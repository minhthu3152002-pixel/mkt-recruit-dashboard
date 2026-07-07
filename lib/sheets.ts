import { unstable_cache } from "next/cache";
import { google } from "googleapis";
import { Dataset, CandidateRow, MetaSpendRow, JobSlotRow, BudgetPlanRow } from "./types";
import { SAMPLE } from "./sample-data";
import { SOURCE_TABS, pick, extractJdCode, companyFromCode, cleanTitle, parseFlexibleDate } from "./candidate-source";
import { applyCvOverrides } from "./overrides";

function hasCreds() {
  return Boolean(
    process.env.GOOGLE_CANDIDATE_SHEET_ID &&
      process.env.GOOGLE_MARKETING_SHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
  );
}

// Tạo 1 lần rồi tái dùng -> tránh tạo JWT + token-exchange mỗi read (giảm lỗi/rate-limit).
let _sheets: ReturnType<typeof google.sheets> | null = null;
function client() {
  if (!_sheets) {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    _sheets = google.sheets({ version: "v4", auth });
  }
  return _sheets;
}

// Tên tab có dấu gạch ngang / khoảng trắng phải bọc trong nháy đơn khi dùng A1 notation.
const a1 = (tab: string, cells: string) => `'${tab.replace(/'/g, "''")}'!${cells}`;

async function read(spreadsheetId: string, range: string): Promise<any[][]> {
  const res = await client().spreadsheets.values.get({ spreadsheetId, range });
  return (res.data.values as any[][]) ?? [];
}

// Parse số tiền/đếm: chịu được cả "2,229,120" (phẩy) lẫn "2.229.120" (chấm) ngăn nghìn,
// đuôi ".0" của số thô, ký hiệu tiền tệ, và giá trị đã là number.
const num = (v?: any) => {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  let s = String(v).trim().replace(/[^\d.,-]/g, "");
  if (!s) return 0;
  s = s.replace(/,/g, ""); // phẩy = ngăn nghìn ở dữ liệu này
  if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ""); // chấm ngăn nghìn -> bỏ
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

