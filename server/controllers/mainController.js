// get /
// Homepage

exports.homepage = async (req, res) => {
  const locals = {
    title: "Node Note",
    description: "Easy as NodeJS!",
  };

  res.render("index", locals);
};

// get /
// About

exports.about = async (req, res) => {
  const locals = {
    title: "About - Node Note",
    description: "about Node Note",
  };

  res.render("index", locals);
};
