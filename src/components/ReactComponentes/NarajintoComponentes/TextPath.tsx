"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TextPathCurve = "wave" | "arc" | "circle";
export type TextPathDirection = "forward" | "reverse";

export interface TextPathProps {
  /** The string to tile along the path. */
  text: string;
  /** Built-in curve. Ignored when `path` is set. Default: `"arc"`. */
  curve?: TextPathCurve;
  /** Custom SVG path `d`. Wins over `curve`. Open paths only (wave/arc style). */
  path?: string;
  /** Custom viewBox when using a custom `path`. */
  viewBox?: string;
  /** Seconds for one seamless loop. Lower = faster. Default: 14 */
  duration?: number;
  /** Travel direction. Default: `"forward"`. */
  direction?: TextPathDirection;
  /** Separator between tiled copies. Default: `"  ·  "`. */
  separator?: string;
  /**
   * How many text tiles to place. Default: 3.
   * Wave/arc: tiles along the open path for the marquee.
   * Circle: copies of the phrase; the ring radius grows so they fit
   * exactly once around (no overlap, no equal-angle letter hacks).
   */
  repeats?: number;
  /** Font size in CSS pixels. Default: 28 */
  fontSize?: number;
  /** Font weight. Default: 500 */
  fontWeight?: number | string;
  /** Letter spacing in em. Default: 0.05 */
  letterSpacing?: number;
  /** Text fill. Omit to inherit `currentColor`. */
  fill?: string;
  /** Draw the underlying path stroke. Default: false */
  showPath?: boolean;
  /** Path stroke color. Defaults to a soft theme line. */
  pathColor?: string;
  /** Path stroke width in CSS pixels. Default: 1 */
  pathWidth?: number;
  /**
   * Force the loop paused. When omitted, auto-pauses off-screen or when
   * the tab is hidden.
   */
  paused?: boolean;
  /** Optional Tailwind class for size / color on the host. */
  className?: string;
  /** Accessible name. Defaults to `text`. */
  "aria-label"?: string;
}

type CurveDef = {
  d: string;
  viewBox: string;
};

const CURVES: Record<"wave" | "arc", CurveDef> = {
  wave: {
    d: "M 0 72 C 50 12, 90 132, 140 72 S 230 12, 280 72 S 370 132, 420 72 S 510 12, 560 72",
    viewBox: "0 0 560 144",
  },
  arc: {
    d: "M 24 118 Q 280 -8 536 118",
    viewBox: "0 0 560 140",
  },
};

function useAutoPause(paused: boolean | undefined) {
  const pausedPropRef = React.useRef(paused);
  const inViewRef = React.useRef(true);
  const reduceMotionRef = React.useRef(false);
  const [host, setHost] = React.useState<Element | null>(null);
  const [playing, setPlaying] = React.useState(true);
  pausedPropRef.current = paused;

  const setHostRef = React.useCallback((node: SVGSVGElement | null) => {
    setHost(node);
  }, []);

  React.useEffect(() => {
    if (!host) return;

    let pageVisible = document.visibilityState !== "hidden";

    const mq =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const syncReduceMotion = () => {
      reduceMotionRef.current = mq?.matches ?? false;
    };
    syncReduceMotion();

    const sync = () => {
      if (reduceMotionRef.current) {
        setPlaying(false);
        return;
      }
      const forced = pausedPropRef.current;
      if (forced === true) {
        setPlaying(false);
        return;
      }
      if (forced === false) {
        setPlaying(true);
        return;
      }
      setPlaying(inViewRef.current && pageVisible);
    };

    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { threshold: 0.01 },
    );

    const onVisibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      sync();
    };

    const onReduceMotionChange = () => {
      syncReduceMotion();
      sync();
    };

    if (paused !== false) {
      io.observe(host);
      document.addEventListener("visibilitychange", onVisibility);
    }
    mq?.addEventListener("change", onReduceMotionChange);

    sync();

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      mq?.removeEventListener("change", onReduceMotionChange);
    };
  }, [paused, host]);

  return { setHostRef, playing };
}

/**
 * Circle mode — real SVG textPath on a ring sized to the text.
 *
 * Why not per-letter rotate (CircularText)? Equal angle-per-grapheme fights
 * proportional fonts and looks stepped/uneven. Why not a fixed-radius circle
 * + repeats? Extra copies stack on a closed path and look glitched.
 *
 * Instead: measure the tiled string, set circumference = text length, spin
 * the whole group. Spacing stays native; repeats just make a larger ring.
 */
