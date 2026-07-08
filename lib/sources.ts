export type Channel = "meta" | "linkedin" | "itviec" | "topdev" | "free";
export const PAID_CHANNELS: Channel[] = ["meta", "linkedin", "itviec", "topdev"];

export const CHANNEL_META: Record<Channel, { label: string; paid: boolean; color: string; ccy: "KRW" | "VND" }> = {
  meta: { label: "Meta Ads", paid: true, color: "#2563eb", ccy: "KRW" },
  linkedin: { label: "LinkedIn", paid: true, color: "#0a66c2", ccy: "VND" },
  itviec: { label: "ITviec", paid: true, color: "#e4322b", ccy: "VND" },
  topdev: { label: "TopDev", paid: true, color: "#f04e37", ccy: "VND" },
  free: { label: "Free / Organic", paid: false, color: "#16a34a", ccy: "VND" },
};

// ============================================================================
// PHÂN LOẠI NGUỒN CV — nơi DUY NHẤT chỉnh sửa mapping source.
// Có 2 lớp thông tin cho mỗi source (đều key theo normalizeSource = trim+lowercase):
//   1) SOURCE_TO_CHANNEL: source -> 1 trong 4 kênh PAID (meta/linkedin/itviec/topdev)
//      hoặc "free". Dùng để GÁN CHI PHÍ (metrics.ts, tab Paid channel/Budget/JD).
//   2) SOURCE_META: source -> { channelType: paid|free, group, label }. Dùng để
//      HIỂN THỊ ở tab "Source Analysis" (3 tầng Paid/Free > group > source(label)).
// QUAN TRỌNG — 2 lớp phải NHẤT QUÁN về paid/free:
//   channelType === "paid"  ⇔  SOURCE_TO_CHANNEL[source] ∈ 4 kênh paid.
//   Mọi source PAID phải xuất hiện ở CẢ HAI map bên dưới.
// ============================================================================

// (1) Source -> kênh (để gán tiền). Free/unknown -> "free".
export const SOURCE_TO_CHANNEL: Record<string, Channel> = {
  // --- PAID ---
  "landing-page_meta": "meta",          // Meta ads (kênh tính tiền)
  "itviec-api": "itviec",
  "it-viec-manual": "itviec",
  "top-dev": "topdev",                  // TopDev có tính phí
  "linkedin": "linkedin",               // ứng viên LinkedIn paid
  "landing-page_linkedin": "linkedin",  // landing-page utm=linkedin -> LinkedIn paid
  // --- FREE / organic / social / owned (liệt kê rõ; unknown mặc định vẫn free) ---
  "landing-page": "free",
  "landing-page_meta_social": "free",
  "landing-page_ig": "free",
  "landing-page_ig_text_post_permalink": "free",
  "landing-page_ig_text_feed_timeline": "free",
  "landing-page_linkedin_social": "free",
  "landing-page_linkedin_threads": "free",
  "landing-page_threads": "free",
  "landing-page_fb_group": "free",
  "landing-page_fb": "free",
  "landing-page_group": "free",
  "landing-page_facebook-group": "free",
  "landing-page_zalo": "free",
  "landing-page_zalo_group": "free",
  "jobs-go": "free",
  "glint": "free",
  "landing-page_glints": "free",
  "ybox": "free",
  "fyi": "free",
  "landing-page_coffeechat": "free",
  "landing-page_vku": "free",
  "landing-page_hutech": "free",
  // LinkedIn FREE — khớp theo TÊN CHÍNH XÁC (KHÔNG có logic "chứa 'linkedin' -> paid").
  "linkedin_free_manual": "free",          // ngoại lệ nhập tay (xem lib/overrides.ts)
  "landing-page_linkedin_freejob": "free", // LinkedIn đăng job free (không tính phí)
  // landing-page_test: KHÔNG map -> mặc định "free" + rơi vào group "Other" (link test nội bộ)
};

