import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDashboard } from "@/components/DashboardContext";
import { kochiDefaultStops } from "@/data/defaultStops";

export const Route = createFileRoute("/routes")({
  head: () => ({
    meta: [
      { title: "Saved Routes — RouteForge" },
      { name: "description", content: "View and manage past optimised delivery routes." },
    ],
  }),
  component: RoutesPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouteCard {
  id: number;
  date: string;
  status: "Completed" | "Draft";
  name: string;
  stops: number;
  km: number;
  duration: string;
  saved: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockRoutes: RouteCard[] = [
  { id: 1, date: "2026-06-14", status: "Completed", name: "Morning delivery run",   stops: 11, km: 34.2, duration: "1h 22m", saved: "18 min" },
  { id: 2, date: "2026-06-12", status: "Completed", name: "North district route",   stops: 9,  km: 28.7, duration: "1h 08m", saved: "24 min" },
  { id: 3, date: "2026-06-10", status: "Completed", name: "South loop — express",   stops: 13, km: 41.5, duration: "1h 47m", saved: "31 min" },
  { id: 4, date: "2026-06-08", status: "Draft",     name: "East side pilot run",    stops: 7,  km: 19.3, duration: "0h 52m", saved: "11 min" },
  { id: 5, date: "2026-06-05", status: "Completed", name: "Weekend bulk delivery",  stops: 15, km: 52.1, duration: "2h 14m", saved: "38 min" },
  { id: 6, date: "2026-06-01", status: "Draft",     name: "City centre afternoon",  stops: 8,  km: 22.9, duration: "1h 01m", saved: "14 min" },
];

const mockLoadStops = kochiDefaultStops;

const summaryStats = [
  { label: "Total routes",   value: "6"      },
  { label: "Avg time saved", value: "22 min" },
  { label: "Total km saved", value: "187 km" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1, background: "var(--rf-surface)", border: "0.5px solid var(--rf-border)", borderRadius: "10px", padding: "12px 16px" }}>
      <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--rf-muted)", marginBottom: "4px" }}>{label}</p>
      <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--rf-dark)", lineHeight: 1 }}>{value}</p>
    </div>
  );
}

function PillButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background:   active ? "var(--rf-primary)" : "var(--rf-surface)",
        color:        active ? "white" : "var(--rf-muted)",
        border:       "none",
        borderRadius: "99px",
        padding:      "4px 14px",
        fontSize:     "12px",
        fontWeight:   active ? 500 : 400,
        cursor:       "pointer",
        transition:   "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

