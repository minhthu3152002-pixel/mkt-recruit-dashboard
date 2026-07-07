"use client";
import { useState } from "react";
import type { JobSlotRow } from "@/lib/types";
import type { Channel } from "@/lib/sources";
import { channelCostInRange, toVnd } from "@/lib/metrics";
import { t, formatMoney, formatInt, moneyLabel, rateNote } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { KpiCard } from "@/components/KpiCard";
import { Dot, ChartCard } from "@/components/Bits";
import { ChannelCostCombo } from "@/components/Charts";
import { chColor } from "@/components/theme";
import { IconCoin, IconUsers, IconTag, IconJd } from "@/components/Icons";

type LiteMeta = { date: string; spend: number; leads: number };
type LiteCv = { date: string; ch: Channel; jd: string };
type Ch = Exclude<Channel, "free">;

const CHANNELS: { key: Ch; label: string; ccy: "KRW" | "VND" }[] = [
  { key: "meta", label: "Meta Ads", ccy: "KRW" },
  { key: "linkedin", label: "LinkedIn", ccy: "VND" },
  { key: "itviec", label: "ITviec", ccy: "VND" },
  { key: "topdev", label: "TopDev", ccy: "VND" },
];

const dayNum = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000) : null;
};
const isoOf = (d: number) => new Date(d * 86400000).toISOString().slice(0, 10);

