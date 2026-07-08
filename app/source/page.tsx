import { getDataset } from "@/lib/sheets";
import { toVnd } from "@/lib/metrics";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { SourcePanel } from "@/components/SourcePanel";

export const revalidate = 600;

export default async function SourcePage() {
  const lang = getLang();
  const d = await getDataset();

  // CV thô (ngày nộp + source) — đếm ở client theo range.
  const cvs = d.cvs.map((c) => ({ d: c.date || "", s: c.source }));

  // Chi phí paid all-time theo "cost channel" (Meta quy đổi VND; job-board đã VND).
  const metaKRW = d.meta.reduce((a, r) => a + r.spend, 0);
  const slotSum = (ch: "itviec" | "linkedin" | "topdev") =>
    d.jobSlots.filter((s) => s.channel === ch).reduce((a, s) => a + s.cost, 0);
  const paidCost = { meta: toVnd(metaKRW), itviec: slotSum("itviec"), linkedin: slotSum("linkedin"), topdev: slotSum("topdev") };

  return (
    <>
      <Header source={d.source} lang={lang} title={t(lang, "source.title")} eyebrow={t(lang, "source.eyebrow")} />
      <SourcePanel lang={lang} cvs={cvs} paidCost={paidCost} />
    </>
  );
}
