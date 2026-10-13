"use client";

import { useId } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { HatchPattern } from "@/components/overview/hatch-pattern";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

type SparklineProps = {
  /** One point per day of the current period, oldest first. */
  points: { day: string; label: string; value: number }[];
  label: string;
  /** Formats the exact value shown in the tooltip. */
  format: "count" | "percent" | "duration";
};

const formatValue = (value: number, format: SparklineProps["format"]) => {
  if (format === "percent") return `${(value * 100).toFixed(1)}%`;
  if (format === "duration") {
    const s = Math.round(value / 1000);
    return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
  }
  return value.toLocaleString("en");
};

/** Daily values of one KPI: sage line over a hatched area, tooltip with the date and exact value. No animation. */
export function Sparkline({ points, label, format }: SparklineProps) {
  const patternId = `spark-${useId().replace(/:/g, "")}`;
  const config = { value: { label, color: "var(--sage)" } } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="aspect-auto h-10 w-full">
      <AreaChart data={points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <HatchPattern id={patternId} />
        </defs>
        <XAxis dataKey="label" hide />
        <YAxis hide domain={[0, "dataMax"]} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ""}
              formatter={(value) => (
                <span className="flex w-full justify-between gap-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium tabular-nums">{formatValue(Number(value), format)}</span>
                </span>
              )}
            />
          }
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={1.5}
          fill={`url(#${patternId})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
