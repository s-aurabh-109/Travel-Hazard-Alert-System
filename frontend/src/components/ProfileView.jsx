import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSafety } from "../context/SafetyContext";
import { getEmergencyContacts } from "../services/nodeApi";

export default function ProfileView() {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const { isNodeOnline, isAiOnline } = useSafety();

  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("tourist");
  const [contacts, setContacts] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadContacts() {
      const data = await getEmergencyContacts();
      if (data) setContacts(data);
    }
    loadContacts();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (mode === "login") {
      const res = await login(email, password);
      if (!res.success) setMsg(res.message);
    } else {
      const res = await register(name, email, password, role);
      if (!res.success) setMsg(res.message);
    }
  };

  return (
    <div className="tab-view-container">
      <div className="view-header">
        <h2>👤 Tourist Safety Profile</h2>
        <p>Manage authentication, emergency contacts, & system status</p>
      </div>

      {/* Backend Health Diagnostic Banner */}
      <div className="profile-card system-status-card">
        <h3>⚡ Live Backend Connectivity</h3>
        <div className="status-grid">
          <div className="status-row">
            <span className="status-title">Node.js Express Backend (Port 5000)</span>
            <span className={`status-indicator ${isNodeOnline ? "online" : "demo"}`}>
              {isNodeOnline ? "● CONNECTED LIVE" : "● DEMO / MOCK MODE"}
            </span>
          </div>
          <div className="status-row">
            <span className="status-title">FastAPI AI Microservice (Port 8001)</span>
            <span className={`status-indicator ${isAiOnline ? "online" : "demo"}`}>
              {isAiOnline ? "● CONNECTED LIVE" : "● DEMO / MOCK MODE"}
            </span>
          </div>
        </div>
      </div>

      {isAuthenticated && user ? (
        <>
          {/* Profile Card */}
          <div className="profile-card user-card">
            <div className="user-avatar-row">
              <div className="user-avatar">{user.name ? user.name[0].toUpperCase() : "U"}</div>
              <div>
                <h3 className="user-name">{user.name}</h3>
                <span className="role-tag">{user.role || "tourist"}</span>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
            <button className="logout-btn" onClick={logout} type="button">
              Log Out
            </button>
          </div>

          {/* Emergency Contacts List */}
          <div className="profile-card contacts-card">
            <h3>📞 Emergency SOS Contacts</h3>
            <div className="contacts-list">
              {contacts.map((c) => (
                <div key={c.id} className="contact-item">
                  <div>
                    <strong>{c.name}</strong> ({c.relation})
                    <p className="contact-phone">{c.phone}</p>
                  </div>
                  <a className="call-btn" href={`tel:${c.phone}`}>
                    📞 Call
                  </a>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Auth Form Card */
        <div className="profile-card auth-card">
          <div className="auth-toggle">
            <button
              className={`toggle-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`toggle-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
              type="button"
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {mode === "register" && (
              <div className="input-field">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="input-field">
              <label>Email Address</label>
              <input
                type="email"
                required
                placeholder="tourist@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-field">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === "register" && (
              <div className="input-field">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="tourist">Tourist User</option>
                  <option value="police">Police Officer</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
            )}

            {msg && <p className="auth-error-msg">{msg}</p>}

            <button type="submit" className="auth-submit-btn">
              {mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
