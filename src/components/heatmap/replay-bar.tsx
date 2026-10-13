"use client";

import { useEffect, useRef, useState } from "react";
import { animate, type JSAnimation } from "animejs";
import { Pause, Play } from "lucide-react";
import { LocalTime } from "@/components/local-time";
import { Button } from "@/components/ui/button";

/** Total time for a full replay (first → last click). */
const REPLAY_MS = 2000;

type ReplayBarProps = {
  /** Time span of the clicks being shown, epoch ms. */
  start: number;
  end: number;
  /** Current replay time: only clicks at or before it are drawn. */
  value: number;
  onChange: (value: number) => void;
};

/**
 * Play/pause + range slider over the visible clicks' time span. Play animates the slider to the end with anime.js;
 * with prefers-reduced-motion, Play jumps to the end instead (the slider still works).
 */
export function ReplayBar({ start, end, value, onChange }: ReplayBarProps) {
  const animation = useRef<JSAnimation | null>(null);
  const [playing, setPlaying] = useState(false);
  const singleMoment = end <= start;

  useEffect(
    () => () => {
      animation.current?.cancel();
    },
    [],
  );

  function stop() {
    animation.current?.cancel();
    animation.current = null;
    setPlaying(false);
  }

  function play() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onChange(end);
      return;
    }
    const from = value >= end ? start : value; // at the end: replay from the first click
    const state = { t: from };
    onChange(from);
    setPlaying(true);
    animation.current = animate(state, {
      t: end,
      duration: (REPLAY_MS * (end - from)) / Math.max(1, end - start),
      ease: "linear",
      onUpdate: () => onChange(state.t),
      onComplete: () => {
        onChange(end);
        animation.current = null;
        setPlaying(false);
      },
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        className="size-9 shrink-0 rounded-full"
        onClick={playing ? stop : play}
        disabled={singleMoment}
        aria-label={playing ? "Pause replay" : "Play replay"}
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
      <input
        type="range"
        min={start}
        max={Math.max(end, start + 1)}
        step={1}
        value={value}
        disabled={singleMoment}
        onChange={(e) => {
          stop();
          onChange(Number(e.target.value));
        }}
        aria-label="Replay time"
        className="h-1.5 min-w-0 flex-1 cursor-pointer accent-sage"
      />
      <LocalTime iso={new Date(value).toISOString()} withDate className="shrink-0 text-xs text-muted-foreground tabular-nums" />
    </div>
  );
}
