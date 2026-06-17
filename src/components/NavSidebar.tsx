import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Route as RouteIcon,
  Truck,
  MapPin,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard, iconClass: "ti-layout-dashboard" },
  { label: "Routes", to: "/routes", icon: RouteIcon, iconClass: "ti-route" },
  { label: "Fleet", to: "/fleet", icon: Truck, iconClass: "ti-truck" },
  { label: "Stops", to: "/stops", icon: MapPin, iconClass: "ti-map-pin" },
  { label: "Analytics", to: "/analytics", icon: BarChart3, iconClass: "ti-chart-bar" },
  { label: "Settings", to: "/settings", icon: Settings, iconClass: "ti-settings" },
];

export function NavSidebar() {
  return (
    <aside
      style={{
        width: "240px",
        height: "100vh",
        backgroundColor: "var(--rf-dark)",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "col",
        zIndex: 40,
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex h-full w-full flex-col">
        {/* Logo Section */}
        <div
          className="flex items-center gap-2"
          style={{
            padding: "20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <RouteIcon size={18} style={{ color: "var(--rf-primary)" }} />
              <span className="text-white font-semibold text-[15px] tracking-wide m-0 leading-none">
                RouteForge
              </span>
            </div>
            <span
              className="text-[11px] mt-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              route optimizer
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav
          className="flex-1 overflow-y-auto"
          style={{ padding: "12px 10px" }}
        >
          <ul className="flex flex-col gap-[2px] m-0 p-0 list-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex items-center gap-[10px] rounded-[8px] px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer no-underline hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
                    activeProps={{
                      style: {
                        backgroundColor: "rgba(234, 88, 12, 0.2)",
                        color: "var(--rf-primary)",
                      },
                    }}
                    inactiveProps={{
                      style: {
                        color: "rgba(255, 255, 255, 0.6)",
                      },
                    }}
                  >
                    <span className={`flex items-center justify-center ${item.iconClass}`}>
                      <Icon size={16} />
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Version Badge */}
        <div
          style={{
            padding: "16px",
            marginTop: "auto",
          }}
        >
          <span
            className="text-[11px]"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            v0.1 · Shell
          </span>
        </div>
      </div>
    </aside>
  );
}
