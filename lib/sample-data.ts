import { Dataset, CandidateRow } from "./types";

// Spec gọn -> bung thành từng dòng CV (mỗi CV 1 dòng, có ngày + source).
const JD_SPEC: { jdCode: string; company: string; title: string; sources: Record<string, number> }[] = [
  { jdCode: "NX501", company: "Nexacode", title: "Full-stack Developer (Flutter)", sources: { "ITviec-api": 355, "it-viec-manual": 67, "landing-page": 65, "landing-page_linkedin_social": 43, FYI: 33, "landing-page_zalo": 16, "landing-page_meta": 5 } },
  { jdCode: "MT702", company: "Mutistation", title: "Website Developer", sources: { "top-dev": 233, LinkedIn: 20, "landing-page": 12, "landing-page_meta": 6 } },
  { jdCode: "FPT401", company: "FPT Software Korea", title: "Embedded software developer", sources: { "ITviec-api": 134, "landing-page_fb_group": 34, LinkedIn: 30, "landing-page_linkedin_social": 28, "landing-page": 11, "it-viec-manual": 8, FYI: 7, "landing-page_meta_social": 2 } },
  { jdCode: "JN301", company: "Jinosys", title: "Mobile App & Web Service Developer", sources: { "ITviec-api": 135, "landing-page": 23, YBOX: 19, glint: 18, "it-viec-manual": 18, LinkedIn: 16, FYI: 10, "landing-page_meta": 1 } },
  { jdCode: "MT701", company: "Mutistation", title: "UI/UX Designer", sources: { LinkedIn: 30, "landing-page": 12, FYI: 3, "landing-page_zalo": 1 } },
  { jdCode: "WP602", company: "Wellpod", title: "TikTok Shop & Shopify Manager", sources: { LinkedIn: 15, "landing-page_linkedin_social": 12, "landing-page": 9, "landing-page_threads": 4, "landing-page_zalo": 2, FYI: 1 } },
  { jdCode: "DF101", company: "DF Corp", title: "Global Marketing Intern/Junior", sources: { glint: 23, YBOX: 6 } },
  { jdCode: "WP601", company: "Wellpod", title: "TikTok Ads Marketing Manager", sources: { LinkedIn: 12, "landing-page": 8, "landing-page_threads": 2, "landing-page_fb_group": 1 } },
  { jdCode: "SL201", company: "SeedLab", title: "Performance & Growth Manager", sources: { LinkedIn: 15, "landing-page": 1 } },
];

function buildCvs(): CandidateRow[] {
  const out: CandidateRow[] = [];
  let i = 0;
  for (const jd of JD_SPEC) {
    for (const [source, n] of Object.entries(jd.sources)) {
      for (let k = 0; k < n; k++) {
        const month = i % 2 === 0 ? "05" : "06";
        const day = String((i % 27) + 1).padStart(2, "0");
        out.push({ jdCode: jd.jdCode, company: jd.company, title: jd.title, date: `2026-${month}-${day}`, source });
        i++;
      }
    }
  }
  return out;
}

export const SAMPLE: Dataset = {
  source: "sample",
  cvs: buildCvs(),
  meta: [
    { date: "2026-05-08", spend: 210000, impressions: 42000, clicks: 340, leads: 12 },
    { date: "2026-05-20", spend: 180000, impressions: 38000, clicks: 300, leads: 9 },
    { date: "2026-06-05", spend: 240000, impressions: 51000, clicks: 410, leads: 15 },
    { date: "2026-06-18", spend: 260000, impressions: 55000, clicks: 430, leads: 17 },
    { date: "2026-06-28", spend: 264455, impressions: 49000, clicks: 400, leads: 14 },
  ],
  jobSlots: [
    { channel: "itviec", jobCode: "FPT401", title: "Embedded", effectiveDate: "2026-05", cost: 2229120 },
    { channel: "itviec", jobCode: "NX501", title: "Fullstack", effectiveDate: "2026-05", cost: 2229120 },
    { channel: "itviec", jobCode: "JN301", title: "Mobile", effectiveDate: "2026-05", cost: 2229120 },
    { channel: "linkedin", jobCode: "WP601", title: "TikTok Ads", effectiveDate: "2026-05", cost: 400000 },
    { channel: "linkedin", jobCode: "WP602", title: "TikTok Shop", effectiveDate: "2026-05", cost: 400000 },
    { channel: "linkedin", jobCode: "MT701", title: "UI/UX", effectiveDate: "2026-05", cost: 726357 },
    { channel: "topdev", jobCode: "MT702", title: "Website Dev", effectiveDate: "2026-05", cost: 4941000 },
  ],
  plan: [
    { month: "2026-05", channel: "meta", budget: 13825000 },
    { month: "2026-05", channel: "linkedin", budget: 15405000 },
    { month: "2026-06", channel: "meta", budget: 30625000 },
    { month: "2026-06", channel: "linkedin", budget: 34125000 },
  ],
};