export function RangePanel({
  lang, jobSlots, meta, cvs, defaultFrom, defaultTo,
}: {
  lang: Lang; jobSlots: JobSlotRow[]; meta: LiteMeta[]; cvs: LiteCv[]; defaultFrom: string; defaultTo: string;
}) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  function totalsFor(r: { from: string; to: string }) {
    const jc = channelCostInRange(jobSlots, r);
    const ma = meta.reduce(
      (a, m) => (m.date >= r.from && m.date <= r.to ? { spend: a.spend + m.spend, leads: a.leads + m.leads } : a),
      { spend: 0, leads: 0 }
    );
    const cvc = (ch: Channel) => cvs.filter((c) => c.ch === ch && c.date >= r.from && c.date <= r.to).length;
    const perCv: Record<Ch, number> = { meta: ma.leads, linkedin: cvc("linkedin"), itviec: cvc("itviec"), topdev: cvc("topdev") };
    const perCost: Record<Ch, number> = { meta: toVnd(ma.spend), linkedin: jc.linkedin, itviec: jc.itviec, topdev: jc.topdev };
    const cost = perCost.meta + perCost.linkedin + perCost.itviec + perCost.topdev;
    const cv = perCv.meta + perCv.linkedin + perCv.itviec + perCv.topdev;
    // JD distinct có ≥1 CV kênh trả phí, ngày nộp trong range.
    const paidJd = new Set(cvs.filter((c) => c.ch !== "free" && c.date >= r.from && c.date <= r.to).map((c) => c.jd)).size;
    return { metaKrw: ma.spend, perCost, perCv, cost, cv, blended: cv > 0 ? cost / cv : null, paidJd };
  }

  const cur = totalsFor({ from, to });

  // Kỳ liền trước cùng độ dài (số ngày) — để so badge %.
  const fromD = dayNum(from), toD = dayNum(to);
  const len = fromD != null && toD != null && toD >= fromD ? toD - fromD + 1 : 0;
  const prevRange = len > 0 ? { from: isoOf(fromD! - len), to: isoOf(fromD! - 1) } : null;
  const prev = prevRange ? totalsFor(prevRange) : null;
  // Ẩn badge khi kỳ trước quá nhỏ (< 5% kỳ này) -> tránh % vô nghĩa do chia cho số gần 0.
  const MIN_PREV_RATIO = 0.05;
  const pct = (c: number, p: number) => (p > 0 && p >= MIN_PREV_RATIO * c ? ((c - p) / p) * 100 : null);
  const costDelta = prev ? pct(cur.cost, prev.cost) : null;
  const cvDelta = prev ? pct(cur.cv, prev.cv) : null;
  const jdDelta = prev ? pct(cur.paidJd, prev.paidJd) : null;
  const blendedDelta = prev && prev.blended != null && cur.blended != null ? pct(cur.blended, prev.blended) : null;

  // Dữ liệu chart gộp (Chi phí + Cost/CV) theo range.
  const comboData = CHANNELS.map((c) => ({
    label: c.label,
    chiphi: cur.perCost[c.key],
    costcv: cur.perCv[c.key] > 0 ? cur.perCost[c.key] / cur.perCv[c.key] : 0,
  }));

  function stat(key: Ch) {
    if (key === "meta") {
      const spend = cur.metaKrw, spendVnd = cur.perCost.meta, n = cur.perCv.meta;
      return { ccy: "KRW" as const, spend, spendVnd, cv: n, cpc: n > 0 ? spendVnd / n : null };
    }
    const spend = cur.perCost[key], n = cur.perCv[key];
    return { ccy: "VND" as const, spend, spendVnd: spend, cv: n, cpc: n > 0 ? spend / n : null };
  }

  const vsPrev = t(lang, "range.vsPrev");
  const inputCls =
    "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/20";

  return (
    <section className="card space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">{t(lang, "range.title")}</h2>
          <p className="text-xs text-muted">{t(lang, "range.sub")}</p>
        </div>
        <div className="flex items-end gap-3">
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t(lang, "common.from")}
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t(lang, "common.to")}
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </label>
        </div>
      </div>

      {/* 4 thẻ tổng theo range — badge "so với kỳ trước" */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard surface tone="pink" icon={<IconCoin />} label={`${t(lang, "paid.kpi.totalCost")} (${moneyLabel(lang)})`} value={formatMoney(cur.cost, "VND", lang)}
          sub={rateNote(lang)} delta={costDelta} deltaLabel={vsPrev} deltaNeutral />
        <KpiCard surface tone="blue" icon={<IconUsers />} label={t(lang, "paid.kpi.cvPaid")} value={formatInt(cur.cv, lang)}
          sub={t(lang, "paid.kpi.bySource")} delta={cvDelta} deltaLabel={vsPrev} />
        <KpiCard surface tone="orange" icon={<IconTag />} label={t(lang, "paid.kpi.costPerCv")} value={cur.blended != null ? formatMoney(cur.blended, "VND", lang) : "—"}
          sub={t(lang, "paid.kpi.costDivCv")} delta={blendedDelta} deltaLabel={vsPrev} deltaLowerIsBetter />
        <KpiCard surface tone="green" icon={<IconJd />} label={t(lang, "paid.kpi.paidJd")} value={formatInt(cur.paidJd, lang)}
          sub={t(lang, "paid.kpi.jdHasPaid")} delta={jdDelta} deltaLabel={vsPrev} deltaNeutral />
      </div>
      <p className="text-[11px] leading-relaxed text-muted">{t(lang, "range.note")}</p>

      {/* 4 thẻ kênh theo range */}
      <div className="grid gap-4 sm:grid-cols-2">
        {CHANNELS.map(({ key, label }) => {
          const s = stat(key);
          return (
            <div key={key} className="rounded-2xl bg-canvas p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                  <Dot color={chColor(key)} /> {label}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <Metric label={t(lang, "paid.ch.chiphi")} value={formatMoney(s.spend, s.ccy, lang)}
                  sub={key === "meta" ? (lang === "vi" ? `= ${formatMoney(s.spend, s.ccy, "ko")}` : `≈ ${formatMoney(s.spend, s.ccy, "vi")}`) : undefined} />
                <Metric label={t(lang, "paid.ch.cv")} value={formatInt(s.cv, lang)} />
                <Metric label={t(lang, "paid.ch.costcv")} value={s.cpc ? formatMoney(s.cpc, "VND", lang) : "—"} />
              </div>
              {key === "meta" && <p className="mt-3 text-[11px] text-muted">{t(lang, "paid.ch.metaNote")}</p>}
            </div>
          );
        })}
      </div>

      {/* chart gộp theo range */}
      <ChartCard title={t(lang, "range.chart.title")} subtitle={t(lang, "range.chart.sub")}>
        <ChannelCostCombo data={comboData} height={260} lang={lang} />
      </ChartCard>
    </section>
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
