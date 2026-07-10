---
name: update_financial_data
description: "Kỹ năng này hoạt động như một REST Client để tự động đẩy số liệu tài chính của khách hàng (lấy từ tin nhắn chat) lên CSDL Supabase thông qua API nội bộ của FinPeace"
---

# Mục tiêu
Agent đóng vai trò như một chuyên viên tiếp nhận dữ liệu tự động. Khi Phát hiện Người dùng báo cáo về tài sản, nợ nần, thanh khoản, hoặc mục tiêu tương lai, Agent trích xuất các thành phần cụ thể và gửi Request tới Hệ thống FinPeace. KHÔNG ĐƯỢC tự động gộp chung "Tổng Nợ" hay "Tổng Tài Sản". Phân mảnh cụ thể tên từng loại tài sản/nợ theo khai báo.

# Quy trình hoạt động
1. **Trích xuất thông tin (Extraction):** 
   - Dựa vào đoạn chát, bóc tách từng chi tiết thuộc 2 nhóm Hành động chính:
     - Khai báo tài sản/nợ ➔ Chọn `Action: add_client_asset`. Các trường cần gửi: `asset_group` (chỉ chọn nhóm: 'Nợ', 'Thanh khoản', 'Đầu tư', 'Bảo vệ', 'Tiêu dùng'), `asset_name` (Ví dụ: Thẻ VCB, Nhà chung cư), `amount` (VND), `risk_level` (Từ 1-5, Mặc định 3).
     - Khai báo mục tiêu lâu dài ➔ Chọn `Action: update_wealth_scenario`. Các trường cần gửi: `target_amount` (Mục tiêu tiền), `target_years` (Số năm), `monthly_cashflow` (Tích lũy định kỳ hàng tháng).
   - Lưu ý: Email là bắt buộc để CSDL định danh user.
2. **Xác thực API Key:** Chuẩn bị Secret Key: `finpeace-agent-secret-key-2025`
3. **Gửi Request Cập Nhật (Đồng Bộ Kép):** 
   - Sử dụng tool `run_command` để kích hoạt cURL request POST tới endpoint: `http://localhost:3000/api/agent/update-financial-data`. Mọi thay đổi sẽ lập tức Bắn tia Realtime làm nhảy Giao Diện Khách hàng.

# Mẫu Câu Lệnh Sinh cURL (Template)

**Mẫu 1: Dùng cho khai báo Từng khoản Nợ / Tài sản**
```bash
curl -X POST http://localhost:3000/api/agent/update-financial-data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer finpeace-agent-secret-key-2025" \
  -d '{
    "email": "khachhang@email.com",
    "action": "add_client_asset",
    "data": {
      "asset_group": "Nợ",
      "asset_name": "Thẻ tín dụng VIB",
      "amount": 50000000,
      "risk_level": 4,
      "notes": "Lãi suất tốn kém"
    }
  }'
```

**Mẫu 2: Dùng cho Thiết lập Kịch bản / Mục tiêu Tương lai**
```bash
curl -X POST http://localhost:3000/api/agent/update-financial-data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer finpeace-agent-secret-key-2025" \
  -d '{
    "email": "khachhang@email.com",
    "action": "update_wealth_scenario",
    "data": {
      "plan_name": "Mục tiêu Nghỉ hưu",
      "target_amount": 10000000000,
      "target_years": 15,
      "monthly_cashflow": 10000000,
      "initial_capital": 500000000
    }
  }'
```

# Xử lý Kết quả
- Nếu cURL trả về `{"success": true}`, Agent trả lời Khách hàng bằng **giọng điệu chữa lành, cảm thông**: "✅ Đã gieo khoản dữ liệu này vào Hệ Thống Cây Sinh Mệnh của anh/chị [Tên]! Sự trung thực với bản thân là bước đầu tiên của bình an."
- Nếu cURL báo lỗi, Agent báo lỗi cho Khách hàng dưới dạng "Có chút xao nhãng hệ thống, em sẽ kiểm tra lại".
