import { useState, useEffect } from "react";
import { useSafety } from "../context/SafetyContext";

export default function SosModal({ onClose }) {
  const { triggerSos, cancelSos, isSosActive, userLocation, sosStatus } = useSafety();
  const [countdown, setCountdown] = useState(3);
  const [isCounting, setIsCounting] = useState(false);
  const [customMsg, setCustomMsg] = useState("");

  useEffect(() => {
    let timer;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (isCounting && countdown === 0) {
      setIsCounting(false);
      triggerSos(customMsg || "EMERGENCY PANIC ALERT: Immediate assistance required!");
    }
    return () => clearTimeout(timer);
  }, [isCounting, countdown, customMsg, triggerSos]);

  const handleStartPanic = () => {
    setIsCounting(true);
    setCountdown(3);
  };

  const handleCancel = () => {
    setIsCounting(false);
    setCountdown(3);
    cancelSos();
    if (onClose) onClose();
  };

  return (
    <div className="sos-modal-overlay">
      <div className="sos-modal-content">
        <div className="sos-modal-header">
          <span className="sos-alert-icon">🚨</span>
          <h2>EMERGENCY SOS PANIC</h2>
          <p>Instant dispatch to emergency contacts & police hotline</p>
        </div>

        {isSosActive ? (
          <div className="sos-active-view">
            <div className="sos-beacon-ring">
              <span className="beacon-ping"></span>
              <span className="sos-text">SOS ACTIVE</span>
            </div>

            <div className="sos-details-card">
              <p className="sos-coords">
                📍 <strong>GPS Coordinates:</strong> {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
              </p>
              <p className="sos-status-badge">
                Status: {sosStatus?.status || "DISPATCHED TO NEARBY POLICE & HELPLINES"}
              </p>
            </div>

            <button className="sos-cancel-btn" onClick={handleCancel} type="button">
              ⏹️ STAND DOWN / CANCEL SOS ALARM
            </button>
          </div>
        ) : (
          <div className="sos-trigger-view">
            {isCounting ? (
              <div className="countdown-ring">
                <span className="countdown-num">{countdown}</span>
                <p>Broadcasting GPS signal in {countdown}s...</p>
                <button className="sos-cancel-btn" onClick={() => setIsCounting(false)} type="button">
                  CANCEL COUNTDOWN
                </button>
              </div>
            ) : (
              <>
                <div className="sos-input-group">
                  <label htmlFor="sos-msg">Optional Emergency Note:</label>
                  <input
                    id="sos-msg"
                    type="text"
                    placeholder="e.g. Followed by suspicious car near central station"
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                  />
                </div>

                <button className="sos-big-button" onClick={handleStartPanic} type="button">
                  <span className="sos-button-icon">🚨</span>
                  <span className="sos-button-text">HOLD FOR 3 SECONDS OR TAP TO TRIGGER</span>
                </button>

                <button className="sos-close-text-btn" onClick={onClose} type="button">
                  Dismiss Window
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
