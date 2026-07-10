---
name: finpeace_ui_ux_builder
description: "Kỹ năng thiết kế và phát triển giao diện (UI/UX) Frontend cho dự án FinPeace, tuân thủ chặt chẽ Design System Bình An Tài Chính."
---

# Mục Tiêu
Skill này biến Agent (Gemini) thành một Kỹ sư Frontend UI/UX chuyên biệt cho hệ sinh thái `finpeace.cloud`. Nhiệm vụ của Agent là viết code tạo ra các giao diện (Component) tương tác cao, siêu mượt nhưng phải giữ được năng lượng "Chữa lành" thay vì "Căng thẳng FOMO".

# 1. Tech Stack Bắt Buộc
- **Framework:** Next.js 14+ (App Router).
- **Styling:** TailwindCSS tĩnh (không dùng inline styles trừ khi bắt buộc với animation).
- **Công cụ UI:** `lucide-react` (Bộ icon chuẩn), `framer-motion` (Cho mọi hiệu ứng cuộn, chuyển cảnh - Scrollytelling), `shadcn/ui` (Nếu cần các form, button phức tạp).

# 2. Design System Mặc Định (Cốt Lõi Của FinPeace)
Agent khi tạo UI phải bám sát các nguyên tắc Thẩm mỹ sau:
- **Bảng Màu Chữa Lành (Healing Colors):**
  - Trắng, Xám nhạt, Be (Neutral 50 - Nhẹ nhàng, bao dung).
  - Xanh Lục Bảo, Xanh Lá Cây, Xanh Ngọc (Màu của sự sống, cái cây mọc rễ).
  - TUYỆT ĐỐI TRÁNH: Đỏ chót, Xanh Neon, gradient loè loẹt gây cảm giác "Sàn giao dịch rủi ro".
- **Góc Bo Tròn (Soft Curves):** Sử dụng `rounded-2xl`, `rounded-full` để làm mềm mọi góc cạnh của đồ thị, thẻ tài sản. Khách hàng đang mang nợ không muốn nhìn thấy thứ gì sắc nhọn.
- **Glassmorphism:** Sử dụng `bg-white/80 backdrop-blur-md` để tạo độ sâu và cảm giác cao cấp.

# 3. Micro-Animations (Framer Motion)
Với mọi giao diện Dashboard hay Cây Sinh Mệnh, Gemini PHẢI áp dụng:
- `<AnimatePresence>` cho quá trình chuyển đổi Step (Màn hình).
- Initial opacity 0, trượt nhe lên (Y: 50) khi xuất hiện để mang lại cảm giác "Nhẹ nhõm, nâng đỡ".
- Hiệu ứng Hover: `whileHover={{ scale: 1.02 }}` cho các nút bấm quan trọng.

# 4. Khi Nhận Yêu Cầu Tạo Component
1. Khảo sát Yêu cầu: "Giao diện này dùng để hiển thị Nợ (áp lực) hay Khu Vườn Đầu Tư (hy vọng)?".
2. Nếu là Nợ -> Dùng màu trung tính (Xám, Đỏ Đất nhạt), thông tin tối giản tránh gây hoảng loạn.
3. Nếu là Khu Vườn -> Dùng Xanh lục, mô phỏng biểu đồ mọc lên.
4. Render Code: Luôn output full mã React Component hoàn chỉnh với "use client".

# 5. Khắc phục lỗi Frontend thường gặp
- Hãy nhớ bọc `useMemo`, `useCallback` cho mọi logic tính toán nặng bên trong function Component để né lỗi đứt gãy SSR của Next.js (Temporal Dead Zone).
- Không nhồi nhét quá nhiều logic fetch dữ liệu vào UI Component; ưu tiên tách ra Hook riêng.

# 6. Landing Page Layout Patterns (Học từ Keynote Presentation)

Khi thiết kế landing page cho Advisor Trading (`landing-plan`, `landing-trust`, `landing-discipline`), Agent phải áp dụng 3 pattern sau:

## Pattern A — Centered Title + 3-Column Cards
```tsx
// Tag pill (elevated header on card, same as slide title pill)
<div className="bg-teal-50 border-b border-teal-100 px-6 py-4 flex items-center gap-3">
  <div className="w-8 h-8 bg-white rounded-xl shadow-sm">...</div>
  <h3 className="font-bold text-teal-700 text-sm">{card.title}</h3>
</div>
<div className="px-6 py-5">...</div>
```

## Pattern B — Split Layout (Text Left + Panel Right)
```tsx
<div className="grid lg:grid-cols-2 gap-16 items-start">
  {/* Left: big title + numbered list 01→04 */}
  {/* Right: stat panel / citations / image */}
</div>
```

## Pattern C — Thin HR Frame (Slide Border)
```tsx
// Adaptive HR — dark prop cho dark sections
const HR = ({ dark = false }) =>
  <div className={`w-full h-px ${dark ? 'bg-white/10' : 'bg-slate-200/60'}`} />
// Đặt HR ở đầu và cuối mỗi section
```

## Quy Tắc Tương Phản Section (QUAN TRỌNG)
Các section phải xen kẽ sáng/tối để tạo nhịp điệu trực quan rõ ràng:

| Section | Background | Text chính |
|---|---|---|
| Hero | `from-teal-50 via-white to-emerald-50` | `text-slate-800` |
| Section 2 | `bg-slate-800` hoặc `bg-slate-900` | `text-white` |
| Section 3 (3-col) | `bg-white` | `text-slate-800` |
| Section 4 | `bg-teal-900` hoặc `bg-emerald-900` | `text-white` |
| CTA | `bg-gradient-to-br from-teal-600 to-emerald-600` | `text-white` |

> **Lỗi thường gặp:** Không dùng `bg-white` xen kẽ `bg-neutral-50` — user không thấy sự khác biệt. Phải có dark section thực sự (`slate-800`, `teal-900`).

## Dark Section Color Adaptation
Khi section có dark background, tất cả elements phải đổi màu:
- Cards: `bg-white/5 border-white/10` thay vì `bg-white border-slate-100`
- Numbered badges: `bg-teal-400/20 text-teal-300` thay vì `bg-teal-50 text-teal-600`
- Body text: `text-slate-300` hoặc `text-teal-300/70`
- Section label: `text-teal-400/60`
