const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const checkinController = require("../controllers/diemdanhController");
const { ensureLoggedIn } = require("../middlewares/authMiddleware");
const { getSheetsClient } = require("../services/sheetService");
const path = require("path");

// Trang login
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);

// Trang scan (sau login)
router.get("/", authController.redirectToAdmin);
router.get("/admin", ensureLoggedIn, authController.getAdmin);

// Trang chính sau khi nhấn Điểm danh "Quét QR"
router.get("/diemdanhQR", ensureLoggedIn, authController.getdiemDanhQR);

// API điểm danh
router.post("/diemdanh", ensureLoggedIn, checkinController.diemDanh);

// API xuất danh sách điểm danh (admin)
router.get('/api/attendance', ensureLoggedIn, async (req, res) => {
  try {
    // Lấy dữ liệu từ Google Sheets
    const sheets = await getSheetsClient(); // Thêm dòng này
    const spreadsheetId = process.env.SHEET_ID;
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Diemdanh!B2:G" // Điều chỉnh range cho đúng với file của bạn
    });
    const rows = result.data.values || [];
    // Chuyển dữ liệu thành dạng object cho frontend
    const data = rows
      .filter(row => row[0] && row[0] !== "Họ và tên")
      .map(row => ({
        name: row[0] || "",
        team: row[1] || "",
        phone: row[2] || "",
        code: row[3] || "",
        status: row[4] || "",
        time: row[5] || ""
      }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Không lấy được dữ liệu điểm danh' });
  }
});

router.get("/api/export-csv", ensureLoggedIn, async (req, res) => {
  try {
    const { getSheetsClient } = require("../services/sheetService");
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SHEET_ID;
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Diemdanh!B2:G" // Điều chỉnh range cho đúng với file của bạn
    });
    const rows = result.data.values || [];
    let csv = rows.map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=attendance.csv");
    res.send(csv);
  } catch (err) {
    console.error("Lỗi khi xuất CSV:", err);
    res.status(500).send("Lỗi máy chủ khi xuất file CSV.");
  }
});
//Trang trạng thái
// Route hiển thị trang trạng thái
router.get("/status", ensureLoggedIn, (req, res) => {
  const user = req.session.user || {};
  res.render("status", { 
    username: user.fullname || "", 
    userid: user.id || "" 
  });
});

// API trả về danh sách trạng thái
router.get("/api/status-list", ensureLoggedIn, async (req, res) => {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SHEET_ID;
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Diemdanh!B2:G"
    });
    // Kết quả trả về: [STT, Họ tên, Đội, SĐT, Mã số, Trạng thái, Thời gian]
    const rows = result.data.values || [];
    const checkedIn = [];
    const checkedOut = [];
    rows.forEach(row => {
      if (row[5] === "Đã check in") checkedIn.push(row[1]);
      if (row[5] === "Đã check out") checkedOut.push(row[1]);
    });
    res.json({ checkedIn, checkedOut });
  } catch (err) {
    console.error(err);
    res.status(500).json({ checkedIn: [], checkedOut: [], error: "Server error" });
  }
});

// Reload attendance data
async function loadAttendance() {
  const res = await fetch('/api/attendance');
  const data = await res.json();
  renderTable(data);
}

module.exports = router;