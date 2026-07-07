# Định nghĩa chỉ số (cách tính)

Đây là "hợp đồng" về cách tính. Claude Code sẽ hiện thực trong `lib/metrics.ts` đúng theo đây.

## Chỉ số cơ bản
- **Tổng CV** = tổng "Tổng tích luỹ" của các JD (từ JD DAILY).
- **CPL (cost per lead) theo kênh** = tổng chi phí kênh ÷ số lead/CV của kênh.
- **Cost/CV theo JD** = (job-slot theo Job code + phần Meta chia đều, quy đổi VND) ÷ tổng CV của JD.

## Chỉ số theo RANGE NGÀY (from → to)
> Muốn tính theo khoảng ngày thì dữ liệu phải có theo NGÀY. Chỗ nào chỉ có số tổng thì không cắt theo ngày được.

- **Tổng CV (range)** = cộng CV của các ngày nằm trong [from, to].
  - Nguồn: các cột ngày trong JD DAILY (25/06, 26/06, …). *Vì ngày đang là CỘT nên phải cộng đúng các cột trong range.*
  - Bền hơn: tạo 1 tab `daily` dạng dài — `date | jd | source | cvs` (1 dòng/ngày/JD/nguồn) — rồi lọc theo range cực dễ.
- **CPL Meta (range)** = tổng Spend trong range ÷ tổng Leads trong range.
  - Nguồn: `raw-data` (có Date + Spend + Leads mỗi dòng) → cắt range chuẩn.
- **Cost/CV (range) theo JD** = chi phí paid phát sinh trong range ÷ CV thu trong range.
- **Cost job-board (range) — ITviec / LinkedIn / TopDev**: RẢI ĐỀU cost mỗi job ra số ngày chạy rồi chỉ tính phần ngày trong range.
  - Mỗi job có `cost`, `Từ ngày`, `Đến ngày` (linkedin: F/G; it-viec/top-dev: C/D). `costPerDay = cost / (Đến − Từ + 1)` (tính cả 2 đầu).
  - Với range [from, to]: `overlap = max(0, min(to, Đến) − max(from, Từ) + 1)`; cost trong range của job = `costPerDay × overlap`. Tổng kênh = cộng tất cả job.
  - **Fallback** (thiếu Đến ngày / Đến < Từ / số ngày ≤ 0): gán TRỌN cost vào tháng hiệu lực, chỉ tính nếu tháng đó giao range (không rải). overlap âm → 0, không bao giờ chia cho 0.
  - Code: `jobSlotCostInRange` / `channelCostInRange` trong `lib/metrics.ts`. **CHỈ dùng cho khu vực chọn-range**; overview toàn timeline vẫn cộng trọn cost (không rải).

## Quy ước
- Tiền song song KRW/VND; quy đổi khi gộp bằng `NEXT_PUBLIC_KRW_TO_VND`.
- Phân loại nguồn free/paid: xem `lib/sources.ts`.
- Meta chia ĐỀU cho các JD có nguồn `landing-page_meta`.

## Muốn thêm chỉ số mới?
Viết định nghĩa (công thức + lấy từ đâu) vào đây, rồi bảo Claude Code: "thêm chỉ số X theo docs/metrics.md".
