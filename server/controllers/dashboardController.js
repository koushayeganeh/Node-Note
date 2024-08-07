const Note = require("../models/Note");
const mongoose = require("mongoose");

// get /
// dashboard

exports.dashboard = async (req, res) => {
  let perPage = 8;
  let page = req.query.page || 1;

  const userId = req.user.id;
  const objectId = new mongoose.Types.ObjectId(userId);

  const locals = {
    title: "Dashboard",
    description: "Easy as NodeJS!",
  };

  try {
    const notes = await Note.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      { $match: { user: objectId } },
      {
        $project: {
          title: { $substr: ["$title", 0, 35] },
          body: { $substr: ["$body", 0, 100] },
        },
      },
    ])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Note.countDocuments();

    res.render("dashboard/index", {
      userName: req.user.firstName,
      locals,
      notes,
      currentPage: page,
      totalPages: Math.ceil(count / perPage),
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    console.log(error);
  }
};

// get /
// dashboardViewNote

exports.dashboardViewNote = async (req, res) => {
  try {
    const note = await Note.findById({ _id: req.params.id })
      .where({
        user: req.user.id,
      })
      .lean();

    const locals = {
      title: "Dashboard" + " | " + note.title,
      description: "This is a Private Note!",
    };
    res.render("dashboard/view-notes", {
      locals,
      note,
      noteId: req.params.id,
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    res.send(
      "Eaither you don't have access to this note or this note just does not exist."
    );
    console.log(error);
  }
};

// PUT /
// dashboardUpdateNote

exports.dashboardUpdateNote = async (req, res) => {
  try {
    await Note.findOneAndUpdate(
      { _id: req.params.id },
      { title: req.body.title, body: req.body.body }
    ).where({ user: req.user.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

// POST /
// dashboardDeleteNote

exports.dashboardDeleteNote = async (req, res) => {
  try {
    await Note.deleteOne({ _id: req.params.id }).where({ user: req.user.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

// GET /
// dashboardAddNote

exports.dashboardAddNote = async (req, res) => {
  res.render("dashboard/add-note", {
    layout: "../views/layouts/dashboard",
  });
};

// Post /
// dashboardAddNoteSubmit

exports.dashboardAddNoteSubmit = async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Note.create(req.body);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

// GET /
// dashboardSearch

exports.dashboardSearch = async (req, res) => {
  try {
    res.render("dashboard/search", {
      searchResults: "",
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    console.log(error);
  }
};

// POST /
// dashboardSearchSubmit

exports.dashboardSearchSubmit = async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const searchResults = await Note.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChars, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChars, "i") } },
      ],
    }).where({ user: req.user.id });

    res.render("dashboard/search", {
      searchResults,
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    console.log(error);
  }
};
