import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDashboard } from "@/components/DashboardContext";
import { Stop as RouteStop } from "@/types";

export const Route = createFileRoute("/stops")({
  head: () => ({
    meta: [
      { title: "Stops — RouteForge" },
      { name: "description", content: "Manage all delivery stop locations." },
    ],
  }),
  component: StopsPage,
});

// ─── Local types ──────────────────────────────────────────────────────────────

type Zone = "North" | "East" | "South" | "West" | "Centre";

interface LocalStop {
  id: number;
  name: string;
  address: string;
  zone: Zone;
  lat: number;
  lng: number;
  visits: number;
  lastUsed: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const initialStops: LocalStop[] = [
  { id: 1,  name: "Riverside Pharmacy",  address: "Fort Kochi, Kochi",              zone: "South",  lat: 10.0269, lng: 76.3050, visits: 28, lastUsed: "1 day ago"  },
  { id: 2,  name: "Green Valley Cafe",   address: "Marine Drive, Kochi",            zone: "West",   lat: 9.9700,  lng: 76.2900, visits: 14, lastUsed: "3 days ago" },
  { id: 3,  name: "North Tower B",       address: "InfoPark, Kakkanad, Kochi",      zone: "North",  lat: 10.0150, lng: 76.3550, visits: 31, lastUsed: "Today"      },
  { id: 4,  name: "City Market",         address: "MG Road, Kochi",                 zone: "Centre", lat: 9.9680,  lng: 76.3010, visits: 47, lastUsed: "2 days ago" },
  { id: 5,  name: "Elm Court",           address: "Kaloor, Kochi",                  zone: "East",   lat: 9.9312,  lng: 76.2673, visits: 9,  lastUsed: "6 days ago" },
  { id: 6,  name: "Lakeside Mall",       address: "Lulu Mall, Edappally, Kochi",    zone: "East",   lat: 9.9667,  lng: 76.2422, visits: 22, lastUsed: "4 days ago" },
  { id: 7,  name: "Park Gate",           address: "Palarivattom, Kochi",            zone: "North",  lat: 9.9300,  lng: 76.2600, visits: 18, lastUsed: "2 days ago" },
  { id: 8,  name: "Central Post Office", address: "Ernakulam South, Kochi",         zone: "Centre", lat: 9.9400,  lng: 76.2700, visits: 53, lastUsed: "Today"      },
  { id: 9,  name: "West Depot",          address: "Kaloor Junction, Kochi",         zone: "West",   lat: 9.9500,  lng: 76.2800, visits: 6,  lastUsed: "8 days ago" },
  { id: 10, name: "Station Square",      address: "Vytilla Mobility Hub, Kochi",    zone: "Centre", lat: 9.9600,  lng: 76.2900, visits: 39, lastUsed: "1 day ago"  },
  { id: 11, name: "High Street Bakery",  address: "Broadway, Kochi",                zone: "South",  lat: 9.9700,  lng: 76.3000, visits: 17, lastUsed: "5 days ago" },
  { id: 12, name: "Harbour View Flats",  address: "Willingdon Island, Kochi",       zone: "East",   lat: 9.9800,  lng: 76.3100, visits: 11, lastUsed: "3 days ago" },
];

const zoneColors: Record<Zone, { bg: string; color: string }> = {
  North:  { bg: "#DBEAFE", color: "#1E40AF" },
  East:   { bg: "#D1FAE5", color: "#065F46" },
  South:  { bg: "#FEF3C7", color: "#92400E" },
  West:   { bg: "#EDE9FE", color: "#4C1D95" },
  Centre: { bg: "#FFE4E6", color: "#9F1239" },
};

const allZones: Zone[] = ["North", "East", "South", "West", "Centre"];

// ─── Page ─────────────────────────────────────────────────────────────────────

function StopsPage() {
  const { setPageTitle, setPageSubtitle, setHeaderAction, setStops, showToast } = useDashboard();

  const [stopsList,    setStopsList]    = useState<LocalStop[]>(initialStops);
  const [selected,     setSelected]     = useState<LocalStop | null>(null);
  const [search,       setSearch]       = useState("");
  const [zoneFilter,   setZoneFilter]   = useState<Zone | "All">("All");
  // Fix 10 — edit state
  const [isEditing,    setIsEditing]    = useState(false);
  const [editingName,  setEditingName]  = useState("");

  useEffect(() => {
    setPageTitle("Stops");
    setPageSubtitle("All delivery locations");
    setHeaderAction(null);
  }, [setPageTitle, setPageSubtitle, setHeaderAction]);

  const filtered = stopsList.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.address.toLowerCase().includes(search.toLowerCase());
    const matchZone   = zoneFilter === "All" || s.zone === zoneFilter;
    return matchSearch && matchZone;
  });

  // Fix 9 — add selected stop to dashboard route
  const handleAddToRoute = () => {
    if (!selected) return;
    const newStop: RouteStop = {
      id:      Date.now().toString(),
      name:    selected.name,
      address: selected.address,
      lat:     selected.lat,
      lng:     selected.lng,
      eta:     "--",
      isDepot: false,
    };
    setStops(prev => [...prev, newStop]);
    showToast(`${selected.name} added to current route`, "success");
    setSelected(null);
  };

  // Fix 10 — save edited name
  const handleSaveEdit = () => {
    if (!selected) return;
    setStopsList(prev => prev.map(s => s.id === selected.id ? { ...s, name: editingName } : s));
    setSelected(prev => prev ? { ...prev, name: editingName } : null);
    setIsEditing(false);
    showToast("Stop name updated", "success");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", height: "100%", backgroundColor: "var(--rf-bg)", overflow: "hidden" }}>

      {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
      <div style={{ padding: "24px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 600, color: "var(--rf-dark)", margin: 0 }}>All Stops</h1>
            <p style={{ fontSize: "13px", color: "var(--rf-muted)", marginTop: "2px" }}>{stopsList.length} locations</p>
          </div>
          {/* Fix 8 — Add stop button */}
          <button
            onClick={() => showToast("Go to the dashboard map and search for an address to add a real stop", "info")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--rf-primary)", color: "white", border: "none", borderRadius: "8px", padding: "7px 16px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
          >
            <i className="ti ti-plus" style={{ fontSize: "14px" }} />
            Add stop
          </button>
        </div>

        {/* Search + zone filter */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <i className="ti ti-search" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "var(--rf-muted)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search by name or address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", border: "1px solid var(--rf-border)", borderRadius: "8px", padding: "8px 12px 8px 32px", fontSize: "13px", color: "var(--rf-text)", background: "white", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <select
            value={zoneFilter}
            onChange={e => setZoneFilter(e.target.value as Zone | "All")}
            style={{ border: "1px solid var(--rf-border)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "var(--rf-muted)", background: "white", cursor: "pointer", outline: "none" }}
          >
            <option value="All">All zones</option>
            {allZones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
          <thead>
            <tr>
              {["Name", "Address", "Zone", "Visits", "Last Used"].map(col => (
                <th key={col} style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--rf-muted)", padding: "0 12px 8px", textAlign: col === "Visits" ? "right" : "left" }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(stop => {
              const isSel = selected?.id === stop.id;
              const bdr   = `0.5px solid ${isSel ? "var(--rf-primary)" : "var(--rf-border)"}`;
              return (
                <tr key={stop.id} onClick={() => { setSelected(isSel ? null : stop); setIsEditing(false); }} style={{ cursor: "pointer" }}>
                  <td style={{ padding: "12px", background: "white", borderRadius: "10px 0 0 10px", border: bdr, borderRight: "none", fontSize: "13px", fontWeight: 500, color: "var(--rf-dark)", whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <i className="ti ti-map-pin" style={{ color: "var(--rf-primary)", fontSize: "13px" }} />
                      {stop.name}
                    </span>
                  </td>
                  <td style={{ padding: "12px", background: "white", border: bdr, borderLeft: "none", borderRight: "none", fontSize: "13px", color: "var(--rf-muted)", whiteSpace: "nowrap" }}>{stop.address}</td>
                  <td style={{ padding: "12px", background: "white", border: bdr, borderLeft: "none", borderRight: "none" }}>
                    <span style={{ background: zoneColors[stop.zone].bg, color: zoneColors[stop.zone].color, borderRadius: "99px", padding: "2px 9px", fontSize: "11px", fontWeight: 500 }}>{stop.zone}</span>
                  </td>
                  <td style={{ padding: "12px", background: "white", border: bdr, borderLeft: "none", borderRight: "none", fontSize: "13px", color: "var(--rf-dark)", textAlign: "right", fontWeight: 500 }}>{stop.visits}</td>
                  <td style={{ padding: "12px", background: "white", borderRadius: "0 10px 10px 0", border: bdr, borderLeft: "none", fontSize: "12px", color: "var(--rf-muted)", whiteSpace: "nowrap" }}>{stop.lastUsed}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--rf-muted)", fontSize: "13px" }}>No stops match your search.</div>
        )}
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
      <div style={{ borderLeft: "1px solid var(--rf-border)", position: "relative", overflow: "hidden" }}>
        <div style={{ width: "100%", height: "100%", background: "#FFEDD5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!selected && <p style={{ fontSize: "13px", color: "rgba(67,20,7,0.35)", textAlign: "center", padding: "0 24px" }}>Select a stop to preview location</p>}
        </div>

        {/* Slide-up detail panel */}
        <div style={{ position: "absolute", bottom: selected ? 0 : "-100%", left: 0, right: 0, background: "white", borderRadius: "16px 16px 0 0", padding: "20px", borderTop: "1px solid var(--rf-border)", transition: "bottom 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 -4px 24px rgba(67,20,7,0.08)" }}>
          {selected && (
            <>
              <div style={{ width: "32px", height: "4px", background: "var(--rf-border)", borderRadius: "99px", margin: "0 auto 16px" }} />

              {/* Fix 10 — editable name */}
              {isEditing ? (
                <input
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  autoFocus
                  style={{ fontSize: "16px", fontWeight: 600, color: "var(--rf-dark)", border: "1px solid var(--rf-primary)", borderRadius: "6px", padding: "4px 8px", width: "100%", outline: "none", marginBottom: "4px", boxSizing: "border-box" }}
                />
              ) : (
                <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--rf-dark)", marginBottom: "4px" }}>{selected.name}</p>
              )}
              <p style={{ fontSize: "13px", color: "var(--rf-muted)", marginBottom: "16px" }}>{selected.address}</p>

              <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                {[{ icon: "ti-repeat", text: `${selected.visits} visits total` }, { icon: "ti-clock", text: `Last: ${selected.lastUsed}` }].map(p => (
                  <span key={p.icon} style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "var(--rf-surface)", border: "0.5px solid var(--rf-border)", borderRadius: "99px", padding: "5px 12px", fontSize: "12px", color: "var(--rf-muted)" }}>
                    <i className={`ti ${p.icon}`} style={{ fontSize: "12px" }} />{p.text}
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {/* Fix 9 — Add to route */}
                <button onClick={handleAddToRoute} style={{ flex: 1, background: "var(--rf-primary)", color: "white", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                  Add to route
                </button>

                {/* Fix 10 — Edit / Save / Cancel */}
                {isEditing ? (
                  <>
                    <button onClick={() => { setIsEditing(false); setEditingName(""); }} style={{ flex: 1, background: "transparent", color: "var(--rf-muted)", border: "1px solid var(--rf-border)", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", cursor: "pointer" }}>
                      Cancel
                    </button>
                    <button onClick={handleSaveEdit} style={{ flex: 1, background: "var(--rf-accent)", color: "white", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                      Save
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setEditingName(selected.name); setIsEditing(true); }} style={{ flex: 1, background: "transparent", color: "var(--rf-dark)", border: "1px solid var(--rf-border)", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                    Edit
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
