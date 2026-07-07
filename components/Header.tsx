export function Header({ source, title, eyebrow }: { source: "sheets" | "sample"; title: string; eyebrow: string }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      <span className={`pill ${source === "sheets" ? "bg-free/10 text-free" : "bg-amber-100 text-amber-700"}`}>
        {source === "sheets" ? "● Live từ Google Sheets" : "● Sample data"}
      </span>
    </header>
  );
}
