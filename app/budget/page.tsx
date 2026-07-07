import { getDataset } from "@/lib/sheets";
import { monthlySpend, fmtVnd, fmtKrw, monthLabel } from "@/lib/metrics";
import { CHANNEL_META } from "@/lib/sources";
import { KpiCard } from "@/components/KpiCard";
import { Header } from "@/components/Header";
import { MonthlyStack } from "@/components/Charts";

export const revalidate = 600;

export default async function BudgetPage() {
  const d = await getDataset();
  const rows = monthlySpend(d);
  const totalActual = rows.reduce((a, r) => a + r.actualVnd, 0);
  const totalPlan = rows.reduce((a, r) => a + r.planVnd, 0);
  const usedPct = totalPlan > 0 ? (totalActual / totalPlan) * 100 : 0;

  const months = Array.from(new Set(rows.map((r) => r.month))).sort();
  const chartData = months.map((m) => {
    const mr = rows.filter((r) => r.month === m);
    const get = (ch: string) => mr.find((r) => r.channel === ch)?.actualVnd ?? 0;
    return {
      month: monthLabel(m),
      Meta: get("meta"), LinkedIn: get("linkedin"), ITviec: get("itviec"), TopDev: get("topdev"),
      Plan: mr.reduce((a, r) => a + r.planVnd, 0),
    };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Header source={d.source} title="Budget theo tháng" eyebrow="Đã sài bao nhiêu theo từng kênh" />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard label="Đã chi (VND-equiv)" value={fmtVnd(totalActual)} accent="#5b3df5" />
        <KpiCard label="Kế hoạch" value={totalPlan > 0 ? fmtVnd(totalPlan) : "—"} accent="#2563eb" />
        <KpiCard label="% đã dùng" value={totalPlan > 0 ? usedPct.toFixed(0) + "%" : "—"} sub="actual ÷ plan" accent={usedPct > 100 ? "#e4322b" : "#16a34a"} />
      </section>

      <section className="card p-5">
        <h2 className="font-display text-lg font-semibold">Actual vs Plan theo tháng</h2>
        <p className="mb-3 text-xs text-black/45">Cột màu = actual từng kênh (VND-equiv) · cột nhạt = kế hoạch</p>
        <MonthlyStack data={chartData} />
      </section>

      <div className="card overflow-hidden">
        <div className="px-5 pt-5"><h2 className="font-display text-lg font-semibold">Chi tiết</h2></div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-black/40">
                <th className="px-5 py-2 font-semibold">Tháng</th>
                <th className="px-3 py-2 font-semibold">Kênh</th>
                <th className="px-3 py-2 text-right font-semibold">Actual</th>
                <th className="px-3 py-2 text-right font-semibold">Plan</th>
                <th className="px-5 py-2 text-right font-semibold">% dùng</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const pct = r.planVnd > 0 ? (r.actualVnd / r.planVnd) * 100 : null;
                return (
                  <tr key={i} className="border-t border-black/[0.05]">
                    <td className="px-5 py-3">{monthLabel(r.month)}</td>
                    <td className="px-3 py-3">{CHANNEL_META[r.channel].label}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.channel === "meta" ? `${fmtKrw(r.actualNative)}` : fmtVnd(r.actualNative)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-black/50">{r.planVnd > 0 ? fmtVnd(r.planVnd) : "—"}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {pct != null ? <span className={pct > 100 ? "text-[#e4322b]" : "text-free"}>{pct.toFixed(0)}%</span> : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
