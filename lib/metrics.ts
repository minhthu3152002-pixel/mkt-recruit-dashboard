import { Dataset, CandidateRow, JdAgg } from "./types";
import { Channel, PAID_CHANNELS, CHANNEL_META, classifySource, META_PAID_SOURCE, normalizeSource } from "./sources";

export const KRW_TO_VND = Number(process.env.NEXT_PUBLIC_KRW_TO_VND) || 19.2;
export const toVnd = (krw: number) => krw * KRW_TO_VND;
const monthOf = (d: string) => d.slice(0, 7);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

// Gộp CV thô -> theo JD (mỗi JD: tổng CV + phân nguồn).
export function aggregateJds(cvs: CandidateRow[]): JdAgg[] {
  const map = new Map<string, JdAgg>();
  for (const cv of cvs) {
    let jd = map.get(cv.jdCode);
    if (!jd) { jd = { jdCode: cv.jdCode, company: cv.company, title: cv.title, totalCvs: 0, sources: {} }; map.set(cv.jdCode, jd); }
    jd.totalCvs++;
    jd.sources[cv.source] = (jd.sources[cv.source] ?? 0) + 1;
    if (!jd.company && cv.company) jd.company = cv.company;
    if (!jd.title && cv.title) jd.title = cv.title;
  }
  return [...map.values()];
}

export function cvCountByChannel(cvs: CandidateRow[]): Record<Channel, number> {
  const acc: Record<Channel, number> = { meta: 0, linkedin: 0, itviec: 0, topdev: 0, free: 0 };
  for (const cv of cvs) acc[classifySource(cv.source)]++;
  return acc;
}

// ---------- Tab 1: Paid channel ----------
export type ChannelSummary = {
  channel: Channel; label: string; ccy: "KRW" | "VND";
  spend: number; spendVnd: number; cvs: number; costPerCvVnd: number | null; jobs: number | null;
};

export function paidChannelSummary(d: Dataset): ChannelSummary[] {
  const cvByCh = cvCountByChannel(d.cvs);
  const metaKRW = sum(d.meta.map((r) => r.spend));
  const rows: ChannelSummary[] = [{
    channel: "meta", label: CHANNEL_META.meta.label, ccy: "KRW",
    spend: metaKRW, spendVnd: toVnd(metaKRW), cvs: cvByCh.meta,
    costPerCvVnd: cvByCh.meta > 0 ? toVnd(metaKRW) / cvByCh.meta : null, jobs: null,
  }];
  for (const ch of ["linkedin", "itviec", "topdev"] as const) {
    const slots = d.jobSlots.filter((s) => s.channel === ch);
    const spend = sum(slots.map((s) => s.cost));
    rows.push({
      channel: ch, label: CHANNEL_META[ch].label, ccy: "VND",
      spend, spendVnd: spend, cvs: cvByCh[ch],
      costPerCvVnd: cvByCh[ch] > 0 ? spend / cvByCh[ch] : null, jobs: slots.length,
    });
  }
  return rows;
}

// ---------- Tab 2: CV theo JD ----------
export type JdMetrics = {
  jdCode: string; company: string; title: string; totalCvs: number;
  cvPaid: number; cvFree: number; jobSlotVnd: number; metaKRW: number;
  totalVnd: number; costPerCvVnd: number | null;
};

export function jdMetrics(d: Dataset): JdMetrics[] {
  const jds = aggregateJds(d.cvs);
  const metaTotalKRW = sum(d.meta.map((r) => r.spend));
  const metaJdCodes = jds.filter((jd) => (jd.sources[META_PAID_SOURCE] ?? 0) > 0).map((jd) => jd.jdCode);
  const metaPerJdKRW = metaJdCodes.length > 0 ? metaTotalKRW / metaJdCodes.length : 0;

  const slotByCode = new Map<string, number>();
  for (const s of d.jobSlots) slotByCode.set(s.jobCode, (slotByCode.get(s.jobCode) ?? 0) + s.cost);

  return jds.map((jd) => {
    let cvPaid = 0, cvFree = 0;
    for (const [src, n] of Object.entries(jd.sources)) {
      if (CHANNEL_META[classifySource(src)].paid) cvPaid += n; else cvFree += n;
    }
    const jobSlotVnd = slotByCode.get(jd.jdCode) ?? 0;
    const metaKRW = metaJdCodes.includes(jd.jdCode) ? metaPerJdKRW : 0;
    const totalVnd = jobSlotVnd + toVnd(metaKRW);
    return {
      jdCode: jd.jdCode, company: jd.company, title: jd.title, totalCvs: jd.totalCvs,
      cvPaid, cvFree, jobSlotVnd, metaKRW, totalVnd,
      costPerCvVnd: jd.totalCvs > 0 && totalVnd > 0 ? totalVnd / jd.totalCvs : null,
    };
  }).sort((a, b) => b.totalCvs - a.totalCvs);
}

// ---------- Tab 3: Budget theo tháng ----------
export type MonthChannelSpend = { month: string; channel: Channel; actualNative: number; actualVnd: number; planVnd: number };

export function monthlySpend(d: Dataset): MonthChannelSpend[] {
  const months = new Set<string>();
  d.meta.forEach((r) => months.add(monthOf(r.date)));
  d.jobSlots.forEach((s) => s.effectiveDate && months.add(s.effectiveDate));
  d.plan.forEach((p) => months.add(p.month));

  const out: MonthChannelSpend[] = [];
  for (const m of [...months].filter(Boolean).sort()) {
    for (const ch of PAID_CHANNELS) {
      let native = 0;
      if (ch === "meta") native = sum(d.meta.filter((r) => monthOf(r.date) === m).map((r) => r.spend));
      else native = sum(d.jobSlots.filter((s) => s.channel === ch && s.effectiveDate === m).map((s) => s.cost));
      const planVnd = sum(d.plan.filter((p) => p.month === m && p.channel === ch).map((p) => p.budget));
      if (native === 0 && planVnd === 0) continue;
      out.push({ month: m, channel: ch, actualNative: native, actualVnd: ch === "meta" ? toVnd(native) : native, planVnd });
    }
  }
  return out;
}

// ---------- formatters ----------
export const fmtVnd = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "\u20ab";
export const fmtKrw = (n: number) => "\u20a9" + new Intl.NumberFormat("ko-KR").format(Math.round(n));
export const fmtInt = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n));
export const monthLabel = (m: string) => "Th" + Number(m.slice(5, 7)) + "/" + m.slice(2, 4);
export { normalizeSource };
