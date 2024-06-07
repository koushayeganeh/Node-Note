// get /
// dashboard

exports.dashboard = async (req, res) => {
  const locals = {
    title: "Dashboard",
    description: "Easy as NodeJS!",
  };

  res.render("dashboard/index", {
    locals,
    layout: "../views/layouts/dashboard",
  });
};
