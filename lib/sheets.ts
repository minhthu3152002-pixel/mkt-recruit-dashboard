import { google } from "googleapis";
import { Dataset, CandidateRow, MetaSpendRow, JobSlotRow, BudgetPlanRow } from "./types";
import { SAMPLE } from "./sample-data";
import { SOURCE_TABS, pick, extractJdCode, companyFromCode, cleanTitle, parseFlexibleDate } from "./candidate-source";

function hasCreds() {
  return Boolean(
    process.env.GOOGLE_CANDIDATE_SHEET_ID &&
      process.env.GOOGLE_MARKETING_SHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
  );
}

function client() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

async function read(spreadsheetId: string, range: string): Promise<any[][]> {
  const res = await client().spreadsheets.values.get({ spreadsheetId, range });
  return (res.data.values as any[][]) ?? [];
}

const num = (v?: any) => {
  if (v == null) return 0;
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// ---- Candidate Data: quét tất cả tab nguồn, source = tên tab (landing-page tách theo utm) ----
async function fetchCandidates(candId: string): Promise<CandidateRow[]> {
  const out: CandidateRow[] = [];
  for (const cfg of SOURCE_TABS) {
    let rows: any[][];
    try {
      rows = await read(candId, `${cfg.name}!A${cfg.headerRow + 1}:Z100000`);
    } catch {
      continue; // tab không tồn tại -> bỏ qua
    }
    for (const r of rows) {
      const email = String(pick(r, cfg.email) ?? "").trim();
      if (!email) continue;
      const code = extractJdCode(String(pick(r, cfg.codeCol) ?? ""));
      if (!code) continue;
      const title = cleanTitle(String(pick(r, cfg.titleCol) ?? ""), code);
      const company = String(pick(r, cfg.companyCol) ?? "").trim() || companyFromCode(code);
      const date = parseFlexibleDate(pick(r, cfg.date));
      let source = cfg.name;
      if (cfg.name === "landing-page") {
        const us = String(pick(r, cfg.utmSource ?? 0) ?? "").trim();
        source = us ? `landing-page_${us}` : "landing-page";
      }
      out.push({ jdCode: code, company, title, date, source });
    }
  }
  return out;
}

// ---- Meta spend: raw-data-v2 (KRW). Giả định cột giống raw-data: Date=A, Spend=N, Impr=O, Clicks=P, Leads=R ----
async function fetchMeta(mktId: string): Promise<MetaSpendRow[]> {
  const rows = await read(mktId, "raw-data-v2!A2:R20000");
  return rows
    .filter((r) => r[0])
    .map((r) => ({ date: parseFlexibleDate(r[0]), spend: num(r[13]), impressions: num(r[14]), clicks: num(r[15]), leads: num(r[17]) }))
    .filter((r) => r.date);
}

async function fetchLinkedin(mktId: string): Promise<JobSlotRow[]> {
  const rows = await read(mktId, "linkedin-paid-jobs!A2:I5000");
  return rows.filter((r) => r[8]).map((r) => ({
    channel: "linkedin" as const, jobCode: String(r[8]).trim(), title: String(r[3] ?? "").trim(),
    effectiveDate: (parseFlexibleDate(r[2]) || "").slice(0, 7), cost: num(r[7]),
  }));
}

async function fetchJobTab(mktId: string, tab: string, channel: "itviec" | "topdev"): Promise<JobSlotRow[]> {
  const rows = await read(mktId, `${tab}!A2:G5000`);
  return rows.filter((r) => r[6]).map((r) => ({
    channel, jobCode: String(r[6]).trim(), title: String(r[1] ?? "").trim(),
    effectiveDate: (parseFlexibleDate(r[2]) || "").slice(0, 7), cost: num(r[5]),
  }));
}

async function fetchPlan(mktId: string): Promise<BudgetPlanRow[]> {
  try {
    const rows = await read(mktId, "plan!A2:C1000");
    const ok = ["meta", "linkedin", "itviec", "topdev", "free"];
    return rows
      .filter((r) => r[0] && ok.includes(String(r[1] ?? "").trim().toLowerCase()))
      .map((r) => ({ month: String(r[0]).trim(), channel: String(r[1]).trim().toLowerCase() as any, budget: num(r[2]) }));
  } catch {
    return [];
  }
}

export async function getDataset(): Promise<Dataset> {
  if (!hasCreds()) return SAMPLE;
  const cand = process.env.GOOGLE_CANDIDATE_SHEET_ID as string;
  const mkt = process.env.GOOGLE_MARKETING_SHEET_ID as string;
  try {
    const [cvs, meta, linkedin, itviec, topdev, plan] = await Promise.all([
      fetchCandidates(cand),
      fetchMeta(mkt).catch(() => [] as MetaSpendRow[]),
      fetchLinkedin(mkt).catch(() => [] as JobSlotRow[]),
      fetchJobTab(mkt, "it-viec", "itviec").catch(() => [] as JobSlotRow[]),
      fetchJobTab(mkt, "top-dev", "topdev").catch(() => [] as JobSlotRow[]),
      fetchPlan(mkt),
    ]);
    if (cvs.length === 0) return SAMPLE;
    return { cvs, meta, jobSlots: [...linkedin, ...itviec, ...topdev], plan, source: "sheets" };
  } catch (err) {
    console.error("[sheets] read failed, using sample:", err);
    return SAMPLE;
  }
}
