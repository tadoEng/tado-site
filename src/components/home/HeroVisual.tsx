import { useEffect, useRef } from "react";

type Segment = {
  t: number;
  y: number;
  w: number;
  d: number;
  skew: number;
  cx: number;
};

type ThemeName = "light" | "dark";

type Palette = {
  glow: string;
  shadowInner: string;
  shadowOuter: string;
  ghost: string;
  frontLeft: string;
  frontMid: string;
  frontRight: string;
  sideFace: (t: number) => string;
  sideEdge: (t: number) => string;
  column: string;
  columnRear: string;
  windStart: string;
  windEnd: string;
  windHead: (alpha: number) => string;
  profileLine: string;
  profileFillA: string;
  profileFillB: string;
  baseline: string;
  caption: string;
};

const FLOOR_COUNT = 52;
const SPIRE_SEGS = 8;
const CANVAS_W = 700;
const CANVAS_H = 560;
const PERIOD = 5.8;

const PALETTES: Record<ThemeName, Palette> = {
  dark: {
    glow: "rgba(40, 100, 255, 0.16)",
    shadowInner: "rgba(10, 30, 90, 0.58)",
    shadowOuter: "rgba(0, 0, 0, 0)",
    ghost: "rgba(150, 185, 255, 0.36)",
    frontLeft: "rgba(18, 32, 80, 0.90)",
    frontMid: "rgba(34, 63, 148, 0.78)",
    frontRight: "rgba(18, 32, 80, 0.90)",
    sideFace: (t) => `rgba(${12 + t * 12}, ${20 + t * 14}, ${54 + t * 22}, 0.92)`,
    sideEdge: (t) => `rgba(80, 128, 230, ${0.10 + t * 0.08})`,
    column: "rgba(170, 198, 255, 0.30)",
    columnRear: "rgba(130, 160, 235, 0.20)",
    windStart: "rgba(64, 120, 255, 0.00)",
    windEnd: "rgba(120, 186, 255, 0.92)",
    windHead: (alpha) => `rgba(120, 186, 255, ${alpha})`,
    profileLine: "rgba(251, 146, 60, 0.92)",
    profileFillA: "rgba(251, 146, 60, 0.02)",
    profileFillB: "rgba(239, 68, 68, 0.26)",
    baseline: "rgba(132, 168, 255, 0.28)",
    caption: "rgba(178, 208, 255, 0.80)",
  },
  light: {
    glow: "rgba(38, 98, 255, 0.11)",
    shadowInner: "rgba(54, 93, 172, 0.25)",
    shadowOuter: "rgba(84, 114, 172, 0)",
    ghost: "rgba(42, 80, 158, 0.28)",
    frontLeft: "rgba(220, 232, 253, 0.92)",
    frontMid: "rgba(191, 213, 249, 0.92)",
    frontRight: "rgba(220, 232, 253, 0.92)",
    sideFace: (t) => `rgba(${176 - t * 24}, ${198 - t * 24}, ${236 - t * 20}, 0.95)`,
    sideEdge: (t) => `rgba(62, 104, 196, ${0.24 + t * 0.12})`,
    column: "rgba(34, 77, 173, 0.34)",
    columnRear: "rgba(60, 102, 186, 0.26)",
    windStart: "rgba(54, 114, 233, 0.00)",
    windEnd: "rgba(49, 112, 240, 0.78)",
    windHead: (alpha) => `rgba(49, 112, 240, ${Math.min(alpha, 0.8)})`,
    profileLine: "rgba(224, 92, 41, 0.86)",
    profileFillA: "rgba(249, 115, 22, 0.02)",
    profileFillB: "rgba(239, 68, 68, 0.20)",
    baseline: "rgba(51, 93, 180, 0.24)",
    caption: "rgba(41, 75, 150, 0.72)",
  },
};

