import React from "react";
import Svg, { Circle } from "react-native-svg";

export type ConicRingSegment = { percent: number; color: string };

interface ConicRingProps {
  size?: number;
  strokeWidth?: number;
  /** One or more segments, each a percentage (0-100) of the ring's circumference.
   *  A single segment renders a plain progress ring; several render a donut chart. */
  segments: ConicRingSegment[];
  trackColor?: string;
}

/** SVG stroke-based ring/donut — the RN-safe stand-in for the design's CSS
 *  `conic-gradient()`. Reused by the hero phone-mock progress ring and the
 *  budget-tool category donut. */
export function ConicRing({ size = 64, strokeWidth = 10, segments, trackColor = "rgba(42,36,24,0.08)" }: ConicRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  // Cumulative starting offset per segment, computed immutably (no render-time
  // mutation) — each segment's start is the sum of every percent before it.
  const withOffset = segments.reduce<{ segment: ConicRingSegment; offset: number }[]>((acc, segment) => {
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.segment.percent : 0;
    return [...acc, { segment, offset }];
  }, []);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
      {withOffset.map(({ segment, offset }, i) => {
        const len = (Math.max(0, Math.min(100, segment.percent)) / 100) * circumference;
        const dashOffset = -((offset / 100) * circumference);
        return (
          <Circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${len} ${Math.max(0, circumference - len)}`}
            strokeDashoffset={dashOffset}
            strokeLinecap={segments.length > 1 ? "butt" : "round"}
            fill="none"
            // Rotate so the ring starts at 12 o'clock instead of 3 o'clock.
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </Svg>
  );
}
