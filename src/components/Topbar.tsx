import { useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { Upload, Download, Loader2, RefreshCw, Zap } from "lucide-react";
import { useDashboard } from "./DashboardContext";
import { Stop } from "../types";

export function Topbar() {
  const location   = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const csvInputRef = useRef<HTMLInputElement>(null);

  const {
    optimizing, optimized, handleOptimize,
    stops, setStops, showToast,
    pageTitle, pageSubtitle, headerAction,
  } = useDashboard();

  // ── Fix 1: Import CSV ──────────────────────────────────────────────────────
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split("\n").slice(1); // skip header
      const imported: Stop[] = [];
      lines.forEach((line, i) => {
        const parts   = line.split(",");
        const name    = parts[0]?.trim();
        const address = parts[1]?.trim();
        const lat     = parseFloat(parts[2]);
        const lng     = parseFloat(parts[3]);
        if (!name || isNaN(lat) || isNaN(lng)) return;
        imported.push({
          id:      Date.now().toString() + i,
          name,
          address: address || "",
          lat,
          lng,
          eta:     "--",
          isDepot: false,
        });
      });
      if (imported.length === 0) {
        showToast("CSV must have columns: name, address, lat, lng", "error");
        return;
      }
      setStops(prev => [...prev, ...imported]);
      showToast(`${imported.length} stop${imported.length !== 1 ? "s" : ""} imported`, "success");
    };
    reader.readAsText(file);
    e.target.value = ""; // allow re-importing the same file
  };

  // ── Fix 2: Export ──────────────────────────────────────────────────────────
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(stops, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `routeforge-route-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Route exported as JSON", "success");
  };

  return (
    <header
      className="flex items-center justify-between flex-shrink-0"
      style={{
        backgroundColor: "var(--rf-dark)",
        padding:         "0 20px",
        borderBottom:    "1px solid rgba(255,255,255,0.08)",
        height:          "52px",
      }}
    >
      {/* Left — title + subtitle */}
      <div className="flex flex-col">
        <span className="text-white font-semibold text-[14px] leading-tight">
          {pageTitle}
        </span>
        {pageSubtitle && (
          <span className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            {pageSubtitle}
          </span>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        {isDashboard ? (
          <>
            {/* Hidden file input for CSV import */}
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={handleCSVImport}
            />

            <button
              onClick={() => csvInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--rf-dark2)",
                color:  "var(--rf-bg)",
              }}
            >
              <Upload size={14} />
              Import CSV
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--rf-dark2)",
                color:  "var(--rf-bg)",
              }}
            >
              <Download size={14} />
              Export
            </button>

            <button
              onClick={handleOptimize}
              disabled={optimizing}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-white transition-all select-none cursor-pointer"
              style={{
                backgroundColor: "var(--rf-primary)",
                opacity: optimizing ? 0.7 : 1,
                cursor:  optimizing ? "not-allowed" : "pointer",
              }}
            >
              {optimizing ? (
                <>
                  <Loader2 size={14} className="spin" />
                  <span>Optimizing...</span>
                </>
              ) : optimized ? (
                <>
                  <RefreshCw size={14} />
                  <span>Re-optimize</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Optimize Route</span>
                </>
              )}
            </button>
          </>
        ) : (
          headerAction
        )}
      </div>
    </header>
  );
}
