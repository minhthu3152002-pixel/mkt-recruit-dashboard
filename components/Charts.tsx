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
// Donut Paid vs Free (hồng = paid, xanh lá = free). Tâm hiện tổng CV.
export function PaidFreeDonut({ paid, free, lang = "vi", height = 220 }: { paid: number; free: number; lang?: Lang; height?: number }) {
  const total = paid + free;
  const data = [
    { key: t(lang, "source.paid"), value: paid, color: PINK },
    { key: t(lang, "source.free"), value: free, color: GREEN },
  ];
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="key" cx="50%" cy="50%" innerRadius={62} outerRadius={92} paddingAngle={2} isAnimationActive={false} stroke="none">
            {data.map((d, i) => (<Cell key={i} fill={d.color} />))}
          </Pie>
          <Tooltip content={({ active, payload }: any) => {
            if (!active || !payload?.length) return null;
            const p = payload[0];
            return (
              <div className="rounded-xl border border-black/[0.06] bg-white px-3 py-2 text-xs shadow-card">
                <span className="font-semibold text-ink">{p.name}</span>
                <span className="ml-2 text-muted">{formatInt(p.value, lang)} CV · {pct(p.value)}%</span>
              </div>
            );
          }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold tabular-nums text-ink">{formatInt(total, lang)}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t(lang, "source.kpi.totalCv")}</span>
      </div>
      <div className="mt-3 flex items-center justify-center gap-5 text-xs font-semibold">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: PINK }} />{t(lang, "source.paid")} {pct(paid)}%</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: GREEN }} />{t(lang, "source.free")} {pct(free)}%</span>
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
