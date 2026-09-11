import { useSafety } from "../context/SafetyContext";

export default function BottomNav({ activeTab, setActiveTab }) {
  const { isSosActive, safetyScore } = useSafety();

  const tabs = [
    { id: "map", label: "Safety Map", icon: "🗺️" },
    { id: "risk", label: "AI Radar", icon: "🤖", badge: safetyScore?.level === "HIGH_DANGER" ? "!" : null },
    { id: "sos", label: "SOS Panic", icon: "🚨", isSos: true },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`nav-item ${isActive ? "nav-item-active" : ""} ${tab.isSos ? "nav-item-sos" : ""} ${isSosActive && tab.isSos ? "sos-pulse" : ""}`}
            type="button"
          >
            <div className="nav-icon-container">
              <span className="nav-icon">{tab.icon}</span>
              {tab.badge && <span className="nav-badge">{tab.badge}</span>}
            </div>
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
