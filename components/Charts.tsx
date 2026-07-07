"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell,
  ComposedChart, Line,
} from "recharts";
import { PINK, BLUE } from "./theme";

const fmtShort = (n: number) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(n);
const fmtVndFull = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "₫";

const axisTick = { fontSize: 12, fill: "#8a8a9e", fontWeight: 600 } as const;
const gridProps = { strokeDasharray: "4 6", stroke: "#eef0f3", vertical: false } as const;

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white px-3 py-2 shadow-card">
      {label != null && <div className="mb-1 text-xs font-semibold text-ink">{label}</div>}
      <div className="space-y-0.5">
        {payload.filter((p: any) => p.value != null).map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-muted">{p.name}</span>
            <span className="ml-auto font-semibold text-ink">{fmtVndFull(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cột VND theo kênh (bo tròn đầu). Dùng cho cả "Chi phí" lẫn "Cost/CV".
export function ChannelSpendBar({ data, name = "Chi phí (VND-equiv)", height = 250 }: { data: { label: string; spendVnd: number; color: string }[]; name?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -6, bottom: 0 }} barCategoryGap="35%">
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} dy={6} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={fmtShort} width={44} />
        <Tooltip cursor={{ fill: "rgba(23,22,34,0.03)" }} content={<ChartTooltip />} />
        <Bar isAnimationActive={false} dataKey="spendVnd" name={name} radius={[8, 8, 8, 8]} maxBarSize={54}>
          {data.map((d, i) => (<Cell key={i} fill={d.color} />))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Gộp "Chi phí" + "Cost/CV" theo kênh vào 1 chart, 2 trục Y (đơn vị khác nhau).
// Cột hồng = Chi phí (trục trái) · cột xanh = Cost/CV (trục phải).
export function ChannelCostCombo({ data, height = 250 }: { data: { label: string; chiphi: number; costcv: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 4, left: -6, bottom: 0 }} barCategoryGap="28%" barGap={4}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} dy={6} />
        <YAxis yAxisId="left" tick={axisTick} tickLine={false} axisLine={false} tickFormatter={fmtShort} width={44} />
        <YAxis yAxisId="right" orientation="right" tick={axisTick} tickLine={false} axisLine={false} tickFormatter={fmtShort} width={44} />
        <Tooltip cursor={{ fill: "rgba(23,22,34,0.03)" }} content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }} iconType="circle" iconSize={9} />
        <Bar isAnimationActive={false} yAxisId="left" dataKey="chiphi" name="Chi phí (VND)" fill={PINK} radius={[6, 6, 0, 0]} maxBarSize={30} />
        <Bar isAnimationActive={false} yAxisId="right" dataKey="costcv" name="Cost/CV (VND)" fill={BLUE} radius={[6, 6, 0, 0]} maxBarSize={30} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Tab 3: actual (VND-equiv) chồng theo kênh + đường Plan cong mượt.
export function MonthlyStack({ data }: { data: Record<string, number | string>[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 12, right: 8, left: -6, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} dy={6} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={fmtShort} width={44} />
        <Tooltip cursor={{ fill: "rgba(23,22,34,0.03)" }} content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }} iconType="circle" iconSize={9} />
        <Bar isAnimationActive={false} dataKey="Meta" stackId="a" fill="#2f6bff" maxBarSize={52} />
        <Bar isAnimationActive={false} dataKey="LinkedIn" stackId="a" fill="#0a66c2" maxBarSize={52} />
        <Bar isAnimationActive={false} dataKey="ITviec" stackId="a" fill="#ec2c69" maxBarSize={52} />
        <Bar isAnimationActive={false} dataKey="TopDev" stackId="a" fill="#f97316" radius={[8, 8, 0, 0]} maxBarSize={52} />
        <Line isAnimationActive={false} type="monotone" dataKey="Plan" name="Kế hoạch" stroke={PINK} strokeWidth={3}
          dot={{ r: 3, fill: "#fff", stroke: PINK, strokeWidth: 2 }} activeDot={{ r: 5 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Đường cong mượt 2 line (dùng nếu có chuỗi theo tháng).
export function DualLine({ data, series }: {
  data: Record<string, number | string>[];
  series: { key: string; name: string; color: "pink" | "blue" }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 12, right: 10, left: -6, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} dy={6} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={fmtShort} width={44} />
        <Tooltip cursor={{ stroke: "#e6e8ec" }} content={<ChartTooltip />} />
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
