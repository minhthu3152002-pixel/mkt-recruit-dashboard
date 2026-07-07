import { ReactNode } from "react";
import { Tone, TONE_GRADIENT } from "./theme";
import { IconTrendUp, IconTrendDown } from "./Icons";

// Badge "so với tháng trước": xanh nếu tăng, đỏ nếu giảm.
// pct == null -> ẩn hẳn (không đủ dữ liệu để so sánh, KHÔNG bịa số).
export function DeltaBadge({ pct }: { pct: number | null | undefined }) {
  if (pct == null || !Number.isFinite(pct)) return null;
  const up = pct >= 0;
  return (
    <span className={`pill ${up ? "bg-up/10 text-up" : "bg-down/10 text-down"}`}>
      {up ? <IconTrendUp /> : <IconTrendDown />}
      {up ? "+" : ""}{pct.toFixed(0)}%
      <span className="font-medium opacity-70">so với tháng trước</span>
    </span>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  tone = "pink",
  icon,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  icon?: ReactNode;
  delta?: number | null;
}) {
  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full shadow-sm" style={{ background: TONE_GRADIENT[tone] }}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="stat">{value}</div>
          <div className="mt-1 truncate text-[13px] font-medium text-muted">{label}</div>
        </div>
      </div>
      {(delta != null || sub) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          <DeltaBadge pct={delta ?? null} />
          {sub && <span className="text-xs text-muted">{sub}</span>}
        </div>
      )}
    </div>
  );
}
