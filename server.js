const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware
app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Thiết lập view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route chính
app.use("/", routes);

// API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Khởi động
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});

