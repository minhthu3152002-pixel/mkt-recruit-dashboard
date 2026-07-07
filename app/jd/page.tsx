import { getDataset } from "@/lib/sheets";
import { jdMetrics } from "@/lib/metrics";
import { getLang } from "@/lib/lang";
import { t, formatMoney, formatInt } from "@/lib/i18n";
import { KpiCard } from "@/components/KpiCard";
import { Header } from "@/components/Header";
import { PopularityBar, ValueBadge } from "@/components/Bits";
import { IconUsers, IconGauge, IconTag, IconJd } from "@/components/Icons";

export const revalidate = 600;

export default async function JdPage() {
  const lang = getLang();
  const d = await getDataset();
  const jds = jdMetrics(d);
  const totalCvs = jds.reduce((a, r) => a + r.totalCvs, 0);
  const totalPaid = jds.reduce((a, r) => a + r.cvPaid, 0);
  const totalFree = jds.reduce((a, r) => a + r.cvFree, 0);
  const totalVnd = jds.reduce((a, r) => a + r.totalVnd, 0);
  const blended = totalCvs > 0 ? totalVnd / totalCvs : 0;
  const maxCvs = jds.reduce((m, j) => Math.max(m, j.totalCvs), 0) || 1;

  return (
    <>
      <Header source={d.source} lang={lang} title={t(lang, "jd.title")} eyebrow={t(lang, "jd.eyebrow")} />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard tone="blue" icon={<IconUsers />} label={t(lang, "jd.kpi.totalCv")} value={formatInt(totalCvs, lang)} />
        <KpiCard tone="pink" icon={<IconJd />} label={t(lang, "jd.kpi.cvPaid")} value={formatInt(totalPaid, lang)} />
        <KpiCard tone="green" icon={<IconGauge />} label={t(lang, "jd.kpi.cvFree")} value={formatInt(totalFree, lang)} />
        <KpiCard tone="orange" icon={<IconTag />} label={t(lang, "jd.kpi.costPerCv")} value={formatMoney(blended, "VND", lang)} />
      </section>

      <div className="card overflow-hidden">
        <div className="px-6 pt-6">
          <h2 className="font-display text-lg font-bold text-ink">{t(lang, "jd.tbl.title")}</h2>
          <p className="mt-0.5 text-xs text-muted">{t(lang, "jd.tbl.sub")}</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                <th className="w-8 px-6 py-2">#</th>
                <th className="px-3 py-2">{t(lang, "jd.col.jd")}</th>
                <th className="px-3 py-2 w-[26%]">{t(lang, "jd.col.cvVol")}</th>
                <th className="px-3 py-2 text-right">{t(lang, "jd.col.paid")}</th>
                <th className="px-3 py-2 text-right">{t(lang, "jd.col.free")}</th>
                <th className="px-3 py-2 text-right">{t(lang, "jd.col.jobslot")}</th>
                <th className="px-3 py-2 text-right">{t(lang, "jd.col.meta")}</th>
                <th className="px-6 py-2 text-right">{t(lang, "jd.col.costcv")}</th>
              </tr>
            </thead>
            <tbody>
              {jds.map((j, i) => (
                <tr key={j.jdCode} className="border-t border-black/[0.05] hover:bg-black/[0.015]">
                  <td className="px-6 py-3.5 text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-3 py-3.5">
                    <div className="font-semibold text-ink">{j.jdCode}</div>
                    <div className="text-[11px] text-muted">{j.company} · {j.title}</div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <PopularityBar value={j.totalCvs / maxCvs} color={j.cvPaid >= j.cvFree ? "#ec2c69" : "#2f6bff"} />
                      <span className="w-10 shrink-0 text-right font-semibold tabular-nums text-ink">{formatInt(j.totalCvs, lang)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-muted">{formatInt(j.cvPaid, lang)}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-free">{formatInt(j.cvFree, lang)}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-muted">{j.jobSlotVnd > 0 ? formatMoney(j.jobSlotVnd, "VND", lang) : "—"}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-muted">{j.metaKRW > 0 ? formatMoney(j.metaKRW, "KRW", lang) : "—"}</td>
                  <td className="px-6 py-3.5 text-right">
                    {j.costPerCvVnd ? (
                      <ValueBadge tone="pink">{formatMoney(j.costPerCvVnd, "VND", lang)}</ValueBadge>
                    ) : j.cvPaid > 0 ? (
                      <ValueBadge tone="warn">{t(lang, "jd.badge.updating")}</ValueBadge>
                    ) : (
                      <ValueBadge tone="green">{t(lang, "jd.badge.free")}</ValueBadge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-1 px-1 text-xs text-muted">
        <p>{t(lang, "jd.foot1")}</p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <ValueBadge tone="green">{t(lang, "jd.badge.free")}</ValueBadge> {t(lang, "jd.foot.free")} ·
          <ValueBadge tone="warn">{t(lang, "jd.badge.updating")}</ValueBadge> {t(lang, "jd.foot.updating")}
        </p>
      </div>
    </>
  );
}
