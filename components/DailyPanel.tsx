"use client";
import { useState } from "react";
import { fmtInt } from "@/lib/metrics";

type Cv = { jd: string; d: string; s: string };
type Meta = Record<string, { company: string; title: string }>;

const MAX_DAYS = 30;
const dayNum = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000) : 0;
};
const addDays = (iso: string, n: number) => new Date((dayNum(iso) + n) * 86400000).toISOString().slice(0, 10);
const span = (f: string, t: string) => dayNum(t) - dayNum(f) + 1;
const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export function DailyPanel({ cvs, meta, defaultFrom, defaultTo }: { cvs: Cv[]; meta: Meta; defaultFrom: string; defaultTo: string }) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [clamped, setClamped] = useState(false);

  function onFrom(v: string) {
    if (!v) return;
    let f = v, t = to;
    if (f > t) t = f;
    if (span(f, t) > MAX_DAYS) { t = addDays(f, MAX_DAYS - 1); setClamped(true); } else setClamped(false);
    setFrom(f); setTo(t);
  }
  function onTo(v: string) {
    if (!v) return;
    let f = from, t = v;
    if (t < f) f = t;
    if (span(f, t) > MAX_DAYS) { f = addDays(t, -(MAX_DAYS - 1)); setClamped(true); } else setClamped(false);
    setFrom(f); setTo(t);
  }

  // các ngày trong range
  const days: string[] = [];
  for (let d = dayNum(from); d <= dayNum(to); d++) days.push(new Date(d * 86400000).toISOString().slice(0, 10));

  // gom theo JD: tích luỹ (<= to) + đếm mỗi ngày trong range + phân bố nguồn (<= to)
  const agg = new Map<string, { cum: number; daily: Record<string, number>; src: Record<string, number> }>();
  for (const c of cvs) {
    let j = agg.get(c.jd);
    if (!j) { j = { cum: 0, daily: {}, src: {} }; agg.set(c.jd, j); }
    if (c.d <= to) { j.cum++; j.src[c.s] = (j.src[c.s] ?? 0) + 1; }
    if (c.d >= from && c.d <= to) j.daily[c.d] = (j.daily[c.d] ?? 0) + 1;
  }
  const rows = [...agg.entries()].filter(([, j]) => j.cum > 0).sort((a, b) => b[1].cum - a[1].cum);

  const totalCum = rows.reduce((a, [, j]) => a + j.cum, 0);
  const totalByDay = days.map((d) => rows.reduce((a, [, j]) => a + (j.daily[d] ?? 0), 0));

  const inputCls =
    "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/20";

  return (
    <section className="card space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">CV nhận theo ngày · từng JD</h2>
          <p className="text-xs text-muted">
            Tổng tích luỹ = CV tới hết ngày “Đến” · mỗi cột = CV nhận trong đúng ngày · tối đa 30 ngày
            {clamped && <span className="ml-1 font-semibold text-pink">— đã kẹp lại 30 ngày</span>}
          </p>
        </div>
        <div className="flex items-end gap-3">
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Từ ngày
            <input type="date" value={from} max={to} onChange={(e) => onFrom(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Đến ngày
            <input type="date" value={to} min={from} onChange={(e) => onTo(e.target.value)} className={inputCls} />
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              <th className="sticky left-0 z-20 bg-white px-3 py-2 text-left">JD Code</th>
              <th className="px-3 py-2 text-left">Company</th>
              <th className="px-3 py-2 text-left">Job Title</th>
              <th className="px-3 py-2 text-right">Tổng tích luỹ</th>
              {days.map((d) => (
                <th key={d} className="px-2 py-2 text-right tabular-nums">{ddmm(d)}</th>
              ))}
              <th className="px-3 py-2 text-left">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([code, j]) => {
              const m = meta[code] ?? { company: "", title: "" };
              const srcStr = Object.entries(j.src).sort((a, b) => b[1] - a[1]).map(([s, n]) => `• ${s} (${n})`).join("  ");
              return (
                <tr key={code} className="border-t border-black/[0.05]">
                  <td className="sticky left-0 z-10 border-t border-black/[0.05] bg-white px-3 py-2.5 font-semibold text-ink">{code}</td>
                  <td className="px-3 py-2.5 text-muted">{m.company || "—"}</td>
                  <td className="px-3 py-2.5 text-muted">{m.title || "—"}</td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-ink">{fmtInt(j.cum)}</td>
                  {days.map((d) => {
                    const n = j.daily[d] ?? 0;
                    return <td key={d} className={`px-2 py-2.5 text-right tabular-nums ${n ? "text-ink" : "text-black/20"}`}>{n || "·"}</td>;
                  })}
                  <td className="min-w-[220px] whitespace-normal px-3 py-2.5 text-[11px] leading-relaxed text-muted">{srcStr}</td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-black/10 font-bold">
              <td className="sticky left-0 z-10 bg-canvas px-3 py-2.5 text-ink">TỔNG</td>
              <td className="bg-canvas px-3 py-2.5" />
              <td className="bg-canvas px-3 py-2.5" />
              <td className="bg-canvas px-3 py-2.5 text-right tabular-nums text-ink">{fmtInt(totalCum)}</td>
              {totalByDay.map((n, i) => (
                <td key={i} className="bg-canvas px-2 py-2.5 text-right tabular-nums text-ink">{n || "·"}</td>
              ))}
              <td className="bg-canvas px-3 py-2.5" />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted">
        {fmtInt(rows.length)} JD có CV tới ngày “Đến”. Tự tính từ CV thô (Candidate Data) — cùng logic bắt mã JD / parse ngày / gom nguồn như Apps Script JD DAILY.
      </p>
    </section>
  );
}
