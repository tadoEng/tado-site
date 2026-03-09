// src/components/home/HeroVisual.tsx
// ─────────────────────────────────────────────────────────────
// Animated structural frame SVG — React island (client:load)
// Adapts colours to light/dark via CSS custom properties.
// ─────────────────────────────────────────────────────────────

export default function HeroVisual() {
  return (
    <div className="relative flex items-center justify-center w-full">
      {/* Ambient glow behind diagram */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 55% 50%, hsl(var(--primary) / 0.08) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      <svg
        viewBox="0 0 440 380"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full overflow-visible relative z-10"
        role="img"
        aria-label="Animated structural frame analysis diagram showing beam deflection under load"
      >
        <defs>
          {/* Engineering grid */}
          <pattern
            id="hv-grid"
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 22 0 L 0 0 0 22"
              fill="none"
              stroke="hsl(var(--primary) / 0.07)"
              strokeWidth="0.5"
            />
          </pattern>

          {/* Beam stress gradient — animates colours */}
          <linearGradient id="hv-stress" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="hsl(220 70% 45%)">
              <animate
                attributeName="stop-color"
                values="hsl(220 70% 45%);hsl(220 70% 45%);hsl(220 70% 45%)"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="30%" stopColor="hsl(150 55% 45%)">
              <animate
                attributeName="stop-color"
                values="hsl(150 55% 45%);hsl(40 75% 40%);hsl(150 55% 45%)"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="55%" stopColor="hsl(40 75% 40%)">
              <animate
                attributeName="stop-color"
                values="hsl(40 75% 40%);hsl(15 65% 45%);hsl(40 75% 40%)"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="80%" stopColor="hsl(150 55% 45%)">
              <animate
                attributeName="stop-color"
                values="hsl(150 55% 45%);hsl(40 75% 40%);hsl(150 55% 45%)"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="hsl(220 70% 45%)" />
          </linearGradient>

          {/* Moment diagram fill */}
          <linearGradient id="hv-moment" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>

          {/* Load arrow marker */}
          <marker id="hv-arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="7" orient="auto">
            <path d="M0,0 L7,0 L3.5,7 Z" fill="hsl(var(--destructive))" />
          </marker>
        </defs>

        {/* Background grid */}
        <rect width="440" height="380" fill="url(#hv-grid)" opacity="0.8" />

        {/* Ground line */}
        <line x1="40" y1="310" x2="400" y2="310" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1.5" />
        {[56, 84, 116, 200, 324, 356, 384].map((x) => (
          <line
            key={x}
            x1={x} y1="310" x2={x - 10} y2="322"
            stroke="hsl(var(--muted-foreground) / 0.15)"
            strokeWidth="1"
          />
        ))}

        {/* Columns */}
        {[80, 220, 360].map((x) => (
          <line
            key={x}
            x1={x} y1="160" x2={x} y2="310"
            stroke="hsl(var(--muted-foreground) / 0.5)"
            strokeWidth="4"
          />
        ))}

        {/* Pin supports */}
        {[
          [80, 310, 66, 334, 94, 334],
          [220, 310, 206, 334, 234, 334],
          [360, 310, 346, 334, 374, 334],
        ].map(([cx, cy, x1, y1, x2, y2], i) => (
          <g key={i}>
            <polygon
              points={`${cx},${cy} ${x1},${y1} ${x2},${y2}`}
              fill="none"
              stroke="hsl(var(--muted-foreground) / 0.5)"
              strokeWidth="1.5"
            />
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="hsl(var(--muted-foreground) / 0.25)"
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* Ghost beam (undeflected) */}
        <line x1="80" y1="160" x2="360" y2="160" stroke="hsl(var(--primary) / 0.15)" strokeWidth="2" strokeDasharray="5,5" />

        {/* Deflected beam — stress colour fill */}
        <path stroke="url(#hv-stress)" strokeWidth="14" fill="none" strokeLinecap="round">
          <animate
            attributeName="d"
            values="M80,160 Q150,160 220,160 Q290,160 360,160;M80,160 Q150,205 220,212 Q290,205 360,160;M80,160 Q150,205 220,212 Q290,205 360,160;M80,160 Q150,160 220,160 Q290,160 360,160"
            dur="4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1"
          />
        </path>

        {/* Beam outline */}
        <path stroke="hsl(var(--primary) / 0.75)" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <animate
            attributeName="d"
            values="M80,160 Q150,160 220,160 Q290,160 360,160;M80,160 Q150,205 220,212 Q290,205 360,160;M80,160 Q150,205 220,212 Q290,205 360,160;M80,160 Q150,160 220,160 Q290,160 360,160"
            dur="4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1"
          />
        </path>

        {/* Moment diagram */}
        <path fill="url(#hv-moment)" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1">
          <animate
            attributeName="d"
            values="M80,160 Q220,160 360,160 L360,160 Q220,160 80,160 Z;M80,160 Q220,238 360,160 L360,160 Q220,160 80,160 Z;M80,160 Q220,238 360,160 L360,160 Q220,160 80,160 Z;M80,160 Q220,160 360,160 L360,160 Q220,160 80,160 Z"
            dur="4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1"
          />
        </path>

        {/* Load arrows */}
        {[150, 220, 290].map((x) => (
          <line
            key={x}
            x1={x} x2={x} y1="64" markerEnd="url(#hv-arrow)"
            stroke="hsl(var(--destructive))"
            strokeWidth="2"
          >
            <animate
              attributeName="y2"
              values="148;155;155;148"
              dur="4s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1"
            />
          </line>
        ))}
        <line x1="130" y1="48" x2="310" y2="48" stroke="hsl(var(--destructive) / 0.4)" strokeWidth="1.5" />
        <text x="162" y="42" fontFamily="monospace" fontSize="10" fill="hsl(var(--destructive) / 0.7)">
          <animate attributeName="opacity" values="0.6;1;1;0.6" dur="4s" repeatCount="indefinite" />
          w (UDL)
        </text>

        {/* Nodes */}
        <circle cx="80"  cy="160" r="5.5" fill="hsl(var(--primary))" />
        <circle cx="360" cy="160" r="5.5" fill="hsl(var(--primary))" />
        <circle cx="220" fill="hsl(var(--primary))">
          <animate attributeName="cy"   values="160;212;212;160" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1" />
          <animate attributeName="r"    values="5.5;8.5;8.5;5.5" dur="4s" repeatCount="indefinite" />
          <animate attributeName="fill" values="hsl(var(--primary));hsl(var(--destructive));hsl(var(--destructive));hsl(var(--primary))" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Dimension line */}
        <g opacity="0.28">
          <line x1="80" y1="356" x2="360" y2="356" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          <line x1="80"  y1="348" x2="80"  y2="364" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          <line x1="360" y1="348" x2="360" y2="364" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          <text x="220" y="372" fontFamily="monospace" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="middle">
            L = span
          </text>
        </g>

        {/* Floating labels */}
        <g>
          <animate attributeName="opacity" values="0;0;1;1;0" dur="4s" repeatCount="indefinite" keyTimes="0;0.3;0.45;0.75;1" />
          <line x1="232" y1="185" x2="250" y2="200" stroke="hsl(var(--primary) / 0.4)" strokeWidth="1" strokeDasharray="2,2" />
          <text x="252" y="204" fontFamily="monospace" fontSize="9.5" fill="hsl(var(--primary))">max δ</text>
        </g>
        <text x="302" y="118" fontFamily="monospace" fontSize="9" fill="hsl(var(--destructive) / 0.75)" textAnchor="middle">
          <animate attributeName="opacity" values="0;0;0;1;0" dur="4s" repeatCount="indefinite" keyTimes="0;0.25;0.4;0.65;1" />
          σ critical
        </text>

        {/* Corner watermark */}
        <text x="430" y="16" fontFamily="monospace" fontSize="8" fill="hsl(var(--primary) / 0.2)" textAnchor="end">
          FEM — 2D FRAME
        </text>
      </svg>
    </div>
  );
}
