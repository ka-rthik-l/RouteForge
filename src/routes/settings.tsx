import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDashboard } from "@/components/DashboardContext";
import { checkHealth } from "@/utils/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — RouteForge" },
      { name: "description", content: "Configure routing profiles, vehicle constraints, and API parameters." },
    ],
  }),
  component: SettingsPage,
});

// ─── Reusable sub-components ──────────────────────────────────────────────────

function SectionCard({ title, subtitle, children, danger }: { title: string; subtitle?: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{ background: danger ? "rgba(220,38,38,0.04)" : "white", borderRadius: "14px", border: `0.5px solid ${danger ? "rgba(220,38,38,0.2)" : "var(--rf-border)"}`, padding: "20px 24px", marginBottom: "16px" }}>
      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: danger ? "#DC2626" : "var(--rf-dark)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>{title}</p>
        {subtitle && <p style={{ fontSize: "12px", color: "var(--rf-muted)", marginTop: "3px" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, description, children, last }: { label: string; description: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: last ? "none" : "0.5px solid var(--rf-border)", gap: "16px" }}>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--rf-dark)", margin: 0 }}>{label}</p>
        <p style={{ fontSize: "12px", color: "var(--rf-muted)", marginTop: "2px" }}>{description}</p>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function SegmentedControl({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "inline-flex", background: "var(--rf-surface)", borderRadius: "8px", padding: "3px", gap: "2px" }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{ fontSize: "12px", padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: value === opt ? 600 : 400, background: value === opt ? "var(--rf-primary)" : "transparent", color: value === opt ? "white" : "var(--rf-muted)", transition: "all 0.15s ease" }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: "40px", height: "22px", borderRadius: "11px", background: on ? "var(--rf-primary)" : "#D1D5DB", border: "none", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center", justifyContent: on ? "flex-end" : "flex-start", transition: "background 0.2s ease", flexShrink: 0 }}>
      <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

function SettingInput({ value, onChange, width, type = "text" }: { value: string | number; onChange: (v: string) => void; width?: number; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: width ? `${width}px` : "200px", border: "1px solid var(--rf-border)", borderRadius: "6px", padding: "6px 10px", fontSize: "13px", color: "var(--rf-text)", background: "white", outline: "none", boxSizing: "border-box" }} />
  );
}

