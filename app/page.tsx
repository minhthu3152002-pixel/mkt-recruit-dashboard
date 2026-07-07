import { getDataset } from "@/lib/sheets";
import { paidChannelSummary } from "@/lib/metrics";
import { classifySource } from "@/lib/sources";
import { getLang } from "@/lib/lang";
import { t, formatMoney, formatInt, moneyLabel, rateNote } from "@/lib/i18n";
import { KpiCard } from "@/components/KpiCard";
import { Header } from "@/components/Header";
import { ChannelCostCombo } from "@/components/Charts";
import { RangePanel } from "@/components/RangePanel";
import { Dot, ChartCard } from "@/components/Bits";
import { chColor } from "@/components/theme";
import { IconCoin, IconUsers, IconTag, IconJd } from "@/components/Icons";

export const revalidate = 600;

export default async function PaidChannelPage() {
  const lang = getLang();
  const d = await getDataset();
  const rows = paidChannelSummary(d);
  const totalSpendVnd = rows.reduce((a, r) => a + r.spendVnd, 0);
  const totalCvs = rows.reduce((a, r) => a + r.cvs, 0);
  const blended = totalCvs > 0 ? totalSpendVnd / totalCvs : 0;
  const comboData = rows.map((r) => ({ label: r.label, chiphi: r.spendVnd, costcv: r.costPerCvVnd ?? 0 }));
  // Số JD chạy paid (toàn thời gian) = JD distinct có ≥1 CV kênh trả phí.
  const paidJdAll = new Set(d.cvs.filter((c) => classifySource(c.source) !== "free").map((c) => c.jdCode)).size;

  // Dữ liệu gọn cho khu vực chọn-range (tính lại ở client khi đổi ngày).
  const metaLite = d.meta.map((m) => ({ date: m.date, spend: m.spend, leads: m.leads }));
  const cvLite = d.cvs.filter((c) => c.date).map((c) => ({ date: c.date, ch: classifySource(c.source), jd: c.jdCode }));
  const vnNow = new Date(Date.now() + 7 * 3600 * 1000); // giờ VN (UTC+7)
  const defTo = vnNow.toISOString().slice(0, 10);
  const defFrom = `${vnNow.getUTCFullYear()}-${String(vnNow.getUTCMonth() + 1).padStart(2, "0")}-01`;

  return (
    <>
      <Header source={d.source} lang={lang} title={t(lang, "paid.title")} eyebrow="Meta · LinkedIn · ITviec · TopDev" />

      {/* ===== KHUNG OVERVIEW — toàn bộ thời gian ===== */}
      <section className="card space-y-5 p-5 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">{t(lang, "paid.overview")}</h2>
          <p className="text-xs text-muted">{t(lang, "paid.overviewSub")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard surface tone="pink" icon={<IconCoin />} label={`${t(lang, "paid.kpi.totalCost")} (${moneyLabel(lang)})`} value={formatMoney(totalSpendVnd, "VND", lang)} sub={rateNote(lang)} />
          <KpiCard surface tone="blue" icon={<IconUsers />} label={t(lang, "paid.kpi.cvPaid")} value={formatInt(totalCvs, lang)} sub={t(lang, "paid.kpi.bySource")} />
          <KpiCard surface tone="orange" icon={<IconTag />} label={t(lang, "paid.kpi.costPerCv")} value={formatMoney(blended, "VND", lang)} sub={t(lang, "paid.kpi.costDivCv")} />
          <KpiCard surface tone="green" icon={<IconJd />} label={t(lang, "paid.kpi.paidJd")} value={formatInt(paidJdAll, lang)} sub={t(lang, "paid.kpi.jdHasPaid")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.channel} className="rounded-2xl bg-canvas p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                  <Dot color={chColor(r.channel)} /> {r.label}
                </span>
                <span className="pill bg-black/[0.05] text-muted">{r.jobs != null ? `${r.jobs} ${t(lang, "paid.ch.jobPost")}` : t(lang, "paid.ch.ads")}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <Metric label={t(lang, "paid.ch.chiphi")} value={formatMoney(r.spend, r.ccy, lang)} sub={metaSub(r.channel, r.spend, r.ccy, lang)} />
                <Metric label={t(lang, "paid.ch.cv")} value={formatInt(r.cvs, lang)} />
                <Metric label={t(lang, "paid.ch.costcv")} value={r.costPerCvVnd ? formatMoney(r.costPerCvVnd, "VND", lang) : "—"} />
              </div>
              {r.channel === "meta" && <p className="mt-3 text-[11px] text-muted">{t(lang, "paid.ch.metaNote")}</p>}
            </div>
          ))}
        </div>

        <ChartCard title={t(lang, "paid.chart.title")} subtitle={t(lang, "paid.chart.sub")}>
          <ChannelCostCombo data={comboData} height={260} lang={lang} />
        </ChartCard>
      </section>

      {/* ===== KHUNG THEO KHOẢNG NGÀY ===== */}
      <RangePanel lang={lang} jobSlots={d.jobSlots} meta={metaLite} cvs={cvLite} defaultFrom={defFrom} defaultTo={defTo} />
    </>
  );
}

// Meta được bill bằng KRW. Hiển thị thêm dòng đối chiếu đồng tiền còn lại.
function metaSub(channel: string, spend: number, ccy: "KRW" | "VND", lang: "vi" | "ko") {
  if (channel !== "meta") return undefined;
  return lang === "vi" ? `= ${formatMoney(spend, ccy, "ko")}` : `≈ ${formatMoney(spend, ccy, "vi")}`;
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 font-semibold tabular-nums text-ink">{value}</div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </div>
  );
}
