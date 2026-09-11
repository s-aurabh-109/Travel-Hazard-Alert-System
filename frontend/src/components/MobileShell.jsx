import { useSafety } from "../context/SafetyContext";

export default function MobileShell({ children }) {
  const { isNodeOnline, isAiOnline, isSosActive } = useSafety();

  return (
    <div className="app-viewport-wrapper">
      {/* Mobile Device Frame Container */}
      <div className={`mobile-frame ${isSosActive ? "sos-active-frame" : ""}`}>
        {/* Device Status Bar */}
        <header className="mobile-header">
          <div className="header-brand">
            <span className="brand-logo">🛡️</span>
            <div>
              <h1 className="brand-title">TravelSafe</h1>
              <p className="brand-subtitle">AI Hazard & Safety Radar</p>
            </div>
          </div>

          {/* Backend Health Chips */}
          <div className="backend-chips">
            <span className={`chip ${isNodeOnline ? "chip-online" : "chip-demo"}`} title="Node.js Express Backend">
              <span className="chip-dot"></span>
              NODE
            </span>
            <span className={`chip ${isAiOnline ? "chip-online" : "chip-demo"}`} title="FastAPI AI Engine">
              <span className="chip-dot"></span>
              AI ENGINE
            </span>
          </div>
        </header>

        {/* Dynamic View Body */}
        <main className="mobile-content">{children}</main>
      </div>
    </div>
  );
}
