"use client";
import { useState } from "react";
import type { JobSlotRow } from "@/lib/types";
import type { Channel } from "@/lib/sources";
import { channelCostInRange, toVnd, fmtVnd, fmtKrw, fmtInt, KRW_TO_VND } from "@/lib/metrics";
import { KpiCard } from "@/components/KpiCard";
import { Dot, ChartCard } from "@/components/Bits";
import { ChannelCostCombo } from "@/components/Charts";
import { chColor } from "@/components/theme";
import { IconCoin, IconUsers, IconTag } from "@/components/Icons";

type LiteMeta = { date: string; spend: number; leads: number };
type LiteCv = { date: string; ch: Channel };
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
  jobSlots, meta, cvs, defaultFrom, defaultTo,
}: {
  jobSlots: JobSlotRow[]; meta: LiteMeta[]; cvs: LiteCv[]; defaultFrom: string; defaultTo: string;
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
    return { metaKrw: ma.spend, perCost, perCv, cost, cv, blended: cv > 0 ? cost / cv : null };
  }

  const cur = totalsFor({ from, to });

  // Kỳ liền trước cùng độ dài (số ngày) — để so badge %.
  const fromD = dayNum(from), toD = dayNum(to);
  const len = fromD != null && toD != null && toD >= fromD ? toD - fromD + 1 : 0;
  const prevRange = len > 0 ? { from: isoOf(fromD! - len), to: isoOf(fromD! - 1) } : null;
  const prev = prevRange ? totalsFor(prevRange) : null;
  const pct = (c: number, p: number) => (p > 0 ? ((c - p) / p) * 100 : null);
  const costDelta = prev ? pct(cur.cost, prev.cost) : null;
  const cvDelta = prev ? pct(cur.cv, prev.cv) : null;
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

  const inputCls =
    "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/20";

  return (
    <section className="card space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Theo khoảng ngày</h2>
          <p className="text-xs text-muted">Job-board rải đều cost theo ngày · Meta theo spend/leads · CV theo ngày nộp · badge so với kỳ liền trước cùng độ dài</p>
        </div>
        <div className="flex items-end gap-3">
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Từ ngày
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Đến ngày
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </label>
        </div>
      </div>

      {/* 3 thẻ tổng theo range — badge "so với kỳ trước" */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard surface tone="pink" icon={<IconCoin />} label="Tổng chi phí (VND-equiv)" value={fmtVnd(cur.cost)}
          sub={`Meta quy đổi @${KRW_TO_VND} VND/₩`} delta={costDelta} deltaLabel="so với kỳ trước" deltaLowerIsBetter />
        <KpiCard surface tone="blue" icon={<IconUsers />} label="CV từ kênh paid" value={fmtInt(cur.cv)}
          sub="gán theo nguồn" delta={cvDelta} deltaLabel="so với kỳ trước" />
        <KpiCard surface tone="orange" icon={<IconTag />} label="Cost / CV (blended)" value={cur.blended != null ? fmtVnd(cur.blended) : "—"}
          sub="chi phí paid ÷ CV paid" delta={blendedDelta} deltaLabel="so với kỳ trước" deltaLowerIsBetter />
      </div>

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
                <Metric label="Chi phí" value={s.ccy === "KRW" ? fmtKrw(s.spend) : fmtVnd(s.spend)} sub={s.ccy === "KRW" ? `≈ ${fmtVnd(s.spendVnd)}` : undefined} />
                <Metric label="CV" value={fmtInt(s.cv)} />
                <Metric label="Cost/CV" value={s.cpc ? fmtVnd(s.cpc) : "—"} />
              </div>
              {key === "meta" && <p className="mt-3 text-[11px] text-muted">CV = lead Meta báo cáo (raw-data-v2)</p>}
            </div>
          );
        })}
      </div>

      {/* chart gộp theo range */}
      <ChartCard title="Chi phí & Cost/CV theo kênh" subtitle="Trong khoảng ngày đã chọn · cột hồng = chi phí (trục trái) · cột xanh = cost/CV (trục phải)">
        <ChannelCostCombo data={comboData} height={260} />
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
