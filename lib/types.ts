import { Channel } from "./sources";
export type { Channel };
export { CHANNEL_META, PAID_CHANNELS } from "./sources";

// 1 dòng = 1 CV thô, đọc từ các tab nguồn của Candidate Data.
export type CandidateRow = {
  jdCode: string;
  company: string;
  title: string;
  date: string;   // YYYY-MM-DD ("" nếu không đọc được)
  source: string; // tên tab, hoặc landing-page_{utm}
};

// Meta spend theo ngày (raw-data-v2, KRW).
export type MetaSpendRow = {
  date: string; spend: number; impressions: number; clicks: number; leads: number;
};

// 1 job post đã mua (linkedin-paid-jobs / it-viec / top-dev), VND.
// startDate/endDate = "Từ ngày"/"Đến ngày" (YYYY-MM-DD, "" nếu không đọc được) — dùng cho rải cost theo range.
export type JobSlotRow = {
  channel: Extract<Channel, "linkedin" | "itviec" | "topdev">;
  jobCode: string; title: string; effectiveDate: string; cost: number;
  startDate: string; endDate: string;
};

export type BudgetPlanRow = { month: string; channel: Channel; budget: number };

export type Dataset = {
  cvs: CandidateRow[];
  meta: MetaSpendRow[];
  jobSlots: JobSlotRow[];
  plan: BudgetPlanRow[];
  source: "sheets" | "sample";
};

// JD gộp lại từ cvs (tính trong metrics).
export type JdAgg = {
  jdCode: string; company: string; title: string;
  totalCvs: number; sources: Record<string, number>;
};
