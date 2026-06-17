import { Check } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// @ts-ignore — leaflet-polylinedecorator has no official types
import "leaflet-polylinedecorator";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { Stop } from "@/types";
import { KOCHI_CENTER } from "@/data/defaultStops";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

// ─── Types ────────────────────────────────────────────────────────────────────

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface MapViewProps {
  stops: Stop[];
  optimized: boolean;
  onStopMove: (id: string, lat: number, lng: number) => void;
  showBadge?: boolean;
  savedLabel?: string;
  /** Fired when "Add stop" in sidebar is clicked — tells MapView to focus search */
  addStopRequested?: boolean;
  /** Called with real Nominatim data when the user selects a suggestion */
  onAddStop: (name: string, address: string, lat: number, lng: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createMarkerIcon(label: string, isDepot: boolean): L.DivIcon {
  const bg = isDepot ? "#431407" : "#EA580C";
  return L.divIcon({
    className: "",
    html: `<div style="background-color: ${bg}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    tooltipAnchor: [14, 0],
  });
}

async function fetchRouteGeometry(stops: Stop[]): Promise<L.LatLngTuple[]> {
  if (stops.length < 2) return [];
  const coords = stops.map((s) => `${s.lng},${s.lat}`).join(";");
  const closed = `${coords};${stops[0].lng},${stops[0].lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${closed}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM route failed");
    const data = await res.json();
    const ring = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
    if (!ring?.length) throw new Error("No geometry");
    return ring.map(([lng, lat]) => [lat, lng] as L.LatLngTuple);
  } catch {
    const fallback = stops.map((s) => [s.lat, s.lng] as L.LatLngTuple);
    if (fallback.length > 1) fallback.push(fallback[0]);
    return fallback;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MapView({
  stops,
  optimized,
  onStopMove,
  showBadge = false,
  savedLabel = "",
  addStopRequested = false,
  onAddStop,
}: MapViewProps) {
  // Map refs
  const mapRef        = useRef<L.Map | null>(null);
  const markersRef    = useRef<L.Marker[]>([]);
  const polylineRef   = useRef<L.Polyline | null>(null);
  const decoratorRef  = useRef<any>(null);
  const stopCountRef  = useRef(stops.length);
  const hasInitialFitRef = useRef(false);

  // Search state
  const [query,        setQuery]        = useState("");
  const [suggestions,  setSuggestions]  = useState<NominatimResult[]>([]);
  const [searching,    setSearching]    = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef  = useRef<HTMLDivElement>(null);
  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Map init ────────────────────────────────────────────────────────────────
  const fitToStops = useCallback((map: L.Map, stopList: Stop[]) => {
    if (stopList.length === 0) return;
    const bounds = L.latLngBounds(stopList.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
  }, []);

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map("map", { zoomControl: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);
    map.setView([KOCHI_CENTER.lat, KOCHI_CENTER.lng], 12);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Focus search bar when "Add stop" sidebar button is clicked ──────────────
  useEffect(() => {
    if (!addStopRequested) return;
    searchInputRef.current?.focus();
    const wrap = searchWrapRef.current;
    if (wrap) {
      wrap.classList.add("search-highlight");
      setTimeout(() => wrap.classList.remove("search-highlight"), 1000);
    }
  }, [addStopRequested]);

  // ── Click-outside → close suggestions ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Markers + depot pulse ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    stops.forEach((stop, index) => {
      const label  = stop.isDepot ? "D" : String(index);
      const icon   = createMarkerIcon(label, stop.isDepot || false);
      const marker = L.marker([stop.lat, stop.lng], { icon, draggable: !stop.isDepot });
      marker.addTo(mapRef.current!);
      marker.bindTooltip(stop.name, { permanent: false, direction: "top" });
      marker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        onStopMove(stop.id, pos.lat, pos.lng);
      });
      markersRef.current.push(marker);

      // Pulsing ring on depot only when route is optimized
      if (stop.isDepot && optimized) {
        const el = marker.getElement();
        if (el) {
          const inner = el.querySelector("div") as HTMLElement | null;
          if (inner) inner.classList.add("depot-pulse");
        }
      }
    });

    const countChanged = stopCountRef.current !== stops.length;
    stopCountRef.current = stops.length;
    if (mapRef.current && stops.length > 0 && (!hasInitialFitRef.current || countChanged)) {
      fitToStops(mapRef.current, stops);
      hasInitialFitRef.current = true;
    }
  }, [stops, optimized, onStopMove, fitToStops]);

  // ── Route polyline + directional arrows ────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || stops.length < 2) {
      polylineRef.current?.remove();
      polylineRef.current = null;
      decoratorRef.current?.remove();
      decoratorRef.current = null;
      return;
    }

    let cancelled = false;
    fetchRouteGeometry(stops).then((coords) => {
      if (cancelled || !mapRef.current) return;

      polylineRef.current?.remove();
      polylineRef.current = null;
      decoratorRef.current?.remove();
      decoratorRef.current = null;

      const polyline = L.polyline(coords, {
        color:     optimized ? "#16A34A" : "#EA580C",
        weight:    4,
        opacity:   0.9,
        dashArray: optimized ? undefined : "8 6",
      });
      polyline.addTo(mapRef.current!);
      polylineRef.current = polyline;

      if (optimized && coords.length > 1) {
        const decorator = (L as any).polylineDecorator(polyline, {
          patterns: [{
            offset:  "25px",
            repeat:  "80px",
            symbol:  (L as any).Symbol.arrowHead({
              pixelSize:   10,
              polygon:     false,
              pathOptions: { color: "#16A34A", fillOpacity: 1, weight: 2 },
            }),
          }],
        });
        decorator.addTo(mapRef.current!);
        decoratorRef.current = decorator;
      }

      if (optimized) fitToStops(mapRef.current!, stops);
    });

    return () => { cancelled = true; };
  }, [stops, optimized, fitToStops]);

  // ── Nominatim search handler ────────────────────────────────────────────────
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=in&viewbox=74.8,12.0,77.6,8.0`,
          { headers: { "Accept-Language": "en" } }
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (item: NominatimResult) => {
    const lat     = parseFloat(item.lat);
    const lng     = parseFloat(item.lon);
    const name    = item.display_name.split(",")[0].trim();
    const address = item.display_name;
    mapRef.current?.setView([lat, lng], 14);
    onAddStop(name, address, lat, lng);
    setQuery("");
    setSuggestions([]);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      id="map"
      style={{ width: "100%", height: "100%", backgroundColor: "#FFEDD5", position: "relative" }}
      className="overflow-hidden select-none"
    >
      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <div
        ref={searchWrapRef}
        style={{ position: "absolute", top: "12px", left: "12px", zIndex: 1000, width: "300px" }}
      >
        {/* Input row */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: suggestions.length > 0 ? "12px 12px 0 0" : "99px",
            border: "1px solid var(--rf-border)",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "border-radius 0.15s ease, box-shadow 0.15s ease",
          }}
        >
          {/* Search icon / spinner */}
          {searching ? (
            <svg
              width="14" height="14"
              viewBox="0 0 24 24"
              style={{ color: "var(--rf-primary)", flexShrink: 0, animation: "spin 0.8s linear infinite" }}
              fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <svg
              width="14" height="14"
              viewBox="0 0 24 24"
              style={{ color: "var(--rf-muted)", flexShrink: 0 }}
              fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search address to add a stop…"
            style={{
              fontSize: "13px",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              color: "var(--rf-text)",
              width: "100%",
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setSuggestions([]); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--rf-muted)", fontSize: "16px", lineHeight: 1, padding: 0, flexShrink: 0,
              }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div
            style={{
              background: "white",
              border: "1px solid var(--rf-border)",
              borderTop: "none",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            {suggestions.map((item, i) => (
              <button
                key={item.place_id}
                onMouseDown={() => handleSelectSuggestion(item)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "var(--rf-dark)",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  borderTop: i > 0 ? "0.5px solid var(--rf-border)" : "none",
                  cursor: "pointer",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rf-surface)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontWeight: 500 }}>
                  {item.display_name.split(",")[0].trim()}
                </span>
                <span style={{ color: "var(--rf-muted)", fontSize: "11px", marginLeft: "6px" }}>
                  {item.display_name.split(",").slice(1, 3).join(",").trim()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Zoom controls ───────────────────────────────────────────────────── */}
      <div
        style={{ position: "absolute", top: "12px", right: "12px", zIndex: 1000 }}
        className="flex flex-col gap-1"
      >
        {[{ label: "+", title: "Zoom In", action: () => mapRef.current?.zoomIn() },
          { label: "−", title: "Zoom Out", action: () => mapRef.current?.zoomOut() }].map(btn => (
          <button
            key={btn.title}
            onClick={btn.action}
            title={btn.title}
            style={{
              width: "30px", height: "30px", borderRadius: "8px",
              backgroundColor: "white", border: "1px solid var(--rf-border)",
              fontSize: "18px", color: "var(--rf-dark)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            className="hover:bg-orange-50 active:scale-95 transition-all select-none font-semibold"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* ── Optimized badge ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute", bottom: "16px", right: "16px", zIndex: 1000,
          opacity: showBadge ? 1 : 0,
          transform: showBadge ? "translateY(0)" : "translateY(8px)",
          pointerEvents: showBadge ? "auto" : "none",
          transition: "transform 400ms ease, opacity 400ms ease",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--rf-accent)", color: "white",
            borderRadius: "99px", padding: "8px 18px",
            fontSize: "12px", fontWeight: 500,
            display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Check size={14} className="flex-shrink-0 stroke-[3]" />
          <span>Route optimized{savedLabel ? ` · saved ${savedLabel}` : ""}</span>
        </div>
      </div>
    </div>
  );
}
