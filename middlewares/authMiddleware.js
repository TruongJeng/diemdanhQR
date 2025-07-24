exports.ensureLoggedIn = (req, res, next) => {
  if (req.session && req.session.loggedIn) {
    next();
  } else {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(401).json({ message: "❌ Bạn chưa đăng nhập." });
    }
    res.redirect("/login");
  }
};
