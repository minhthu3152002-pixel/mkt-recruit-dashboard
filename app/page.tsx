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
      <Header source={d.source} title="Paid channel" eyebrow="Meta \u00b7 LinkedIn \u00b7 ITviec \u00b7 TopDev" />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard label="T\u1ed5ng chi ph\u00ed (VND-equiv)" value={fmtVnd(totalSpendVnd)} sub={`Meta quy \u0111\u1ed5i @${KRW_TO_VND} VND/\u20a9`} accent="#5b3df5" />
        <KpiCard label="CV t\u1eeb k\u00eanh paid" value={fmtInt(totalCvs)} sub="g\u00e1n theo ngu\u1ed3n" accent="#2563eb" />
        <KpiCard label="Cost / CV (blended)" value={fmtVnd(blended)} sub="chi ph\u00ed paid \u00f7 CV paid" accent="#e4322b" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.channel} className="card rail p-4" style={{ ["--rail" as any]: chColor(r.channel) }}>
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold">{r.label}</span>
              <span className="pill bg-black/[0.05] text-black/60">{r.jobs != null ? `${r.jobs} job post` : "ads"}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <Metric label="Chi ph\u00ed" value={r.ccy === "KRW" ? fmtKrw(r.spend) : fmtVnd(r.spend)} sub={r.ccy === "KRW" ? `\u2248 ${fmtVnd(r.spendVnd)}` : undefined} />
              <Metric label="CV" value={fmtInt(r.cvs)} />
              <Metric label="Cost/CV" value={r.costPerCvVnd ? fmtVnd(r.costPerCvVnd) : "\u2014"} />
            </div>
          </div>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="font-display text-lg font-semibold">Chi ph\u00ed theo k\u00eanh</h2>
        <p className="mb-3 text-xs text-black/45">Quy v\u1ec1 VND \u0111\u1ec3 so s\u00e1nh (Meta g\u1ed1c l\u00e0 KRW)</p>
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
