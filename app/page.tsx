import { getDataset } from "@/lib/sheets";
import { paidChannelSummary, fmtVnd, fmtKrw, fmtInt, KRW_TO_VND } from "@/lib/metrics";
import { classifySource } from "@/lib/sources";
import { KpiCard } from "@/components/KpiCard";
import { Header } from "@/components/Header";
import { ChannelSpendBar } from "@/components/Charts";
import { RangePanel } from "@/components/RangePanel";
import { Dot, ChartCard } from "@/components/Bits";
import { chColor } from "@/components/theme";
import { IconCoin, IconUsers, IconTag } from "@/components/Icons";

export const revalidate = 600;

export default async function PaidChannelPage() {
  const d = await getDataset();
  const rows = paidChannelSummary(d);
  const totalSpendVnd = rows.reduce((a, r) => a + r.spendVnd, 0);
  const totalCvs = rows.reduce((a, r) => a + r.cvs, 0);
  const blended = totalCvs > 0 ? totalSpendVnd / totalCvs : 0;
  const barData = rows.map((r) => ({ label: r.label, spendVnd: r.spendVnd, color: chColor(r.channel) }));
  const cpcData = rows.map((r) => ({ label: r.label, spendVnd: r.costPerCvVnd ?? 0, color: chColor(r.channel) }));

  // Dữ liệu gọn cho khu vực chọn-range (tính lại ở client khi đổi ngày).
  const metaLite = d.meta.map((m) => ({ date: m.date, spend: m.spend, leads: m.leads }));
  const cvLite = d.cvs.filter((c) => c.date).map((c) => ({ date: c.date, ch: classifySource(c.source) }));
  const vnNow = new Date(Date.now() + 7 * 3600 * 1000); // giờ VN (UTC+7)
  const defTo = vnNow.toISOString().slice(0, 10);
  const defFrom = `${vnNow.getUTCFullYear()}-${String(vnNow.getUTCMonth() + 1).padStart(2, "0")}-01`;

  return (
    <>
      <Header source={d.source} title="Paid channel" eyebrow="Meta · LinkedIn · ITviec · TopDev" />

      {/* ===== KHUNG OVERVIEW — toàn bộ thời gian ===== */}
      <section className="card space-y-5 p-5 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Tổng quan</h2>
          <p className="text-xs text-muted">Toàn bộ thời gian · không phụ thuộc ô chọn ngày</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard surface tone="pink" icon={<IconCoin />} label="Tổng chi phí (VND-equiv)" value={fmtVnd(totalSpendVnd)} sub={`Meta quy đổi @${KRW_TO_VND} VND/₩`} />
          <KpiCard surface tone="blue" icon={<IconUsers />} label="CV từ kênh paid" value={fmtInt(totalCvs)} sub="gán theo nguồn" />
          <KpiCard surface tone="orange" icon={<IconTag />} label="Cost / CV (blended)" value={fmtVnd(blended)} sub="chi phí paid ÷ CV paid" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.channel} className="rounded-2xl bg-canvas p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                  <Dot color={chColor(r.channel)} /> {r.label}
                </span>
                <span className="pill bg-black/[0.05] text-muted">{r.jobs != null ? `${r.jobs} job post` : "ads"}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <Metric label="Chi phí" value={r.ccy === "KRW" ? fmtKrw(r.spend) : fmtVnd(r.spend)} sub={r.ccy === "KRW" ? `≈ ${fmtVnd(r.spendVnd)}` : undefined} />
                <Metric label="CV" value={fmtInt(r.cvs)} />
                <Metric label="Cost/CV" value={r.costPerCvVnd ? fmtVnd(r.costPerCvVnd) : "—"} />
              </div>
              {r.channel === "meta" && <p className="mt-3 text-[11px] text-muted">CV = lead Meta báo cáo (raw-data-v2)</p>}
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Chi phí theo kênh" subtitle="Quy về VND (Meta gốc là KRW)">
            <ChannelSpendBar data={barData} height={230} />
          </ChartCard>
          <ChartCard title="Cost/CV theo kênh" subtitle="Chi phí kênh ÷ CV kênh (VND)">
            <ChannelSpendBar data={cpcData} name="Cost/CV (VND)" height={230} />
          </ChartCard>
        </div>
      </section>

      {/* ===== KHUNG THEO KHOẢNG NGÀY ===== */}
      <RangePanel jobSlots={d.jobSlots} meta={metaLite} cvs={cvLite} defaultFrom={defFrom} defaultTo={defTo} />
    </>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 font-semibold tabular-nums text-ink">{value}</div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </div>
  );
}
