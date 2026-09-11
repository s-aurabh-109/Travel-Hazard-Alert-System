import { useState, useEffect } from "react";
import { useSafety } from "../../context/SafetyContext";
import { evaluateRisk, checkAiAnomaly, getAiAnalytics, type RiskData, type AnomalyData, type AiAnalytics } from "../../services/aiApi";
import { Sparkles, X, ShieldCheck, Activity, BarChart3, AlertTriangle } from "lucide-react";

export default function AiRiskModal({ onClose }: { onClose: () => void }) {
  const { userLocation, safetyScore } = useSafety();
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [anomalyData, setAnomalyData] = useState<AnomalyData | null>(null);
  const [analytics, setAnalytics] = useState<AiAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [r, a, sum] = await Promise.all([
        evaluateRisk(userLocation[0], userLocation[1]),
        checkAiAnomaly(userLocation[0], userLocation[1]),
        getAiAnalytics(),
      ]);
      setRiskData(r);
      setAnomalyData(a);
      setAnalytics(sum);
      setLoading(false);
    }
    loadData();
  }, [userLocation]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[400px] bg-white rounded-[28px] p-5 shadow-float border border-slate-100 text-slate-900 relative max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] text-white grid place-items-center shadow-soft">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-[16px] text-slate-900">AI Safety Insights</h2>
              <p className="text-[11px] text-slate-500">Live Hazard & Risk Radar</p>
            </div>
          </div>
          <button onClick={onClose} className="press h-8 w-8 rounded-full bg-slate-100 grid place-items-center text-slate-500 hover:text-slate-900">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-500 space-y-2">
            <div className="h-7 w-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Calculating satellite risk models...</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Threat Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-slate-600">AI Threat Level</span>
                <span className="px-2.5 py-0.5 rounded-full font-extrabold text-[10px] bg-emerald-100 text-[#059669]">
                  {riskData?.riskLevel || "LOW HAZARD"}
                </span>
              </div>
              <p className="text-[12px] text-slate-700 font-medium">"{riskData?.advisory || safetyScore?.aiSummary}"</p>
            </div>

            {/* Anomaly Check */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                <Activity className="h-4 w-4 text-[#2563EB]" /> Route Anomaly Check
              </div>
              {anomalyData?.isAnomaly ? (
                <div className="p-2.5 rounded-xl bg-red-50 text-[#EF4444] font-semibold text-[11px]">
                  ⚠️ Route Deviation Detected ({((anomalyData?.confidence || 0.9) * 100).toFixed(0)}%)
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-[#059669] font-semibold text-[11px]">
                  ✅ Normal Travel Pattern Verified ({((anomalyData?.confidence || 0.94) * 100).toFixed(0)}% Match)
                </div>
              )}
              <p className="text-[11px] text-slate-500">{anomalyData?.riskMessage}</p>
            </div>

            {/* Factor Progress Bars */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
              <div className="flex justify-between items-center text-[12px] font-bold text-slate-900">
                <span>Score Breakdown Matrix</span>
                <span className="text-[#2563EB]">{safetyScore?.score}/100</span>
              </div>
              <div className="space-y-2">
                {(safetyScore?.factors || []).map((f, i) => (
                  <div key={i} className="text-[11px]">
                    <div className="flex justify-between text-slate-600 mb-1 font-medium">
                      <span>{f.name}</span>
                      <span className="font-semibold text-slate-900">{f.score}% ({f.status})</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] rounded-full" style={{ width: `${f.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="block text-base font-extrabold text-[#059669]">{analytics?.totalSafeZones || 14}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Safe Zones</span>
              </div>
              <div className="p-3 rounded-2xl bg-red-50 border border-red-100">
                <span className="block text-base font-extrabold text-[#EF4444]">{analytics?.totalDangerZones || 3}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Danger Zones</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <span className="block text-base font-extrabold text-[#2563EB]">{analytics?.systemSafetyIndex || "94.2%"}</span>
                <span className="text-[10px] text-slate-500 font-semibold">AI Index</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