function RouteCardItem({
  card,
  onLoad,
}: {
  card: RouteCard;
  onLoad: (card: RouteCard) => void;
}) {
  const isCompleted = card.status === "Completed";
  const displayDate = new Date(card.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ background: "white", borderRadius: "14px", border: "1px solid var(--rf-border)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* ROW 1 — date + status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", background: "var(--rf-surface)", color: "var(--rf-muted)", padding: "3px 10px", borderRadius: "99px" }}>{displayDate}</span>
        <span style={{ fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "99px", background: isCompleted ? "#DCFCE7" : "#FEF3C7", color: isCompleted ? "#166534" : "#92400E" }}>{card.status}</span>
      </div>

      {/* ROW 2 — name */}
      <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--rf-dark)", margin: 0 }}>{card.name}</p>

      {/* ROW 3 — pills */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {[
          { icon: "ti-map-pin", text: `${card.stops} stops` },
          { icon: "ti-road",    text: `${card.km} km`       },
          { icon: "ti-clock",   text: card.duration         },
        ].map(p => (
          <span key={p.icon} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--rf-surface)", borderRadius: "99px", padding: "4px 12px", fontSize: "12px", color: "var(--rf-muted)" }}>
            <i className={`ti ${p.icon}`} style={{ fontSize: "12px" }} />{p.text}
          </span>
        ))}
      </div>

      {/* ROW 4 — savings + actions */}
      <div style={{ borderTop: "1px solid var(--rf-border)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--rf-accent)" }}>
          <i className="ti ti-trending-down" style={{ fontSize: "13px" }} />
          Saved {card.saved} vs naive
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          {/* Fix 6 — View map */}
          <button
            onClick={() => onLoad(card)}
            style={{ border: "1px solid var(--rf-border)", borderRadius: "8px", padding: "5px 12px", fontSize: "12px", color: "var(--rf-dark)", background: "transparent", cursor: "pointer" }}
          >
            View map
          </button>
          {/* Fix 5 — Load route */}
          <button
            onClick={() => onLoad(card)}
            style={{ background: "var(--rf-primary)", border: "none", borderRadius: "8px", padding: "5px 12px", fontSize: "12px", fontWeight: 500, color: "white", cursor: "pointer" }}
          >
            Load route
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function RoutesPage() {
  const { setPageTitle, setPageSubtitle, setHeaderAction, setStops, showToast } = useDashboard();
  const navigate = useNavigate();

  // Fix 3 — controlled search
  const [search,       setSearch]       = useState("");
  // Fix 4 — filter panel
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "Completed" | "Draft">("all");
  const [dateFilter,   setDateFilter]   = useState<"all" | "week" | "month">("all");

  useEffect(() => {
    setPageTitle("Saved routes");
    setPageSubtitle("View and manage past routes");
    setHeaderAction(null);
  }, [setPageTitle, setPageSubtitle, setHeaderAction]);

  // Fixes 5 & 6 — Load route + navigate
  const handleLoadRoute = (card: RouteCard) => {
    setStops(mockLoadStops);
    showToast(`Route loaded: ${card.name}`, "success");
    navigate({ to: "/dashboard" });
  };

  // Combined filter (Fix 3 + Fix 4)
  const filteredRoutes = mockRoutes
    .filter(r => search === "" || r.name.toLowerCase().includes(search.toLowerCase()))
    .filter(r => statusFilter === "all" || r.status === statusFilter)
    .filter(r => {
      if (dateFilter === "all") return true;
      const date = new Date(r.date);
      const now  = new Date();
      if (dateFilter === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      }
      if (dateFilter === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return date >= monthAgo;
      }
      return true;
    });

  return (
    <div style={{ height: "100%", backgroundColor: "var(--rf-bg)", padding: "24px", overflowY: "auto", boxSizing: "border-box" }}>
      {/* Summary stat row */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {summaryStats.map(s => <SummaryStat key={s.label} label={s.label} value={s.value} />)}
      </div>

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: filterOpen ? "12px" : "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, color: "var(--rf-dark)", margin: 0 }}>Saved Routes</h1>
          <p style={{ fontSize: "13px", color: "var(--rf-muted)", marginTop: "2px" }}>6 routes · last 30 days</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Fix 3 — controlled search */}
          <input
            type="text"
            placeholder="Search routes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: "white", border: "1px solid var(--rf-border)", borderRadius: "8px", padding: "7px 12px", fontSize: "13px", width: "220px", color: "var(--rf-text)", outline: "none" }}
          />
          {/* Fix 4 — filter toggle */}
          <button
            onClick={() => setFilterOpen(p => !p)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid var(--rf-border)", borderRadius: "8px", padding: "7px 12px", fontSize: "13px", color: filterOpen ? "var(--rf-primary)" : "var(--rf-muted)", background: filterOpen ? "var(--rf-surface)" : "white", cursor: "pointer" }}
          >
            <i className={`ti ${filterOpen ? "ti-x" : "ti-filter"}`} style={{ fontSize: "14px" }} />
            {filterOpen ? "Close" : "Filter"}
          </button>
        </div>
      </div>

      {/* Fix 4 — filter panel */}
      {filterOpen && (
        <div style={{ background: "white", border: "1px solid var(--rf-border)", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--rf-muted)", width: "80px" }}>Status</span>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["all", "Completed", "Draft"] as const).map(v => (
                <PillButton key={v} label={v === "all" ? "All" : v} active={statusFilter === v} onClick={() => setStatusFilter(v)} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--rf-muted)", width: "80px" }}>Date range</span>
            <div style={{ display: "flex", gap: "6px" }}>
              {([{ v: "all", l: "All time" }, { v: "week", l: "This week" }, { v: "month", l: "This month" }] as const).map(({ v, l }) => (
                <PillButton key={v} label={l} active={dateFilter === v} onClick={() => setDateFilter(v)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cards grid */}
      {filteredRoutes.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "14px" }}>
          {filteredRoutes.map(card => (
            <RouteCardItem key={card.id} card={card} onLoad={handleLoadRoute} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--rf-muted)", fontSize: "13px" }}>
          No routes match your search.
        </div>
      )}
    </div>
  );
}
