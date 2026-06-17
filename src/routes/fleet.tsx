import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDashboard } from "@/components/DashboardContext";

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Fleet — RouteForge" },
      { name: "description", content: "Manage your delivery drivers and vehicles." },
    ],
  }),
  component: FleetPage,
});

type DriverStatus = "On route" | "Active" | "Off duty";

interface Driver {
  id: number;
  initials: string;
  name: string;
  role: string;
  status: DriverStatus;
  vehicle: string;
  plate: string;
  routes: number;
  joined: string;
  currentRoute?: string;
  currentProgress?: number;
  currentStops?: string;
  lastRoute?: string;
}

interface Vehicle {
  id: number;
  name: string;
  type: string;
  driver: string;
  status: DriverStatus;
  lastUsed: string;
}

const drivers: Driver[] = [
  { id: 1, initials: "JO", name: "James Okafor",  role: "Driver",        status: "On route",  vehicle: "Van",         plate: "KL 07 R 1247", routes: 127, joined: "Mar 2025", currentRoute: "Morning delivery run", currentProgress: 27, currentStops: "3 of 11 stops done" },
  { id: 2, initials: "PM", name: "Priya Mehta",   role: "Driver",        status: "Active",    vehicle: "Transit",     plate: "KL 07 S 4892", routes: 89,  joined: "Jun 2025", lastRoute: "Jun 13 · saved 22 min" },
  { id: 3, initials: "DS", name: "Dan Sullivan",  role: "Senior Driver", status: "Off duty",  vehicle: "Sprinter",    plate: "KL 07 M 7631", routes: 214, joined: "Jan 2024", lastRoute: "Jun 12 · saved 31 min" },
  { id: 4, initials: "SN", name: "Sara Nair",     role: "Driver",        status: "Active",    vehicle: "Courier bike", plate: "N/A",          routes: 56,  joined: "Sep 2025", lastRoute: "Jun 14 · saved 18 min" },
];

const vehicles: Vehicle[] = [
  { id: 1, name: "Van KL 07 R 1247",       type: "Cargo van",   driver: "James Okafor", status: "On route",  lastUsed: "Today"      },
  { id: 2, name: "Transit KL 07 S 4892",   type: "Transit van", driver: "Priya Mehta",  status: "Active",    lastUsed: "Today"      },
  { id: 3, name: "Sprinter KL 07 M 7631",  type: "Sprinter",    driver: "Dan Sullivan", status: "Off duty",  lastUsed: "2 days ago" },
  { id: 4, name: "Courier bike (N/A)",     type: "Bicycle",     driver: "Sara Nair",    status: "Active",    lastUsed: "Today"      },
];

const statusStyle: Record<DriverStatus, React.CSSProperties> = {
  "On route": { background: "rgba(234,88,12,0.1)",   color: "var(--rf-primary)", border: "1px solid rgba(234,88,12,0.3)"  },
  "Active":   { background: "rgba(22,163,74,0.1)",   color: "var(--rf-accent)",  border: "1px solid rgba(22,163,74,0.3)"  },
  "Off duty": { background: "rgba(124,45,18,0.08)",  color: "var(--rf-muted)",   border: "1px solid rgba(124,45,18,0.2)"  },
};

const summaryCards = [
  { label: "Active drivers", value: 3, borderColor: "var(--rf-accent)"  },
  { label: "On route now",   value: 1, borderColor: "var(--rf-primary)" },
  { label: "Off duty",       value: 2, borderColor: "var(--rf-muted)"   },
];

