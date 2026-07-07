"use client";
import { useState, type CSSProperties } from "react";
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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleSrc = (code: string) =>
    setExpanded((prev) => { const n = new Set(prev); n.has(code) ? n.delete(code) : n.add(code); return n; });

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

  // Heatmap: cường độ nền xanh theo số CV/ngày lớn nhất trong bảng.
  let maxDaily = 1;
  for (const [, j] of rows) for (const d of days) if ((j.daily[d] ?? 0) > maxDaily) maxDaily = j.daily[d];
  const heat = (n: number): CSSProperties | undefined =>
    n > 0 ? { backgroundColor: `rgba(34,197,94,${(0.08 + 0.32 * Math.min(1, n / maxDaily)).toFixed(3)})` } : undefined;

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

      <div className="max-h-[72vh] overflow-auto rounded-xl border border-black/[0.05]">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              <th className="sticky left-0 top-0 z-30 border-b border-black/[0.07] bg-white px-4 py-2.5 text-left">JD</th>
              <th className="sticky top-0 z-20 border-b border-black/[0.07] bg-white px-3 py-2.5 text-right">Tổng tích luỹ</th>
              {days.map((d) => (
                <th key={d} className="sticky top-0 z-20 min-w-[46px] border-b border-black/[0.07] bg-white px-2 py-2.5 text-right tabular-nums">{ddmm(d)}</th>
              ))}
              <th className="sticky top-0 z-20 border-b border-black/[0.07] bg-white px-4 py-2.5 text-left">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([code, j]) => {
              const m = meta[code] ?? { company: "", title: "" };
              const entries = Object.entries(j.src).sort((a, b) => b[1] - a[1]);
              const isExp = expanded.has(code);
              const shown = isExp ? entries : entries.slice(0, 3);
              const rest = entries.length - 3;
              const sub = [m.company, m.title].filter(Boolean).join(" · ");
              return (
                <tr key={code} className="group">
                  <td className="sticky left-0 z-10 min-w-[210px] border-t border-black/[0.04] bg-white px-4 py-3 group-hover:bg-black/[0.02]">
                    <div className="font-semibold text-ink">{code}</div>
                    <div className="max-w-[240px] truncate text-[11px] text-muted">{sub || "—"}</div>
                  </td>
                  <td className="border-t border-black/[0.04] px-3 py-3 text-right font-semibold tabular-nums text-ink">{fmtInt(j.cum)}</td>
                  {days.map((d) => {
                    const n = j.daily[d] ?? 0;
                    return (
                      <td key={d} style={heat(n)} className={`border-t border-black/[0.04] px-2 py-3 text-right tabular-nums ${n ? "font-semibold text-ink" : "text-black/15"}`}>
                        {n || "·"}
                      </td>
                    );
                  })}
                  <td className="border-t border-black/[0.04] px-4 py-3 align-middle" title={entries.map(([s, n]) => `${s} (${n})`).join(", ")}>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] leading-relaxed text-muted">
                      {shown.map(([s, n]) => (
                        <span key={s} className="whitespace-nowrap">• {s} <span className="text-ink/70">({n})</span></span>
                      ))}
                      {rest > 0 && (
                        <button
                          onClick={() => toggleSrc(code)}
                          className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-semibold text-ink/60 transition hover:bg-pink-soft hover:text-pink-600"
                        >
                          {isExp ? "thu gọn" : `+${rest} nguồn`}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr className="font-bold">
              <td className="sticky bottom-0 left-0 z-20 border-t-2 border-black/10 bg-canvas px-4 py-3 text-ink">TỔNG</td>
              <td className="sticky bottom-0 z-10 border-t-2 border-black/10 bg-canvas px-3 py-3 text-right tabular-nums text-ink">{fmtInt(totalCum)}</td>
              {totalByDay.map((n, i) => (
                <td key={i} className="sticky bottom-0 z-10 border-t-2 border-black/10 bg-canvas px-2 py-3 text-right tabular-nums text-ink">{n || "·"}</td>
              ))}
              <td className="sticky bottom-0 z-10 border-t-2 border-black/10 bg-canvas px-4 py-3" />
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
