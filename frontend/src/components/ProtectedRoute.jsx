import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// check expiration sans lib
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, logout } = useAuth();
  const token = localStorage.getItem("token");

  if (loading) return <p style={{ padding: "2rem" }}>Chargement...</p>;

  // pas de token => pas connecté
  if (!token) return <Navigate to="/login" replace />;

  // token expiré => logout + login
  if (isTokenExpired(token)) {
    logout();
    return <Navigate to="/login" replace />;
  }

  // user pas chargé (cas rare) => login
  if (!user) return <Navigate to="/login" replace />;

  // roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