function StatusBadge({ status }: { status: DriverStatus }) {
  return (
    <span style={{ ...statusStyle[status], borderRadius: "99px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function DriverCard({ driver }: { driver: Driver }) {
  return (
    <div style={{ background: "white", borderRadius: "14px", border: "0.5px solid var(--rf-border)", padding: "18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--rf-surface)", color: "var(--rf-primary)", fontSize: "15px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1.5px solid var(--rf-border)" }}>{driver.initials}</div>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--rf-dark)", margin: 0 }}>{driver.name}</p>
            <p style={{ fontSize: "12px", color: "var(--rf-muted)", marginTop: "1px" }}>{driver.role}</p>
          </div>
        </div>
        <StatusBadge status={driver.status} />
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
        {[`${driver.vehicle} · ${driver.plate}`, `${driver.routes} routes`, `Joined ${driver.joined}`].map(t => (
          <span key={t} style={{ background: "var(--rf-surface)", borderRadius: "99px", padding: "4px 12px", fontSize: "12px", color: "var(--rf-muted)" }}>{t}</span>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--rf-border)", paddingTop: "12px", marginTop: "12px" }}>
        {driver.status === "On route" ? (
          <>
            <p style={{ fontSize: "12px", color: "var(--rf-primary)", display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
              <i className="ti ti-route" style={{ fontSize: "13px" }} />
              Currently: {driver.currentRoute} · {driver.currentStops}
            </p>
            <div style={{ height: "4px", background: "var(--rf-surface)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${driver.currentProgress}%`, background: "var(--rf-primary)", borderRadius: "99px" }} />
            </div>
          </>
        ) : (
          <p style={{ fontSize: "12px", color: "var(--rf-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
            <i className="ti ti-history" style={{ fontSize: "13px" }} />
            Last route: {driver.lastRoute}
          </p>
        )}
      </div>
    </div>
  );
}

function FleetPage() {
  const { setPageTitle, setPageSubtitle, setHeaderAction, showToast } = useDashboard();

  // Fix 11 — Add driver modal state
  const [modalOpen,    setModalOpen]    = useState(false);
  const [driverName,   setDriverName]   = useState("");
  const [driverVehicle,setDriverVehicle]= useState("");
  const [driverRole,   setDriverRole]   = useState("Driver");

  useEffect(() => {
    setPageTitle("Fleet");
    setPageSubtitle("Manage your drivers and vehicles");
    setHeaderAction(null);
  }, [setPageTitle, setPageSubtitle, setHeaderAction]);

  const handleAddDriver = () => {
    if (!driverName.trim()) return;
    showToast(`${driverName} added to fleet (mock)`, "success");
    setModalOpen(false);
    setDriverName("");
    setDriverVehicle("");
    setDriverRole("Driver");
  };

  const closeModal = () => {
    setModalOpen(false);
    setDriverName("");
    setDriverVehicle("");
    setDriverRole("Driver");
  };

  return (
    <div style={{ height: "100%", backgroundColor: "var(--rf-bg)", padding: "24px", overflowY: "auto", boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, color: "var(--rf-dark)", margin: 0 }}>Fleet</h1>
          <p style={{ fontSize: "13px", color: "var(--rf-muted)", marginTop: "2px" }}>3 active · 1 on route</p>
        </div>
        {/* Fix 11 — opens modal */}
        <button onClick={() => setModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--rf-primary)", color: "white", border: "none", borderRadius: "8px", padding: "7px 16px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
          <i className="ti ti-user-plus" style={{ fontSize: "14px" }} />Add driver
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        {summaryCards.map(c => (
          <div key={c.label} style={{ flex: 1, background: "white", borderRadius: "12px", border: "1px solid var(--rf-border)", borderLeft: `3px solid ${c.borderColor}`, padding: "14px 16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--rf-muted)", marginBottom: "6px" }}>{c.label}</p>
            <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--rf-dark)", lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Driver cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: "14px", marginBottom: "28px" }}>
        {drivers.map(d => <DriverCard key={d.id} driver={d} />)}
      </div>

      {/* Vehicles table */}
      <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--rf-dark)", margin: "0 0 12px" }}>Vehicles</h2>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
        <thead>
          <tr>{["Vehicle","Type","Driver","Status","Last Used"].map(col => (
            <th key={col} style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--rf-muted)", padding: "0 12px 8px", textAlign: "left" }}>{col}</th>
          ))}</tr>
        </thead>
        <tbody>
          {vehicles.map(v => {
            const cells = [v.name, v.type, v.driver, null, v.lastUsed];
            return (
              <tr key={v.id}>
                {cells.map((cell, ci) => (
                  <td key={ci} style={{ padding: "12px", background: "white", border: "0.5px solid var(--rf-border)", borderLeft: ci === 0 ? "0.5px solid var(--rf-border)" : "none", borderRight: ci === cells.length - 1 ? "0.5px solid var(--rf-border)" : "none", borderRadius: ci === 0 ? "10px 0 0 10px" : ci === cells.length - 1 ? "0 10px 10px 0" : "0", fontSize: "13px", color: ci === 0 ? "var(--rf-dark)" : "var(--rf-muted)", fontWeight: ci === 0 ? 500 : 400, whiteSpace: "nowrap" }}>
                    {ci === 3 ? <StatusBadge status={v.status} /> : cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Fix 11 — Add driver modal */}
      {modalOpen && (
        <div onClick={closeModal} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: "16px", padding: "28px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--rf-dark)", margin: 0 }}>Add driver</h2>
              <button onClick={closeModal} style={{ background: "transparent", border: "none", fontSize: "20px", color: "var(--rf-muted)", cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "20px" }}>
              {[
                { label: "Full name",  value: driverName,    onChange: setDriverName,    placeholder: "e.g. James Okafor",  type: "input"  },
                { label: "Vehicle",    value: driverVehicle, onChange: setDriverVehicle, placeholder: "e.g. Van LX19 OPQ",  type: "input"  },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rf-muted)", display: "block", marginBottom: "4px" }}>{f.label}</label>
                  <input value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} style={{ width: "100%", border: "1px solid var(--rf-border)", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", color: "var(--rf-dark)", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rf-muted)", display: "block", marginBottom: "4px" }}>Role</label>
                <select value={driverRole} onChange={e => setDriverRole(e.target.value)} style={{ width: "100%", border: "1px solid var(--rf-border)", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", color: "var(--rf-dark)", outline: "none", background: "white", boxSizing: "border-box" }}>
                  <option>Driver</option>
                  <option>Senior Driver</option>
                  <option>Courier</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button onClick={closeModal} style={{ flex: 1, border: "1px solid var(--rf-border)", borderRadius: "8px", padding: "8px 18px", fontSize: "14px", color: "var(--rf-muted)", background: "transparent", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAddDriver} style={{ flex: 1, background: "var(--rf-primary)", color: "white", border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>Add driver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
