// Port từ Apps Script "JD DAILY" — cấu hình đọc từng tab nguồn trong Candidate Data.
// Cột theo SỐ 1-based (1=A). 0 = không có.
export type TabCfg = {
  name: string;
  headerRow: number;
  email: number;
  date: number;
  codeCol: number;
  companyCol: number;
  titleCol: number;
  utmSource?: number;
};

export const SOURCE_TABS: TabCfg[] = [
  { name: "landing-page",   headerRow: 1, email: 4, date: 2,  codeCol: 10, companyCol: 9,  titleCol: 8,  utmSource: 14 },
  { name: "ITviec-api",     headerRow: 1, email: 4, date: 8,  codeCol: 1,  companyCol: 0,  titleCol: 1 },
  { name: "top-dev",        headerRow: 1, email: 3, date: 9,  codeCol: 8,  companyCol: 0,  titleCol: 8 },
  { name: "LinkedIn",       headerRow: 1, email: 2, date: 12, codeCol: 13, companyCol: 0,  titleCol: 13 },
  { name: "glint",          headerRow: 1, email: 2, date: 12, codeCol: 13, companyCol: 0,  titleCol: 13 },
  { name: "YBOX",           headerRow: 1, email: 2, date: 12, codeCol: 13, companyCol: 0,  titleCol: 13 },
  { name: "it-viec-manual", headerRow: 1, email: 3, date: 5,  codeCol: 4,  companyCol: 0,  titleCol: 4 },
  { name: "FYI",            headerRow: 1, email: 4, date: 2,  codeCol: 13, companyCol: 7,  titleCol: 6 },
  { name: "jobs-go",        headerRow: 1, email: 5, date: 9,  codeCol: 16, companyCol: 15, titleCol: 14 },
];

export const CODE_COMPANY_HINT: Record<string, string> = {
  DF: "DF Corp", SL: "SeedLab", JN: "Jinosys", NX: "Nexacode",
  WP: "Wellpod", MT: "Mutistation", AW: "Andwise", OQ: "ONSQUARE",
  FPT: "FPT Software", WF: "Wefun", ME: "Moen", NS: "Non Stereotype",
  LM: "Lumicraft", SHU: "Shupia", MNF: "MNF Solution",
  META: "Metainnotech", OM: "Omicsyn", HSE: "Hello Science Edu",
};

export const pick = (row: any[], col: number) => (col > 0 ? row[col - 1] : "");

export function extractJdCode(text: string): string | null {
  const m = String(text || "").match(/(^|[^A-Za-z0-9])([A-Z]{2,4}\d{3,4})(?![0-9])/);
  return m ? m[2] : null;
}

export function companyFromCode(code: string): string {
  const m = code.match(/^([A-Z]{2,4})/);
  return m ? CODE_COMPANY_HINT[m[1]] ?? "" : "";
}

export function cleanTitle(title: string, code: string): string {
  let t = String(title || "").trim();
  if (code) t = t.replace(new RegExp("^\\s*" + code + "\\s*[-_:]*\\s*", "i"), "");
  t = t.replace(/\s*\(#\d+\)\s*$/, "").trim();
  return t || String(title || "").trim();
}

// Serial của Google Sheets/Excel (số ngày từ 1899-12-30) -> "YYYY-MM-DD".
// Cần khi cột ngày được format kiểu "số" -> API trả về "46149" thay vì chuỗi ngày.
const SHEET_EPOCH = Date.UTC(1899, 11, 30);
function serialToDate(n: number): string {
  const dt = new Date(SHEET_EPOCH + Math.round(n) * 86400000);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

// dd/MM/yyyy | MM/dd | yyyy-mm-dd (+ giờ) | serial number -> "YYYY-MM-DD" | ""
export function parseFlexibleDate(raw: any): string {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  // Serial dạng "46149" / "46149.0" (không có dấu / hoặc -) -> quy đổi.
  const serial = s.replace(/,/g, "");
  if (/^\d{4,6}(\.0+)?$/.test(serial)) {
    const n = Math.trunc(Number(serial));
    if (n >= 20000 && n <= 90000) return serialToDate(n); // ~1954..2146
  }
  const m = s.match(/(\d{1,4})\s*[\/\-]\s*(\d{1,2})(?:\s*[\/\-]\s*(\d{2,4}))?/);
  if (!m) return "";
  let a = parseInt(m[1], 10), b = parseInt(m[2], 10);
  let y = m[3] ? parseInt(m[3], 10) : new Date().getFullYear();
  if (y < 100) y += 2000;
  let day = a, month = b;
  if (a > 31) { y = a; month = b; day = m[3] ? parseInt(m[3], 10) : 1; } // ISO yyyy-mm-dd
  else if (a <= 12 && b > 12) { month = a; day = b; }                    // MM/dd
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
