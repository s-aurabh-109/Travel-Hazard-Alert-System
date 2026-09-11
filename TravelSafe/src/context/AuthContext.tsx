import { createContext, useContext, useState, type ReactNode } from "react";
import { loginUser as apiLogin, registerUser as apiRegister } from "../services/nodeApi";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, pass: string, role?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("user_info");
    return saved ? JSON.parse(saved) : { id: "u-demo", name: "Saurabh Kumar", email: "saurabh@travelsafe.in", role: "tourist" };
  });

  const [token, setToken] = useState<string>(() => {
    if (typeof window === "undefined") return "demo-token";
    return localStorage.getItem("auth_token") || "demo-token";
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    if (res && res.token) {
      setToken(res.token);
      setUser(res.user);
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem("user_info", JSON.stringify(res.user));
      }
      return { success: true };
    }
    return { success: false, message: "Login failed" };
  };

  const register = async (name: string, email: string, password: string, role = "tourist") => {
    const res = await apiRegister(name, email, password, role);
    if (res && res.token) {
      setToken(res.token);
      setUser(res.user);
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem("user_info", JSON.stringify(res.user));
      }
      return { success: true };
    }
    return { success: false, message: "Registration failed" };
  };

  const logout = () => {
    setUser(null);
    setToken("");
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_info");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
