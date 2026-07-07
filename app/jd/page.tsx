import { getDataset } from "@/lib/sheets";
import { jdMetrics, monthOverMonth, fmtVnd, fmtKrw, fmtInt } from "@/lib/metrics";
import { KpiCard } from "@/components/KpiCard";
import { Header } from "@/components/Header";
import { PopularityBar, ValueBadge } from "@/components/Bits";
import { IconUsers, IconGauge, IconTag, IconJd } from "@/components/Icons";

export const revalidate = 600;

export default async function JdPage() {
  const d = await getDataset();
  const jds = jdMetrics(d);
  const mom = monthOverMonth(d);
  const totalCvs = jds.reduce((a, r) => a + r.totalCvs, 0);
  const totalPaid = jds.reduce((a, r) => a + r.cvPaid, 0);
  const totalFree = jds.reduce((a, r) => a + r.cvFree, 0);
  const totalVnd = jds.reduce((a, r) => a + r.totalVnd, 0);
  const blended = totalCvs > 0 ? totalVnd / totalCvs : 0;
  const maxCvs = jds.reduce((m, j) => Math.max(m, j.totalCvs), 0) || 1;

  return (
    <>
      <Header source={d.source} title="CV theo JD" eyebrow="Chi phí & cost/CV cho từng job" />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard tone="blue" icon={<IconUsers />} label="Tổng CV" value={fmtInt(totalCvs)} delta={mom.cvs} />
        <KpiCard tone="pink" icon={<IconJd />} label="CV paid" value={fmtInt(totalPaid)} />
        <KpiCard tone="green" icon={<IconGauge />} label="CV free" value={fmtInt(totalFree)} />
        <KpiCard tone="orange" icon={<IconTag />} label="Cost / CV (blended)" value={fmtVnd(blended)} />
      </section>

      <div className="card overflow-hidden">
        <div className="px-6 pt-6">
          <h2 className="font-display text-lg font-bold text-ink">Chi tiết từng JD</h2>
          <p className="mt-0.5 text-xs text-muted">Tiền = job-slot theo Job code + Meta chia đều · CV từ JD DAILY</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                <th className="w-8 px-6 py-2">#</th>
                <th className="px-3 py-2">JD</th>
                <th className="px-3 py-2 w-[26%]">Lượng CV</th>
                <th className="px-3 py-2 text-right">Paid</th>
                <th className="px-3 py-2 text-right">Free</th>
                <th className="px-3 py-2 text-right">Job-slot</th>
                <th className="px-3 py-2 text-right">Meta</th>
                <th className="px-6 py-2 text-right">Cost/CV</th>
              </tr>
            </thead>
            <tbody>
              {jds.map((j, i) => (
                <tr key={j.jdCode} className="border-t border-black/[0.05] hover:bg-black/[0.015]">
                  <td className="px-6 py-3.5 text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-3 py-3.5">
                    <div className="font-semibold text-ink">{j.jdCode}</div>
                    <div className="text-[11px] text-muted">{j.company} · {j.title}</div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <PopularityBar value={j.totalCvs / maxCvs} color={j.cvPaid >= j.cvFree ? "#ec2c69" : "#2f6bff"} />
                      <span className="w-10 shrink-0 text-right font-semibold tabular-nums text-ink">{fmtInt(j.totalCvs)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-muted">{fmtInt(j.cvPaid)}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-free">{fmtInt(j.cvFree)}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-muted">{j.jobSlotVnd > 0 ? fmtVnd(j.jobSlotVnd) : "—"}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-muted">{j.metaKRW > 0 ? fmtKrw(j.metaKRW) : "—"}</td>
                  <td className="px-6 py-3.5 text-right">
                    {j.costPerCvVnd ? (
                      <ValueBadge tone="pink">{fmtVnd(j.costPerCvVnd)}</ValueBadge>
                    ) : j.cvPaid > 0 ? (
                      <ValueBadge tone="warn">đang cập nhật giá</ValueBadge>
                    ) : (
                      <ValueBadge tone="green">miễn phí</ValueBadge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-1 px-1 text-xs text-muted">
        <p>Cost/CV = (job-slot theo Job code + phần Meta chia đều, quy đổi VND) ÷ tổng CV của JD.</p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <ValueBadge tone="green">miễn phí</ValueBadge> chỉ có CV từ kênh không tốn phí ·
          <ValueBadge tone="warn">đang cập nhật giá</ValueBadge> có CV kênh trả phí (Meta/LinkedIn/ITviec/TopDev) nhưng chưa nhập giá vào sheet Marketing.
        </p>
      </div>
    </>
  );
}
