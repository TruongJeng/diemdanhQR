const { google } = require("googleapis");
const creds = require("../credentials.json");

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  return google.sheets({ version: "v4", auth: await auth.getClient() });
}

// Trả về số dòng (index) của mã số, bắt đầu từ 2 (do header ở dòng 1)
async function findRowIndexById(id) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.SHEET_ID;
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Diemdanh!E2:E"
  });
  const rows = result.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === id.toString()) {
      return i + 2; // vì E2 là dòng 2
    }
  }
  return -1;
}

// Lấy trạng thái và thời gian tại 1 dòng
async function getStatusAndTime(rowIndex) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.SHEET_ID;
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `Diemdanh!F${rowIndex}:G${rowIndex}`
  });
  const [status = "", time = ""] = (result.data.values && result.data.values[0]) || [];
  return { status, time };
}

// Ghi trạng thái và thời gian mới vào sheet
async function updateStatusAndTime(rowIndex, status, time) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.SHEET_ID;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Diemdanh!F${rowIndex}:G${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[status, time]]
    }
  });
}
async function getStatusList() {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.SHEET_ID;
  // Đổi 'Trang tính1' thành đúng tên sheet của bạn!
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Diemdanh'!B2:F" // B: Họ và tên, F: Trạng thái
  });
  const rows = result.data.values || [];
  const checkedIn = [];
  const checkedOut = [];
  for (const row of rows) {
    const name = row[0] || ""; // Cột B: Họ và tên
    const status = row[4] || ""; // Cột F: Trạng thái
    if (status === "Đã check in") checkedIn.push(name);
    if (status === "Đã check out") checkedOut.push(name);
  }
  return { checkedIn, checkedOut };
}
module.exports = {
  findRowIndexById,
  getStatusAndTime,
  updateStatusAndTime,
  getStatusList,
  getSheetsClient // Thêm dòng này!
};