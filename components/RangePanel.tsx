"use client";
import { useState } from "react";
import type { JobSlotRow } from "@/lib/types";
import type { Channel } from "@/lib/sources";
import { channelCostInRange, toVnd, fmtVnd, fmtKrw, fmtInt, KRW_TO_VND } from "@/lib/metrics";
import { KpiCard } from "@/components/KpiCard";
import { Dot } from "@/components/Bits";
import { chColor } from "@/components/theme";
import { IconCoin, IconUsers, IconTag } from "@/components/Icons";

type LiteMeta = { date: string; spend: number; leads: number };
type LiteCv = { date: string; ch: Channel };

const CHANNELS: { key: Exclude<Channel, "free">; label: string; ccy: "KRW" | "VND" }[] = [
  { key: "meta", label: "Meta Ads", ccy: "KRW" },
  { key: "linkedin", label: "LinkedIn", ccy: "VND" },
  { key: "itviec", label: "ITviec", ccy: "VND" },
  { key: "topdev", label: "TopDev", ccy: "VND" },
];

export function RangePanel({
  jobSlots, meta, cvs, defaultFrom, defaultTo,
}: {
  jobSlots: JobSlotRow[]; meta: LiteMeta[]; cvs: LiteCv[]; defaultFrom: string; defaultTo: string;
}) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const jobCost = channelCostInRange(jobSlots, { from, to });
  const metaAgg = meta.reduce(
    (a, m) => (m.date >= from && m.date <= to ? { spend: a.spend + m.spend, leads: a.leads + m.leads } : a),
    { spend: 0, leads: 0 }
  );
  const cvCount = (ch: Channel) => cvs.filter((c) => c.ch === ch && c.date >= from && c.date <= to).length;

  // CV theo kênh trong range (Meta = leads; còn lại = đếm CV theo ngày nộp).
  const cv = { meta: metaAgg.leads, linkedin: cvCount("linkedin"), itviec: cvCount("itviec"), topdev: cvCount("topdev") };

  function stat(key: Exclude<Channel, "free">) {
    if (key === "meta") {
      const spend = metaAgg.spend, spendVnd = toVnd(spend);
      return { ccy: "KRW" as const, spend, spendVnd, cv: cv.meta, cpc: cv.meta > 0 ? spendVnd / cv.meta : null };
    }
    const spend = jobCost[key];
    return { ccy: "VND" as const, spend, spendVnd: spend, cv: cv[key], cpc: cv[key] > 0 ? spend / cv[key] : null };
  }

  // 3 thẻ tổng theo range (không badge "so với tháng trước").
  const totalCost = toVnd(metaAgg.spend) + jobCost.linkedin + jobCost.itviec + jobCost.topdev;
  const totalCv = cv.meta + cv.linkedin + cv.itviec + cv.topdev;
  const blended = totalCv > 0 ? totalCost / totalCv : null;

  const inputCls =
    "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/20";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Theo khoảng ngày</h2>
          <p className="text-xs text-muted">Job-board rải đều cost theo ngày · Meta theo spend/leads trong range · CV theo ngày nộp</p>
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

      {/* 3 thẻ tổng theo range — cùng design 3 thẻ tổng overview, KHÔNG có badge % */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard tone="pink" icon={<IconCoin />} label="Tổng chi phí (VND-equiv)" value={fmtVnd(totalCost)} sub={`Meta quy đổi @${KRW_TO_VND} VND/₩`} />
        <KpiCard tone="blue" icon={<IconUsers />} label="CV từ kênh paid" value={fmtInt(totalCv)} sub="gán theo nguồn" />
        <KpiCard tone="orange" icon={<IconTag />} label="Cost / CV (blended)" value={blended != null ? fmtVnd(blended) : "—"} sub="chi phí paid ÷ CV paid" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CHANNELS.map(({ key, label }) => {
          const s = stat(key);
          return (
            <div key={key} className="card p-5">
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
