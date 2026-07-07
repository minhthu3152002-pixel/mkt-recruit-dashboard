"use client";
import { useState } from "react";
import { t, formatInt, moreSources } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

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

export function DailyPanel({ lang, cvs, meta, defaultFrom, defaultTo }: { lang: Lang; cvs: Cv[]; meta: Meta; defaultFrom: string; defaultTo: string }) {
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

  // Heatmap XANH LÁ chỉ cho ô CÓ CV: nhiều CV -> đậm dần (pastel). Ô = 0 -> trắng.
  let maxDaily = 1;
  for (const [, j] of rows) for (const d of days) { const v = j.daily[d] ?? 0; if (v > maxDaily) maxDaily = v; }
  const heat = (n: number): string | undefined => {
    if (n <= 0) return undefined; // ô trống -> nền trắng, KHÔNG tô
    const a = 0.12 + 0.5 * Math.sqrt(n / maxDaily); // 0.12..0.62 — xanh pastel, đậm dần
    return `rgba(22,163,74,${a.toFixed(3)})`;
  };

  // Line chia cột dọc rất mảnh: cột ngày đầu = line nhóm hơi đậm, còn lại line mờ.
  const dayDivider = (i: number) => (i === 0 ? "border-l border-black/10" : "border-l border-black/[0.05]");
  const DAY_W = "w-[46px] min-w-[46px]";

  // Tông bảng: XANH DƯƠNG NHẠT PASTEL (chỉ bảng này; các tab khác giữ hồng).
  const HEAD = "bg-[#e6f0fb]";       // header row
  const CUM_HEAD = "bg-[#dbeafe]";   // header cột Tổng tích luỹ (đậm hơn chút)
  const CUM_CELL = "bg-[#eef5fd]";   // ô Tổng tích luỹ (baby blue nhạt để nổi)

  const inputCls =
    "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20";

  return (
    <section className="card space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">{t(lang, "daily.panel.title")}</h2>
          <p className="text-xs text-muted">
            {t(lang, "daily.panel.sub")}
            {clamped && <span className="ml-1 font-semibold text-[#2563eb]">{t(lang, "daily.clamped")}</span>}
          </p>
        </div>
        <div className="flex items-end gap-3">
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t(lang, "common.from")}
            <input type="date" value={from} max={to} onChange={(e) => onFrom(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t(lang, "common.to")}
            <input type="date" value={to} min={from} onChange={(e) => onTo(e.target.value)} className={inputCls} />
          </label>
        </div>
      </div>

      <div className="max-h-[72vh] overflow-auto rounded-xl border border-black/[0.06]">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            {/* HEADER: nền xanh dương nhạt, chữ đậm vừa, sticky */}
            <tr className="text-[11px] font-bold uppercase tracking-wide text-ink/70">
              <th className={`sticky left-0 top-0 z-30 border-b border-black/[0.08] ${HEAD} px-4 py-2.5 text-left`}>JD</th>
              <th className={`sticky top-0 z-20 border-b border-l border-black/[0.08] ${CUM_HEAD} px-3 py-2.5 text-right`}>{t(lang, "daily.col.cumTotal")}</th>
              {days.map((d, i) => (
                <th key={d} className={`sticky top-0 z-20 ${DAY_W} ${dayDivider(i)} border-b border-black/[0.08] ${HEAD} px-1 py-2.5 text-center tabular-nums`}>{ddmm(d)}</th>
              ))}
              <th className={`sticky top-0 z-20 border-b border-l-2 border-black/10 ${HEAD} px-4 py-2.5 text-left`}>{t(lang, "daily.col.source")}</th>
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
                  {/* Tổng tích luỹ: đậm + nền baby blue nhạt */}
                  <td className={`border-l border-t border-black/[0.05] ${CUM_CELL} px-3 py-3 text-right font-bold tabular-nums text-ink group-hover:bg-[#dbeafe]`}>{formatInt(j.cum, lang)}</td>
                  {/* Cột ngày: heatmap xanh lá cho ô có CV, ô 0 -> nền trắng "·" mờ */}
                  {days.map((d, i) => {
                    const n = j.daily[d] ?? 0;
                    const bg = heat(n);
                    return (
                      <td
                        key={d}
                        style={bg ? { backgroundColor: bg } : undefined}
                        className={`${DAY_W} ${dayDivider(i)} border-t border-black/[0.05] px-1 py-3 text-center tabular-nums ${n ? "font-semibold text-ink" : "bg-white text-black/20"}`}
                      >
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
                          className="mt-0.5 w-fit rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-semibold text-ink/60 transition hover:bg-[#dbeafe] hover:text-[#2563eb]"
                        >
                          {isExp ? t(lang, "daily.collapse") : moreSources(lang, rest)}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* Dòng TỔNG (sticky bottom) */}
            <tr className="font-bold">
              <td className="sticky bottom-0 left-0 z-20 border-t-2 border-black/15 bg-canvas px-4 py-3 text-ink">{t(lang, "common.total")}</td>
              <td className="sticky bottom-0 z-10 border-l border-t-2 border-black/15 bg-canvas px-3 py-3 text-right tabular-nums text-ink">{formatInt(totalCum, lang)}</td>
              {totalByDay.map((n, i) => (
                <td key={i} className={`sticky bottom-0 z-10 ${DAY_W} ${dayDivider(i)} border-t-2 border-black/15 bg-canvas px-1 py-3 text-center tabular-nums text-ink`}>{n || "·"}</td>
              ))}
              <td className="sticky bottom-0 z-10 border-l-2 border-t-2 border-black/15 bg-canvas px-4 py-3" />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted">
        {formatInt(rows.length, lang)} {t(lang, "daily.foot")}
      </p>
    </section>
  );
}
