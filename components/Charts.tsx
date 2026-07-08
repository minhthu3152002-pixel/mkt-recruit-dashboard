"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell,
  ComposedChart, Line, PieChart, Pie,
} from "recharts";
import { PINK, BLUE } from "./theme";
import { formatMoney, formatInt, moneyLabel, t, KRW_TO_VND } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

const GREEN = "#16a34a"; // free / organic

// Giá trị data đều là VND-base. Ở KO đổi sang KRW (÷ tỷ giá) + đổi locale.
const compact = (n: number, lang: Lang) => {
  const v = lang === "ko" ? n / KRW_TO_VND : n;
  return new Intl.NumberFormat(lang === "ko" ? "ko-KR" : "vi-VN", { notation: "compact" }).format(v);
};

const axisTick = { fontSize: 12, fill: "#8a8a9e", fontWeight: 600 } as const;
const gridProps = { strokeDasharray: "4 6", stroke: "#eef0f3", vertical: false } as const;

function ChartTooltip({ active, payload, label, lang }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white px-3 py-2 shadow-card">
      {label != null && <div className="mb-1 text-xs font-semibold text-ink">{label}</div>}
      <div className="space-y-0.5">
        {payload.filter((p: any) => p.value != null).map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-muted">{p.name}</span>
            <span className="ml-auto font-semibold text-ink">{formatMoney(p.value, "VND", lang)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cột VND theo kênh (bo tròn đầu). Dùng cho cả "Chi phí" lẫn "Cost/CV".
export function ChannelSpendBar({ data, name, height = 250, lang = "vi" }: { data: { label: string; spendVnd: number; color: string }[]; name?: string; height?: number; lang?: Lang }) {
  const barName = name ?? `${t(lang, "paid.ch.chiphi")} (${moneyLabel(lang)})`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -6, bottom: 0 }} barCategoryGap="35%">
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} dy={6} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(n) => compact(n, lang)} width={44} />
        <Tooltip cursor={{ fill: "rgba(23,22,34,0.03)" }} content={(p) => <ChartTooltip {...p} lang={lang} />} />
        <Bar isAnimationActive={false} dataKey="spendVnd" name={barName} radius={[8, 8, 8, 8]} maxBarSize={54}>
          {data.map((d, i) => (<Cell key={i} fill={d.color} />))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Gộp "Chi phí" + "Cost/CV" theo kênh vào 1 chart, 2 trục Y (đơn vị khác nhau).
// Cột hồng = Chi phí (trục trái) · cột xanh = Cost/CV (trục phải).
export function ChannelCostCombo({ data, height = 250, lang = "vi" }: { data: { label: string; chiphi: number; costcv: number }[]; height?: number; lang?: Lang }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 4, left: -6, bottom: 0 }} barCategoryGap="28%" barGap={4}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} dy={6} />
        <YAxis yAxisId="left" tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(n) => compact(n, lang)} width={44} />
        <YAxis yAxisId="right" orientation="right" tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(n) => compact(n, lang)} width={44} />
        <Tooltip cursor={{ fill: "rgba(23,22,34,0.03)" }} content={(p) => <ChartTooltip {...p} lang={lang} />} />
        <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }} iconType="circle" iconSize={9} />
        <Bar isAnimationActive={false} yAxisId="left" dataKey="chiphi" name={t(lang, "paid.ch.chiphi")} fill={PINK} radius={[6, 6, 0, 0]} maxBarSize={30} />
        <Bar isAnimationActive={false} yAxisId="right" dataKey="costcv" name={t(lang, "paid.ch.costcv")} fill={BLUE} radius={[6, 6, 0, 0]} maxBarSize={30} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Tab 3: actual (VND-equiv) chồng theo kênh + đường Plan cong mượt.
