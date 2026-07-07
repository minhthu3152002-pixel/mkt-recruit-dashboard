# Recruit Dashboard

Dashboard tuyển dụng đọc trực tiếp từ **2 file Google Sheets**, gồm 3 tab:

1. **Paid channel** — Meta Ads, LinkedIn, ITviec, TopDev: chi phí, CV, cost/CV.
2. **CV theo JD** — mỗi JD: tổng CV, tiền đã bỏ ra, cost/CV (gộp free + paid).
3. **Budget theo tháng** — đã sài bao nhiêu theo từng kênh, so với kế hoạch.

Stack: Next.js 14 + TypeScript + Tailwind + Recharts. Deploy Vercel.

> Chạy được ngay với sample data. Cắm Sheets xong badge đổi sang "Live từ Google Sheets".

```bash
npm install && npm run dev   # http://localhost:3000
```

---

## Dữ liệu vào từ đâu

**File 1 — Marketing Activities [KTC 2026]** (`GOOGLE_SHEET_ID`):
- `raw-data` → Meta: Date(A), Spend(N, **KRW**), Impr(O), Clicks(P), Leads(R)
- `linkedin-paid-jobs` → Ngày hiệu lực(C), Vị trí(D), Chi phí VND(H), Job code(I)
- `it-viec` → Vị trí(B), Từ ngày(C), Chi phí VND(F), Job code(G) · cố định 2.229.120đ/job
- `topdev` → cùng layout `it-viec` · cố định 4.941.000đ/job *(tạo tab này nếu chưa có)*

**File 2 — V2_KTC2026_MASTER** (`GOOGLE_MASTER_SHEET_ID`):
- `JD DAILY` → JD Code(A), Company(B), Job Title(C), Tổng tích luỹ(D), Source(M)
- `plan` *(tùy chọn, tự tạo)* → month | channel | budget — kế hoạch budget từng tháng

`Job code` ở file 1 khớp `JD Code` ở file 2 → nối được tiền ↔ CV theo JD.

---

## Cách tính (logic nghiệp vụ)

**Phân nguồn → kênh** (`lib/sources.ts` — sửa ở đây nếu sai):
- Paid: `landing-page_meta`→Meta · `itviec-api`,`it-viec-manual`→ITviec · `top-dev`→TopDev · `linkedin`→LinkedIn
- Free: `landing-page` (direct), `landing-page_meta_social` (FB/IG post), `landing-page_linkedin_social` (LinkedIn post), `landing-page_fb_group`, `landing-page_threads`, `glint`/`glints`/`ybox`/`jobsgo`, `fyi`...

**Chi phí Meta gán vào JD:** chia **đều** cho các JD có nguồn `landing-page_meta` (>0). Trừ meta_social và mọi UTM khác.

**Cost/CV theo JD** = (job-slot theo Job code + phần Meta chia đều, quy đổi VND) ÷ tổng CV của JD.

**Tiền tệ song song:** Meta gốc **KRW**, LinkedIn/ITviec/TopDev **VND**. Khi cần gộp thì quy đổi bằng `NEXT_PUBLIC_KRW_TO_VND` (mặc định 19.2). Bảng hiện cả 2 (VND + KRW ở cột Meta).

---

## Cắm Google Sheets (Service Account)

1. console.cloud.google.com → tạo project → bật **Google Sheets API**.
2. Credentials → **Service account** → tạo Key **JSON**, tải về.
3. Lấy `client_email` + `private_key` từ JSON.
4. **Share cả 2 file** cho `client_email` đó (quyền Viewer).
5. Copy `.env.example` → `.env.local`, điền `GOOGLE_SHEET_ID`, `GOOGLE_MASTER_SHEET_ID`, email, private key.
6. `npm run dev` → badge chuyển "Live từ Google Sheets".

## GitHub → Vercel

```bash
git init && git add . && git commit -m "recruit dashboard" && git branch -M main
git remote add origin https://github.com/<user>/<repo>.git && git push -u origin main
```
Vercel → Add New Project → import repo → Settings → Environment Variables (dán 5 biến ở trên) → Deploy.

---

## Cấu trúc

```
app/            page.tsx (Paid channel) · jd/ (CV theo JD) · budget/ (Budget tháng)
components/     Sidebar, Header, KpiCard, Charts
lib/            sources.ts (map nguồn→kênh) · types.ts · sheets.ts (đọc Sheets)
                metrics.ts (Meta chia đều, cost/CV theo JD) · sample-data.ts
```
