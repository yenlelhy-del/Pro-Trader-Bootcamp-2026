# Quy tắc & Quy trình làm việc dự án Pro Trader Bootcamp 2026

Tài liệu này lưu trữ toàn bộ các quy chuẩn, cấu hình tích hợp và nghiệp vụ đặc thù của dự án Pro Trader Bootcamp 2026 để áp dụng nhất quán cho các phiên làm việc tiếp theo.

## 1. Công nghệ & Môi trường triển khai
- **Frontend Stack:** React (TypeScript) + Vite + TailwindCSS.
- **Triển khai (Deployment):** Vercel (Production) đã cấu hình ánh xạ CNAME qua tên miền chính thức:
  👉 **Domain:** `https://lion.finpeace.cloud`
  👉 **Lệnh Deploy:** `npx vercel --prod --name pro-trader-bootcamp` (Project ID tương ứng trên tài khoản Vercel `yen-le`).
- **Tĩnh đóng gói tài nguyên (Vite Static Assets):** Không sử dụng đường dẫn chuỗi tĩnh trực tiếp đối với ảnh (như `/src/assets/qr.png`). Mọi hình ảnh (Mascot, mã QR broker) phải được `import` ở đầu file Component để Vite biên dịch và sinh hash tên file đúng khi build production.

## 2. Các thông số tích hợp & API
- **Google Sheets Webhook (Đăng ký Leads):**
  - **URL Apps Script:** `https://script.google.com/macros/s/AKfycbwFTuZBCLk6FyM8jQtWd3PVL8XFzD5yvUDyd4oKf1LZm45hzhZlWwg1tzmk1FRXl5W5Pw/exec`
  - **Cấu trúc cột Google Sheet (6 cột):** STT (A) | Thời gian (B) | Họ tên (C) | Số điện thoại (D) | Môi giới (E) | ID (F).
  - **Lưu ý CORS:** Cần gọi fetch ở chế độ `mode: 'no-cors'` để tránh bị trình duyệt chặn redirect 302 từ máy chủ Google Script.
- **API Giá Chứng Khoán Thời Gian Thực:**
  - **Endpoint (DNSE / Entrade):** `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock?symbol={SYMBOL}&from={FROM_TIMESTAMP}&to={TO_TIMESTAMP}&resolution=1D`
  - **Đặc điểm:** API công khai hỗ trợ CORS. Giá trị trả về ở đơn vị 1.000đ (Ví dụ: `23.1` tương đương 23.100đ/cổ phiếu).
  - **Quy chuẩn gõ giá:** Ô nhập giá mua/giá bán sử dụng `type="text"` và `inputMode="decimal"` (không dùng mũi tên tăng giảm số) để người dùng gõ số thập phân tự do, tự động chuẩn hóa dấu phẩy `,` thành dấu chấm `.` khi tính toán.

## 3. Nghiệp vụ Quản lý vị thế & Quy tắc kỷ luật (Cách 2)
Hệ thống mô phỏng hoạt động theo dạng **Quản lý vị thế thời gian thực** (Real-time Position Management):
1. **Mở vị thế:** 
   - Điền Mã cổ phiếu, Khối lượng, Tỷ trọng và Giá Entry.
   - Vị thế được ghi nhận ở trạng thái **Đang mở (OPEN / HOLDING)**, `profit: 0` and `exitPrice: null`.
2. **Chốt vị thế:**
   - Người dùng click nút **"Chốt"** trực tiếp ở dòng giao dịch tại cột Giá exit, gõ giá bán ra để đóng vị thế.
   - Trạng thái chuyển sang **Đã đóng (CLOSED)**, lúc này lợi nhuận thực tế mới được khóa và tính toán.
3. **Tính toán chỉ số & Luật kỷ luật:**
   - **Equity Curve (Biểu đồ NAV):** Chỉ vẽ biểu đồ và tính toán điểm NAV dựa trên các vị thế đã đóng (**CLOSED**).
   - **Luật sụt giảm rủi ro (Drawdown):** Giới hạn sụt giảm ngày (Max Daily Drawdown 4% NAV) và sụt giảm tổng (Max Overall Drawdown 8% NAV) được kiểm tra dựa trên các lệnh đã đóng.
   - **Quy tắc nhất quán (Consistency):** Lợi nhuận của 1 lệnh đơn lẻ không được chiếm quá 40% chỉ tiêu lợi nhuận (+5% NAV) để thăng hạng.
   - **Quy tắc đa dạng hóa (Diversification - Max 40% NAV) & Bộ lọc thanh khoản (VN100 / >200k):** Được kiểm tra liên tục trên **TẤT CẢ** các vị thế (cả Đang mở và Đã đóng).
