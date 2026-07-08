// ============================================================================
// i18n — nhãn UI cho 4 tab (VI mặc định, KO). Tên riêng GIỮ NGUYÊN không dịch:
// Meta Ads, LinkedIn, ITviec, TopDev, CV, JD, cost/CV.
// ⚠️ CHUỖI HÀN (ko) cần người bản xứ review — đánh dấu "// KO-REVIEW".
// ============================================================================

export type Lang = "vi" | "ko";
export type Ccy = "VND" | "KRW";

export const KRW_TO_VND = Number(process.env.NEXT_PUBLIC_KRW_TO_VND) || 19.2;
const locale = (lang: Lang) => (lang === "vi" ? "vi-VN" : "ko-KR");

// Tiền GẮN theo ngôn ngữ: VI -> VND (₫), KO -> KRW (₩). Quy đổi 2 chiều @KRW_TO_VND.
export function formatMoney(value: number, base: Ccy, lang: Lang): string {
  let amount: number, ccy: Ccy;
  if (lang === "vi") {
    amount = base === "KRW" ? value * KRW_TO_VND : value;
    ccy = "VND";
  } else {
    amount = base === "VND" ? value / KRW_TO_VND : value;
    ccy = "KRW";
  }
  const s = new Intl.NumberFormat(locale(lang)).format(Math.round(amount));
  return ccy === "VND" ? `${s}₫` : `₩${s}`;
}

export function formatInt(n: number, lang: Lang): string {
  return new Intl.NumberFormat(locale(lang)).format(Math.round(n));
}

// Nhãn tiền tệ hiện hành + chú thích quy đổi (đổi theo ngôn ngữ).
export const moneyLabel = (lang: Lang) => (lang === "vi" ? "VND-equiv" : "KRW-equiv");
export const rateNote = (lang: Lang) =>
  lang === "vi" ? `Meta quy đổi @${KRW_TO_VND} VND/₩` : `환율 적용 @${KRW_TO_VND} ₫/₩`; // KO-REVIEW

