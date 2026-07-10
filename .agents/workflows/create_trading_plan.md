---
description: Quy trình tạo Trading Plan từ ảnh đồ thị (Phân tích -> Duyệt -> Cập nhật DB)
---

Sử dụng workflow này khi User yêu cầu "Tạo một Trading Plan" và gửi kèm ảnh đồ thị.

### Bước 1: Phân tích đồ thị
Sử dụng kỹ năng `stock_chart_analyzer` để phân tích ảnh User gửi. 
- Xác định cấu trúc lồng ghép (Nesting).
- Đánh số giai đoạn (VD: Sideway 4, Trending 5).
- Tính toán Area Symmetry trên biểu đồ Log.
- Dự phóng Vùng mua (Entry), Cắt lỗ (SL), Chốt lời (TP).

### Bước 2: Đề xuất bản thảo (Draft)
Trình bày kết quả phân tích cho User dưới dạng bản thảo Trading Plan:
- **Ticker:** [Mã] | **Chiều:** [Mua/Bán]
- **Hệ thống sóng:** [VD: Sideway 4]
- **Logic Area Symmetry:** [Mô tả ngắn gọn]
- **Vùng mua:** [Giá]
- **Stop Loss:** [Giá]
- **Take Profit:** [Giá mục tiêu]
- **Luận điểm:** [Ghi chú của Advisor]

### Bước 3: Chờ User chỉnh sửa và Xác nhận
Hỏi User: *"Bạn có muốn chỉnh sửa thông số nào không? Nếu đã đồng ý, hãy nói 'Xác nhận' để tôi cập nhật lên hệ thống advisor.finpeace.cloud."*

### Bước 4: Cập nhật Cơ sở dữ liệu
Khi User nói **"Xác nhận"**, thực hiện gọi công cụ `run_command` hoặc `axios/fetch` (nếu có tool) để gửi request POST đến API:
- **URL:** `https://advisor.finpeace.cloud/api/advisor/admin` (hoặc đường dẫn local tương ứng)
- **Method:** `POST`
- **Action:** `upsert_plan`
- **Payload:** Bao gồm các trường `ticker`, `wave_index`, `area_symmetry_note`, `entry_zone`, `stop_loss`, `take_profit`, `is_confirmed: true`, v.v.

### Bước 5: Thông báo hoàn tất
Thông báo cho User mã đã được cập nhật thành công và hiển thị trên Dashboard khách hàng.
