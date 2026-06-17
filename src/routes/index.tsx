import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ArrowDown, Cpu, MapPin, Map, Zap, Atom } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RouteForge — Smarter Delivery Route Optimization" },
      {
        name: "description",
        content:
          "RouteForge plans the fastest, cheapest delivery routes for your fleet in seconds.",
      },
      { property: "og:title", content: "RouteForge — Smarter Delivery Route Optimization" },
      {
        property: "og:description",
        content:
          "RouteForge plans the fastest, cheapest delivery routes for your fleet in seconds.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--rf-dark)" }}>
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative pb-20 pt-16">
        {/* Pill Badge */}
        <div 
          className="mb-6 rounded-full inline-flex items-center justify-center"
          style={{ 
            backgroundColor: "rgba(234,88,12,0.2)", 
            border: "1px solid var(--rf-primary)", 
            color: "var(--rf-primary)",
            fontSize: "13px",
            padding: "6px 16px"
          }}
        >
          Powered by Google OR-Tools + OSRM
        </div>
        
        {/* Headline */}
        <h1 
          className="text-center font-bold text-white max-w-4xl"
          style={{ 
            fontSize: "clamp(40px, 6vw, 72px)", 
            lineHeight: 1.1,
            letterSpacing: "-0.02em"
          }}
        >
          The <span style={{ color: "var(--rf-primary)" }}>fastest</span> route between any stops. Solved in seconds.
        </h1>
        
        {/* Subtitle */}
        <p 
          className="text-center mt-6"
          style={{ 
            fontSize: "18px", 
            color: "rgba(255,255,255,0.6)", 
            maxWidth: "520px",
            lineHeight: 1.6
          }}
        >
          RouteForge finds the optimal delivery order for 10+ stops using real road times — cutting drive time by up to 35%.
        </p>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-10">
          <Link
            to="/dashboard"
            className="rounded-full font-medium transition-transform hover:scale-105 active:scale-95 inline-flex items-center justify-center"
            style={{ 
              backgroundColor: "var(--rf-primary)", 
              color: "white", 
              padding: "14px 32px", 
              fontSize: "16px" 
            }}
          >
            Launch app →
          </Link>
          <button
            className="rounded-full font-medium transition-colors hover:bg-white/5 inline-flex items-center justify-center"
            style={{ 
              backgroundColor: "transparent", 
              border: "1px solid rgba(255,255,255,0.3)", 
              color: "white", 
              padding: "14px 32px", 
              fontSize: "16px" 
            }}
          >
            See how it works
          </button>
        </div>
        
        {/* Map Placeholder */}
        <div 
          className="w-full flex items-center justify-center mt-12 shadow-2xl relative overflow-hidden"
          style={{ 
            backgroundColor: "#1a0a02", 
            border: "1px solid rgba(234,88,12,0.3)", 
            height: "340px", 
            maxWidth: "860px",
            borderRadius: "20px"
          }}
        >
          <div 
            className="absolute inset-0" 
            style={{ 
              background: "radial-gradient(circle at center, rgba(234,88,12,0.15) 0%, transparent 70%)" 
            }}
          />
          <span style={{ color: "rgba(234,88,12,0.5)", fontFamily: "monospace", letterSpacing: "1px", zIndex: 10 }}>
            [ Interactive map loads here ]
          </span>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="text-white/30 w-6 h-6" />
        </div>
      </main>

      {/* "What is RouteForge?" Section */}
      <section 
        className="w-full flex justify-center"
        style={{ 
          backgroundColor: "var(--rf-bg)", 
          padding: "96px 48px" 
        }}
      >
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 items-start" style={{ gap: "64px" }}>
          {/* LEFT Column */}
          <div className="flex flex-col items-start">
            <span 
              className="font-medium uppercase tracking-wider" 
              style={{ 
                fontSize: "13px", 
                color: "var(--rf-muted)", 
                marginBottom: "12px" 
              }}
            >
              The optimizer
            </span>
            <h2 
              className="font-bold"
              style={{ 
                fontSize: "clamp(32px, 5vw, 52px)", 
                color: "var(--rf-dark)", 
                lineHeight: 1.1 
              }}
            >
              What is RouteForge?
            </h2>
            <Link
              to="/dashboard"
              className="rounded-full font-medium transition-transform hover:scale-105 active:scale-95 inline-flex items-center justify-center"
              style={{ 
                backgroundColor: "var(--rf-dark)", 
                color: "white", 
                padding: "12px 28px", 
                fontSize: "15px",
                marginTop: "24px"
              }}
            >
              Try it free →
            </Link>
          </div>

          {/* RIGHT Column */}
          <div>
            <p 
              style={{ 
                fontSize: "20px", 
                lineHeight: 1.6, 
                color: "var(--rf-muted)", 
                fontWeight: 400 
              }}
            >
              RouteForge is a route optimization engine that solves the same problem Amazon and DPD tackle millions of times per day — finding the fastest sequence to visit 10 or more delivery stops. It uses real road driving times from OSRM and Google OR-Tools to cut unnecessary distance, saving drivers 20–40 minutes per shift.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="w-full flex justify-center"
        style={{ 
          backgroundColor: "var(--rf-bg)", 
          padding: "0px 48px 96px" 
        }}
      >
        <div className="w-full max-w-6xl flex flex-col md:flex-row" style={{ gap: "16px" }}>
          {/* Card 1 */}
          <div 
            style={{
              flex: 1.4,
              backgroundColor: "var(--rf-surface)",
              border: "1px solid var(--rf-border)",
              borderRadius: "20px",
              padding: "28px",
              minHeight: "280px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <h3 style={{ fontSize: "22px", fontWeight: 600, color: "var(--rf-dark)" }}>
              Routes that save real time
            </h3>
            
            <div className="flex-1 flex items-center justify-center py-4">
              <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Dotted route line */}
                <path d="M30 130 Q 70 80, 100 90 T 170 30" stroke="var(--rf-primary)" strokeWidth="3" strokeDasharray="6 6" fill="transparent" />
                {/* Pins */}
                <circle cx="30" cy="130" r="8" fill="var(--rf-primary)" />
                <circle cx="100" cy="90" r="8" fill="var(--rf-primary)" />
                <circle cx="170" cy="30" r="8" fill="var(--rf-primary)" />
                {/* Pin highlights */}
                <circle cx="30" cy="130" r="3" fill="white" />
                <circle cx="100" cy="90" r="3" fill="white" />
                <circle cx="170" cy="30" r="3" fill="white" />
              </svg>
            </div>

            <p style={{ fontSize: "14px", color: "var(--rf-muted)", lineHeight: 1.5 }}>
              Feed in your stops and RouteForge calculates the optimal order using real road travel times — not straight-line guesses. Drivers spend less time driving, more time delivering.
            </p>
          </div>

          {/* Card 2 */}
          <div 
            style={{
              flex: 1,
              backgroundColor: "var(--rf-dark)",
              borderRadius: "20px",
              padding: "28px",
              minHeight: "280px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <h3 style={{ fontSize: "22px", fontWeight: 600, color: "white" }}>
              Instant results
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
              10+ stops optimized in under a second. Powered by Google OR-Tools, the same solver used in production logistics systems.
            </p>
          </div>

          {/* Card 3 */}
          <div 
            style={{
              flex: 1,
              backgroundColor: "var(--rf-dark2)",
              borderRadius: "20px",
              padding: "28px",
              minHeight: "280px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <h3 style={{ fontSize: "22px", fontWeight: 600, color: "white" }}>
              Live on a real map
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
              Every route renders on OpenStreetMap via Leaflet. Drag pins to adjust stops, watch the route redraw instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Logo Bar Section */}
      <section 
        className="w-full flex justify-center border-y"
        style={{ 
          backgroundColor: "white", 
          borderColor: "var(--rf-border)",
          padding: "28px 48px" 
        }}
      >
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between" style={{ gap: "32px" }}>
          {/* Left */}
          <div 
            style={{ 
              fontSize: "13px", 
              color: "var(--rf-muted)", 
              maxWidth: "140px", 
              lineHeight: 1.4,
              fontWeight: 500
            }}
          >
            Built with production-grade tools
          </div>

          {/* Right */}
          <div className="flex flex-wrap items-center justify-center md:justify-end" style={{ gap: "32px" }}>
            <div className="flex items-center gap-2">
              <Cpu size={18} color="var(--rf-primary)" />
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--rf-dark)" }}>OR-Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} color="var(--rf-primary)" />
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--rf-dark)" }}>OSRM</span>
            </div>
            <div className="flex items-center gap-2">
              <Map size={18} color="var(--rf-primary)" />
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--rf-dark)" }}>Leaflet.js</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={18} color="var(--rf-primary)" />
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--rf-dark)" }}>FastAPI</span>
            </div>
            <div className="flex items-center gap-2">
              <Atom size={18} color="var(--rf-primary)" />
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--rf-dark)" }}>React</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        className="w-full flex justify-center"
        style={{ 
          backgroundColor: "var(--rf-bg)", 
          padding: "96px 48px" 
        }}
      >
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-start" style={{ gap: "64px" }}>
          {/* LEFT Column */}
          <div style={{ flex: 5.5 }}>
            <div 
              style={{ 
                fontSize: "13px", 
                color: "var(--rf-primary)", 
                fontWeight: 500, 
                marginBottom: "16px" 
              }}
            >
              How it works
            </div>
            <h2 
              style={{ 
                fontSize: "clamp(28px,4vw,44px)", 
                fontWeight: 700, 
                color: "var(--rf-dark)", 
                lineHeight: 1.1,
                marginBottom: "16px"
              }}
            >
              Three steps to the fastest route
            </h2>
            <p 
              style={{ 
                fontSize: "16px", 
                color: "var(--rf-muted)", 
                marginBottom: "40px",
                lineHeight: 1.6
              }}
            >
              RouteForge combines real road data with a world-class optimization solver to give drivers the best possible route — every time.
            </p>

            <div className="flex flex-col" style={{ gap: "28px" }}>
              {/* Step 1 */}
              <div className="flex gap-4">
                <div 
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ 
                    width: "28px", 
                    height: "28px", 
                    backgroundColor: "var(--rf-primary)", 
                    color: "white", 
                    borderRadius: "50%", 
                    fontSize: "12px", 
                    fontWeight: 700 
                  }}
                >
                  1
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, color: "var(--rf-dark)", fontSize: "16px", marginBottom: "4px" }}>
                    Drop your stops
                  </h4>
                  <p style={{ color: "var(--rf-muted)", fontSize: "14px", lineHeight: 1.5 }}>
                    Type any address or click the map to place a delivery pin. Add as many stops as you need.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex gap-4">
                <div 
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ 
                    width: "28px", 
                    height: "28px", 
                    backgroundColor: "var(--rf-primary)", 
                    color: "white", 
                    borderRadius: "50%", 
                    fontSize: "12px", 
                    fontWeight: 700 
                  }}
                >
                  2
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, color: "var(--rf-dark)", fontSize: "16px", marginBottom: "4px" }}>
                    Hit optimize
                  </h4>
                  <p style={{ color: "var(--rf-muted)", fontSize: "14px", lineHeight: 1.5 }}>
                    RouteForge builds a real driving-time matrix and solves the fastest sequence using Google OR-Tools.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div 
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ 
                    width: "28px", 
                    height: "28px", 
                    backgroundColor: "var(--rf-primary)", 
                    color: "white", 
                    borderRadius: "50%", 
                    fontSize: "12px", 
                    fontWeight: 700 
                  }}
                >
                  3
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, color: "var(--rf-dark)", fontSize: "16px", marginBottom: "4px" }}>
                    Drive the route
                  </h4>
                  <p style={{ color: "var(--rf-muted)", fontSize: "14px", lineHeight: 1.5 }}>
                    Your optimized route appears on the map instantly. Export it or share a link with the driver.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT Column */}
          <div 
            style={{ 
              flex: 4.5,
              backgroundColor: "var(--rf-dark)",
              borderRadius: "20px",
              padding: "32px",
              minHeight: "420px",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div 
              style={{ 
                fontSize: "12px", 
                color: "rgba(255,255,255,0.5)", 
                textTransform: "uppercase", 
                letterSpacing: "0.08em",
                marginBottom: "24px"
              }}
            >
              Before vs after
            </div>

            <div className="flex flex-col gap-4 mb-auto">
              {/* Naive Route */}
              <div 
                className="flex items-center justify-center"
                style={{
                  height: "120px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(220,38,38,0.15)",
                  border: "1px solid rgba(220,38,38,0.3)"
                }}
              >
                <span style={{ color: "#FCA5A5", fontWeight: 500 }}>Naive order — 1h 58m</span>
              </div>

              {/* Optimized Route */}
              <div 
                className="flex items-center justify-center"
                style={{
                  height: "120px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(22,163,74,0.15)",
                  border: "1px solid rgba(22,163,74,0.3)"
                }}
              >
                <span style={{ color: "#86EFAC", fontWeight: 500 }}>Optimized — 1h 17m</span>
              </div>
            </div>

            <div 
              className="self-start inline-flex items-center justify-center"
              style={{
                backgroundColor: "var(--rf-primary)",
                color: "white",
                borderRadius: "9999px",
                padding: "8px 20px",
                fontSize: "14px",
                fontWeight: 600,
                marginTop: "32px"
              }}
            >
              You saved 41 minutes →
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section 
        className="w-full flex flex-col items-center text-center"
        style={{ 
          backgroundColor: "var(--rf-dark)", 
          padding: "96px 48px" 
        }}
      >
        <div 
          className="rounded-full inline-flex items-center justify-center"
          style={{ 
            backgroundColor: "rgba(234,88,12,0.2)", 
            border: "1px solid var(--rf-primary)", 
            color: "var(--rf-primary)",
            fontSize: "13px",
            padding: "6px 16px"
          }}
        >
          No account needed
        </div>
        
        <h2 
          style={{ 
            fontSize: "clamp(32px,5vw,56px)", 
            fontWeight: 700, 
            color: "white", 
            marginTop: "20px",
            lineHeight: 1.1
          }}
        >
          Try RouteForge free. Right now.
        </h2>
        
        <p 
          style={{ 
            fontSize: "18px", 
            color: "rgba(255,255,255,0.6)", 
            marginTop: "16px",
            maxWidth: "480px",
            lineHeight: 1.6
          }}
        >
          Drop in your stops, hit optimize, and see the fastest route in under a second.
        </p>
        
        <Link
          to="/dashboard"
          className="rounded-full inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          style={{ 
            backgroundColor: "var(--rf-primary)", 
            color: "white", 
            padding: "16px 40px", 
            fontSize: "17px",
            fontWeight: 600,
            marginTop: "32px"
          }}
        >
          Launch the app →
        </Link>
      </section>

      {/* Footer */}
      <footer 
        className="w-full flex flex-col sm:flex-row items-center justify-between"
        style={{ 
          backgroundColor: "var(--rf-dark)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: "24px 48px"
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
          © 2026 RouteForge
        </div>
        
        <div className="flex items-center mt-4 sm:mt-0" style={{ gap: "24px" }}>
          <a href="#" className="hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>GitHub</a>
          <a href="#" className="hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>How it works</a>
          <a href="#" className="hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Tech stack</a>
        </div>
      </footer>
    </div>
  );
}
