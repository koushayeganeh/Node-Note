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
          updatedAt: -1,
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
