"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";

const LANGS: Lang[] = ["vi", "ko"];

// Nút VI | KO. Mặc định VI, nhớ qua localStorage (mirror sang cookie để server đọc).
export function LangToggle({ lang }: { lang: Lang }) {
  const router = useRouter();

  // Lần đầu: nếu localStorage đã chọn KO nhưng cookie chưa có -> set cookie + refresh.
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if ((saved === "vi" || saved === "ko") && saved !== lang) {
      document.cookie = `lang=${saved}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (l: Lang) => {
    if (l === lang) return;
    try { localStorage.setItem("lang", l); } catch {}
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return (
    <div className="inline-flex overflow-hidden rounded-full border border-black/10 bg-white text-[11px] font-bold uppercase tracking-wide">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => set(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1 transition ${lang === l ? "bg-pink text-white" : "text-muted hover:bg-black/[0.04] hover:text-ink"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
