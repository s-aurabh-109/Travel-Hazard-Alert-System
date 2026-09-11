import { useState, useEffect } from "react";
import { useSafety } from "../../context/SafetyContext";
import { AlertOctagon, X, PhoneCall, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function SosModal({ onClose }: { onClose: () => void }) {
  const { triggerSos, cancelSos, isSosActive, userLocation, sosStatus } = useSafety();
  const [countdown, setCountdown] = useState(3);
  const [isCounting, setIsCounting] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    let timer: any;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (isCounting && countdown === 0) {
      setIsCounting(false);
      triggerSos(note || "EMERGENCY PANIC ALERT: Immediate assistance required!");
    }
    return () => clearTimeout(timer);
  }, [isCounting, countdown, note, triggerSos]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[400px] bg-white rounded-[28px] p-6 shadow-float border border-slate-100 text-slate-900 text-center relative overflow-hidden space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="press absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 grid place-items-center text-slate-500 hover:text-slate-900"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#EF4444] ring-8 ring-red-50 font-bold">
            <AlertOctagon className="h-7 w-7 animate-bounce" />
          </div>

          <div>
            <h2 className="font-display font-extrabold text-[20px] text-[#EF4444]">Emergency SOS Panic</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Live GPS Broadcast to Emergency Services & Hotlines
            </p>
          </div>

          {isSosActive ? (
            <div className="py-2 space-y-3">
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-left space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-[#EF4444] font-extrabold text-[13px]">
                  <CheckCircle2 className="h-4 w-4" /> SOS BEACON DISPATCHED
                </div>
                <p className="text-slate-700">
                  📍 <strong>GPS Position:</strong> {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                </p>
                <p className="text-slate-700">
                  ⚡ <strong>Status:</strong> {sosStatus?.status || "DISPATCHED TO POLICE & HELPLINES"}
                </p>
              </div>

              <button
                onClick={() => {
                  cancelSos();
                  onClose();
                }}
                className="press w-full py-3 px-4 bg-slate-900 text-white font-bold text-xs rounded-2xl shadow-soft"
              >
                ⏹️ Stand Down / Cancel SOS
              </button>
            </div>
          ) : isCounting ? (
            <div className="py-4 space-y-3">
              <div className="h-20 w-20 mx-auto rounded-full border-4 border-[#EF4444] flex items-center justify-center text-3xl font-extrabold text-[#EF4444] animate-pulse bg-red-50">
                {countdown}
              </div>
              <p className="text-[12px] text-slate-600 font-medium">Broadcasting beacon in {countdown}s...</p>
              <button
                onClick={() => setIsCounting(false)}
                className="press py-2 px-5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-full border border-slate-200"
              >
                Cancel Countdown
              </button>
            </div>
          ) : (
            <div className="py-1 space-y-3">
              <div className="text-left">
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Optional Note:</label>
                <input
                  type="text"
                  placeholder="e.g. Following suspicious vehicle near station"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>

              <button
                onClick={() => {
                  setIsCounting(true);
                  setCountdown(3);
                }}
                className="press w-full h-32 rounded-3xl bg-gradient-to-br from-red-600 to-red-500 text-white font-extrabold flex flex-col items-center justify-center gap-1.5 shadow-float active:scale-95 transition-all"
              >
                <ShieldAlert className="h-9 w-9 text-white" />
                <span className="text-xs tracking-wider">TAP OR HOLD TO TRIGGER ALARM</span>
              </button>

              <div className="flex gap-2 text-xs pt-1">
                <a
                  href="tel:112"
                  className="press flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center gap-1.5 font-bold"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-blue-600" /> Call 112
                </a>
                <a
                  href="tel:1091"
                  className="press flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center gap-1.5 font-bold"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-pink-600" /> Call 1091
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
