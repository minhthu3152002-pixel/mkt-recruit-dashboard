# CLAUDE.md — hướng dẫn cho Claude Code

Dashboard tuyển dụng (Next.js 14 + TS + Tailwind + Recharts), đọc data từ 2 Google Sheets, deploy Vercel.

## Chạy
- `npm install` rồi `npm run dev` (http://localhost:3000)
- `npm run build` để kiểm tra trước khi push
- Biến môi trường ở `.env.local` (xem `.env.example`). KHÔNG commit secret.

## 3 tab
- `app/page.tsx` — Paid channel (Meta, LinkedIn, ITviec, TopDev)
- `app/jd/page.tsx` — CV theo JD (tiền + cost/CV mỗi job)
- `app/budget/page.tsx` — Budget theo tháng (actual vs plan)

## Luật nghiệp vụ (QUAN TRỌNG — đừng đổi nếu không được yêu cầu)
- **Phân loại nguồn CV → kênh** chỉ ở `lib/sources.ts` (`SOURCE_TO_CHANNEL`). Free vs paid quyết định ở đây.
- **Chi phí Meta gán vào JD:** chia ĐỀU cho các JD có nguồn `landing-page_meta` (>0). Không tính meta_social hay UTM khác. Logic ở `lib/metrics.ts` (`jdMetrics`).
- **Cost/CV theo JD** = (job-slot theo Job code + phần Meta chia đều, quy đổi VND) ÷ tổng CV.
- **Tiền song song:** Meta = KRW, LinkedIn/ITviec/TopDev = VND. Quy đổi bằng `NEXT_PUBLIC_KRW_TO_VND` khi cần gộp.
- **Join key:** `Job code` (file 1) = `JD Code` (file 2, tab JD DAILY).
- CV luôn lấy từ `JD DAILY` (cột Tổng tích luỹ + Source), KHÔNG lấy "Leads" của Meta.

## Nguồn dữ liệu
- `lib/sheets.ts` đọc các tab: raw-data, linkedin-paid-jobs, it-viec, topdev (file 1) + JD DAILY, plan (file 2).
- Khi chưa có env → tự dùng `lib/sample-data.ts`.

## Quy ước code
- Trang là server component (đọc Sheets ở server). Chart là client component (`"use client"`).
- Format tiền: `fmtVnd`, `fmtKrw`, `fmtInt` trong `lib/metrics.ts`.
- Thêm nguồn dữ liệu mới: viết hàm `fetch...` trong `lib/sheets.ts`, chuẩn hoá về type trong `lib/types.ts`.

## Đọc docs/ trước khi code
- `docs/data-sources.md` — lấy gì từ Sheet nào (map tab/cột).
- `docs/metrics.md` — định nghĩa cách tính (kể cả theo range ngày).
- `docs/requests.md` — yêu cầu mới nhất của chủ dự án; làm mục mới nhất khi được nhờ.
- `apps-script/` — code Apps Script (chạy trong Google Sheet, không phải Vercel).
Khi hiện thực chỉ số/nguồn mới: cập nhật cả code LẪN doc tương ứng để hai bên luôn khớp.

## Nguyên tắc kiến trúc
- Sheet = KHO DỮ LIỆU THÔ. Mọi tính toán làm trong code, KHÔNG phụ thuộc công thức Sheet.
- Bỏ qua tab `dashboard` (đang lỗi #REF!).
- Source của CV = tên tab trong Candidate Data (landing-page dùng thêm cột utm_source).
