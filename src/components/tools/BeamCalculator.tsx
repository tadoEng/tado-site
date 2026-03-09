// src/components/tools/BeamCalculator.tsx
// ─────────────────────────────────────────────────────────────
// React island. Pure HTML inputs — no Starwind here (Starwind
// is .astro only; React islands use plain Tailwind).
//
// Physics: Euler-Bernoulli beam theory
//   Simply supported:  δ_max = 5wL⁴/384EI  (UDL)
//                      δ_max = PL³/48EI     (point load @ centre)
//   Cantilever:        δ_max = wL⁴/8EI      (UDL)
//                      δ_max = PL³/3EI      (point load @ tip)
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";

type BeamType = "simply-supported" | "cantilever" | "fixed-fixed";
type LoadType = "udl" | "point-centre" | "point-end";

interface Inputs {
  beamType: BeamType;
  loadType: LoadType;
  span: number;       // metres
  load: number;       // kN (total UDL) or kN (point)
  E: number;          // GPa
  I: number;          // cm⁴
}

interface Results {
  maxMoment: number;   // kNm
  maxShear: number;    // kN
  maxDeflection: number; // mm
  momentDiagram: { x: number; m: number }[];
  shearDiagram:  { x: number; v: number }[];
  deflectionDiagram: { x: number; d: number }[];
}

const STEPS = 80;

function compute(inp: Inputs): Results {
  const { beamType, loadType, span: L, load: q, E, I } = inp;

  // Convert units: E GPa → kN/m², I cm⁴ → m⁴
  const EI = (E * 1e6) * (I * 1e-8); // kN·m²

  const points = Array.from({ length: STEPS + 1 }, (_, i) => (i / STEPS) * L);

  let momentDiagram: { x: number; m: number }[] = [];
  let shearDiagram:  { x: number; v: number }[] = [];
  let deflectionDiagram: { x: number; d: number }[] = [];
  let maxMoment = 0;
  let maxShear = 0;
  let maxDeflection = 0;

  if (beamType === "simply-supported") {
    if (loadType === "udl") {
      // w = q/L (kN/m)
      const w = q / L;
      const R = (w * L) / 2;
      momentDiagram = points.map((x) => ({ x, m: R * x - (w * x * x) / 2 }));
      shearDiagram  = points.map((x) => ({ x, v: R - w * x }));
      deflectionDiagram = points.map((x) => ({
        x,
        d: ((w * x) / (24 * EI)) * (L ** 3 - 2 * L * x ** 2 + x ** 3) * 1000,
      }));
      maxMoment = (w * L * L) / 8;
      maxShear  = R;
      maxDeflection = (5 * w * L ** 4) / (384 * EI) * 1000;
    } else if (loadType === "point-centre") {
      const P = q;
      const R = P / 2;
      momentDiagram = points.map((x) => ({
        x,
        m: x <= L / 2 ? R * x : R * x - P * (x - L / 2),
      }));
      shearDiagram = points.map((x) => ({
        x,
        v: x < L / 2 ? R : x === L / 2 ? 0 : -R,
      }));
      deflectionDiagram = points.map((x) => ({
        x,
        d: x <= L / 2
          ? ((P * x) / (48 * EI)) * (3 * L ** 2 - 4 * x ** 2) * 1000
          : ((P * (L - x)) / (48 * EI)) * (3 * L ** 2 - 4 * (L - x) ** 2) * 1000,
      }));
      maxMoment = (P * L) / 4;
      maxShear  = R;
      maxDeflection = (P * L ** 3) / (48 * EI) * 1000;
    }
  } else if (beamType === "cantilever") {
    if (loadType === "udl") {
      const w = q / L;
      momentDiagram = points.map((x) => ({ x, m: -(w * (L - x) ** 2) / 2 }));
      shearDiagram  = points.map((x) => ({ x, v: w * (L - x) }));
      deflectionDiagram = points.map((x) => ({
        x,
        d: ((w * x * x) / (24 * EI)) * (6 * L ** 2 - 4 * L * x + x ** 2) * 1000,
      }));
      maxMoment = (w * L * L) / 2;
      maxShear  = w * L;
      maxDeflection = (w * L ** 4) / (8 * EI) * 1000;
    } else if (loadType === "point-end") {
      const P = q;
      momentDiagram = points.map((x) => ({ x, m: -P * (L - x) }));
      shearDiagram  = points.map((x) => ({ x, v: P }));
      deflectionDiagram = points.map((x) => ({
        x,
        d: ((P * x * x) / (6 * EI)) * (3 * L - x) * 1000,
      }));
      maxMoment = P * L;
      maxShear  = P;
      maxDeflection = (P * L ** 3) / (3 * EI) * 1000;
    }
  }

  return { maxMoment, maxShear, maxDeflection, momentDiagram, shearDiagram, deflectionDiagram };
}

