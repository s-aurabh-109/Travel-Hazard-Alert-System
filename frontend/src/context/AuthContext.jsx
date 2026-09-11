import { createContext, useContext, useState } from "react";
import { loginUser as apiLogin, registerUser as apiRegister } from "../services/nodeApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user_info");
    return saved ? JSON.parse(saved) : { id: "demo-user", name: "Tourist User", role: "tourist", email: "tourist@safe.org" };
  });

  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || "demo-token");
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res && res.token) {
      setToken(res.token);
      setUser(res.user);
      setIsAuthenticated(true);
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("user_info", JSON.stringify(res.user));
      return { success: true };
    }
    return { success: false, message: "Login failed" };
  };

  const register = async (name, email, password, role) => {
    const res = await apiRegister(name, email, password, role);
    if (res && res.token) {
      setToken(res.token);
      setUser(res.user);
      setIsAuthenticated(true);
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("user_info", JSON.stringify(res.user));
      return { success: true };
    }
    return { success: false, message: "Registration failed" };
  };

  const logout = () => {
    setUser(null);
    setToken("");
    setIsAuthenticated(false);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
