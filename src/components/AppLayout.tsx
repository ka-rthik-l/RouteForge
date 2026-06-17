import React from "react";
import { NavSidebar } from "./NavSidebar";
import { Topbar } from "./Topbar";
import { Toast } from "./Toast";
import { DashboardProvider, useDashboard } from "./DashboardContext";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { toast } = useDashboard();
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--rf-bg)" }}>
      <NavSidebar />
      <div
        style={{
          marginLeft: "240px",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Topbar />
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
      {/* Global toast — visible from every page */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DashboardProvider>
    <LayoutInner>{children}</LayoutInner>
  </DashboardProvider>
);
