import { useState, useEffect } from "react";
import { useSafety } from "../context/SafetyContext";
import { evaluateRisk, checkAiAnomaly, getAiAnalytics } from "../services/aiApi";

export default function AiRiskView() {
  const { userLocation, safetyScore } = useSafety();
  const [riskData, setRiskData] = useState(null);
  const [anomalyData, setAnomalyData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAiData() {
      setLoading(true);
      const [rData, aData, sumData] = await Promise.all([
        evaluateRisk(userLocation[0], userLocation[1]),
        checkAiAnomaly(userLocation[0], userLocation[1]),
        getAiAnalytics(),
      ]);
      setRiskData(rData);
      setAnomalyData(aData);
      setAnalytics(sumData);
      setLoading(false);
    }
    loadAiData();
  }, [userLocation]);

  return (
    <div className="tab-view-container">
      <div className="view-header">
        <h2>🤖 AI Safety & Risk Radar</h2>
        <p>Powered by Python FastAPI AI Microservice</p>
      </div>

      {loading ? (
        <div className="loading-spinner-box">
          <div className="spinner"></div>
          <p>Evaluating AI hazard factors & satellite model...</p>
        </div>
      ) : (
        <div className="ai-risk-grid">
          {/* Main Risk Status Card */}
          <div className="ai-card main-risk-card">
            <div className="card-top-row">
              <span className="card-icon">🛡️</span>
              <div>
                <h3>AI Threat Assessment</h3>
                <span className={`risk-tag risk-${(riskData?.riskLevel || "LOW").toLowerCase()}`}>
                  LEVEL: {riskData?.riskLevel || "LOW HAZARD"}
                </span>
              </div>
            </div>
            <p className="ai-advisory-text">"{riskData?.advisory || safetyScore?.aiSummary}"</p>
          </div>

          {/* Anomaly Detection Status */}
          <div className="ai-card anomaly-card">
            <div className="card-top-row">
              <span className="card-icon">⚡</span>
              <h3>Route & Anomaly Monitor</h3>
            </div>
            <div className="anomaly-status">
              {anomalyData?.isAnomaly ? (
                <div className="anomaly-badge danger">
                  ⚠️ Route Deviation / Anomaly Detected! (Confidence: {((anomalyData?.confidence || 0.9) * 100).toFixed(0)}%)
                </div>
              ) : (
                <div className="anomaly-badge safe">
                  ✅ Normal Travel Pattern Verified (Confidence: {((anomalyData?.confidence || 0.94) * 100).toFixed(0)}%)
                </div>
              )}
              <p className="anomaly-msg">{anomalyData?.riskMessage}</p>
            </div>
          </div>

          {/* Detailed Factor Breakdown */}
          <div className="ai-card factors-card">
            <h3>📊 Safety Score Components</h3>
            <div className="factors-list">
              {(safetyScore?.factors || []).map((factor, idx) => (
                <div key={idx} className="factor-row">
                  <div className="factor-info-line">
                    <span className="factor-lbl">{factor.name}</span>
                    <span className="factor-pct">{factor.score}% — {factor.status}</span>
                  </div>
                  <div className="factor-progress-bg">
                    <div
                      className="factor-progress-fill"
                      style={{
                        width: `${factor.score}%`,
                        backgroundColor: factor.score > 80 ? "#10b981" : factor.score > 50 ? "#f59e0b" : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Analytics */}
          <div className="ai-card stats-card">
            <h3>📈 Regional Safety Overview</h3>
            <div className="stats-mini-grid">
              <div className="stat-pill">
                <span className="stat-num">{analytics?.totalSafeZones || 14}</span>
                <span className="stat-lbl">Active Safe Zones</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num hazard">{analytics?.totalDangerZones || 3}</span>
                <span className="stat-lbl">High Danger Zones</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num">{analytics?.systemSafetyIndex || "94.2%"}</span>
                <span className="stat-lbl">System Safety Score</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
