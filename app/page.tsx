import { getDataset } from "@/lib/sheets";
import { paidChannelSummary, monthOverMonth, fmtVnd, fmtKrw, fmtInt, KRW_TO_VND } from "@/lib/metrics";
import { classifySource } from "@/lib/sources";
import { KpiCard } from "@/components/KpiCard";
import { Header } from "@/components/Header";
import { ChannelSpendBar } from "@/components/Charts";
import { RangePanel } from "@/components/RangePanel";
import { Dot } from "@/components/Bits";
import { chColor } from "@/components/theme";
import { IconCoin, IconUsers, IconTag } from "@/components/Icons";

export const revalidate = 600;

export default async function PaidChannelPage() {
  const d = await getDataset();
  const rows = paidChannelSummary(d);
  const mom = monthOverMonth(d);
  const totalSpendVnd = rows.reduce((a, r) => a + r.spendVnd, 0);
  const totalCvs = rows.reduce((a, r) => a + r.cvs, 0);
  const blended = totalCvs > 0 ? totalSpendVnd / totalCvs : 0;
  const barData = rows.map((r) => ({ label: r.label, spendVnd: r.spendVnd, color: chColor(r.channel) }));

  // Dữ liệu gọn cho khu vực chọn-range (tính lại ở client khi đổi ngày).
  const metaLite = d.meta.map((m) => ({ date: m.date, spend: m.spend, leads: m.leads }));
  const cvLite = d.cvs.filter((c) => c.date).map((c) => ({ date: c.date, ch: classifySource(c.source) }));
  const vnNow = new Date(Date.now() + 7 * 3600 * 1000); // giờ VN (UTC+7)
  const defTo = vnNow.toISOString().slice(0, 10);
  const defFrom = `${vnNow.getUTCFullYear()}-${String(vnNow.getUTCMonth() + 1).padStart(2, "0")}-01`;

  return (
    <>
      <Header source={d.source} title="Paid channel" eyebrow="Meta · LinkedIn · ITviec · TopDev" />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard tone="pink" icon={<IconCoin />} label="Tổng chi phí (VND-equiv)" value={fmtVnd(totalSpendVnd)}
          delta={mom.spendVnd} sub={`Meta quy đổi @${KRW_TO_VND} VND/₩`} />
        <KpiCard tone="blue" icon={<IconUsers />} label="CV từ kênh paid" value={fmtInt(totalCvs)}
          delta={mom.cvs} sub="gán theo nguồn" />
        <KpiCard tone="orange" icon={<IconTag />} label="Cost / CV (blended)" value={fmtVnd(blended)}
          sub="chi phí paid ÷ CV paid" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.channel} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <Dot color={chColor(r.channel)} /> {r.label}
              </span>
              <span className="pill bg-black/[0.04] text-muted">{r.jobs != null ? `${r.jobs} job post` : "ads"}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <Metric label="Chi phí" value={r.ccy === "KRW" ? fmtKrw(r.spend) : fmtVnd(r.spend)} sub={r.ccy === "KRW" ? `≈ ${fmtVnd(r.spendVnd)}` : undefined} />
              <Metric label="CV" value={fmtInt(r.cvs)} />
              <Metric label="Cost/CV" value={r.costPerCvVnd ? fmtVnd(r.costPerCvVnd) : "—"} />
            </div>
            {r.channel === "meta" && (
              <p className="mt-3 text-[11px] text-muted">CV = lead Meta báo cáo (raw-data-v2)</p>
            )}
          </div>
        ))}
      </section>

      <RangePanel jobSlots={d.jobSlots} meta={metaLite} cvs={cvLite} defaultFrom={defFrom} defaultTo={defTo} />

      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-ink">Chi phí theo kênh</h2>
        <p className="mb-2 text-xs text-muted">Quy về VND để so sánh (Meta gốc là KRW)</p>
        <ChannelSpendBar data={barData} />
      </section>
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
