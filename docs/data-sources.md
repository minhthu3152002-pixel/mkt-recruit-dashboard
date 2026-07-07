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
Cột ĐÃ ĐỐI CHIẾU với dữ liệu thật (không còn là giả định). Bọc tên tab trong nháy đơn ở A1 notation.

| Kênh | Tab | Tiền | Cột (1-based) |
|------|-----|------|---------------|
| Meta | `raw-data-v2` | KRW | Date=A, Spend=N, Impressions=O, Clicks=P, Leads=R |
| LinkedIn | `linkedin-paid-jobs` | VND | Ngày hiệu lực=C, Vị trí=D, Chi phí=H, Job code=I |
| ITviec | `it-viec` | VND | Vị trí=B, Từ ngày=C, Chi phí=F, Job code=G — cố định 2,229,120đ/job |
| TopDev | `top-dev` | VND | Vị trí=B, Từ ngày=C, Chi phí=F, Job code=G — cố định 4,941,000đ/job |
| (plan) | `plan` *(tùy chọn)* | VND | month=A, channel=B, budget=C |

- Số tiền có thể là "2,229,120" (phẩy) hoặc "2.229.120" (chấm) ngăn nghìn → `num()` trong `lib/sheets.ts` xử lý cả hai.
- Cột ngày đôi khi được format kiểu "số" → API trả serial (vd `46149`); `parseFlexibleDate` tự quy đổi serial → `YYYY-MM-DD`.
- Dò lại dữ liệu thô bất cứ lúc nào: `/api/debug-sheets?key=debug` (header + 3 dòng đầu mỗi tab, hoặc lỗi đọc). Nếu tab báo lỗi 403 → chia sẻ file Marketing cho service account; rỗng → kiểm tra `GOOGLE_MARKETING_SHEET_ID`.

## C. Funnel (chất lượng CV) — LÀM SAU
Sheet qualify candidate + interview tracking. [ ] TODO: file nào + khoá join (ID/Email/JD).

## Quy tắc
- Tiền song song KRW/VND; quy đổi khi gộp bằng `NEXT_PUBLIC_KRW_TO_VND`.
- Meta gán vào JD: chia đều cho các JD có nguồn `landing-page_meta`.
