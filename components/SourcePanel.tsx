"use client";
import { Fragment, useMemo, useState } from "react";
import { sourceMeta, PAID_LABEL_TO_COST_CHANNEL, type ChannelType } from "@/lib/sources";
import { t, formatMoney, formatInt } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { KpiCard } from "@/components/KpiCard";
import { ChartCard } from "@/components/Bits";
import { PaidFreeDonut, SourceTopBar } from "@/components/Charts";
import { IconUsers, IconJd, IconGauge, IconTag } from "@/components/Icons";

type Cv = { d: string; s: string };
type PaidCost = { meta: number; itviec: number; linkedin: number; topdev: number };

type Leaf = { label: string; cv: number; raws: { raw: string; n: number }[]; cost: number | null };
type Group = { group: string; cv: number; cost: number | null; leaves: Leaf[] };
type Tier = { type: ChannelType; cv: number; cost: number | null; groups: Group[] };

export function SourcePanel({ lang, cvs, paidCost }: { lang: Lang; cvs: Cv[]; paidCost: PaidCost }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openTier, setOpenTier] = useState<Set<string>>(new Set(["paid", "free"]));
  const [openGroup, setOpenGroup] = useState<Set<string>>(new Set());

  const costOfLabel = (label: string): number | null => {
    const ch = PAID_LABEL_TO_COST_CHANNEL[label];
    return ch ? paidCost[ch] : null;
  };

  const { tiers, total, paidCv, freeCv, totalPaidCost, top } = useMemo(() => {
    // Lọc theo range: trống = all-time; có ràng buộc thì chỉ CV có ngày nộp trong khoảng.
    const inRange = (d: string) => {
      if (!from && !to) return true;
      if (!d) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    };
    // Gom: type -> group -> label -> {cv, raws}
    const acc = new Map<ChannelType, Map<string, Map<string, { cv: number; raws: Map<string, number> }>>>();
    let total = 0;
    for (const c of cvs) {
      if (!inRange(c.d)) continue;
      const m = sourceMeta(c.s);
      total++;
      let g = acc.get(m.channelType);
      if (!g) { g = new Map(); acc.set(m.channelType, g); }
      let l = g.get(m.group);
      if (!l) { l = new Map(); g.set(m.group, l); }
      let leaf = l.get(m.label);
      if (!leaf) { leaf = { cv: 0, raws: new Map() }; l.set(m.label, leaf); }
      leaf.cv++;
      leaf.raws.set(c.s, (leaf.raws.get(c.s) ?? 0) + 1);
    }

    const tiers: Tier[] = [];
    for (const type of ["paid", "free"] as ChannelType[]) {
      const g = acc.get(type);
      if (!g) continue;
      const groups: Group[] = [];
      for (const [group, leavesMap] of g) {
        const leaves: Leaf[] = [];
        for (const [label, v] of leavesMap) {
          const raws = [...v.raws.entries()].map(([raw, n]) => ({ raw, n })).sort((a, b) => b.n - a.n);
          leaves.push({ label, cv: v.cv, raws, cost: type === "paid" ? costOfLabel(label) : null });
        }
        leaves.sort((a, b) => b.cv - a.cv);
        const gcv = leaves.reduce((a, x) => a + x.cv, 0);
        const gcost = type === "paid" ? leaves.reduce((a, x) => a + (x.cost ?? 0), 0) : null;
        groups.push({ group, cv: gcv, cost: gcost, leaves });
      }
      groups.sort((a, b) => b.cv - a.cv);
      const tcv = groups.reduce((a, x) => a + x.cv, 0);
      const tcost = type === "paid" ? groups.reduce((a, x) => a + (x.cost ?? 0), 0) : null;
      tiers.push({ type, cv: tcv, cost: tcost, groups });
    }

    const paidCv = tiers.find((x) => x.type === "paid")?.cv ?? 0;
    const freeCv = tiers.find((x) => x.type === "free")?.cv ?? 0;
    const totalPaidCost = paidCost.meta + paidCost.itviec + paidCost.linkedin + paidCost.topdev;

    // Top ~10 nguồn (theo label) toàn bộ tier.
    const flat: { label: string; cv: number; paid: boolean }[] = [];
    for (const ti of tiers) for (const gr of ti.groups) for (const lf of gr.leaves) flat.push({ label: lf.label, cv: lf.cv, paid: ti.type === "paid" });
    flat.sort((a, b) => b.cv - a.cv);
    const top = flat.slice(0, 10);

    return { tiers, total, paidCv, freeCv, totalPaidCost, top };
  }, [cvs, from, to, paidCost]);

  const pct = (v: number) => (total > 0 ? ((v / total) * 100).toFixed(1) + "%" : "—");
  const costPerCvPaid = paidCv > 0 ? totalPaidCost / paidCv : null;

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, key: string) => {
    const n = new Set(set); n.has(key) ? n.delete(key) : n.add(key); setter(n);
  };

  const inputCls =
    "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/20";
  const Caret = ({ open }: { open: boolean }) => (
    <span className={`inline-block w-3 text-[10px] text-muted transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
  );

  return (
    <>
      {/* Range ngày */}
      <section className="card flex flex-wrap items-end justify-between gap-4 p-5">
        <p className="max-w-xl text-xs text-muted">{t(lang, "source.rangeNote")}</p>
        <div className="flex items-end gap-3">
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t(lang, "common.from")}
            <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t(lang, "common.to")}
            <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </label>
          {(from || to) && (
            <button onClick={() => { setFrom(""); setTo(""); }} className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-muted transition hover:bg-black/[0.04] hover:text-ink">
              all-time
            </button>
          )}
        </div>
      </section>

      {/* Thẻ tổng */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard tone="blue" icon={<IconUsers />} label={t(lang, "source.kpi.totalCv")} value={formatInt(total, lang)} />
        <KpiCard tone="pink" icon={<IconJd />} label={t(lang, "source.kpi.paid")} value={formatInt(paidCv, lang)} sub={`${pct(paidCv)} ${t(lang, "source.kpi.ofTotal")}`} />
        <KpiCard tone="green" icon={<IconGauge />} label={t(lang, "source.kpi.free")} value={formatInt(freeCv, lang)} sub={`${pct(freeCv)} ${t(lang, "source.kpi.ofTotal")}`} />
        <KpiCard tone="orange" icon={<IconTag />} label={t(lang, "source.kpi.costPerCvPaid")} value={costPerCvPaid != null ? formatMoney(costPerCvPaid, "VND", lang) : "—"} sub={t(lang, "source.kpi.paidCostDivCv")} />
      </section>

      <p className="px-1 text-[11px] text-muted">{t(lang, "source.metaNote")}</p>

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={t(lang, "source.chart.splitTitle")} subtitle={t(lang, "source.chart.splitSub")}>
          <PaidFreeDonut paid={paidCv} free={freeCv} lang={lang} />
        </ChartCard>
        <ChartCard title={t(lang, "source.chart.topTitle")} subtitle={t(lang, "source.chart.topSub")}>
          <SourceTopBar data={top} lang={lang} />
        </ChartCard>
      </section>

      {/* Bảng 3 tầng */}
      <div className="card overflow-hidden">
        <div className="px-6 pt-6">
          <h2 className="font-display text-lg font-bold text-ink">{t(lang, "source.tbl.title")}</h2>
          <p className="mt-0.5 text-xs text-muted">{t(lang, "source.tbl.sub")}</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                <th className="px-6 py-2">{t(lang, "source.col.name")}</th>
                <th className="px-3 py-2 text-right">{t(lang, "source.col.cv")}</th>
                <th className="px-3 py-2 text-right">{t(lang, "source.col.pct")}</th>
                <th className="px-3 py-2 text-right">{t(lang, "source.col.cost")}</th>
                <th className="px-6 py-2 text-right">{t(lang, "source.col.costcv")}</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((ti) => {
                const tierOpen = openTier.has(ti.type);
                const isPaid = ti.type === "paid";
                const tierCostcv = isPaid && ti.cv > 0 && ti.cost != null ? ti.cost / ti.cv : null;
                return (
                  <Fragment key={ti.type}>
                    {/* Tier */}
                    <tr className="border-t border-black/[0.06] bg-black/[0.015] font-bold">
                      <td className="px-6 py-3">
                        <button onClick={() => toggle(openTier, setOpenTier, ti.type)} className="flex items-center gap-2 text-ink">
                          <Caret open={tierOpen} />
                          <span className={`h-2.5 w-2.5 rounded-full ${isPaid ? "bg-pink" : "bg-free"}`} />
                          {t(lang, isPaid ? "source.paid" : "source.free")}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink">{formatInt(ti.cv, lang)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted">{pct(ti.cv)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink">{isPaid && ti.cost != null ? formatMoney(ti.cost, "VND", lang) : t(lang, "source.free.cost")}</td>
                      <td className="px-6 py-3 text-right tabular-nums text-ink">{tierCostcv != null ? formatMoney(tierCostcv, "VND", lang) : (isPaid ? "—" : t(lang, "source.free.cost"))}</td>
                    </tr>
                    {/* Groups */}
                    {tierOpen && ti.groups.map((gr) => {
                      const gkey = `${ti.type}|${gr.group}`;
                      const gOpen = openGroup.has(gkey);
                      const gCostcv = isPaid && gr.cv > 0 && gr.cost != null ? gr.cost / gr.cv : null;
                      return (
                        <Fragment key={gkey}>
                          <tr className="border-t border-black/[0.04]">
                            <td className="px-6 py-2.5">
                              <button onClick={() => toggle(openGroup, setOpenGroup, gkey)} className="flex items-center gap-2 pl-5 font-semibold text-ink">
                                <Caret open={gOpen} />{gr.group}
                              </button>
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-ink">{formatInt(gr.cv, lang)}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-muted">{pct(gr.cv)}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-muted">{isPaid && gr.cost != null ? formatMoney(gr.cost, "VND", lang) : "—"}</td>
                            <td className="px-6 py-2.5 text-right tabular-nums text-muted">{gCostcv != null ? formatMoney(gCostcv, "VND", lang) : "—"}</td>
                          </tr>
                          {/* Leaves */}
                          {gOpen && gr.leaves.map((lf) => {
                            const lCostcv = isPaid && lf.cv > 0 && lf.cost != null ? lf.cost / lf.cv : null;
                            return (
                              <tr key={lf.label} className="border-t border-black/[0.03] hover:bg-black/[0.015]">
                                <td className="px-6 py-2.5">
                                  <div className="pl-12">
                                    <div className="font-medium text-ink">{lf.label}</div>
                                    <div className="truncate text-[10px] text-muted/70" title={lf.raws.map((r) => `${r.raw} (${r.n})`).join(", ")}>
                                      {lf.raws.map((r) => r.raw).join(" · ")}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-right tabular-nums text-ink">{formatInt(lf.cv, lang)}</td>
                                <td className="px-3 py-2.5 text-right tabular-nums text-muted">{pct(lf.cv)}</td>
                                <td className="px-3 py-2.5 text-right tabular-nums text-muted">{isPaid && lf.cost != null ? formatMoney(lf.cost, "VND", lang) : "—"}</td>
                                <td className="px-6 py-2.5 text-right tabular-nums text-muted">{lCostcv != null ? formatMoney(lCostcv, "VND", lang) : "—"}</td>
                              </tr>
                            );
                          })}
                        </Fragment>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="px-1 text-[11px] leading-relaxed text-muted">{t(lang, "source.costNote")}</p>
    </>
  );
}
