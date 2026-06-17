import { Route } from "lucide-react";
import { Link } from "@tanstack/react-router";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Tech stack", href: "#tech-stack" },
  { label: "GitHub", href: "https://github.com" },
];

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full bg-white"
      style={{
        borderBottom: "1px solid var(--rf-border)",
        padding: "16px 48px",
      }}
    >
      <nav className="flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Route size={22} style={{ color: "var(--rf-primary)" }} />
          <span style={{ color: "var(--rf-dark)", fontWeight: 600, fontSize: "1.05rem" }}>
            RouteForge
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-sm transition-opacity hover:opacity-70"
                style={{ color: "var(--rf-muted)" }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 rounded-full px-5 py-2 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "var(--rf-primary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--rf-dark2)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--rf-primary)")}
        >
          Launch app →
        </Link>
      </nav>
    </header>
  );
}