function towerWidth(t: number): number {
  if (t < 0.18) return 130 - t * 60;
  if (t < 0.38) return 119 - (t - 0.18) * 80;
  if (t < 0.56) return 103 - (t - 0.38) * 100;
  if (t < 0.72) return 85 - (t - 0.56) * 110;
  if (t < 0.88) return 67 - (t - 0.72) * 120;
  return Math.max(8, 48 - (t - 0.88) * 280);
}

function towerTwist(t: number): number {
  return t * 38;
}

function towerCx(t: number): number {
  return Math.sin(t * Math.PI * 1.6) * 6;
}

function stressHue(t: number): string {
  const stops: [number, number, number, number][] = [
    [0, 200, 90, 65],
    [0.25, 170, 88, 58],
    [0.5, 100, 86, 52],
    [0.72, 40, 92, 55],
    [0.88, 20, 94, 54],
    [1.0, 0, 92, 50],
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, h0, s0, l0] = stops[i];
    const [t1, h1, s1, l1] = stops[i + 1];
    if (t <= t1) {
      const f = (t - t0) / (t1 - t0);
      return `hsl(${h0 + f * (h1 - h0)}, ${s0 + f * (s1 - s0)}%, ${l0 + f * (l1 - l0)}%)`;
    }
  }

  return "hsl(0, 92%, 50%)";
}

