export function Header({ source, title, eyebrow }: { source: "sheets" | "sample"; title: string; eyebrow: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink">{title}</h1>
        <p className="mt-0.5 text-sm text-muted">{eyebrow}</p>
      </div>
      <span
        className={`pill ${
          source === "sheets" ? "bg-up/10 text-up" : "bg-amber-100 text-amber-700"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${source === "sheets" ? "bg-up" : "bg-amber-500"}`} />
        {source === "sheets" ? "Live từ Google Sheets" : "Sample data"}
      </span>
    </header>
  );
}
