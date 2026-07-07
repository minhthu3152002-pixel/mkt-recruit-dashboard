import { getDataset } from "@/lib/sheets";
import { monthlySpend, monthLabel } from "@/lib/metrics";
import { CHANNEL_META } from "@/lib/sources";
import { getLang } from "@/lib/lang";
import { t, formatMoney, moneyLabel } from "@/lib/i18n";
import { KpiCard } from "@/components/KpiCard";
import { Header } from "@/components/Header";
import { MonthlyStack } from "@/components/Charts";
import { PopularityBar, ValueBadge, Dot } from "@/components/Bits";
import { chColor } from "@/components/theme";
import { IconCoin, IconTarget, IconGauge } from "@/components/Icons";

export const revalidate = 600;

export default async function BudgetPage() {
  const lang = getLang();
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
      <Header source={d.source} lang={lang} title={t(lang, "budget.title")} eyebrow={t(lang, "budget.eyebrow")} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard tone="pink" icon={<IconCoin />} label={`${t(lang, "budget.kpi.spent")} (${moneyLabel(lang)})`} value={formatMoney(totalActual, "VND", lang)} />
        <KpiCard tone="blue" icon={<IconTarget />} label={t(lang, "budget.kpi.plan")} value={totalPlan > 0 ? formatMoney(totalPlan, "VND", lang) : "—"} />
        <KpiCard tone={usedPct > 100 ? "pink" : "green"} icon={<IconGauge />} label={t(lang, "budget.kpi.usedPct")}
          value={totalPlan > 0 ? usedPct.toFixed(0) + "%" : "—"} sub={totalPlan > 0 ? t(lang, "budget.kpi.usedSub") : t(lang, "budget.kpi.noPlan")} />
      </section>

      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-ink">{t(lang, "budget.chart.title")}</h2>
        <p className="mb-2 text-xs text-muted">{t(lang, "budget.chart.sub")}</p>
        <MonthlyStack data={chartData} lang={lang} />
      </section>

      <div className="card overflow-hidden">
        <div className="px-6 pt-6"><h2 className="font-display text-lg font-bold text-ink">{t(lang, "budget.tbl.title")}</h2></div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                <th className="px-6 py-2">{t(lang, "budget.col.month")}</th>
                <th className="px-3 py-2">{t(lang, "budget.col.channel")}</th>
                <th className="px-3 py-2 text-right">{t(lang, "budget.col.actual")}</th>
                <th className="px-3 py-2 text-right">{t(lang, "budget.col.plan")}</th>
                <th className="px-6 py-2 w-[28%]">{t(lang, "budget.col.usedPct")}</th>
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
                    <td className="px-3 py-3.5 text-right tabular-nums text-ink">{r.channel === "meta" ? formatMoney(r.actualNative, "KRW", lang) : formatMoney(r.actualNative, "VND", lang)}</td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-muted">{r.planVnd > 0 ? formatMoney(r.planVnd, "VND", lang) : "—"}</td>
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
