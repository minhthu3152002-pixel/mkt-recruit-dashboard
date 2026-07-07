// Mảnh UI tái dùng cho bảng: thanh "độ phổ biến" + badge %.
export function PopularityBar({ value, color = "#ec2c69", className = "" }: { value: number; color?: string; className?: string }) {
  const pct = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)) * 100;
  return (
    <div className={`track ${className}`}>
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Dot({ color }: { color: string }) {
  return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />;
}

// Badge đen bo tròn chứa % (giống cột Sales của Top Products).
export function ValueBadge({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "pink" | "green" | "up" | "down" }) {
  const cls: Record<string, string> = {
    dark: "bg-ink text-white",
    pink: "bg-pink-soft text-pink-600",
    green: "bg-free/12 text-free",
    up: "bg-up/10 text-up",
    down: "bg-down/10 text-down",
  };
  return <span className={`pill justify-center ${cls[tone]}`}>{children}</span>;
}