export function MonthlyStack({ data, lang = "vi" }: { data: Record<string, number | string>[]; lang?: Lang }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 12, right: 8, left: -6, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} dy={6} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(n) => compact(n, lang)} width={44} />
        <Tooltip cursor={{ fill: "rgba(23,22,34,0.03)" }} content={(p) => <ChartTooltip {...p} lang={lang} />} />
        <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }} iconType="circle" iconSize={9} />
        <Bar isAnimationActive={false} dataKey="Meta" stackId="a" fill="#2f6bff" maxBarSize={52} />
        <Bar isAnimationActive={false} dataKey="LinkedIn" stackId="a" fill="#0a66c2" maxBarSize={52} />
        <Bar isAnimationActive={false} dataKey="ITviec" stackId="a" fill="#ec2c69" maxBarSize={52} />
        <Bar isAnimationActive={false} dataKey="TopDev" stackId="a" fill="#f97316" radius={[8, 8, 0, 0]} maxBarSize={52} />
        <Line isAnimationActive={false} type="monotone" dataKey="Plan" name={t(lang, "budget.legend.plan")} stroke={PINK} strokeWidth={3}
          dot={{ r: 3, fill: "#fff", stroke: PINK, strokeWidth: 2 }} activeDot={{ r: 5 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ---- Tab 5: Source Analysis ----
// Donut LỒNG 2 tầng: vòng trong = Paid/Free, vòng ngoài = group (theo cung Paid/Free).
// Cung Paid tông hồng (đậm→nhạt theo group), cung Free tông xanh lá.
const PINK_SHADES = ["#c81e56", "#ec2c69", "#f36f97", "#f8a9c1", "#fcd7e4"];
const GREEN_SHADES = ["#15803d", "#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#d5f6df", "#eafaf0"];

type OuterSlice = { group: string; type: "paid" | "free"; cv: number; top: { label: string; cv: number }[] };

export function SourceNestedDonut({ inner, outer, total, lang = "vi", height = 260 }: {
  inner: { key: "paid" | "free"; value: number }[];
  outer: OuterSlice[];
  total: number;
  lang?: Lang;
  height?: number;
}) {
  const pct = (v: number) => (total > 0 ? ((v / total) * 100).toFixed(1) : "0");
  // Màu vòng ngoài: đậm→nhạt theo thứ tự group trong từng tier.
  let pi = 0, gi = 0;
  const outerColored = outer.map((o) => ({
    ...o,
    color: o.type === "paid" ? PINK_SHADES[pi++ % PINK_SHADES.length] : GREEN_SHADES[gi++ % GREEN_SHADES.length],
  }));
  const innerData = inner.map((s) => ({ ...s, color: s.key === "paid" ? PINK : GREEN }));
  const tierName = (type: "paid" | "free") => t(lang, type === "paid" ? "source.paid" : "source.free");

  const tooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    if (p.group !== undefined) {
      return (
        <div className="rounded-xl border border-black/[0.06] bg-white px-3 py-2 text-xs shadow-card">
          <div className="font-semibold text-ink">{p.group} <span className="font-normal text-muted">· {tierName(p.type)}</span></div>
          <div className="text-muted">{formatInt(p.cv, lang)} CV · {pct(p.cv)}%</div>
          {p.top?.length ? (
            <div className="mt-1 space-y-0.5 border-t border-black/[0.06] pt-1">
              {p.top.map((s: any, i: number) => (
                <div key={i} className="flex gap-3"><span className="text-ink">{s.label}</span><span className="ml-auto tabular-nums text-muted">{formatInt(s.cv, lang)}</span></div>
              ))}
            </div>
          ) : null}
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-black/[0.06] bg-white px-3 py-2 text-xs shadow-card">
        <span className="font-semibold text-ink">{tierName(p.key)}</span>
        <span className="ml-2 text-muted">{formatInt(p.value, lang)} CV · {pct(p.value)}%</span>
      </div>
    );
  };

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={innerData} dataKey="value" nameKey="key" cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={1} isAnimationActive={false} stroke="#fff" strokeWidth={1}>
              {innerData.map((d, i) => (<Cell key={i} fill={d.color} />))}
            </Pie>
            <Pie data={outerColored} dataKey="cv" nameKey="group" cx="50%" cy="50%" innerRadius={74} outerRadius={104} paddingAngle={1} isAnimationActive={false} stroke="#fff" strokeWidth={1}>
              {outerColored.map((d, i) => (<Cell key={i} fill={d.color} />))}
            </Pie>
            <Tooltip content={tooltip} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold tabular-nums text-ink">{formatInt(total, lang)}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">{t(lang, "source.kpi.totalCv")}</span>
        </div>
      </div>
      {/* Legend: group tách theo tier để thấy Paid/Free gồm nhóm gì */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {(["paid", "free"] as const).map((type) => (
          <div key={type} className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-ink">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: type === "paid" ? PINK : GREEN }} />
              {tierName(type)}
            </div>
            {outerColored.filter((o) => o.type === type).map((o) => (
              <div key={o.group} className="flex items-center gap-1.5 pl-4">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: o.color }} />
                <span className="truncate text-ink/80">{o.group}</span>
                <span className="ml-auto tabular-nums text-muted">{pct(o.cv)}%</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Bar ngang: top nguồn theo CV, tô màu paid (hồng) / free (xanh lá).
export function SourceTopBar({ data, lang = "vi", height = 320 }: { data: { label: string; cv: number; paid: boolean }[]; lang?: Lang; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }} barCategoryGap="26%">
        <CartesianGrid strokeDasharray="4 6" stroke="#eef0f3" horizontal={false} />
        <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(n) => formatInt(n, lang)} />
        <YAxis type="category" dataKey="label" tick={axisTick} tickLine={false} axisLine={false} width={120} />
        <Tooltip cursor={{ fill: "rgba(23,22,34,0.03)" }} content={({ active, payload, label }: any) => {
          if (!active || !payload?.length) return null;
          return (
            <div className="rounded-xl border border-black/[0.06] bg-white px-3 py-2 text-xs shadow-card">
              <span className="font-semibold text-ink">{label}</span>
              <span className="ml-2 text-muted">{formatInt(payload[0].value, lang)} CV</span>
            </div>
          );
        }} />
        <Bar isAnimationActive={false} dataKey="cv" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {data.map((d, i) => (<Cell key={i} fill={d.paid ? PINK : GREEN} />))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Đường cong mượt 2 line (dùng nếu có chuỗi theo tháng).
export function DualLine({ data, series, lang = "vi" }: {
  data: Record<string, number | string>[];
  series: { key: string; name: string; color: "pink" | "blue" }[];
  lang?: Lang;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 12, right: 10, left: -6, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} dy={6} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(n) => compact(n, lang)} width={44} />
        <Tooltip cursor={{ stroke: "#e6e8ec" }} content={(p) => <ChartTooltip {...p} lang={lang} />} />
        <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }} iconType="circle" iconSize={9} />
        {series.map((s) => (
          <Line isAnimationActive={false} key={s.key} type="monotone" dataKey={s.key} name={s.name}
            stroke={s.color === "pink" ? PINK : BLUE} strokeWidth={3}
            dot={{ r: 3, fill: "#fff", stroke: s.color === "pink" ? PINK : BLUE, strokeWidth: 2 }}
            activeDot={{ r: 5 }} />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
