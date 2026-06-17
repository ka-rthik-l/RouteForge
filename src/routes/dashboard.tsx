import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { MapView } from "@/components/MapView";
import { StopList } from "@/components/StopList";
import { StatCards } from "@/components/StatCards";
import { useDashboard } from "@/components/DashboardContext";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — RouteForge" },
      { name: "description", content: "Plan, optimize, and dispatch delivery routes from the RouteForge dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const {
    stops,
    optimized,
    handleReorder,
    handleRemoveStop,
    requestAddStop,
    addStopFromSearch,
    addStopRequested,
    setStops,
    saved,
    showToast,
    setPageTitle,
    setPageSubtitle,
    setHeaderAction
  } = useDashboard();

  useEffect(() => {
    setPageTitle("Overview");
    setPageSubtitle("Plan and optimize your route");
    setHeaderAction(null);
  }, [setPageTitle, setPageSubtitle, setHeaderAction]);

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ backgroundColor: "var(--rf-bg)" }}>
      {/* Map View Area */}
      <div className="flex-1 h-full relative">
        <MapView 
          stops={stops}
          optimized={optimized}
          onStopMove={(id, lat, lng) => {
            setStops(prev => prev.map(s => 
              s.id === id ? { ...s, lat, lng } : s
            ))
          }}
          showBadge={optimized}
          savedLabel={saved.replace(/^−/, "")}
          addStopRequested={addStopRequested}
          onAddStop={(name, address, lat, lng) => {
            addStopFromSearch(name, address, lat, lng);
            showToast(`${name} added to route`, "success");
          }}
        />
      </div>

      {/* Right Side Panel: StatCards + StopList */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "white",
          borderLeft: "1px solid var(--rf-border)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
        className="h-full overflow-y-auto flex-shrink-0"
      >
        {/* Stat Cards */}
        <StatCards />

        {/* Stop Order List */}
        <div className="flex-1 overflow-hidden">
          <StopList
            stops={stops}
            onReorder={handleReorder}
            onRemoveStop={handleRemoveStop}
            onAddStop={requestAddStop}
          />
        </div>
      </aside>
    </div>
  );
}
