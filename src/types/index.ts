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
  /** Clicked element description (tracker v3+). */
  target?: string;
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
  /** Layout width (viewport minus scrollbar); missing on clicks recorded before it existed. */
  layout_w?: number;
  /** Clicked element description (tracker v3+). */
  target?: string;
  timestamp: string;
};

export type HeatmapData = {
  page_url: string;
  clicks: ClickPoint[];
};

/** One exact viewport width a page was clicked at (heatmap width chips). */
export type ClickWidth = {
  viewport_w: number;
  clicks: number;
  /** Layout width to render the preview at (most common non-empty layout_w of the group, else viewport_w). */
  render_w: number;
  /** Tallest page_h among the group's clicks. */
  page_h: number;
};

export type PageSummary = {
  page_url: string;
  clicks: number;
  views: number;
};
