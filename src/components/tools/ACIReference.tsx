// src/components/tools/ACIReference.tsx
import { useState, useMemo } from "react";

// ── Data ──────────────────────────────────────────────────────

const BARS = [
  { no: 3,  dia: 0.375, area: 0.110, wt: 0.376,  bendStd: 1.125, bendTie: 0.750  },
  { no: 4,  dia: 0.500, area: 0.200, wt: 0.668,  bendStd: 1.500, bendTie: 1.000  },
  { no: 5,  dia: 0.625, area: 0.310, wt: 1.043,  bendStd: 1.875, bendTie: 1.250  },
  { no: 6,  dia: 0.750, area: 0.440, wt: 1.502,  bendStd: 2.250, bendTie: 2.250  },
  { no: 7,  dia: 0.875, area: 0.600, wt: 2.044,  bendStd: 2.625, bendTie: 2.625  },
  { no: 8,  dia: 1.000, area: 0.790, wt: 2.670,  bendStd: 3.000, bendTie: 3.000  },
  { no: 9,  dia: 1.128, area: 1.000, wt: 3.400,  bendStd: 4.512, bendTie: null   },
  { no: 10, dia: 1.270, area: 1.270, wt: 4.303,  bendStd: 5.080, bendTie: null   },
  { no: 11, dia: 1.410, area: 1.560, wt: 5.313,  bendStd: 5.640, bendTie: null   },
  { no: 14, dia: 1.693, area: 2.250, wt: 7.650,  bendStd: 8.465, bendTie: null   },
  { no: 18, dia: 2.257, area: 4.000, wt: 13.600, bendStd: 11.285, bendTie: null  },
];

const SPACINGS = [4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10,10.5,11,11.5,12,12.5,13,13.5,14,14.5,15,15.5,16,16.5,17,17.5,18];

function areaPerFt(barArea: number, spacing: number) {
  return (barArea * 12) / spacing;
}

// ── Concrete section ─────────────────────────────────────────

