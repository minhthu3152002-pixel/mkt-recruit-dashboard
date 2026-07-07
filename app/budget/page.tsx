import { getDataset } from "@/lib/sheets";
import { monthlySpend, fmtVnd, fmtKrw, monthLabel } from "@/lib/metrics";
import { CHANNEL_META } from "@/lib/sources";
import { KpiCard } from "@/components/KpiCard";
import { Header } from "@/components/Header";
import { MonthlyStack } from "@/components/Charts";
import { PopularityBar, ValueBadge, Dot } from "@/components/Bits";
import { chColor } from "@/components/theme";
import { IconCoin, IconTarget, IconGauge } from "@/components/Icons";

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
    <>
      <Header source={d.source} title="Monthly Budget" eyebrow="Đã sài bao nhiêu theo từng kênh" />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard tone="pink" icon={<IconCoin />} label="Đã chi (VND-equiv)" value={fmtVnd(totalActual)} />
        <KpiCard tone="blue" icon={<IconTarget />} label="Kế hoạch" value={totalPlan > 0 ? fmtVnd(totalPlan) : "—"} />
        <KpiCard tone={usedPct > 100 ? "pink" : "green"} icon={<IconGauge />} label="% đã dùng"
          value={totalPlan > 0 ? usedPct.toFixed(0) + "%" : "—"} sub={totalPlan > 0 ? "actual ÷ plan" : "chưa có plan"} />
      </section>

      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-ink">Actual vs Plan theo tháng</h2>
        <p className="mb-2 text-xs text-muted">Cột màu = actual từng kênh (VND-equiv) · đường hồng = kế hoạch</p>
        <MonthlyStack data={chartData} />
      </section>

      <div className="card overflow-hidden">
        <div className="px-6 pt-6"><h2 className="font-display text-lg font-bold text-ink">Chi tiết</h2></div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                <th className="px-6 py-2">Tháng</th>
                <th className="px-3 py-2">Kênh</th>
                <th className="px-3 py-2 text-right">Actual</th>
                <th className="px-3 py-2 text-right">Plan</th>
                <th className="px-6 py-2 w-[28%]">% dùng</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const pct = r.planVnd > 0 ? (r.actualVnd / r.planVnd) * 100 : null;
                return (
                  <tr key={i} className="border-t border-black/[0.05]">
                    <td className="px-6 py-3.5 font-medium text-ink">{monthLabel(r.month)}</td>
                    <td className="px-3 py-3.5">
                      <span className="flex items-center gap-2 text-ink"><Dot color={chColor(r.channel)} />{CHANNEL_META[r.channel].label}</span>
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-ink">{r.channel === "meta" ? fmtKrw(r.actualNative) : fmtVnd(r.actualNative)}</td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-muted">{r.planVnd > 0 ? fmtVnd(r.planVnd) : "—"}</td>
                    <td className="px-6 py-3.5">
                      {pct != null ? (
                        <div className="flex items-center gap-3">
                          <PopularityBar value={pct / 100} color={pct > 100 ? "#ef4444" : "#22c55e"} />
                          <span className="w-12 shrink-0 text-right"><ValueBadge tone={pct > 100 ? "down" : "up"}>{pct.toFixed(0)}%</ValueBadge></span>
                        </div>
                      ) : <span className="text-muted">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
