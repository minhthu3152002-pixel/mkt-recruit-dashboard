import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Recruit Dashboard",
  description: "CV acquisition & cost per CV across channels",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-ink">
        <div className="flex min-h-screen bg-canvas">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 lg:px-9">
            <div className="mx-auto max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
