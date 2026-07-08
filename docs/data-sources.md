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

### A.1 Mapping nguồn đầy đủ (tab Source Analysis)
Nguồn của sự thật: `SOURCE_META` trong `lib/sources.ts` (key = `normalizeSource` = trim + lowercase).
Mỗi source → `{ channelType, group, label }`. `label` là tên hiển thị (nhiều utm thô có thể gộp chung 1 label).
`classifySource` (paid/free) NHẤT QUÁN: `channelType === "paid"` ⇔ source thuộc 4 kênh paid trong `SOURCE_TO_CHANNEL`.
Khớp theo **tên source chính xác** — KHÔNG có logic kiểu "chứa chữ linkedin → paid".

| channelType | group | label | utm/source thô |
|-------------|-------|-------|----------------|
| paid | Ads | Meta Ads | `landing-page_meta` |
| paid | Hiring platform | ITviec | `itviec-api`, `it-viec-manual` |
| paid | Hiring platform | LinkedIn (paid) | `linkedin`, `landing-page_linkedin` |
| paid | Hiring platform | TopDev | `top-dev` |
| free | Direct | Direct landing page | `landing-page` |
| free | Social media | Facebook/IG | `landing-page_meta_social`, `landing-page_ig`, `landing-page_ig_text_post_permalink`, `landing-page_ig_text_feed_timeline` |
| free | Social media | LinkedIn (social) | `landing-page_linkedin_social` |
| free | Social media | Threads | `landing-page_linkedin_threads`, `landing-page_threads` |
| free | Seeding | Facebook group | `landing-page_fb_group`, `landing-page_fb`, `landing-page_group`, `landing-page_facebook-group` |
| free | Zalo community | Zalo | `landing-page_zalo`, `landing-page_zalo_group` |
| free | Hiring platform | Jobsgo | `jobs-go` |
| free | Hiring platform | Glints | `glint`, `landing-page_glints` |
| free | Hiring platform | Ybox | `ybox` |
| free | Hiring platform | FYI | `fyi` |
| free | Hiring platform | LinkedIn (free job) | `linkedin_free_manual`, `landing-page_linkedin_freejob` |
| free | Event | Coffee chat | `landing-page_coffeechat` |
| free | University | VKU | `landing-page_vku` |
| free | University | HUTECH | `landing-page_hutech` |
| free | **Other** | *(tên source thô)* | mọi source LẠ chưa map, vd `landing-page_test` (link test nội bộ) |

> Trong tab Source Analysis, group **Other** luôn xếp CUỐI; các group khác sắp theo CV giảm dần.
> Ở nhóm PAID, group con đặt tên **Hiring platform** cho đồng nhất với group Hiring platform bên Free.
> Chi phí paid gắn theo `PAID_LABEL_TO_COST_CHANNEL` (Meta Ads→meta, ITviec→itviec, LinkedIn (paid)→linkedin, TopDev→topdev), tính all-time.

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
