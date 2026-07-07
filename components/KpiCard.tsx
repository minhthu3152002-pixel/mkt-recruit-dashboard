import { ReactNode } from "react";
import { Tone, TONE_GRADIENT } from "./theme";
import { IconTrendUp, IconTrendDown } from "./Icons";

// Badge % thay đổi. Mũi tên theo dấu; MÀU theo tốt/xấu:
// - mặc định TĂNG = tốt (xanh); lowerIsBetter=true thì GIẢM = tốt (vd cost/CV).
// pct == null -> ẩn hẳn (không đủ dữ liệu để so sánh, KHÔNG bịa số).
export function DeltaBadge({
  pct, label = "so với tháng trước", lowerIsBetter = false,
}: { pct: number | null | undefined; label?: string; lowerIsBetter?: boolean }) {
  if (pct == null || !Number.isFinite(pct)) return null;
  const up = pct >= 0;
  const good = lowerIsBetter ? pct <= 0 : pct >= 0;
  return (
    <span className={`pill ${good ? "bg-up/10 text-up" : "bg-down/10 text-down"}`}>
      {up ? <IconTrendUp /> : <IconTrendDown />}
      {up ? "+" : ""}{pct.toFixed(0)}%
      <span className="font-medium opacity-70">{label}</span>
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
  deltaLabel,
  deltaLowerIsBetter,
  surface,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  icon?: ReactNode;
  delta?: number | null;
  deltaLabel?: string;
  deltaLowerIsBetter?: boolean;
  surface?: boolean; // dùng khi đặt trong khung trắng lớn -> nền xám nhạt cho nổi
}) {
  return (
    <div className={`flex flex-col p-5 ${surface ? "rounded-2xl bg-canvas" : "card"}`}>
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
          <DeltaBadge pct={delta ?? null} label={deltaLabel} lowerIsBetter={deltaLowerIsBetter} />
          {sub && <span className="text-xs text-muted">{sub}</span>}
        </div>
      )}
    </div>
  );
}