const DICT: Record<Lang, Record<string, string>> = {
  vi: {
    "nav.paid": "Paid channel",
    "nav.jd": "Cost per CV by JD",
    "nav.budget": "Monthly Budget",
    "nav.daily": "Daily CV Tracking by JD",
    "nav.source": "Source Analysis",
    "sidebar.footer": "Chi phí & CV theo kênh — cập nhật trực tiếp từ Google Sheets.",
    "sidebar.collapse": "Thu gọn",
    "header.live": "Live từ Google Sheets",
    "header.sample": "Sample data",
    "common.from": "Từ ngày",
    "common.to": "Đến ngày",
    "common.total": "TỔNG",
    "common.dash": "—",

    "paid.title": "Paid channel",
    "paid.overview": "Tổng quan",
    "paid.overviewSub": "Toàn bộ thời gian · không phụ thuộc ô chọn ngày",
    "paid.kpi.totalCost": "Tổng chi phí",
    "paid.kpi.cvPaid": "CV từ kênh paid",
    "paid.kpi.costPerCv": "Cost / CV (blended)",
    "paid.kpi.paidJd": "Số JD chạy paid",
    "paid.kpi.bySource": "gán theo nguồn",
    "paid.kpi.costDivCv": "chi phí paid ÷ CV paid",
    "paid.kpi.jdHasPaid": "JD có CV kênh trả phí",
    "paid.ch.chiphi": "Chi phí",
    "paid.ch.cv": "CV",
    "paid.ch.costcv": "Cost/CV",
    "paid.ch.ads": "ads",
    "paid.ch.jobPost": "job post",
    "paid.ch.metaNote": "CV = lead Meta báo cáo (raw-data-v2)",
    "paid.chart.title": "Chi phí & Cost/CV theo kênh",
    "paid.chart.sub": "Cột hồng = chi phí (trục trái) · cột xanh = cost/CV (trục phải)",

    "range.title": "Theo khoảng ngày",
    "range.sub": "Job-board rải đều cost theo ngày · Meta theo spend/leads · CV theo ngày nộp · badge so kỳ liền trước cùng độ dài",
    "range.vsPrev": "so với kỳ trước",
    "range.note": "Chi phí tăng/giảm là dữ kiện, không phải tốt/xấu — xem Cost/CV để đánh giá hiệu quả. Số JD chạy paid cho biết quy mô tuyển trong kỳ.",
    "range.chart.title": "Chi phí & Cost/CV theo kênh",
    "range.chart.sub": "Trong khoảng ngày đã chọn",

    "jd.title": "Cost per CV by JD",
    "jd.eyebrow": "Chi phí & cost/CV cho từng job",
    "jd.kpi.totalCv": "Tổng CV",
    "jd.kpi.cvPaid": "CV paid",
    "jd.kpi.cvFree": "CV free",
    "jd.kpi.costPerCv": "Cost / CV (blended)",
    "jd.tbl.title": "Chi tiết từng JD",
    "jd.tbl.sub": "Tiền = job-slot theo Job code + Meta chia đều · CV từ JD DAILY",
    "jd.col.jd": "JD",
    "jd.col.cvVol": "Lượng CV",
    "jd.col.paid": "Paid",
    "jd.col.free": "Free",
    "jd.col.jobslot": "Job-slot",
    "jd.col.meta": "Meta",
    "jd.col.costcv": "Cost/CV",
    "jd.badge.free": "miễn phí",
    "jd.badge.updating": "đang cập nhật giá",
    "jd.foot1": "Cost/CV = (job-slot theo Job code + phần Meta chia đều, quy đổi) ÷ tổng CV của JD.",
    "jd.foot.free": "chỉ có CV từ kênh không tốn phí",
    "jd.foot.updating": "có CV kênh trả phí (Meta/LinkedIn/ITviec/TopDev) nhưng chưa nhập giá vào sheet Marketing.",

    "budget.title": "Monthly Budget",
    "budget.eyebrow": "Đã sài bao nhiêu theo từng kênh",
    "budget.kpi.spent": "Đã chi",
    "budget.kpi.plan": "Kế hoạch",
    "budget.kpi.usedPct": "% đã dùng",
    "budget.kpi.usedSub": "actual ÷ plan",
    "budget.kpi.noPlan": "chưa có plan",
    "budget.chart.title": "Actual vs Plan theo tháng",
    "budget.chart.sub": "Cột màu = actual từng kênh · đường hồng = kế hoạch",
    "budget.tbl.title": "Chi tiết",
    "budget.col.month": "Tháng",
    "budget.col.channel": "Kênh",
    "budget.col.actual": "Actual",
    "budget.col.plan": "Plan",
    "budget.col.usedPct": "% dùng",
    "budget.legend.plan": "Kế hoạch",

    "daily.title": "Daily CV Tracking by JD",
    "daily.eyebrow": "CV nhận theo từng ngày · tự tính từ CV thô",
    "daily.panel.title": "CV nhận theo ngày · từng JD",
    "daily.panel.sub": "Tổng tích luỹ = CV tới hết ngày “Đến” · mỗi cột = CV nhận trong đúng ngày · tối đa 30 ngày",
    "daily.clamped": "— đã kẹp lại 30 ngày",
    "daily.col.cumTotal": "Tổng tích luỹ",
    "daily.col.source": "Source",
    "daily.collapse": "thu gọn",
    "daily.foot": "JD có CV tới ngày “Đến”. Tự tính từ CV thô (Candidate Data) — cùng logic bắt mã JD / parse ngày / gom nguồn như Apps Script JD DAILY.",

    "source.title": "Source Analysis",
    "source.eyebrow": "CV đến từ đâu · Paid vs Free · theo nhóm & nguồn",
    "source.kpi.totalCv": "Tổng CV",
    "source.kpi.paid": "CV Paid",
    "source.kpi.free": "CV Free",
    "source.kpi.costPerCvPaid": "Cost/CV nhóm Paid",
    "source.kpi.ofTotal": "trên tổng CV",
    "source.kpi.freeIsFree": "miễn phí",
    "source.kpi.paidCostDivCv": "chi phí paid ÷ CV paid",
    "source.metaNote": "Meta ở đây đếm theo nguồn landing-page_meta, khác “lead nền tảng” ở tab Paid channel.",
    "source.chart.splitTitle": "Paid vs Free",
    "source.chart.splitSub": "Tỷ trọng CV theo loại nguồn",
    "source.chart.topTitle": "Top nguồn theo CV",
    "source.chart.topSub": "Top ~10 nguồn (theo nhãn) · hồng = paid, xanh lá = free",
    "source.tbl.title": "Chi tiết 3 tầng: Paid/Free › nhóm › nguồn",
    "source.tbl.sub": "Bấm để xổ/thu. CV đếm từ Candidate Data theo nguồn · chi phí là all-time.",
    "source.col.name": "Nguồn",
    "source.col.cv": "CV",
    "source.col.pct": "% tổng",
    "source.col.cost": "Chi phí",
    "source.col.costcv": "Cost/CV",
    "source.paid": "Paid",
    "source.free": "Free",
    "source.free.cost": "miễn phí",
    "source.costNote": "Chi phí paid để all-time (khó cắt chính xác theo ngày). Khi chọn range, CV lọc theo ngày nộp nhưng chi phí & cost/CV vẫn tính all-time.",
    "source.rangeNote": "Trống = toàn thời gian · chọn ngày = chỉ đếm CV có ngày nộp trong khoảng.",
  },

  // ⚠️ KO-REVIEW: bản dịch máy, cần người Hàn rà lại.
  ko: {
    "nav.paid": "Paid channel",
    "nav.jd": "Cost per CV by JD",
    "nav.budget": "Monthly Budget",
    "nav.daily": "Daily CV Tracking by JD",
    "nav.source": "Source Analysis",
    "sidebar.footer": "채널별 비용 & CV — Google Sheets 실시간 연동.", // KO-REVIEW
    "sidebar.collapse": "접기", // KO-REVIEW
    "header.live": "Google Sheets 실시간", // KO-REVIEW
    "header.sample": "샘플 데이터", // KO-REVIEW
    "common.from": "시작일", // KO-REVIEW
    "common.to": "종료일", // KO-REVIEW
    "common.total": "합계", // KO-REVIEW
    "common.dash": "—",

    "paid.title": "Paid channel",
    "paid.overview": "전체 개요", // KO-REVIEW
    "paid.overviewSub": "전체 기간 · 날짜 선택과 무관", // KO-REVIEW
    "paid.kpi.totalCost": "총 비용", // KO-REVIEW
    "paid.kpi.cvPaid": "유료 채널 CV", // KO-REVIEW
    "paid.kpi.costPerCv": "Cost / CV (blended)",
    "paid.kpi.paidJd": "유료 진행 JD 수", // KO-REVIEW
    "paid.kpi.bySource": "출처 기준 분류", // KO-REVIEW
    "paid.kpi.costDivCv": "유료 비용 ÷ 유료 CV", // KO-REVIEW
    "paid.kpi.jdHasPaid": "유료 채널 CV 보유 JD", // KO-REVIEW
    "paid.ch.chiphi": "비용", // KO-REVIEW
    "paid.ch.cv": "CV",
    "paid.ch.costcv": "Cost/CV",
    "paid.ch.ads": "ads",
    "paid.ch.jobPost": "job post",
    "paid.ch.metaNote": "CV = Meta 리포트 리드 (raw-data-v2)", // KO-REVIEW
    "paid.chart.title": "채널별 비용 & Cost/CV", // KO-REVIEW
    "paid.chart.sub": "분홍 막대 = 비용(좌축) · 파란 막대 = cost/CV(우축)", // KO-REVIEW

    "range.title": "기간별", // KO-REVIEW
    "range.sub": "Job-board 비용 일할 배분 · Meta는 spend/leads · CV는 제출일 기준 · 배지는 직전 동일 기간 대비", // KO-REVIEW
    "range.vsPrev": "직전 기간 대비", // KO-REVIEW
    "range.note": "비용 증감은 사실일 뿐 좋고 나쁨이 아님 — 효율은 Cost/CV로 판단. 유료 진행 JD 수는 기간 내 채용 규모를 나타냄.", // KO-REVIEW
    "range.chart.title": "채널별 비용 & Cost/CV", // KO-REVIEW
    "range.chart.sub": "선택한 기간 기준", // KO-REVIEW

    "jd.title": "Cost per CV by JD",
    "jd.eyebrow": "직무별 비용 & cost/CV", // KO-REVIEW
    "jd.kpi.totalCv": "총 CV", // KO-REVIEW
    "jd.kpi.cvPaid": "CV paid",
    "jd.kpi.cvFree": "CV free",
    "jd.kpi.costPerCv": "Cost / CV (blended)",
    "jd.tbl.title": "JD 상세", // KO-REVIEW
    "jd.tbl.sub": "비용 = Job code별 job-slot + Meta 균등 배분 · CV는 JD DAILY 기준", // KO-REVIEW
    "jd.col.jd": "JD",
    "jd.col.cvVol": "CV 수", // KO-REVIEW
    "jd.col.paid": "Paid",
    "jd.col.free": "Free",
    "jd.col.jobslot": "Job-slot",
    "jd.col.meta": "Meta",
    "jd.col.costcv": "Cost/CV",
    "jd.badge.free": "무료", // KO-REVIEW
    "jd.badge.updating": "가격 입력 대기", // KO-REVIEW
    "jd.foot1": "Cost/CV = (Job code별 job-slot + Meta 균등 배분, 환산) ÷ JD 총 CV.", // KO-REVIEW
    "jd.foot.free": "무료 채널 CV만 있음", // KO-REVIEW
    "jd.foot.updating": "유료 채널(Meta/LinkedIn/ITviec/TopDev) CV가 있으나 Marketing 시트에 가격 미입력.", // KO-REVIEW

    "budget.title": "Monthly Budget",
    "budget.eyebrow": "채널별 지출 현황", // KO-REVIEW
    "budget.kpi.spent": "지출", // KO-REVIEW
    "budget.kpi.plan": "계획", // KO-REVIEW
    "budget.kpi.usedPct": "사용률 %", // KO-REVIEW
    "budget.kpi.usedSub": "actual ÷ plan",
    "budget.kpi.noPlan": "계획 없음", // KO-REVIEW
    "budget.chart.title": "월별 Actual vs Plan", // KO-REVIEW
    "budget.chart.sub": "색상 막대 = 채널별 actual · 분홍 선 = 계획", // KO-REVIEW
    "budget.tbl.title": "상세", // KO-REVIEW
    "budget.col.month": "월", // KO-REVIEW
    "budget.col.channel": "채널", // KO-REVIEW
    "budget.col.actual": "Actual",
    "budget.col.plan": "Plan",
    "budget.col.usedPct": "사용률 %", // KO-REVIEW
    "budget.legend.plan": "계획", // KO-REVIEW

    "daily.title": "Daily CV Tracking by JD",
    "daily.eyebrow": "일자별 CV 유입 · 원본 CV에서 계산", // KO-REVIEW
    "daily.panel.title": "일자별 CV · JD별", // KO-REVIEW
    "daily.panel.sub": "누적 합계 = 종료일까지 CV · 각 열 = 해당 일자 CV · 최대 30일", // KO-REVIEW
    "daily.clamped": "— 30일로 제한됨", // KO-REVIEW
    "daily.col.cumTotal": "누적 합계", // KO-REVIEW
    "daily.col.source": "Source",
    "daily.collapse": "접기", // KO-REVIEW
    "daily.foot": "종료일까지 CV가 있는 JD. 원본 CV(Candidate Data)에서 Apps Script JD DAILY와 동일 로직으로 계산.", // KO-REVIEW

    "source.title": "Source Analysis",
    "source.eyebrow": "CV 유입 출처 · Paid vs Free · 그룹 & 소스별", // KO-REVIEW
    "source.kpi.totalCv": "총 CV", // KO-REVIEW
    "source.kpi.paid": "CV Paid",
    "source.kpi.free": "CV Free",
    "source.kpi.costPerCvPaid": "Paid Cost/CV", // KO-REVIEW
    "source.kpi.ofTotal": "총 CV 대비", // KO-REVIEW
    "source.kpi.freeIsFree": "무료", // KO-REVIEW
    "source.kpi.paidCostDivCv": "유료 비용 ÷ 유료 CV", // KO-REVIEW
    "source.metaNote": "여기서 Meta는 landing-page_meta 소스로 집계하며, Paid channel 탭의 “플랫폼 리드”와 다릅니다.", // KO-REVIEW
    "source.chart.splitTitle": "Paid vs Free",
    "source.chart.splitSub": "소스 유형별 CV 비중", // KO-REVIEW
    "source.chart.topTitle": "CV 상위 소스", // KO-REVIEW
    "source.chart.topSub": "상위 ~10 소스(라벨 기준) · 분홍 = paid, 초록 = free", // KO-REVIEW
    "source.tbl.title": "3단계 상세: Paid/Free › 그룹 › 소스", // KO-REVIEW
    "source.tbl.sub": "클릭하여 펼치기/접기. CV는 Candidate Data 소스 기준 · 비용은 all-time.", // KO-REVIEW
    "source.col.name": "소스", // KO-REVIEW
    "source.col.cv": "CV",
    "source.col.pct": "% 총합", // KO-REVIEW
    "source.col.cost": "비용", // KO-REVIEW
    "source.col.costcv": "Cost/CV",
    "source.paid": "Paid",
    "source.free": "Free",
    "source.free.cost": "무료", // KO-REVIEW
    "source.costNote": "유료 비용은 all-time 기준(정확한 일자 절단이 어려움). 기간 선택 시 CV는 제출일로 필터되지만 비용 & cost/CV는 all-time으로 계산.", // KO-REVIEW
    "source.rangeNote": "비우면 전체 기간 · 날짜 선택 시 제출일이 범위 내인 CV만 집계.", // KO-REVIEW
  },
};

export function t(lang: Lang, key: string): string {
  return DICT[lang][key] ?? DICT.vi[key] ?? key;
}

// "+N nguồn" / "+N sources"
export const moreSources = (lang: Lang, n: number) => (lang === "vi" ? `+${n} nguồn` : `+${n} 소스`); // KO-REVIEW
