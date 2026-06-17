import { ToastState } from "./DashboardContext";

export function Toast({ message, type, visible }: ToastState) {
  const bgColor =
    type === "success" ? "#16A34A" :
    type === "error"   ? "#DC2626" :
                         "#431407";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "268px", // 240px sidebar + 28px offset
        backgroundColor: bgColor,
        color: "white",
        borderRadius: "10px",
        padding: "10px 16px",
        fontSize: "13px",
        fontWeight: 500,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        pointerEvents: visible ? "auto" : "none",
        transition: "transform 300ms ease, opacity 300ms ease",
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        maxWidth: "360px",
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}
