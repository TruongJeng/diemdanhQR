const {
  findRowIndexById,
  getStatusAndTime,
  updateStatusAndTime
} = require("../services/sheetService");

exports.diemDanh = async (req, res) => {
  const { id, time } = req.body;
  if (!id || !time)
    return res.status(400).json({ message: "❌ Thiếu dữ liệu mã số hoặc thời gian" });

  const rowIndex = await findRowIndexById(id);
  if (rowIndex === -1) {
    return res.json({ success: false, message: `❌ Không tìm thấy mã số ${id}` });
  }

  const { status } = await getStatusAndTime(rowIndex);

  let nextStatus = "";
  if (status === "Đã check in") nextStatus = "Đã check out";
  else nextStatus = "Đã check in";

  await updateStatusAndTime(rowIndex, nextStatus, time);

  return res.json({ success: true, message: `✅ ${nextStatus} cho mã ${id}` });
};