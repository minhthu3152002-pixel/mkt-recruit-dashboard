"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Paid channel", icon: "ti-speakerphone" },
  { href: "/jd", label: "CV theo JD", icon: "ti-file-cv" },
  { href: "/budget", label: "Budget theo tháng", icon: "ti-calendar-dollar" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-ink px-4 py-6 text-white/80 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand font-display text-lg font-bold text-white">R</div>
        <span className="font-display text-lg font-bold text-white">Recruit</span>
      </div>
      <nav className="space-y-1">
        {NAV.map((n) => {
          const active = path === n.href;
          return (
            <Link key={n.href} href={n.href}
              className={`block rounded-lg px-3 py-2 text-sm transition ${active ? "bg-brand text-white" : "hover:bg-white/5"}`}>
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-3 pt-8 text-[11px] text-white/30">Recruit Dashboard · 2026</div>
    </aside>
  );
}
