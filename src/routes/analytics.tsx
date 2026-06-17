import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboard } from "@/components/DashboardContext";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — RouteForge" },
      { name: "description", content: "View route efficiency metrics, fuel savings, and driver performance." },
    ],
  }),
  component: AnalyticsPage,
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const routeDates = ["Jun 1","Jun 2","Jun 4","Jun 5","Jun 7","Jun 8","Jun 10","Jun 11","Jun 13","Jun 14"];

const timeSavedData = [18, 41, 12, 33, 27, 19, 44, 22, 31, 15].map((v, i) => ({
  date: routeDates[i],
  saved: v,
}));

const distSavedData = [12.1, 18.4, 9.2, 21.3, 16.8, 11.4, 24.2, 14.9, 19.6, 8.7].map((v, i) => ({
  date: routeDates[i],
  km: v,
}));

const heatmapValues = {
  North: [3, 5, 7, 4],
  East:  [8, 6, 9, 7],
  South: [2, 4, 3, 5],
  West:  [6, 7, 5, 8],
};
const heatmapZones = ["North", "East", "South", "West"] as const;
const heatmapWeeks = ["Wk1", "Wk2", "Wk3", "Wk4"];

function heatColor(v: number) {
  if (v >= 9) return "#9A3412";
  if (v >= 6) return "#EA580C";
  if (v >= 3) return "#FB923C";
  return "#FFEDD5";
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

const kpiCards = [
  { label: "Routes optimized", value: "24",     delta: "+3 this week",    green: true  },
  { label: "Total time saved", value: "8h 42m", delta: "+41 min this week", green: true  },
  { label: "Total km saved",   value: "312 km", delta: "+34 km this week",  green: true  },
  { label: "Avg stops/route",  value: "9.4",    delta: "stable",           green: false },
];

function KpiCard({ label, value, delta, green }: (typeof kpiCards)[0]) {
  return (
    <div
      style={{
        flex: 1,
        background: "white",
        border: "1px solid var(--rf-border)",
        borderRadius: "12px",
        padding: "14px 16px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "var(--rf-muted)",
          marginBottom: "6px",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: "26px", fontWeight: 700, color: "var(--rf-dark)", lineHeight: 1, marginBottom: "6px" }}>
        {value}
      </p>
      <p style={{ fontSize: "12px", color: green ? "var(--rf-accent)" : "var(--rf-muted)" }}>
        {delta}
      </p>
    </div>
  );
}

// ─── Chart Card wrapper ───────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  children,
  style,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid var(--rf-border)",
        padding: "20px",
        ...style,
      }}
    >
      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--rf-dark)", marginBottom: subtitle ? "2px" : "16px" }}>
        {title}
      </p>
      {subtitle && (
        <p style={{ fontSize: "12px", color: "var(--rf-muted)", marginBottom: "16px" }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function BarTooltip({ active, payload }: { active?: boolean; payload?: {value: number}[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--rf-dark)", color: "white", padding: "6px 12px", borderRadius: "8px", fontSize: "12px" }}>
      Saved: {payload[0].value} min
    </div>
  );
}

function LineTooltip({ active, payload }: { active?: boolean; payload?: {value: number}[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--rf-dark)", color: "white", padding: "6px 12px", borderRadius: "8px", fontSize: "12px" }}>
      {payload[0].value} km saved
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct, color = "var(--rf-accent)" }: { pct: number; color?: string }) {
  return (
    <div style={{ height: "6px", background: "var(--rf-surface)", borderRadius: "99px", marginTop: "10px", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "99px" }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AnalyticsPage() {
  const { setPageTitle, setPageSubtitle, setHeaderAction } = useDashboard();

  useEffect(() => {
    setPageTitle("Analytics");
    setPageSubtitle("Performance insights");
    setHeaderAction(null);
  }, [setPageTitle, setPageSubtitle, setHeaderAction]);

  return (
    <div
      style={{
        height: "100%",
        backgroundColor: "var(--rf-bg)",
        padding: "24px",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* ── SECTION 1: KPI row ─────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {kpiCards.map((c) => (
          <KpiCard key={c.label} {...c} />
        ))}
      </div>

      {/* ── SECTION 2: Bar chart — time saved ──────────────────────────── */}
      <ChartCard
        title="Time saved per route"
        subtitle="Minutes saved vs naive order"
        style={{ marginBottom: "24px" }}
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={timeSavedData} barCategoryGap="35%" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#7C2D12" }}
              axisLine={{ stroke: "#FDBA74" }}
              tickLine={false}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(234,88,12,0.06)" }} />
            <Bar dataKey="saved" fill="#EA580C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── SECTION 3: Two-column ──────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        {/* Left — Line chart */}
        <ChartCard
          title="Distance saved per route (km)"
          style={{ flex: 1 }}
        >
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={distSavedData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#7C2D12" }}
                axisLine={{ stroke: "#FDBA74" }}
                tickLine={false}
              />
              <Tooltip content={<LineTooltip />} />
              <Line
                type="monotone"
                dataKey="km"
                stroke="#16A34A"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Right — Heatmap */}
        <ChartCard
          title="Delivery area heatmap"
          subtitle="Stop frequency by zone this month"
          style={{ flex: 1 }}
        >
          {/* Week labels */}
          <div style={{ display: "flex", marginLeft: "52px", gap: "4px", marginBottom: "4px" }}>
            {heatmapWeeks.map((w) => (
              <div key={w} style={{ flex: 1, textAlign: "center", fontSize: "11px", color: "var(--rf-muted)", fontWeight: 500 }}>
                {w}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {heatmapZones.map((zone) => (
              <div key={zone} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {/* Zone label */}
                <div style={{ width: "48px", fontSize: "11px", fontWeight: 500, color: "var(--rf-muted)", textAlign: "right", paddingRight: "4px", flexShrink: 0 }}>
                  {zone}
                </div>
                {/* Cells */}
                {heatmapValues[zone].map((v, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: "36px",
                      borderRadius: "4px",
                      background: heatColor(v),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: v > 5 ? "white" : "var(--rf-dark)",
                    }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── SECTION 4: Savings breakdown ───────────────────────────────── */}
      <ChartCard title="What RouteForge saved you">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0" }}>
          {[
            { label: "Fuel cost",      big: "£47.20 saved",      sub: "at £0.15/km",          pct: 70 },
            { label: "Driver hours",   big: "8h 42m recovered",   sub: "across 24 routes",      pct: 65 },
            { label: "CO₂ emissions",  big: "78 kg less",         sub: "at 250 g/km average",   pct: 55 },
          ].map((col, i) => (
            <div
              key={col.label}
              style={{
                padding: "0 24px",
                borderRight: i < 2 ? "1px solid var(--rf-border)" : "none",
                paddingLeft: i === 0 ? "0" : "24px",
              }}
            >
              <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--rf-muted)", marginBottom: "8px" }}>
                {col.label}
              </p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--rf-accent)", lineHeight: 1, marginBottom: "4px" }}>
                {col.big}
              </p>
              <p style={{ fontSize: "13px", color: "var(--rf-muted)" }}>{col.sub}</p>
              <ProgressBar pct={col.pct} />
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
