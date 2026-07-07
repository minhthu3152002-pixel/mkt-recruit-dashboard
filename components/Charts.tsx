"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell } from "recharts";

const fmtShort = (n: number) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(n);
const fmtVndFull = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "₫";

// Tab 1: spend (VND-equiv) theo kênh
export function ChannelSpendBar({ data }: { data: { label: string; spendVnd: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#888" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#888" }} tickLine={false} axisLine={false} tickFormatter={fmtShort} />
        <Tooltip formatter={(v: number) => fmtVndFull(v)} />
        <Bar dataKey="spendVnd" name="Chi phí (VND-equiv)" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (<Cell key={i} fill={d.color} />))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Tab 3: actual (VND-equiv) theo kênh, chồng theo tháng + đường plan
export function MonthlyStack({ data }: { data: Record<string, number | string>[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#888" }} tickLine={false} axisLine={false} tickFormatter={fmtShort} />
        <Tooltip formatter={(v: number) => fmtVndFull(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Meta" stackId="a" fill="#2563eb" />
        <Bar dataKey="LinkedIn" stackId="a" fill="#0a66c2" />
        <Bar dataKey="ITviec" stackId="a" fill="#e4322b" />
        <Bar dataKey="TopDev" stackId="a" fill="#f04e37" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Plan" fill="#d8d5f7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
