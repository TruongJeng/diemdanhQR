// Hàm xử lý khi quét thành công mã QR
function onScanSuccess(qrCodeMessage) {
  document.getElementById("result").innerHTML = `✅ Đã quét: ${qrCodeMessage}`;

  // Dừng quét QR để xử lý
  html5QrcodeScanner.clear().then(() => {
    // Gửi mã số về server để điểm danh
    fetch("/diemdanh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ 
        id: qrCodeMessage.trim(), 
        time: new Date().toLocaleString("vi-VN"),
      })
    })
    .then(async response => {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        alert(json.message);

        // Sau 2s, tiếp tục quét lại
        setTimeout(() => {
          html5QrcodeScanner.render(onScanSuccess);
        }, 2000);
      } catch (e) {
        console.error("❌ Lỗi parse JSON:", e, "\nPhản hồi từ server:", text);
        alert("⚠️ Không thể gửi điểm danh. Hãy đăng nhập lại.");
        window.location.href = "/login";
      }
    })
    .catch(error => {
      console.error("❌ Lỗi fetch:", error);
      alert("Lỗi khi gửi điểm danh!");

      // Quét lại sau 2s
      setTimeout(() => {
        html5QrcodeScanner.render(onScanSuccess);
      }, 2000);
    });
  });
}

// Hàm điểm danh thủ công (nếu cần gọi ở nơi khác)
function sendAttendance(id) {
  fetch("/api/diemdanh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, time: new Date().toLocaleString("vi-VN"), action: "checkin" })
  })
  .then(async response => {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      alert(json.message);
    } catch (e) {
      console.error("❌ Lỗi khi gửi điểm danh:", e, "\nPhản hồi từ server:", text);
      alert("⚠️ Không thể gửi điểm danh. Có thể đã bị đăng xuất.");
      window.location.href = "/login";
    }
  })
  .catch(error => {
    console.error("❌ Lỗi fetch:", error);
    alert("Không thể kết nối tới server.");
  });
}

// Khởi tạo trình quét QR
const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: 250
});
html5QrcodeScanner.render(onScanSuccess);
