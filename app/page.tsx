import { getDataset } from "@/lib/sheets";
import { paidChannelSummary, fmtVnd, fmtKrw, fmtInt, KRW_TO_VND } from "@/lib/metrics";
import { KpiCard } from "@/components/KpiCard";
import { ChannelSpendBar } from "@/components/Charts";
import { Header } from "@/components/Header";

export const revalidate = 600;

export default async function PaidChannelPage() {
  const d = await getDataset();
  const rows = paidChannelSummary(d);
  const totalSpendVnd = rows.reduce((a, r) => a + r.spendVnd, 0);
  const totalCvs = rows.reduce((a, r) => a + r.cvs, 0);
  const blended = totalCvs > 0 ? totalSpendVnd / totalCvs : 0;
  const barData = rows.map((r) => ({ label: r.label, spendVnd: r.spendVnd, color: chColor(r.channel) }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Header source={d.source} title="Paid channel" eyebrow="Meta · LinkedIn · ITviec · TopDev" />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard label="Tổng chi phí (VND-equiv)" value={fmtVnd(totalSpendVnd)} sub={`Meta quy đổi @${KRW_TO_VND} VND/₩`} accent="#5b3df5" />
        <KpiCard label="CV từ kênh paid" value={fmtInt(totalCvs)} sub="gán theo nguồn" accent="#2563eb" />
        <KpiCard label="Cost / CV (blended)" value={fmtVnd(blended)} sub="chi phí paid ÷ CV paid" accent="#e4322b" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.channel} className="card rail p-4" style={{ ["--rail" as any]: chColor(r.channel) }}>
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold">{r.label}</span>
              <span className="pill bg-black/[0.05] text-black/60">{r.jobs != null ? `${r.jobs} job post` : "ads"}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <Metric label="Chi phí" value={r.ccy === "KRW" ? fmtKrw(r.spend) : fmtVnd(r.spend)} sub={r.ccy === "KRW" ? `≈ ${fmtVnd(r.spendVnd)}` : undefined} />
              <Metric label="CV" value={fmtInt(r.cvs)} />
              <Metric label="Cost/CV" value={r.costPerCvVnd ? fmtVnd(r.costPerCvVnd) : "—"} />
            </div>
            {r.channel === "meta" && (
              <p className="mt-2 text-[11px] text-black/40">CV = lead Meta báo cáo (raw-data-v2)</p>
            )}
          </div>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="font-display text-lg font-semibold">Chi phí theo kênh</h2>
        <p className="mb-3 text-xs text-black/45">Quy về VND để so sánh (Meta gốc là KRW)</p>
        <ChannelSpendBar data={barData} />
      </section>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-black/40">{label}</div>
      <div className="font-medium tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-black/40">{sub}</div>}
    </div>
  );
}

function chColor(ch: string) {
  return ({ meta: "#2563eb", linkedin: "#0a66c2", itviec: "#e4322b", topdev: "#f04e37", free: "#16a34a" } as Record<string, string>)[ch] ?? "#5b3df5";
}
