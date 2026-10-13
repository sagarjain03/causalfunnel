/** Compact empty state inside an Overview card: one sentence + a link to generate data. */
export function CardEmpty({ message }: { message: string }) {
  return (
    <div className="flex min-h-32 flex-1 flex-col items-center justify-center gap-2 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {/* Plain <a>: /demo is a static file behind a rewrite, not an app route. */}
      <a href="/demo" className="text-sm text-sage hover:underline">
        Open demo store →
      </a>
    </div>
  );
}
