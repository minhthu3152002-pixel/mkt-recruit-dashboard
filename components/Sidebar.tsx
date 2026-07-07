"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconDashboard, IconJd, IconBudget } from "./Icons";

const NAV = [
  { href: "/", label: "Paid channel", Icon: IconDashboard },
  { href: "/jd", label: "CV theo JD", Icon: IconJd },
  { href: "/budget", label: "Budget theo tháng", Icon: IconBudget },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-white px-4 py-6 md:flex">
      <div className="mb-9 flex items-center gap-2.5 px-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-pink font-display text-lg font-extrabold text-white shadow-pill">R</div>
        <span className="font-display text-xl font-extrabold tracking-tight text-ink">Recruit</span>
      </div>

      <nav className="space-y-1.5">
        {NAV.map(({ href, label, Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition ${
                active ? "bg-pink text-white shadow-pill" : "text-muted hover:bg-black/[0.035] hover:text-ink"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-gradient-to-b from-pink-soft to-blue-soft p-4 text-center">
        <div className="font-display text-lg font-extrabold text-ink">Recruit<span className="text-pink">·</span>KTC</div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">Chi phí &amp; CV theo kênh — cập nhật trực tiếp từ Google Sheets.</p>
      </div>
    </aside>
  );
}
