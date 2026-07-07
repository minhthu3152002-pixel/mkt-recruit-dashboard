"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { IconMenu } from "./Icons";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Nhớ trạng thái thu/mở qua reload / chuyển tab.
  useEffect(() => {
    if (localStorage.getItem("sidebar-collapsed") === "1") setCollapsed(true);
  }, []);

  const toggle = () =>
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem("sidebar-collapsed", next ? "1" : "0"); } catch {}
      return next;
    });

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar collapsed={collapsed} onToggle={toggle} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Thanh trên cùng chỉ hiện ở mobile — nút mở drawer */}
        <div className="flex items-center gap-3 border-b border-black/[0.05] bg-white px-4 py-3 md:hidden">
          <button onClick={() => setMobileOpen(true)} aria-label="Mở menu" className="grid h-9 w-9 place-items-center rounded-lg text-ink hover:bg-black/5">
            <IconMenu />
          </button>
          <span className="flex items-center gap-2 font-display font-extrabold text-ink">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-pink text-sm text-white">M</span>Marketing Dashboard
          </span>
        </div>

        <main className="px-4 py-6 sm:px-7 lg:px-9">
          <div className={`mx-auto space-y-6 ${collapsed ? "max-w-none" : "max-w-6xl"}`}>{children}</div>
        </main>
      </div>
    </div>
  );
}
