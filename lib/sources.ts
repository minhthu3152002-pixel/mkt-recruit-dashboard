export type Channel = "meta" | "linkedin" | "itviec" | "topdev" | "free";
export const PAID_CHANNELS: Channel[] = ["meta", "linkedin", "itviec", "topdev"];

export const CHANNEL_META: Record<Channel, { label: string; paid: boolean; color: string; ccy: "KRW" | "VND" }> = {
  meta: { label: "Meta Ads", paid: true, color: "#2563eb", ccy: "KRW" },
  linkedin: { label: "LinkedIn", paid: true, color: "#0a66c2", ccy: "VND" },
  itviec: { label: "ITviec", paid: true, color: "#e4322b", ccy: "VND" },
  topdev: { label: "TopDev", paid: true, color: "#f04e37", ccy: "VND" },
  free: { label: "Free / Organic", paid: false, color: "#16a34a", ccy: "VND" },
};

// Source (= tên tab trong Candidate Data, hoặc landing-page_{utm}) -> kênh.
export const SOURCE_TO_CHANNEL: Record<string, Channel> = {
  // paid
  "landing-page_meta": "meta",     // Meta ads (tính tiền)
  "itviec-api": "itviec",
  "it-viec-manual": "itviec",
  "top-dev": "topdev",             // TopDev có tính phí
  linkedin: "linkedin",            // ứng viên LinkedIn paid
  "landing-page_linkedin": "linkedin", // landing-page có utm=linkedin -> LinkedIn paid
  // free / organic / social / owned
  "landing-page": "free",          // direct
  "landing-page_meta_social": "free",
  "landing-page_linkedin_social": "free",
  "landing-page_fb_group": "free",
  "landing-page_threads": "free",
  "landing-page_zalo": "free",
  "landing-page_glints": "free",
  "landing-page_coffeechat": "free",
  glint: "free",
  ybox: "free",
  "jobs-go": "free",
  fyi: "free",
  linkedin_free_manual: "free", // CV LinkedIn free do ngoại lệ nhập tay (xem lib/overrides.ts)
};

export const META_PAID_SOURCE = "landing-page_meta";

export const normalizeSource = (raw: string) => raw.trim().toLowerCase();
export function classifySource(raw: string): Channel {
  return SOURCE_TO_CHANNEL[normalizeSource(raw)] ?? "free"; // nhãn lạ -> free
}