// Simple SVG mini-chart (no D3 dependency for now)
function MiniChart({ data, yKey, color, label }: {
  data: { x: number; [k: string]: number }[];
  yKey: string;
  color: string;
  label: string;
}) {
  const values = data.map((d) => d[yKey]);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const W = 300;
  const H = 100;
  const pad = 8;

  const pts = data
    .map((d, i) => {
      const px = pad + ((i / (data.length - 1)) * (W - 2 * pad));
      const py = H - pad - ((d[yKey] - minV) / range) * (H - 2 * pad);
      return `${px},${py}`;
    })
    .join(" ");

  const zeroPy = H - pad - ((0 - minV) / range) * (H - 2 * pad);
  const zeroPyC = Math.max(pad, Math.min(H - pad, zeroPy));

  return (
    <div>
      <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border rounded bg-muted/30">
        {/* Zero line */}
        <line x1={pad} x2={W - pad} y1={zeroPyC} y2={zeroPyC}
          stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3,3" />
        {/* Diagram */}
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {/* Area fill */}
        <polygon
          points={`${pad},${zeroPyC} ${pts} ${W - pad},${zeroPyC}`}
          fill={color}
          fillOpacity="0.12"
        />
      </svg>
    </div>
  );
}

export default function BeamCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    beamType: "simply-supported",
    loadType: "udl",
    span: 6,
    load: 30,
    E: 200,
    I: 8000,
  });

  const set = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.tagName === "SELECT" ? e.target.value : parseFloat(e.target.value) || 0;
    setInputs((prev) => {
      const next = { ...prev, [key]: val };
      // Reset load type when beam type changes
      if (key === "beamType") {
        next.loadType = val === "cantilever" ? "point-end" : "udl";
      }
      return next;
    });
  };

  const results = useMemo(() => {
    if (inputs.span <= 0 || inputs.load <= 0 || inputs.E <= 0 || inputs.I <= 0) return null;
    try { return compute(inputs); } catch { return null; }
  }, [inputs]);

  const inputCls = "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block";

  const loadTypeOptions =
    inputs.beamType === "cantilever"
      ? [
          { value: "udl",       label: "UDL (distributed)" },
          { value: "point-end", label: "Point load at tip" },
        ]
      : [
          { value: "udl",          label: "UDL (distributed)" },
          { value: "point-centre", label: "Point load at centre" },
        ];

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-8">

      {/* ── Inputs panel ───────────────────────────────── */}
      <div className="flex flex-col gap-5 rounded-xl border bg-card p-6 h-fit">
        <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Configuration</h2>

        <div>
          <label className={labelCls}>Beam type</label>
          <select className={inputCls} value={inputs.beamType} onChange={set("beamType")}>
            <option value="simply-supported">Simply supported</option>
            <option value="cantilever">Cantilever</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Load type</label>
          <select className={inputCls} value={inputs.loadType} onChange={set("loadType")}>
            {loadTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Span L (m)</label>
          <input type="number" min="0.1" step="0.5" className={inputCls}
            value={inputs.span} onChange={set("span")} />
        </div>

        <div>
          <label className={labelCls}>
            {inputs.loadType === "udl" ? "Total load w (kN)" : "Point load P (kN)"}
          </label>
          <input type="number" min="0" step="1" className={inputCls}
            value={inputs.load} onChange={set("load")} />
        </div>

        <div>
          <label className={labelCls}>Elastic modulus E (GPa)</label>
          <input type="number" min="1" step="10" className={inputCls}
            value={inputs.E} onChange={set("E")} />
          <p className="text-[11px] text-muted-foreground mt-1">Steel ≈ 200 · Concrete ≈ 30 · Timber ≈ 12</p>
        </div>

        <div>
          <label className={labelCls}>Second moment I (cm⁴)</label>
          <input type="number" min="1" step="1000" className={inputCls}
            value={inputs.I} onChange={set("I")} />
          <p className="text-[11px] text-muted-foreground mt-1">UB 305×127×48 ≈ 9575 · UB 203×133×25 ≈ 2340</p>
        </div>
      </div>

      {/* ── Results panel ──────────────────────────────── */}
      <div className="flex flex-col gap-6">

        {/* Summary cards */}
        {results ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Max moment",    value: results.maxMoment.toFixed(1),     unit: "kNm" },
              { label: "Max shear",     value: results.maxShear.toFixed(1),      unit: "kN"  },
              { label: "Max deflection",value: results.maxDeflection.toFixed(2), unit: "mm"  },
            ].map(({ label, value, unit }) => (
              <div key={label} className="rounded-xl border bg-card p-4 text-center">
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-black tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground font-mono">{unit}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            Enter valid inputs to see results.
          </div>
        )}

        {/* Diagrams */}
        {results && (
          <div className="rounded-xl border bg-card p-6 flex flex-col gap-5">
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Diagrams</h2>
            <MiniChart data={results.shearDiagram}     yKey="v" color="hsl(220 70% 55%)" label="Shear force (kN)" />
            <MiniChart data={results.momentDiagram}    yKey="m" color="hsl(40 75% 50%)"  label="Bending moment (kNm)" />
            <MiniChart data={results.deflectionDiagram} yKey="d" color="hsl(160 55% 45%)" label="Deflection (mm)" />
          </div>
        )}

        {/* Theory note */}
        <p className="text-xs text-muted-foreground font-mono border-l-2 border-border pl-3">
          Euler–Bernoulli beam theory. Assumes linear-elastic, homogeneous, prismatic member.
          For non-prismatic or composite sections, use a full FEM solution.
        </p>
      </div>
    </div>
  );
}
