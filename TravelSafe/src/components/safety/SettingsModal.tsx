import { useState } from "react";
import { Settings, X, Bell, Shield, Moon, Globe, Sliders, Smartphone, Check } from "lucide-react";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [geofenceRadius, setGeofenceRadius] = useState("2.5");
  const [sosCountdown, setSosCountdown] = useState("3");
  const [hazardAlerts, setHazardAlerts] = useState(true);
  const [audioBriefs, setAudioBriefs] = useState(true);
  const [autoSms, setAutoSms] = useState(true);
  const [highAccuracyGps, setHighAccuracyGps] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[420px] bg-white rounded-[28px] p-5 shadow-float border border-slate-100 text-slate-900 relative max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] text-white grid place-items-center shadow-soft">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-[16px] text-slate-900">App Settings</h2>
              <p className="text-[11px] text-slate-500">Preferences & Safety Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="press h-8 w-8 rounded-full bg-slate-100 grid place-items-center text-slate-500 hover:text-slate-900">
            <X className="h-4 w-4" />
          </button>
        </div>

        {saved && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[#059669] font-bold text-xs flex items-center gap-2">
            <Check className="h-4 w-4" /> Settings updated successfully!
          </div>
        )}

        {/* Section 1: Safety & Geofence Configuration */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex items-center gap-2 font-display font-bold text-slate-900 text-[13px]">
            <Shield className="h-4 w-4 text-[#2563EB]" /> Safety & Geofence Rules
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Danger Zone Alert Radius</span>
              <span className="font-bold text-[#2563EB]">{geofenceRadius} km</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(e.target.value)}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-slate-700">
            <span className="font-medium">SOS Countdown Delay</span>
            <select
              value={sosCountdown}
              onChange={(e) => setSosCountdown(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold"
            >
              <option value="0">Instant Trigger (0s)</option>
              <option value="3">Standard (3s)</option>
              <option value="5">Extended (5s)</option>
            </select>
          </div>
        </div>

        {/* Section 2: Notifications & Alerts */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
          <div className="flex items-center gap-2 font-display font-bold text-slate-900 text-[13px]">
            <Bell className="h-4 w-4 text-[#2563EB]" /> Notifications & Alerts
          </div>

          <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
            <span>Real-time Hazard Popups</span>
            <input
              type="checkbox"
              checked={hazardAlerts}
              onChange={(e) => setHazardAlerts(e.target.checked)}
              className="accent-[#2563EB] h-4 w-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
            <span>Spoken Audio Safety Briefs</span>
            <input
              type="checkbox"
              checked={audioBriefs}
              onChange={(e) => setAudioBriefs(e.target.checked)}
              className="accent-[#2563EB] h-4 w-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
            <span>Auto-SMS to Emergency Contacts</span>
            <input
              type="checkbox"
              checked={autoSms}
              onChange={(e) => setAutoSms(e.target.checked)}
              className="accent-[#2563EB] h-4 w-4 rounded"
            />
          </label>
        </div>

        {/* Section 3: App Preferences & System */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
          <div className="flex items-center gap-2 font-display font-bold text-slate-900 text-[13px]">
            <Smartphone className="h-4 w-4 text-[#2563EB]" /> Display & System
          </div>

          <div className="flex justify-between items-center text-xs text-slate-700">
            <span className="font-medium">App Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Bengali">বাংলা (Bengali)</option>
              <option value="Marathi">मराठी (Marathi)</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
            </select>
          </div>

          <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
            <span>High Precision GPS Tracking</span>
            <input
              type="checkbox"
              checked={highAccuracyGps}
              onChange={(e) => setHighAccuracyGps(e.target.checked)}
              className="accent-[#2563EB] h-4 w-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
            <span>Dark Appearance Theme</span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="accent-[#2563EB] h-4 w-4 rounded"
            />
          </label>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSave}
          className="press w-full py-3 bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] text-white font-extrabold text-xs rounded-2xl shadow-float"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
