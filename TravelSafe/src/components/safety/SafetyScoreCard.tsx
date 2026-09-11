import { useState } from "react";
import { useSafety } from "../../context/SafetyContext";
import { ShieldCheck, LocateFixed, ChevronDown, ChevronUp, Sparkles, AlertTriangle } from "lucide-react";

export default function SafetyScoreCard({ onOpenAiModal }: { onOpenAiModal?: () => void }) {
  const { safetyScore, isLocating, refreshLocation, isNodeOnline, isAiOnline } = useSafety();
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // Safe Green
    if (score >= 55) return "#f59e0b"; // Warning Amber
    return "#ef4444"; // Danger Red
  };

  const score = safetyScore?.score || 88;
  const color = getScoreColor(score);

  return (
    <div className="glass-card rounded-2xl p-4 shadow-float border border-white/20 text-slate-800 transition-all">
      {/* Top Header Row */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div
          className="h-12 w-12 rounded-full border-2 flex items-center justify-center font-extrabold text-lg bg-slate-900/10 shadow-soft"
          style={{ borderColor: color, color }}
        >
          {score}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border"
              style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}
            >
              ● {score >= 80 ? "SAFE AREA" : score >= 55 ? "CAUTION ZONE" : "HIGH DANGER"}
            </span>

            {/* Micro Live Chips */}
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isAiOnline ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              AI: {isAiOnline ? "LIVE" : "DEMO"}
            </span>
          </div>

          <p className="text-xs text-slate-600 truncate mt-1">
            {safetyScore?.aiSummary || "AI calculating location safety..."}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              refreshLocation();
            }}
            disabled={isLocating}
            className="h-9 w-9 grid place-items-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Recenter & Re-evaluate"
          >
            <LocateFixed className={`h-4 w-4 ${isLocating ? "animate-spin text-indigo-600" : ""}`} />
          </button>

          <button className="h-9 w-9 grid place-items-center rounded-full bg-slate-100 text-slate-600">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Factor Details */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-3">
          <div className="space-y-2">
            {(safetyScore?.factors || []).map((factor, i) => (
              <div key={i} className="text-xs">
                <div className="flex justify-between text-slate-600 mb-1 font-medium">
                  <span>{factor.name}</span>
                  <span className="font-semibold">{factor.score}% ({factor.status})</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${factor.score}%`,
                      backgroundColor: factor.score >= 80 ? "#10b981" : factor.score >= 55 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {onOpenAiModal && (
            <button
              onClick={onOpenAiModal}
              className="w-full mt-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="h-3.5 w-3.5" /> View Detailed AI Threat Assessment
            </button>
          )}
        </div>
      )}
    </div>
  );
}
