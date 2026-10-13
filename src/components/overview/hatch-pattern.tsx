/** SVG version of the `hatch` utility (DESIGN.md §3) for Recharts fills: 1px sage lines at 35% every 6px, 45°. */
export function HatchPattern({ id }: { id: string }) {
  return (
    <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="6" stroke="var(--sage)" strokeOpacity="0.35" strokeWidth="1" />
    </pattern>
  );
}
