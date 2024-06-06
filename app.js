// dotenv helps securing our sensetive information in a separate env file
require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const port = 5000 || process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// static files
app.use(express.static("public"));

// templating engine
app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  const locals = {
    title: "Node Note",
    description: "Easy as NodeJS!",
  };
  res.render("index", locals);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