// ---- Candidate Data: quét tất cả tab nguồn, source = tên tab (landing-page tách theo utm) ----
async function fetchCandidates(candId: string): Promise<CandidateRow[]> {
  const out: CandidateRow[] = [];
  for (const cfg of SOURCE_TABS) {
    let rows: any[][];
    try {
      rows = await read(candId, a1(cfg.name, `A${cfg.headerRow + 1}:Z100000`));
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

// ---- Meta spend: raw-data-v2 (KRW). Cột đã đối chiếu thật: Date=A, Spend=N, Impr=O, Clicks=P, Leads=R ----
async function fetchMeta(mktId: string): Promise<MetaSpendRow[]> {
  const rows = await read(mktId, a1("raw-data-v2", "A2:R20000"));
  return rows
    .filter((r) => r[0])
    .map((r) => ({ date: parseFlexibleDate(r[0]), spend: num(r[13]), impressions: num(r[14]), clicks: num(r[15]), leads: num(r[17]) }))
    .filter((r) => r.date);
}

async function fetchLinkedin(mktId: string): Promise<JobSlotRow[]> {
  const rows = await read(mktId, a1("linkedin-paid-jobs", "A2:I5000"));
  // Ngày dạng MỸ M/D/YYYY (numFmt m/d/yyyy). Từ ngày=F(5), Đến ngày=G(6), Ngày hiệu lực=C(2).
  return rows.filter((r) => r[8]).map((r) => ({
    channel: "linkedin" as const, jobCode: String(r[8]).trim(), title: String(r[3] ?? "").trim(),
    effectiveDate: (parseFlexibleDate(r[2], "MDY") || "").slice(0, 7), cost: num(r[7]),
    startDate: parseFlexibleDate(r[5], "MDY"), endDate: parseFlexibleDate(r[6], "MDY"),
  }));
}

async function fetchJobTab(mktId: string, tab: string, channel: "itviec" | "topdev"): Promise<JobSlotRow[]> {
  const rows = await read(mktId, a1(tab, "A2:G5000"));
  // Ngày dạng D-M-YYYY (numFmt dd-mm-yyyy). Từ ngày=C(2), Đến ngày=D(3), Chi phí=F(5), Job code=G(6).
  return rows.filter((r) => r[6]).map((r) => ({
    channel, jobCode: String(r[6]).trim(), title: String(r[1] ?? "").trim(),
    effectiveDate: (parseFlexibleDate(r[2], "DMY") || "").slice(0, 7), cost: num(r[5]),
    startDate: parseFlexibleDate(r[2], "DMY"), endDate: parseFlexibleDate(r[3], "DMY"),
  }));
}

// ---- Kế hoạch budget theo tháng ----
// Tháng 5: HARDCODE (nguồn: tab may-report, cột "Planned Budget").
const MAY_PLAN: BudgetPlanRow[] = [
  { month: "2026-05", channel: "meta", budget: 15000000 }, // Event & Talent Pool (gộp Hackathon+Mentoring -> 20000000)
  { month: "2026-05", channel: "linkedin", budget: 8100000 },
  { month: "2026-05", channel: "topdev", budget: 19764000 },
  { month: "2026-05", channel: "itviec", budget: 11145600 },
];

// "Tháng 6" -> "2026-06"; hoặc chuỗi ngày/serial -> YYYY-MM; khác -> "".
function monthFromLabel(v: any): string {
  const s = String(v ?? "").trim();
  const m = s.match(/th[aá]ng\s*(\d{1,2})/i);
  if (m) { const mo = Number(m[1]); if (mo >= 1 && mo <= 12) return `2026-${String(mo).padStart(2, "0")}`; }
  const d = parseFlexibleDate(s);
  return d ? d.slice(0, 7) : "";
}

// Tháng 6+: đọc động từ tab "mkt-budget". Cột B=Tháng, K=Meta, L=LinkedIn, M=ITviec (VND).
// Không có TopDev cho T6+. Chỉ lấy month >= 2026-06 (T5 đã hardcode).
async function fetchMktBudget(mktId: string): Promise<BudgetPlanRow[]> {
  try {
    const rows = await read(mktId, a1("mkt-budget", "A1:M2000"));
    const out: BudgetPlanRow[] = [];
    for (const r of rows) {
      const month = monthFromLabel(r[1]); // cột B = "Tháng N"
      if (!month || month < "2026-06") continue;
      const add = (channel: BudgetPlanRow["channel"], v: any) => { const b = num(v); if (b > 0) out.push({ month, channel, budget: b }); };
      add("meta", r[10]);     // cột K
      add("linkedin", r[11]); // cột L
      add("itviec", r[12]);   // cột M
    }
    return out;
  } catch {
    return [];
  }
}

// ---- DEBUG: dò dữ liệu thô các tab Marketing (dùng ở /api/debug-sheets) ----
// Trả về header + vài dòng đầu HOẶC lỗi đọc, để xác nhận đúng cột/tên tab/quyền truy cập.
export async function debugMarketingTabs() {
  const env = {
    GOOGLE_CANDIDATE_SHEET_ID: Boolean(process.env.GOOGLE_CANDIDATE_SHEET_ID),
    GOOGLE_MARKETING_SHEET_ID: Boolean(process.env.GOOGLE_MARKETING_SHEET_ID),
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? null,
    GOOGLE_PRIVATE_KEY: Boolean(process.env.GOOGLE_PRIVATE_KEY),
    NEXT_PUBLIC_KRW_TO_VND: process.env.NEXT_PUBLIC_KRW_TO_VND ?? null,
  };
  if (!hasCreds()) return { hasCreds: false, env, note: "Thiếu env -> app đang chạy sample-data." };

  const mkt = process.env.GOOGLE_MARKETING_SHEET_ID as string;
  const probes = [
    { tab: "raw-data-v2", cells: "A1:U4" },
    { tab: "linkedin-paid-jobs", cells: "A1:I4" },
    { tab: "it-viec", cells: "A1:G4" },
    { tab: "top-dev", cells: "A1:G4" },
    { tab: "plan", cells: "A1:C4" },
  ];
  const tabs = await Promise.all(
    probes.map(async ({ tab, cells }) => {
      try {
        const rows = await read(mkt, a1(tab, cells));
        return { tab, ok: true, rowCount: rows.length, header: rows[0] ?? [], sampleRows: rows.slice(1) };
      } catch (e: any) {
        return { tab, ok: false, error: e?.message ?? String(e) };
      }
    })
  );
  return { hasCreds: true, env, marketingTabs: tabs };
}

async function loadDataset(): Promise<Dataset> {
  if (!hasCreds()) return SAMPLE;
  const cand = process.env.GOOGLE_CANDIDATE_SHEET_ID as string;
  const mkt = process.env.GOOGLE_MARKETING_SHEET_ID as string;
  try {
    // Không nuốt lỗi im lặng: log ra để thấy tab nào đọc hỏng (403/tên tab/ID sai...).
    const warn = (tab: string) => (e: any) => {
      console.error(`[sheets] đọc "${tab}" (marketing) hỏng:`, e?.message ?? e);
      return [] as any[];
    };
    const [cvs, meta, linkedin, itviec, topdev, mktPlan] = await Promise.all([
      fetchCandidates(cand),
      fetchMeta(mkt).catch(warn("raw-data-v2")) as Promise<MetaSpendRow[]>,
      fetchLinkedin(mkt).catch(warn("linkedin-paid-jobs")) as Promise<JobSlotRow[]>,
      fetchJobTab(mkt, "it-viec", "itviec").catch(warn("it-viec")) as Promise<JobSlotRow[]>,
      fetchJobTab(mkt, "top-dev", "topdev").catch(warn("top-dev")) as Promise<JobSlotRow[]>,
      fetchMktBudget(mkt).catch(warn("mkt-budget")) as Promise<BudgetPlanRow[]>,
    ]);
    if (cvs.length === 0) return SAMPLE;
    // Áp ngoại lệ nhập tay (vd CV LinkedIn free bị gắn nhầm paid) tại 1 điểm duy nhất.
    // Plan = Tháng 5 hardcode + Tháng 6+ từ mkt-budget.
    return { cvs: applyCvOverrides(cvs), meta, jobSlots: [...linkedin, ...itviec, ...topdev], plan: [...MAY_PLAN, ...mktPlan], source: "sheets" };
  } catch (err) {
    console.error("[sheets] read failed, using sample:", err);
    return SAMPLE;
  }
}

// Dataset dùng chung cho MỌI trang: đọc Sheets 1 lần/chu kỳ -> nguồn (live/sample)
// NHẤT QUÁN giữa các tab, không để mỗi trang tự đọc rồi lệch nguồn vì rate-limit.
const _cachedDataset = unstable_cache(loadDataset, ["mkt-dashboard-dataset-v1"], { revalidate: 600 });

export async function getDataset(): Promise<Dataset> {
  return _cachedDataset();
}
