const path = require("path");
const accounts = require("../data/accounts");

exports.getAdmin = (req, res) => {
  res.render("admin"); // Giao diện admin riêng
};

exports.getLogin = (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "login.html"));
};

exports.postLogin = (req, res) => {
  const { username, password } = req.body;
  const user = accounts.find(acc => acc.username === username && acc.password === password);
  if (user) {
    req.session.loggedIn = true;
    req.session.username = username;
    req.session.role = user.role;
    res.redirect("/admin");
  } else {
    res.send("❌ Sai tài khoản hoặc mật khẩu");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

exports.redirectToAdmin = (req, res) => {
  if (req.session && req.session.loggedIn) {
    res.redirect("/admin");
  } else {
    res.redirect("/login");
  }
};

exports.getdiemDanhQR = (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "QR.html"));
};

