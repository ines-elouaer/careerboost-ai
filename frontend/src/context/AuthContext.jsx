import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// optionnel: check expiration token
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

// helper: récupérer user depuis réponse backend (2 formats possibles)
const extractUser = (data) => {
  // format A: { token, user: {...} }
  if (data?.user) return data.user;

  // format B: { token, _id, username, email, role }
  if (data?._id) {
    const { _id, username, email, role } = data;
    return { _id, username, email, role };
  }

  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // au refresh: si token => /auth/me
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data)) // /auth/me doit renvoyer l'utilisateur
      .catch(() => { localStorage.removeItem("token"); setUser(null); })

      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);

    const u = extractUser(res.data);
    setUser(u);
  };

  const register = async (username, email, password, role) => {
    const res = await api.post("/auth/register", {
      username,
      email,
      password,
      role,
    });
    localStorage.setItem("token", res.data.token);

    const u = extractUser(res.data);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
