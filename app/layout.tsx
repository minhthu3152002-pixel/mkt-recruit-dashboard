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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 px-5 py-6 sm:px-8 lg:px-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
