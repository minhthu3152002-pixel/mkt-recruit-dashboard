# Lấy gì từ Google Sheet

Nguyên tắc: **Sheet chỉ là kho dữ liệu thô. MỌI tính toán làm trong code (Vercel).**
Bỏ qua tab `dashboard` của file Marketing (lỗi #REF!).

## A. Candidate Data (CV thô) — `GOOGLE_CANDIDATE_SHEET_ID`
Quét TẤT CẢ tab nguồn, **source = tên tab**. Cấu hình cột port từ Apps Script → `lib/candidate-source.ts`.
Mỗi dòng CV lấy: JD Code (regex từ codeCol), Company, Title, Ngày (date parser), Email (lọc dòng rỗng).

| Tab nguồn | → Kênh |
|-----------|--------|
| ITviec-api, it-viec-manual | ITviec (paid) |
| top-dev | TopDev (paid) |
| LinkedIn | LinkedIn (paid) |
| landing-page + utm = `landing-page_meta` | Meta (paid) |
| landing-page (khác), glint, YBOX, jobs-go, FYI | Free |
| landing-page_meta_social / _linkedin_social / _fb_group / _threads / _zalo | Free (social/organic) |

> landing-page tách chi tiết bằng cột `utm_source` → `landing-page_{utm}`.
> Sửa phân loại free/paid ở `lib/sources.ts`.

## B. Marketing Activities — `GOOGLE_MARKETING_SHEET_ID`
| Kênh | Tab | Tiền | Ghi chú |
|------|-----|------|---------|
| Meta | `raw-data-v2` | KRW | theo ngày → lọc range được. Giả định cột: Date=A, Spend=N, Clicks=P, Leads=R (đối chiếu lại nếu lệch) |
| LinkedIn | `linkedin-paid-jobs` | VND | theo Job code |
| ITviec | `it-viec` | VND | 2.229.120đ/job |
| TopDev | `top-dev` | VND | 4.941.000đ/job |
| (plan) | `plan` *(tùy chọn)* | VND | month, channel, budget |

## C. Funnel (chất lượng CV) — LÀM SAU
Sheet qualify candidate + interview tracking. [ ] TODO: file nào + khoá join (ID/Email/JD).

## Quy tắc
- Tiền song song KRW/VND; quy đổi khi gộp bằng `NEXT_PUBLIC_KRW_TO_VND`.
- Meta gán vào JD: chia đều cho các JD có nguồn `landing-page_meta`.
