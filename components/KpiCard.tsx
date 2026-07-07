export function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="card rail p-4" style={{ ["--rail" as any]: accent ?? "#5b3df5" }}>
      <div className="eyebrow">{label}</div>
      <div className="stat mt-1">{value}</div>
      {sub && <div className="mt-1 text-xs text-black/45">{sub}</div>}
    </div>
  );
}
