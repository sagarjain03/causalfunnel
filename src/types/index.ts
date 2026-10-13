export type EventType = "page_view" | "click";

/** An event as returned by the API (dates as ISO strings). */
export type EventDto = {
  id: string;
  session_id: string;
  event_type: EventType;
  page_url: string;
  timestamp: string;
  received_at: string;
  x?: number;
  y?: number;
  viewport_w?: number;
  viewport_h?: number;
  page_h?: number;
  referrer?: string;
  user_agent?: string;
};

export type SessionSummary = {
  session_id: string;
  event_count: number;
  click_count: number;
  page_view_count: number;
  first_seen: string;
  last_seen: string;
  pages: string[];
  /** Any event of the session is on a page ending in /checkout.html. */
  reached_checkout: boolean;
  /** page_url of each page_view in time order, consecutive duplicates collapsed. */
  path: string[];
};

export type SessionsPage = {
  sessions: SessionSummary[];
  nextCursor: string | null;
};

export type ClickPoint = {
  x: number;
  y: number;
  viewport_w: number;
  page_h: number;
};

export type HeatmapData = {
  page_url: string;
  clicks: ClickPoint[];
};

export type PageSummary = {
  page_url: string;
  clicks: number;
  views: number;
};

export type OverviewStats = {
  sessions: number;
  events: number;
  clicks: number;
  pages: number;
};
