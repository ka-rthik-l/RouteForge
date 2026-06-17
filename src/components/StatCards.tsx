import { useDashboard } from "./DashboardContext";

export function StatCards() {
  const { stops, optimized, distance, duration, saved } = useDashboard();

  const stats = [
    { label: "Total Distance", value: optimized ? distance : "--" },
    { label: "Drive Time",     value: optimized ? duration : "--" },
    { label: "Stops",          value: String(stops.length) },
    { label: "Saved",          value: optimized ? saved    : "--", accent: true },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-2 rounded-lg p-2"
      style={{ backgroundColor: "var(--rf-surface)" }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-md bg-white p-2 flex flex-col justify-between"
          style={{ border: "1px solid var(--rf-border)", minHeight: "56px" }}
        >
          <div
            className="text-[9px] uppercase tracking-wider font-semibold"
            style={{ color: "var(--rf-muted)" }}
          >
            {s.label}
          </div>
          <div
            className="text-sm font-bold mt-1"
            style={{
              color: s.accent && optimized ? "var(--rf-accent)" : "var(--rf-dark)",
            }}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
export default StatCards;