function getThemeName(): ThemeName {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function drawFloorTop(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  w: number,
  d: number,
  skew: number,
  dx: number,
  fillStyle: string,
  strokeStyle: string,
  lineWidth: number,
  dash: number[] | null,
  glow: boolean,
): void {
  const fl: [number, number] = [cx - w / 2 + dx, y];
  const fr: [number, number] = [cx + w / 2 + dx, y];
  const br: [number, number] = [cx + w / 2 + dx + skew, y - d];
  const bl: [number, number] = [cx - w / 2 + dx + skew, y - d];

  ctx.beginPath();
  ctx.moveTo(fl[0], fl[1]);
  ctx.lineTo(fr[0], fr[1]);
  ctx.lineTo(br[0], br[1]);
  ctx.lineTo(bl[0], bl[1]);
  ctx.closePath();

  ctx.fillStyle = fillStyle;
  ctx.fill();

  if (dash) ctx.setLineDash(dash);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;

  if (glow) {
    ctx.shadowColor = strokeStyle;
    ctx.shadowBlur = 5;
  }

  ctx.stroke();

  if (glow) {
    ctx.shadowBlur = 0;
  }

  if (dash) ctx.setLineDash([]);
}

export default function HeroVisual() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BASE_CX = 320;
    const BASE_Y = 500;
    const FLOOR_H = 7.1;
    const HEIGHT_PX = (FLOOR_COUNT - 1) * FLOOR_H + 72;
    const MAX_DRIFT = HEIGHT_PX * 0.026;

    const floors: Segment[] = Array.from({ length: FLOOR_COUNT }, (_, i) => {
      const t = i / (FLOOR_COUNT - 1);
      const y = BASE_Y - i * FLOOR_H;
      const w = towerWidth(t);
      const twist = towerTwist(t);
      const d = (20 - t * 8) * Math.cos((twist * Math.PI) / 180);
      const skew = (22 + t * 4) + Math.sin((twist * Math.PI) / 180) * 6;
      const cx = BASE_CX + towerCx(t);
      return { t, y, w, d, skew, cx };
    });

    const spire: Segment[] = Array.from({ length: SPIRE_SEGS }, (_, i) => {
      const tt = i / (SPIRE_SEGS - 1);
      const y = BASE_Y - (FLOOR_COUNT - 1) * FLOOR_H - tt * 72;
      const w = Math.max(2, 8 - tt * 6);
      return { t: Math.min(1 + tt * 0.18, 1), y, w, d: 6 - tt * 4, skew: 24, cx: BASE_CX };
    });

    const segments = [...floors, ...spire];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;

    const sway = (tNorm: number, timeSec: number): number => {
      const modeShape = Math.pow(tNorm, 1.5);
      const wind = Math.sin((2 * Math.PI * timeSec) / PERIOD);
      const gust = Math.sin((2 * Math.PI * timeSec) / (PERIOD * 0.31)) * 0.18;
      return modeShape * MAX_DRIFT * (wind + gust);
    };

    const render = (timeSec: number): void => {
      const palette = PALETTES[getThemeName()];

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const glow = ctx.createRadialGradient(BASE_CX, BASE_Y, 10, BASE_CX, BASE_Y, 160);
      glow.addColorStop(0, palette.glow);
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(BASE_CX, BASE_Y, 160, 0, Math.PI * 2);
      ctx.fill();

      const topDrift = sway(1, timeSec);
      ctx.save();
      ctx.translate(topDrift * 0.15, 0);
      const shadow = ctx.createRadialGradient(BASE_CX, BASE_Y + 12, 5, BASE_CX, BASE_Y + 12, 110);
      shadow.addColorStop(0, palette.shadowInner);
      shadow.addColorStop(1, palette.shadowOuter);
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.ellipse(BASE_CX, BASE_Y + 12, 110, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.24;
      for (const segment of segments) {
        drawFloorTop(
          ctx,
          segment.cx,
          segment.y,
          segment.w,
          segment.d,
          segment.skew,
          0,
          "rgba(0,0,0,0)",
          palette.ghost,
          0.8,
          [5, 4],
          false,
        );
      }
      ctx.restore();

      const arrowCount = 10;
      for (let i = 0; i < arrowCount; i++) {
        const ay = 140 + i * 34;
        const pulse = Math.sin(timeSec * 2.8 - i * 0.55) * 0.5 + 0.5;
        const len = 52 + pulse * 26;
        const alpha = 0.32 + pulse * 0.52;

        ctx.save();
        ctx.globalAlpha = alpha;

        const grad = ctx.createLinearGradient(32, ay, 32 + len, ay);
        grad.addColorStop(0, palette.windStart);
        grad.addColorStop(1, palette.windEnd);
        ctx.strokeStyle = grad;
        ctx.lineWidth = i % 3 === 0 ? 2.1 : 1.5;
        ctx.beginPath();
        ctx.moveTo(32, ay);
        ctx.lineTo(32 + len, ay);
        ctx.stroke();

        ctx.fillStyle = palette.windHead(alpha);
        ctx.beginPath();
        ctx.moveTo(32 + len + 9, ay);
        ctx.lineTo(32 + len, ay - 5);
        ctx.lineTo(32 + len, ay + 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      for (let i = 1; i < segments.length; i++) {
        const top = segments[i];
        const bot = segments[i - 1];
        const dxTop = sway(top.t, timeSec);
        const dxBot = sway(bot.t, timeSec);

        ctx.beginPath();
        ctx.moveTo(top.cx + dxTop + top.w / 2, top.y);
        ctx.lineTo(top.cx + dxTop + top.w / 2 + top.skew, top.y - top.d);
        ctx.lineTo(bot.cx + dxBot + bot.w / 2 + bot.skew, bot.y - bot.d);
        ctx.lineTo(bot.cx + dxBot + bot.w / 2, bot.y);
        ctx.closePath();

        const midT = (top.t + bot.t) / 2;
        ctx.fillStyle = palette.sideFace(midT);
        ctx.fill();

        ctx.strokeStyle = palette.sideEdge(midT);
        ctx.lineWidth = 0.55;
        ctx.stroke();
      }

      for (let i = 1; i < segments.length; i++) {
        const top = segments[i];
        const bot = segments[i - 1];
        const dxTop = sway(top.t, timeSec);
        const dxBot = sway(bot.t, timeSec);

        ctx.beginPath();
        ctx.moveTo(top.cx + dxTop - top.w / 2, top.y);
        ctx.lineTo(top.cx + dxTop + top.w / 2, top.y);
        ctx.lineTo(bot.cx + dxBot + bot.w / 2, bot.y);
        ctx.lineTo(bot.cx + dxBot - bot.w / 2, bot.y);
        ctx.closePath();

        const grad = ctx.createLinearGradient(top.cx + dxTop - top.w / 2, 0, top.cx + dxTop + top.w / 2, 0);
        grad.addColorStop(0, palette.frontLeft);
        grad.addColorStop(0.45, palette.frontMid);
        grad.addColorStop(1, palette.frontRight);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      const fractions = [-0.42, -0.14, 0.14, 0.42];
      for (let i = 1; i < segments.length; i++) {
        const top = segments[i];
        const bot = segments[i - 1];
        const dxTop = sway(top.t, timeSec);
        const dxBot = sway(bot.t, timeSec);

        for (const c of fractions) {
          ctx.strokeStyle = palette.column;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(top.cx + dxTop + c * top.w, top.y);
          ctx.lineTo(bot.cx + dxBot + c * bot.w, bot.y);
          ctx.stroke();

          ctx.strokeStyle = palette.columnRear;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(top.cx + dxTop + c * top.w + top.skew, top.y - top.d);
          ctx.lineTo(bot.cx + dxBot + c * bot.w + bot.skew, bot.y - bot.d);
          ctx.stroke();
        }
      }

      for (const segment of segments) {
        const dx = sway(segment.t, timeSec);
        drawFloorTop(
          ctx,
          segment.cx + dx,
          segment.y,
          segment.w,
          segment.d,
          segment.skew,
          0,
          "rgba(0,0,0,0)",
          stressHue(segment.t),
          1.6 + segment.t * 0.5,
          null,
          true,
        );
      }

      const profileX = 512;
      const profileBase = BASE_Y;
      const profileTop = BASE_Y - HEIGHT_PX;
      const profileH = profileBase - profileTop;
      const profileScale = 4.3;

      ctx.beginPath();
      ctx.moveTo(profileX, profileBase);
      for (let i = 0; i <= 64; i++) {
        const frac = i / 64;
        const py = profileBase - frac * profileH;
        const drift = sway(frac, timeSec) * profileScale;
        ctx.lineTo(profileX + drift, py);
      }
      ctx.lineTo(profileX, profileTop);

      const profileFill = ctx.createLinearGradient(0, profileBase, 0, profileTop);
      profileFill.addColorStop(0, palette.profileFillA);
      profileFill.addColorStop(1, palette.profileFillB);
      ctx.fillStyle = profileFill;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(profileX, profileBase);
      for (let i = 0; i <= 64; i++) {
        const frac = i / 64;
        const py = profileBase - frac * profileH;
        const drift = sway(frac, timeSec) * profileScale;
        ctx.lineTo(profileX + drift, py);
      }
      ctx.strokeStyle = palette.profileLine;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(profileX, profileBase);
      ctx.lineTo(profileX, profileTop);
      ctx.strokeStyle = palette.baseline;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = palette.caption;
      ctx.font = "600 10px 'JetBrains Mono', monospace";
      ctx.fillText("WIND +X", 34, 44);
      ctx.fillText("DRIFT", profileX + 18, profileTop - 8);
    };

    const loop = (timestamp: number): void => {
      render(timestamp / 1000);
      frame = window.requestAnimationFrame(loop);
    };

    const drawCurrent = (): void => {
      const seconds = performance.now() / 1000;
      render(seconds);
    };

    if (reduceMotion) {
      drawCurrent();
    } else {
      frame = window.requestAnimationFrame(loop);
    }

    const observer = new MutationObserver(() => {
      if (reduceMotion) {
        drawCurrent();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="block w-full h-auto bg-transparent"
        role="img"
        aria-label="Animated high-rise tower under wind load with lateral sway"
      />
    </div>
  );
}
