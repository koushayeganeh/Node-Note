// get /
// Homepage

exports.homepage = async (req, res) => {
  const locals = {
    title: "Node Note",
    description: "Easy as NodeJS!",
  };

  res.render("index", locals);
};