function ConcreteSection() {
  const [fc, setFc] = useState(4000);
  const [wc, setWc] = useState(145);
  const isNormalweight = wc >= 140;

  const Ec = isNormalweight
    ? Math.round(57000 * Math.sqrt(fc))
    : Math.round(33 * Math.pow(wc, 1.5) * Math.sqrt(fc));

  const fr = +(7.5 * Math.sqrt(fc) / 1000).toFixed(3);
  const lambda = isNormalweight ? 1.0 : 0.75;

  const inputCls = "w-full rounded-md border border-input bg-background px-3 py-1.5.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "text-xm font-medium text-muted-foreground uppercase tracking-wider mb-1 block";

  return (
    <div className="rounded-xl border bg-card p-6 flex flex-col gap-5">
      <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
        Concrete Properties — ACI 318-14
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>f′c (psi)</label>
          <input type="number" min={2000} max={12000} step={500} className={inputCls}
            value={fc} onChange={e => setFc(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>wc (pcf)</label>
          <input type="number" min={90} max={160} step={1} className={inputCls}
            value={wc} onChange={e => setWc(Number(e.target.value))} />
          <p className="text-[11px] text-muted-foreground mt-1">
            {isNormalweight ? "Normalweight (≥ 140 pcf)" : "Lightweight (90–115 pcf)"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Ec", value: `${Ec.toLocaleString()}`, unit: "psi", ref: "19.2.2.1" },
          { label: "fr", value: fr.toFixed(3), unit: "ksi", ref: "19.2.3.1" },
          { label: "λ", value: lambda.toFixed(2), unit: "", ref: "19.2.4" },
        ].map(({ label, value, unit, ref }) => (
          <div key={label} className="rounded-xl border bg-muted/30 p-4 text-center">
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
              {label} <span className="text-[10px]">§{ref}</span>
            </p>
            <p className="text-xl font-black tabular-nums">{value}</p>
            {unit && <p className="text-sm text-muted-foreground font-mono">{unit}</p>}
          </div>
        ))}
      </div>

      <div className="text-[11px] text-muted-foreground font-mono border-l-2 border-border pl-3 space-y-1">
        {isNormalweight
          ? <p>Ec = 57,000√f′c (ACI 318-14 §19.2.2.1b, normalweight)</p>
          : <p>Ec = 33·wc^1.5·√f′c (ACI 318-14 §19.2.2.1a, lightweight)</p>}
        <p>fr = 7.5λ√f′c (ACI 318-14 §19.2.3.1)</p>
      </div>
    </div>
  );
}

// ── Bar table section ─────────────────────────────────────────

function BarTable() {
  return (
    <div className="rounded-xl border bg-card p-6 flex flex-col gap-4">
      <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
        ASTM Standard Reinforcing Bars
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 text-muted-foreground font-medium" rowSpan={2}>Bar</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium" rowSpan={2}>dia (in)</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium" rowSpan={2}>Area (in²)</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium" rowSpan={2}>Wt (lb/ft)</th>
              <th className="text-center py-1.5 px-2 text-muted-foreground font-medium border-b-0 border-l" colSpan={2}>Std Bend — inside r</th>
              <th className="text-center py-1.5 px-2 text-muted-foreground font-medium border-l" colSpan={2}>Tie Bend — inside r</th>
            </tr>
            <tr className="border-b">
              <th className="text-right py-1.5 px-2 text-muted-foreground font-medium border-l">in</th>
              <th className="text-right py-1.5 px-2 text-muted-foreground font-medium">out in</th>
              <th className="text-right py-1.5 px-2 text-muted-foreground font-medium border-l">in</th>
              <th className="text-right py-1.5 px-2 text-muted-foreground font-medium">out in</th>
            </tr>
          </thead>
          <tbody>
            {BARS.map((b, i) => (
              <tr key={b.no} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                <td className="py-1.5.5 px-2 font-bold text-foreground">#{b.no}</td>
                <td className="py-1.5.5 px-2 text-right">{b.dia.toFixed(3)}</td>
                <td className="py-1.5.5 px-2 text-right">{b.area.toFixed(3)}</td>
                <td className="py-1.5.5 px-2 text-right">{b.wt.toFixed(3)}</td>
                <td className="py-1.5.5 px-2 text-right border-l">{b.bendStd.toFixed(3)}</td>
                <td className="py-1.5.5 px-2 text-right">{(b.bendStd + b.dia).toFixed(3)}</td>
                <td className="py-1.5.5 px-2 text-right border-l">{b.bendTie ? b.bendTie.toFixed(3) : "—"}</td>
                <td className="py-1.5.5 px-2 text-right">{b.bendTie ? (b.bendTie + b.dia).toFixed(3) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Spacing calculator section ────────────────────────────────

function SpacingTable() {
  const [targetAs, setTargetAs] = useState(0.62);
  const [highlightBar, setHighlightBar] = useState<number | null>(null);

  const inputCls = "rounded-md border border-input bg-background px-3 py-1.5.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring w-40";

  const cellBg = (as: number) => {
  const ratio = as / targetAs;
  if (ratio < 1)   return "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300";
  if (ratio < 1.5) return "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 font-semibold";
  if (ratio < 2.0) return "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300";
  return "text-muted-foreground/50";
};

  // Only show bars #3–#11 in main table (common range)
  const displayBars = BARS.filter(b => b.no <= 11);

  return (
    <div className="rounded-xl border bg-card p-6 flex flex-col gap-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
          As per ft — Spacing Table (in²/ft)
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
            Target As (in²/ft)
          </label>
          <input type="number" min={0.1} max={6} step={0.01} className={inputCls}
            value={targetAs} onChange={e => setTargetAs(Number(e.target.value))} />
        </div>
      </div>

      <div className="flex gap-4 text-[11px] font-mono flex-wrap">
        <span className="text-red-500">■ insufficient</span>
        <span className="text-foreground font-semibold">■ ok (ratio &lt; 1.5×)</span>
        <span className="text-muted-foreground">■ ok (ratio &lt; 2.0×)</span>
        <span className="text-muted-foreground/40">■ excessive</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 text-muted-foreground font-medium">s (in)</th>
              {displayBars.map(b => (
                <th
                  key={b.no}
                  className={`text-right py-2 px-2 font-medium cursor-pointer transition-colors ${highlightBar === b.no ? "text-primary" : "text-muted-foreground"}`}
                  onClick={() => setHighlightBar(highlightBar === b.no ? null : b.no)}
                >
                  #{b.no}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPACINGS.map((s, i) => (
              <tr key={s} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                <td className="py-1.5 px-2 text-muted-foreground">{s.toFixed(1)}</td>
                {displayBars.map(b => {
                  const as = areaPerFt(b.area, s);
                  const isHighlighted = highlightBar === b.no;
                  return (
                    <td
                    key={b.no}
                    className={`py-1.5.5 px-3 text-right tabular-nums text-sm transition-colors rounded-sm ${cellBg(as)} ${isHighlighted ? "ring-1 ring-primary" : ""}`}
                    >
                    {as.toFixed(3)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground font-mono border-l-2 border-border pl-3">
        As = (bar area × 12) / spacing. Click a bar header to highlight that column.
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function ACIReference() {
  return (
    <div className="flex flex-col gap-8">
      <ConcreteSection />
      <BarTable />
      <SpacingTable />
    </div>
  );
}