// Fix 12 — dynamic status dot
function StatusDot({ connected, checking }: { connected: boolean | null; checking: boolean }) {
  const color = checking ? "#CA8A04" : connected === true ? "var(--rf-accent)" : "#CA8A04";
  const label = checking ? "Checking..." : connected === true ? "Connected" : "Not connected";
  const textColor = checking ? "#CA8A04" : connected === true ? "var(--rf-accent)" : "#CA8A04";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: `0 0 0 2px ${color}33` }} />
      <span style={{ fontSize: "13px", fontWeight: 500, color: textColor }}>{label}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function SettingsPage() {
  const { setPageTitle, setPageSubtitle, setHeaderAction } = useDashboard();

  // Route preferences
  const [depot,        setDepot]        = useState("Kaloor Hub, Ernakulam, Kochi");
  const [optimMode,    setOptimMode]    = useState("Balanced");
  const [returnDepot,  setReturnDepot]  = useState(true);
  const [maxStops,     setMaxStops]     = useState("15");

  // Display
  const [distUnits,    setDistUnits]    = useState("km");
  const [timeFormat,   setTimeFormat]   = useState("24h");

  // Fix 12 — check connection
  const [checking,     setChecking]     = useState(false);
  const [connected,    setConnected]    = useState<boolean | null>(null);

  // Danger zone
  const [clearConfirm, setClearConfirm] = useState(false);

  // Save
  const [saved,        setSaved]        = useState(false);

  useEffect(() => {
    setPageTitle("Settings");
    setPageSubtitle("Preferences and configuration");
    setHeaderAction(null);
  }, [setPageTitle, setPageSubtitle, setHeaderAction]);

  // Fix 12 — async health check
  const handleCheckConnection = async () => {
    setChecking(true);
    setConnected(null);
    try {
      const ok = await checkHealth();
      setConnected(ok);
    } catch {
      setConnected(false);
    } finally {
      setChecking(false);
    }
  };

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleClear() {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 4000);
    }
  }

  return (
    <div style={{ height: "100%", backgroundColor: "var(--rf-bg)", padding: "24px", overflowY: "auto", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "720px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 600, color: "var(--rf-dark)", marginBottom: "24px" }}>Settings</h1>

        {/* Section 1 — Route preferences */}
        <SectionCard title="Route preferences">
          <SettingRow label="Depot address" description="Starting and ending point of all routes">
            <SettingInput value={depot} onChange={setDepot} width={200} />
          </SettingRow>
          <SettingRow label="Optimization mode" description="Algorithm strategy for route solving">
            <SegmentedControl options={["Fast","Balanced","Best"]} value={optimMode} onChange={setOptimMode} />
          </SettingRow>
          <SettingRow label="Return to depot" description="Route must end at the starting point">
            <Toggle on={returnDepot} onChange={setReturnDepot} />
          </SettingRow>
          <SettingRow label="Max stops per route" description="Driver will not exceed this number of stops" last>
            <SettingInput value={maxStops} onChange={setMaxStops} width={80} type="number" />
          </SettingRow>
        </SectionCard>

        {/* Section 2 — Display */}
        <SectionCard title="Display">
          <SettingRow label="Distance units" description="Unit shown on route stats and cards">
            <SegmentedControl options={["km","miles"]} value={distUnits} onChange={setDistUnits} />
          </SettingRow>
          <SettingRow label="Time format" description="Clock format across the app">
            <SegmentedControl options={["24h","12h"]} value={timeFormat} onChange={setTimeFormat} />
          </SettingRow>
          <SettingRow label="Theme" description="Interface colour scheme" last>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ background: "var(--rf-surface)", border: "1px solid var(--rf-border)", borderRadius: "99px", padding: "4px 12px", fontSize: "12px", fontWeight: 500, color: "var(--rf-primary)" }}>Light</span>
              <span style={{ fontSize: "11px", color: "var(--rf-muted)" }}>Dark mode coming soon</span>
            </div>
          </SettingRow>
        </SectionCard>

        {/* Section 3 — API connection */}
        <SectionCard title="API connection" subtitle="RouteForge uses these services for optimization">
          <SettingRow label="OSRM routing API" description="router.project-osrm.org">
            <StatusDot connected={true} checking={false} />
          </SettingRow>
          {/* Fix 12 — dynamic OR-Tools row */}
          <SettingRow label="OR-Tools backend" description="localhost:8000/health" last>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <StatusDot connected={connected} checking={checking} />
              <button
                onClick={handleCheckConnection}
                disabled={checking}
                style={{ border: "1px solid var(--rf-border)", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: checking ? "var(--rf-muted)" : "var(--rf-muted)", background: "white", cursor: checking ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "4px", opacity: checking ? 0.7 : 1 }}
              >
                {checking && <i className="ti ti-loader-2 spin" style={{ fontSize: "11px" }} />}
                {checking ? "Checking..." : "Check connection"}
              </button>
            </div>
          </SettingRow>
        </SectionCard>

        {/* Section 4 — Danger zone */}
        <SectionCard title="Danger zone" danger>
          <SettingRow label="Clear all route data" description="Removes all saved routes and stops" last>
            <button onClick={handleClear} style={{ border: "1px solid #FCA5A5", color: clearConfirm ? "#7F1D1D" : "#DC2626", borderColor: clearConfirm ? "#F87171" : "#FCA5A5", borderRadius: "6px", padding: "6px 14px", fontSize: "13px", fontWeight: clearConfirm ? 600 : 400, background: clearConfirm ? "rgba(220,38,38,0.06)" : "transparent", cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap" }}>
              {clearConfirm ? "Are you sure? Click again to confirm" : "Clear data"}
            </button>
          </SettingRow>
        </SectionCard>

        {/* Save button */}
        <button onClick={handleSave} style={{ background: saved ? "var(--rf-accent)" : "var(--rf-primary)", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: 500, cursor: "pointer", transition: "background 0.2s ease", marginTop: "4px" }}>
          {saved ? "Saved ✓" : "Save preferences"}
        </button>
      </div>
    </div>
  );
}
