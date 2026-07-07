import { getDataset } from "@/lib/sheets";
import { Header } from "@/components/Header";
import { DailyPanel } from "@/components/DailyPanel";

export const revalidate = 600;

export default async function DailyPage() {
  const d = await getDataset();

  // CV thô có ngày -> {jd, d (ngày nộp), s (source)}. Tính bảng ở client khi đổi range.
  const cvs = d.cvs.filter((c) => c.date).map((c) => ({ jd: c.jdCode, d: c.date, s: c.source }));
  // Company/Job Title cho mỗi JD (lấy giá trị non-empty đầu tiên, gồm cả CV không ngày).
  const meta: Record<string, { company: string; title: string }> = {};
  for (const c of d.cvs) {
    const m = (meta[c.jdCode] ??= { company: "", title: "" });
    if (!m.company && c.company) m.company = c.company;
    if (!m.title && c.title) m.title = c.title;
  }

  // Mặc định 7 ngày gần nhất (giờ VN).
  const vnNow = new Date(Date.now() + 7 * 3600 * 1000);
  const to = vnNow.toISOString().slice(0, 10);
  const from = new Date(vnNow.getTime() - 6 * 86400000).toISOString().slice(0, 10);

  return (
    <>
      <Header source={d.source} title="Daily CV Tracking by JD" eyebrow="CV nhận theo từng ngày · tự tính từ CV thô" />
      <DailyPanel cvs={cvs} meta={meta} defaultFrom={from} defaultTo={to} />
    </>
  );
}