function TextPathCircle({
  text,
  duration,
  direction,
  separator,
  repeats,
  fontSize,
  fontWeight,
  letterSpacing,
  fill,
  showPath,
  pathColor,
  pathWidth,
  paused,
  className,
  "aria-label": ariaLabel,
}: {
  text: string;
  duration: number;
  direction: TextPathDirection;
  separator: string;
  repeats: number;
  fontSize: number;
  fontWeight: number | string;
  letterSpacing: number;
  fill?: string;
  showPath: boolean;
  pathColor?: string;
  pathWidth: number;
  paused?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const reactId = React.useId().replace(/:/g, "");
  const pathId = `wensity-text-path-circle-${reactId}`;

  const measureRef = React.useRef<SVGTextElement | null>(null);
  const spinRef = React.useRef<SVGGElement | null>(null);
  const angleRef = React.useRef(0);
  const { setHostRef, playing } = useAutoPause(paused);

  const trimmed = text.trim() || "Text Path";
  // Keep the trailing separator so the wrap seam matches tile seams.
  const displayText = `${trimmed}${separator}`.repeat(Math.max(1, repeats));

  const [radius, setRadius] = React.useState(0);

  const textStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    letterSpacing: `${letterSpacing}em`,
    fill: fill ?? "var(--wensity-text-path-fill)",
  };

  React.useLayoutEffect(() => {
    const measure = measureRef.current;
    if (!measure) return;
    const len = measure.getComputedTextLength();
    if (len > 1) {
      setRadius(len / (2 * Math.PI));
    }
  }, [displayText, fontSize, fontWeight, letterSpacing]);

  const pad = fontSize * 1.35;
  const size = radius > 0 ? 2 * radius + 2 * pad : fontSize * 10;
  const cx = size / 2;
  const cy = size / 2;
  const r = radius > 0 ? radius : Math.max(1, size / 2 - pad);
  // Start at 12 o'clock, sweep clockwise (readable L→R across the top).
  const pathD = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;

  React.useEffect(() => {
    const spin = spinRef.current;
    if (!spin) return;

    let raf = 0;
    let last = performance.now();
    const sign = direction === "forward" ? 1 : -1;
    const degPerMs = (sign * 360) / (duration * 1000);

    const paint = (angle: number) => {
      spin.setAttribute("transform", `rotate(${angle} ${cx} ${cy})`);
    };

    paint(angleRef.current);

    if (!playing || radius <= 0) {
      return () => {
        if (raf) cancelAnimationFrame(raf);
      };
    }

    const tick = (now: number) => {
      angleRef.current += degPerMs * (now - last);
      last = now;
      paint(angleRef.current);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [playing, duration, direction, cx, cy, radius]);

  return (
    <svg
      ref={setHostRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={ariaLabel ?? trimmed}
      className={cn(
        "wensity-text-path mx-auto block overflow-visible",
        "[--wensity-text-path-fill:currentColor]",
        "[--wensity-text-path-stroke:#a1a1aa]",
        "dark:[--wensity-text-path-stroke:#52525b]",
        className,
      )}
    >
      {/* Off-canvas measure — same font metrics as the visible textPath. */}
      <text
        ref={measureRef}
        x={-9999}
        y={-9999}
        aria-hidden="true"
        style={textStyle}
        className="font-[inherit]"
      >
        {displayText}
      </text>

      <path
        id={pathId}
        d={pathD}
        fill="none"
        stroke={
          showPath ? (pathColor ?? "var(--wensity-text-path-stroke)") : "none"
        }
        strokeWidth={showPath ? pathWidth : 0}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        aria-hidden="true"
      />

      <g ref={spinRef}>
        {radius > 0 ? (
          <text
            style={textStyle}
            className="font-[inherit] [dominant-baseline:central]"
          >
            <textPath
              href={`#${pathId}`}
              startOffset="0"
              method="align"
              spacing="exact"
            >
              {displayText}
            </textPath>
          </text>
        ) : null}
      </g>
    </svg>
  );
}

/**
 * Open path mode — SVG textPath marquee (wave / arc / custom path).
 */
function TextPathOpen({
  text,
  curve,
  path: pathOverride,
  viewBox: viewBoxOverride,
  duration,
  direction,
  separator,
  repeats,
  fontSize,
  fontWeight,
  letterSpacing,
  fill,
  showPath,
  pathColor,
  pathWidth,
  paused,
  className,
  "aria-label": ariaLabel,
}: {
  text: string;
  curve: "wave" | "arc";
  path?: string;
  viewBox?: string;
  duration: number;
  direction: TextPathDirection;
  separator: string;
  repeats: number;
  fontSize: number;
  fontWeight: number | string;
  letterSpacing: number;
  fill?: string;
  showPath: boolean;
  pathColor?: string;
  pathWidth: number;
  paused?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const reactId = React.useId().replace(/:/g, "");
  const pathId = `wensity-text-path-${reactId}`;

  const textPathRef = React.useRef<SVGTextPathElement | null>(null);
  const offsetRef = React.useRef(0);
  const { setHostRef, playing } = useAutoPause(paused);

  const curveDef = CURVES[curve];
  const pathD = pathOverride?.trim() || curveDef.d;
  const viewBox =
    viewBoxOverride?.trim() ||
    (pathOverride ? "0 0 560 144" : curveDef.viewBox);

  const trimmed = text.trim() || "Text Path";
  const tile = `${trimmed}${separator}`;
  const displayText = tile.repeat(Math.max(1, repeats));

  // Reset marquee seam when content/metrics change — not on pause alone.
  React.useEffect(() => {
    offsetRef.current = 0;
    textPathRef.current?.setAttribute("startOffset", "0");
  }, [
    pathD,
    displayText,
    repeats,
    direction,
    duration,
    fontSize,
    fontWeight,
    letterSpacing,
  ]);

  React.useEffect(() => {
    const textPath = textPathRef.current;
    if (!textPath) return;

    let raf = 0;
    let start = performance.now();
    let loopDistance = 0;
    let running = false;

    const measure = () => {
      const total = textPath.getComputedTextLength();
      loopDistance = total > 0 ? total / Math.max(1, repeats) : 0;
    };

    const paint = (offset: number) => {
      offsetRef.current = offset;
      textPath.setAttribute("startOffset", String(offset));
    };

    const resumeFromOffset = () => {
      if (loopDistance <= 0) {
        start = performance.now();
        return;
      }
      const raw =
        direction === "forward"
          ? -offsetRef.current / loopDistance
          : offsetRef.current / loopDistance;
      const progress = ((raw % 1) + 1) % 1;
      start = performance.now() - progress * duration * 1000;
    };

    const tick = (now: number) => {
      if (!running) return;
      if (!playing) {
        running = false;
        raf = 0;
        return;
      }

      if (loopDistance <= 0) measure();
      if (loopDistance > 0) {
        const elapsed = (now - start) / 1000;
        const progress = (elapsed / duration) % 1;
        const offset =
          direction === "forward"
            ? -progress * loopDistance
            : progress * loopDistance;
        paint(offset);
      }

      raf = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (running || !playing) return;
      measure();
      if (loopDistance <= 0) {
        paint(0);
        return;
      }
      resumeFromOffset();
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      running = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    if (playing) startLoop();
    else stopLoop();

    return () => stopLoop();
  }, [
    playing,
    pathD,
    displayText,
    duration,
    repeats,
    direction,
    fontSize,
    fontWeight,
    letterSpacing,
  ]);

  return (
    <svg
      ref={setHostRef}
      viewBox={viewBox}
      role="img"
      aria-label={ariaLabel ?? trimmed}
      className={cn(
        "wensity-text-path block h-auto w-full overflow-visible",
        "[--wensity-text-path-fill:currentColor]",
        "[--wensity-text-path-stroke:#a1a1aa]",
        "dark:[--wensity-text-path-stroke:#52525b]",
        className,
      )}
    >
      <path
        id={pathId}
        d={pathD}
        fill="none"
        stroke={
          showPath ? (pathColor ?? "var(--wensity-text-path-stroke)") : "none"
        }
        strokeWidth={showPath ? pathWidth : 0}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        aria-hidden="true"
      />
      <text
        style={{
          fontSize,
          fontWeight,
          letterSpacing: `${letterSpacing}em`,
          fill: fill ?? "var(--wensity-text-path-fill)",
        }}
        className="font-[inherit] [dominant-baseline:central]"
      >
        <textPath
          ref={textPathRef}
          href={`#${pathId}`}
          startOffset="0"
          method="align"
          spacing="exact"
        >
          {displayText}
        </textPath>
      </text>
    </svg>
  );
}

/**
 * TextPath
 *
 * Curved headline text via SVG textPath for every curve.
 *
 * Motion contract:
 * - Wave/arc: seamless tile loop via startOffset (rAF, no re-renders).
 * - Circle: ring radius = textLength / 2π, then spin the group (no stacking).
 * - `repeats` tiles the string; on circle the ring grows to fit.
 * - Auto-pauses off-screen / hidden tabs; honours reduced motion.
 */
export function TextPath({
  text,
  curve = "arc",
  path: pathOverride,
  viewBox,
  duration = 14,
  direction = "forward",
  separator = "  ·  ",
  repeats = 3,
  fontSize = 28,
  fontWeight = 500,
  letterSpacing = 0.05,
  fill,
  showPath = false,
  pathColor,
  pathWidth = 1,
  paused,
  className,
  "aria-label": ariaLabel,
}: TextPathProps) {
  const safeDuration = Math.max(2, duration);
  const safeRepeats = Math.max(1, Math.min(8, Math.round(repeats)));
  const safeFontSize = Math.max(10, fontSize);
  const safePathWidth = Math.max(0.5, pathWidth);

  if (curve === "circle" && !pathOverride?.trim()) {
    return (
      <TextPathCircle
        text={text}
        duration={safeDuration}
        direction={direction}
        separator={separator}
        repeats={safeRepeats}
        fontSize={safeFontSize}
        fontWeight={fontWeight}
        letterSpacing={letterSpacing}
        fill={fill}
        showPath={showPath}
        pathColor={pathColor}
        pathWidth={safePathWidth}
        paused={paused}
        className={className}
        aria-label={ariaLabel}
      />
    );
  }

  const openCurve: "wave" | "arc" = curve === "wave" ? "wave" : "arc";

  return (
    <TextPathOpen
      text={text}
      curve={openCurve}
      path={pathOverride}
      viewBox={viewBox}
      duration={safeDuration}
      direction={direction}
      separator={separator}
      repeats={safeRepeats}
      fontSize={safeFontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      fill={fill}
      showPath={showPath}
      pathColor={pathColor}
      pathWidth={safePathWidth}
      paused={paused}
      className={className}
      aria-label={ariaLabel}
    />
  );
}

export default TextPath;
