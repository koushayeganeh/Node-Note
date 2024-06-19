const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const axios = require("axios");
const User = require("../models/User");
const { isLoggedIn, checkAuthenticated } = require("../middleware/checkAuth");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      const newUser = {
        googleId: profile.id,
        displayName: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        profileImage: profile.photos[0].value,
        accessToken: accessToken,
      };

      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          user.accessToken = accessToken; // Update the access token
          await user.save();
          done(null, user);
        } else {
          user = await User.create(newUser);
          done(null, user);
        }
      } catch (error) {
        console.log(error);
        done(error, null); // Ensure Passport knows an error occurred
      }
      // console.log(profile);
    }
  )
);

//  Google login route
router.get(
  "/auth/google",
  checkAuthenticated,
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

// Retrieve user data
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login-failure",
    successRedirect: "/dashboard",
  })
);

// Route if something goes wrong
router.get("/login-failure", (req, res) => {
  res.send("login failed...");
});

// Destroy user session
router.get("/logout", isLoggedIn, async (req, res) => {
  try {
    // Revoke access token
    if (req.user && req.user.accessToken) {
      const url = `https://accounts.google.com/o/oauth2/revoke?token=${req.user.accessToken}`;
      await axios.get(url);
    }

    req.logout((err) => {
      if (err) {
        console.log(err);
        return res.send("Error logging out");
      }
      req.session.destroy((error) => {
        if (error) {
          console.log(error);
          return res.send("Error destroying session");
        } else {
          res.clearCookie("connect.sid");
          res.redirect("/");
        }
      });
    });
  } catch (error) {
    console.log(error);
    res.send("Error logging out");
  }
});

// Persist user data after authentication
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// Retrieve user data from session
passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = router;
