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

  // Line chia cột + zebra cột (KHÔNG heatmap): cột ngày đầu = line nhóm đậm hơn, còn lại line mảnh.
  const dayDivider = (i: number) => (i === 0 ? "border-l-2 border-black/10" : "border-l border-black/[0.06]");
  const dayZebra = (i: number) => (i % 2 === 1 ? "bg-[#fafafa]" : "bg-white");
  const DAY_W = "w-[46px] min-w-[46px]";

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

      <div className="max-h-[72vh] overflow-auto rounded-xl border border-black/[0.06]">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            {/* HEADER: nền hồng nhạt, chữ đậm vừa, sticky */}
            <tr className="text-[11px] font-bold uppercase tracking-wide text-ink/70">
              <th className="sticky left-0 top-0 z-30 border-b border-black/[0.08] bg-pink-soft px-4 py-2.5 text-left">JD</th>
              <th className="sticky top-0 z-20 border-b border-l border-black/[0.08] bg-pink-soft px-3 py-2.5 text-right">Tổng tích luỹ</th>
              {days.map((d, i) => (
                <th key={d} className={`sticky top-0 z-20 ${DAY_W} ${dayDivider(i)} border-b border-black/[0.08] bg-pink-soft px-1 py-2.5 text-center tabular-nums`}>{ddmm(d)}</th>
              ))}
              <th className="sticky top-0 z-20 border-b border-l-2 border-black/10 bg-pink-soft px-4 py-2.5 text-left">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([code, j]) => {
              const m = meta[code] ?? { company: "", title: "" };
              const entries = Object.entries(j.src).sort((a, b) => b[1] - a[1]);
              const isExp = expanded.has(code);
              const shown = isExp ? entries : entries.slice(0, 4);
              const rest = entries.length - 4;
              const sub = [m.company, m.title].filter(Boolean).join(" · ");
              return (
                <tr key={code} className="group">
                  {/* JD (freeze) */}
                  <td className="sticky left-0 z-10 min-w-[210px] border-t border-black/[0.05] bg-white px-4 py-3 group-hover:bg-black/[0.025]">
                    <div className="font-semibold text-ink">{code}</div>
                    <div className="max-w-[240px] truncate text-[11px] text-muted">{sub || "—"}</div>
                  </td>
                  {/* Tổng tích luỹ: đậm + nền hồng nhạt */}
                  <td className="border-l border-t border-black/[0.05] bg-pink-soft/60 px-3 py-3 text-right font-bold tabular-nums text-ink group-hover:bg-pink-soft">{fmtInt(j.cum)}</td>
                  {/* Cột ngày: zebra cột, line chia, 0 -> "·" mờ */}
                  {days.map((d, i) => {
                    const n = j.daily[d] ?? 0;
                    return (
                      <td key={d} className={`${DAY_W} ${dayDivider(i)} border-t border-black/[0.05] ${dayZebra(i)} px-1 py-3 text-center tabular-nums ${n ? "font-semibold text-ink" : "text-black/20"}`}>
                        {n || "·"}
                      </td>
                    );
                  })}
                  {/* Source: mỗi nguồn xuống hàng, chữ nhỏ mờ */}
                  <td className="border-l-2 border-t border-black/10 px-4 py-3 align-top group-hover:bg-black/[0.015]" title={entries.map(([s, n]) => `${s} (${n})`).join(", ")}>
                    <div className="flex flex-col gap-0.5 text-[11px] leading-snug text-muted">
                      {shown.map(([s, n]) => (
                        <span key={s} className="whitespace-nowrap">• {s} <span className="text-ink/55">({n})</span></span>
                      ))}
                      {rest > 0 && (
                        <button
                          onClick={() => toggleSrc(code)}
                          className="mt-0.5 w-fit rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-semibold text-ink/60 transition hover:bg-pink-soft hover:text-pink-600"
                        >
                          {isExp ? "thu gọn" : `+${rest} nguồn`}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* Dòng TỔNG (sticky bottom) */}
            <tr className="font-bold">
              <td className="sticky bottom-0 left-0 z-20 border-t-2 border-black/15 bg-canvas px-4 py-3 text-ink">TỔNG</td>
              <td className="sticky bottom-0 z-10 border-l border-t-2 border-black/15 bg-canvas px-3 py-3 text-right tabular-nums text-ink">{fmtInt(totalCum)}</td>
              {totalByDay.map((n, i) => (
                <td key={i} className={`sticky bottom-0 z-10 ${DAY_W} ${dayDivider(i)} border-t-2 border-black/15 bg-canvas px-1 py-3 text-center tabular-nums text-ink`}>{n || "·"}</td>
              ))}
              <td className="sticky bottom-0 z-10 border-l-2 border-t-2 border-black/15 bg-canvas px-4 py-3" />
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
