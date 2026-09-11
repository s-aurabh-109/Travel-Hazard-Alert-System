import { useState } from "react";
import { useSafety } from "../context/SafetyContext";

export default function SafetyScoreCard({ onOpenDetails }) {
  const { safetyScore, isLocating, refreshLocation } = useSafety();
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // Safe Green
    if (score >= 55) return "#f59e0b"; // Amber Warning
    return "#ef4444"; // Danger Red
  };

  const getLevelLabel = (score) => {
    if (score >= 80) return "SAFE AREA";
    if (score >= 55) return "CAUTION ZONE";
    return "HIGH DANGER ZONE";
  };

  const color = getScoreColor(safetyScore?.score || 88);

  return (
    <div className="safety-card-overlay">
      <div className="safety-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="score-ring" style={{ borderColor: color, color }}>
          <span className="score-number">{safetyScore?.score || 88}</span>
          <span className="score-max">/100</span>
        </div>

        <div className="score-info">
          <div className="score-badge" style={{ backgroundColor: `${color}22`, color, borderColor: color }}>
            ● {getLevelLabel(safetyScore?.score || 88)}
          </div>
          <p className="score-summary">{safetyScore?.aiSummary || "Location AI score calculated in real-time."}</p>
        </div>

        <button
          className="locate-btn"
          onClick={(e) => {
            e.stopPropagation();
            refreshLocation();
          }}
          title="Recenter & Re-evaluate"
          disabled={isLocating}
          type="button"
        >
          {isLocating ? "⏳" : "🎯"}
        </button>
      </div>

      {expanded && (
        <div className="safety-card-details">
          <div className="factor-grid">
            {(safetyScore?.factors || []).map((f, i) => (
              <div key={i} className="factor-item">
                <span className="factor-name">{f.name}</span>
                <div className="factor-bar-bg">
                  <div className="factor-bar-fill" style={{ width: `${f.score}%`, backgroundColor: color }} />
                </div>
                <span className="factor-val">{f.score}% ({f.status})</span>
              </div>
            ))}
          </div>
          {onOpenDetails && (
            <button className="view-analytics-btn" onClick={onOpenDetails} type="button">
              View Full AI Analytics & Risk Radar →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
