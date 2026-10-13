"use client";

import { useState } from "react";
import { EventTimeline } from "@/components/sessions/event-timeline";
import { PagePreview } from "@/components/sessions/page-preview";
import { SessionSummary } from "@/components/sessions/session-summary";
import { Card } from "@/components/ui/card";
import type { EventDto } from "@/types";

type JourneyViewProps = {
  sessionId: string;
  events: EventDto[];
};

/** Journey detail: summary + timeline on the left, preview of the selected step's page on the right. */
export function JourneyView({ sessionId, events }: JourneyViewProps) {
  const [selectedId, setSelectedId] = useState(events[0].id);
  const selected = events.find((e) => e.id === selectedId) ?? events[0];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-5">
        <SessionSummary sessionId={sessionId} events={events} />
        <Card>
          <h2 className="text-lg font-medium">Journey</h2>
          <EventTimeline events={events} selectedId={selected.id} onSelect={setSelectedId} />
        </Card>
      </div>
      <PagePreview event={selected} className="lg:sticky lg:top-4 lg:col-span-7 lg:self-start" />
    </div>
  );
}
