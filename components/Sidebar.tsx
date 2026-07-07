"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconDashboard, IconJd, IconBudget, IconCalendarDays, IconMenu, IconChevronLeft } from "./Icons";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

const NAV = [
  { href: "/", key: "nav.paid", Icon: IconDashboard },
  { href: "/jd", key: "nav.jd", Icon: IconJd },
  { href: "/budget", key: "nav.budget", Icon: IconBudget },
  { href: "/daily", key: "nav.daily", Icon: IconCalendarDays },
];

export function Sidebar({
  lang, collapsed, onToggle, mobileOpen, onCloseMobile,
}: {
  lang: Lang; collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onCloseMobile: () => void;
}) {
  const path = usePathname();
  return (
    <>
      {/* Backdrop khi mở drawer trên mobile */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={onCloseMobile} aria-hidden />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col overflow-y-auto bg-white px-3 py-6 transition-[width,transform] duration-300 ease-out md:static md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "md:w-[76px]" : "md:w-64"}`}
      >
        {/* Logo + tên */}
        <div className={`mb-3 flex items-center gap-2.5 px-2 ${collapsed ? "md:justify-center md:px-0" : ""}`}>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pink font-display text-lg font-extrabold text-white shadow-pill">M</div>
          <span className={`font-display text-[15px] font-extrabold leading-tight tracking-tight text-ink ${collapsed ? "md:hidden" : ""}`}>Marketing Dashboard</span>
        </div>

        {/* Nút thu/mở (desktop) */}
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          className={`mb-5 hidden h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-muted transition hover:bg-black/[0.04] hover:text-ink md:flex ${collapsed ? "md:justify-center md:px-0" : ""}`}
        >
          {collapsed ? <IconMenu /> : (<><IconChevronLeft /> <span>{t(lang, "sidebar.collapse")}</span></>)}
        </button>

        <nav className="space-y-1.5">
          {NAV.map(({ href, key, Icon }) => {
            const active = path === href;
            const label = t(lang, key);
            return (
              <Link
                key={href}
                href={href}
                onClick={onCloseMobile}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-full py-3 text-sm font-semibold transition-colors px-4 ${collapsed ? "md:justify-center md:px-0" : ""} ${
                  active ? "bg-pink text-white shadow-pill" : "text-muted hover:bg-black/[0.035] hover:text-ink"
                }`}
              >
                <span className="shrink-0"><Icon /></span>
                <span className={`truncate ${collapsed ? "md:hidden" : ""}`}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={`mt-auto rounded-2xl bg-gradient-to-b from-pink-soft to-blue-soft p-4 text-center ${collapsed ? "md:hidden" : ""}`}>
          <div className="font-display text-base font-extrabold leading-tight text-ink">Marketing Dashboard<span className="text-pink">·</span>KTC</div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">{t(lang, "sidebar.footer")}</p>
          <p className="mt-2 text-[10px] italic text-muted/70">mavis</p>
        </div>
      </aside>
    </>
  );
}
