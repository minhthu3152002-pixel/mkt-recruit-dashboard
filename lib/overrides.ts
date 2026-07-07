import { CandidateRow } from "./types";
import { classifySource } from "./sources";

// Ngoại lệ thủ công: các CV này là LinkedIn FREE (đăng tự nhiên), KHÔNG tính paid.
// Quên gắn đúng nguồn lúc nhập. Khớp theo (jdCode, ngày nộp "YYYY-MM-DD").
// Đây là NGOẠI LỆ NHẬP TAY để sửa dữ liệu, KHÔNG phải bug.
const LINKEDIN_FREE_OVERRIDES: { jdCode: string; date: string }[] = [
  { jdCode: "SL201", date: "2026-04-29" },
  // thêm dòng nếu sau này phát hiện CV tương tự
];

// Nhãn source cho CV bị override -> phân loại "free" (map trong lib/sources.ts).
export const LINKEDIN_FREE_SOURCE = "linkedin_free_manual";

// Nếu 1 CV là LinkedIn (tab "LinkedIn" hoặc landing-page_linkedin) VÀ khớp ĐÚNG
// (jdCode, ngày) trong danh sách -> đổi source sang nhãn free. Chỉ ảnh hưởng CV
// khớp chính xác; mọi CV LinkedIn khác giữ nguyên paid.
export function applyCvOverrides(cvs: CandidateRow[]): CandidateRow[] {
  if (LINKEDIN_FREE_OVERRIDES.length === 0) return cvs;
  return cvs.map((cv) => {
    if (classifySource(cv.source) !== "linkedin") return cv;
    const hit = LINKEDIN_FREE_OVERRIDES.some((o) => o.jdCode === cv.jdCode && o.date === cv.date);
    return hit ? { ...cv, source: LINKEDIN_FREE_SOURCE } : cv;
  });
}