// (2) Source -> { channelType, group, label } cho tab Source Analysis.
//     - label = tên hiển thị (gộp nhiều utm thô cùng 1 nhãn). utm thô chỉ hiện nhỏ/mờ khi hover.
//     - group = tầng giữa (Direct, Social media, Job board...).
//     - Source lạ chưa map -> mặc định { free, "Other", <raw> } (xem sourceMeta()).
export type ChannelType = "paid" | "free";
export type SourceMeta = { channelType: ChannelType; group: string; label: string };
const F = (group: string, label: string): SourceMeta => ({ channelType: "free", group, label });
const P = (group: string, label: string): SourceMeta => ({ channelType: "paid", group, label });

export const SOURCE_META: Record<string, SourceMeta> = {
  // ===== FREE =====
  // Direct
  "landing-page": F("Direct", "Direct landing page"),
  // Social media (gộp nhãn Facebook/IG cho các utm IG/Meta social)
  "landing-page_meta_social": F("Social media", "Facebook/IG"),
  "landing-page_ig": F("Social media", "Facebook/IG"),
  "landing-page_ig_text_post_permalink": F("Social media", "Facebook/IG"),
  "landing-page_ig_text_feed_timeline": F("Social media", "Facebook/IG"),
  "landing-page_linkedin_social": F("Social media", "LinkedIn (social)"),
  "landing-page_linkedin_threads": F("Social media", "Threads"),
  "landing-page_threads": F("Social media", "Threads"),
  // Seeding (gộp nhãn Facebook group cho các utm fb group)
  "landing-page_fb_group": F("Seeding", "Facebook group"),
  "landing-page_fb": F("Seeding", "Facebook group"),
  "landing-page_group": F("Seeding", "Facebook group"),
  "landing-page_facebook-group": F("Seeding", "Facebook group"),
  // Zalo community
  "landing-page_zalo": F("Zalo community", "Zalo"),
  "landing-page_zalo_group": F("Zalo community", "Zalo"),
  // Hiring platform (bao gồm cả LinkedIn free job)
  "jobs-go": F("Hiring platform", "Jobsgo"),
  "glint": F("Hiring platform", "Glints"),
  "landing-page_glints": F("Hiring platform", "Glints"),
  "ybox": F("Hiring platform", "Ybox"),
  "fyi": F("Hiring platform", "FYI"),
  "linkedin_free_manual": F("Hiring platform", "LinkedIn (free job)"),        // LinkedIn free nhập tay (override)
  "landing-page_linkedin_freejob": F("Hiring platform", "LinkedIn (free job)"), // LinkedIn đăng job free
  // Event
  "landing-page_coffeechat": F("Event", "Coffee chat"),
  // University
  "landing-page_vku": F("University", "VKU"),
  "landing-page_hutech": F("University", "HUTECH"),

  // ===== PAID =====
  // Ads
  "landing-page_meta": P("Ads", "Meta Ads"),
  // Hiring platform (đồng nhất tên với group Hiring platform bên Free)
  "itviec-api": P("Hiring platform", "ITviec"),
  "it-viec-manual": P("Hiring platform", "ITviec"),
  "linkedin": P("Hiring platform", "LinkedIn (paid)"),
  "landing-page_linkedin": P("Hiring platform", "LinkedIn (paid)"),
  "top-dev": P("Hiring platform", "TopDev"),
};

// Chi phí paid gắn theo "cost channel" (4 kênh có số tiền). Mỗi label paid ứng 1 kênh
// để tra chi phí all-time trong tab Source Analysis.
export const PAID_LABEL_TO_COST_CHANNEL: Record<string, Exclude<Channel, "free">> = {
  "Meta Ads": "meta",
  "ITviec": "itviec",
  "LinkedIn (paid)": "linkedin",
  "TopDev": "topdev",
};

export const META_PAID_SOURCE = "landing-page_meta";

export const normalizeSource = (raw: string) => raw.trim().toLowerCase();
export function classifySource(raw: string): Channel {
  return SOURCE_TO_CHANNEL[normalizeSource(raw)] ?? "free"; // nhãn lạ -> free
}

// Meta hiển thị cho tab Source Analysis. Source lạ chưa map -> group "Other" (channelType free).
export function sourceMeta(raw: string): SourceMeta {
  return SOURCE_META[normalizeSource(raw)] ?? { channelType: "free", group: "Other", label: raw };
}
