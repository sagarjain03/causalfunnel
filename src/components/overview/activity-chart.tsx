"use client";

import { useId } from "react";
import { Bar, CartesianGrid, Cell, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { HatchPattern } from "@/components/overview/hatch-pattern";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export type ActivityPoint = { day: string; label: string; journeys: number; events: number };

const config = {
  journeys: { label: "Journeys", color: "var(--sage)" },
  events: { label: "Events", color: "var(--sage-dim)" },
} satisfies ChartConfig;

/**
 * Daily journeys (hatched bars, today solid sage, left axis) and events (line, right axis). Fixed 240px height so
 * nothing shifts while it loads. Animations off (DESIGN.md §9 motion budget; also respects reduced motion).
 */
export function ActivityChart({ points }: { points: ActivityPoint[] }) {
  const patternId = `activity-${useId().replace(/:/g, "")}`;
  const last = points.length - 1;
  return (
    <ChartContainer config={config} className="aspect-auto min-h-60 w-full flex-1">
      <ComposedChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <HatchPattern id={patternId} />
        </defs>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} />
        <YAxis
          yAxisId="journeys"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={44}
          label={{ value: "Journeys", angle: -90, position: "insideLeft", fill: "var(--text-muted)", fontSize: 11 }}
        />
        <YAxis
          yAxisId="events"
          orientation="right"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={48}
          label={{ value: "Events", angle: 90, position: "insideRight", fill: "var(--text-muted)", fontSize: 11 }}
        />
        <ChartTooltip
          cursor={{ fill: "var(--panel-raised)" }}
          content={<ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ""} />}
        />
        <Bar yAxisId="journeys" dataKey="journeys" radius={[6, 6, 0, 0]} stroke="var(--line)" isAnimationActive={false}>
          {points.map((p, i) => (
            // Today's bar is solid sage; the others use the hatch texture.
            <Cell key={p.day} fill={i === last ? "var(--sage)" : `url(#${patternId})`} />
          ))}
        </Bar>
        <Line
          yAxisId="events"
          dataKey="events"
          type="monotone"
          stroke="var(--color-events)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
