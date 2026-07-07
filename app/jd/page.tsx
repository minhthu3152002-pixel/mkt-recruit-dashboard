import { getDataset } from "@/lib/sheets";
import { jdMetrics, fmtVnd, fmtKrw, fmtInt } from "@/lib/metrics";
import { KpiCard } from "@/components/KpiCard";
import { Header } from "@/components/Header";

export const revalidate = 600;

export default async function JdPage() {
  const d = await getDataset();
  const jds = jdMetrics(d);
  const totalCvs = jds.reduce((a, r) => a + r.totalCvs, 0);
  const totalPaid = jds.reduce((a, r) => a + r.cvPaid, 0);
  const totalFree = jds.reduce((a, r) => a + r.cvFree, 0);
  const totalVnd = jds.reduce((a, r) => a + r.totalVnd, 0);
  const blended = totalCvs > 0 ? totalVnd / totalCvs : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Header source={d.source} title="CV theo JD" eyebrow="Chi ph\u00ed & cost/CV cho t\u1eebng job" />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="T\u1ed5ng CV" value={fmtInt(totalCvs)} accent="#5b3df5" />
        <KpiCard label="CV paid" value={fmtInt(totalPaid)} accent="#2563eb" />
        <KpiCard label="CV free" value={fmtInt(totalFree)} accent="#16a34a" />
        <KpiCard label="Cost / CV (blended)" value={fmtVnd(blended)} accent="#e4322b" />
      </section>

      <div className="card overflow-hidden">
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-semibold">Chi ti\u1ebft t\u1eebng JD</h2>
          <p className="text-xs text-black/45">Ti\u1ec1n = job-slot theo Job code + Meta chia \u0111\u1ec1u \u00b7 CV t\u1eeb JD DAILY</p>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-black/40">
                <th className="px-5 py-2 font-semibold">JD</th>
                <th className="px-3 py-2 text-right font-semibold">CV</th>
                <th className="px-3 py-2 text-right font-semibold">Paid</th>
                <th className="px-3 py-2 text-right font-semibold">Free</th>
                <th className="px-3 py-2 text-right font-semibold">Job-slot (VND)</th>
                <th className="px-3 py-2 text-right font-semibold">Meta (KRW)</th>
                <th className="px-5 py-2 text-right font-semibold">Cost/CV</th>
              </tr>
            </thead>
            <tbody>
              {jds.map((j) => (
                <tr key={j.jdCode} className="border-t border-black/[0.05] hover:bg-black/[0.015]">
                  <td className="px-5 py-3">
                    <div className="font-medium">{j.jdCode}</div>
                    <div className="text-[11px] text-black/45">{j.company} \u00b7 {j.title}</div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-medium">{fmtInt(j.totalCvs)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-black/60">{fmtInt(j.cvPaid)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-free">{fmtInt(j.cvFree)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{j.jobSlotVnd > 0 ? fmtVnd(j.jobSlotVnd) : "\u2014"}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-black/60">{j.metaKRW > 0 ? fmtKrw(j.metaKRW) : "\u2014"}</td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {j.costPerCvVnd ? <span className="pill bg-black/[0.05] text-black/70">{fmtVnd(j.costPerCvVnd)}</span> : <span className="pill bg-free/10 text-free">mi\u1ec5n ph\u00ed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="px-1 text-xs text-black/40">
        Cost/CV = (job-slot theo Job code + ph\u1ea7n Meta chia \u0111\u1ec1u, quy \u0111\u1ed5i VND) \u00f7 t\u1ed5ng CV c\u1ee7a JD. JD kh\u00f4ng ch\u1ea1y paid \u2192 mi\u1ec5n ph\u00ed.
      </p>
    </div>
  );
}
