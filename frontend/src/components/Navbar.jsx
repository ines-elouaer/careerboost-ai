// src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // ✅ AJOUT
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const res = await api.get("/notifications/unread-count");
        setUnreadCount(res.data?.count || 0);
      } catch (err) {
        console.error("Erreur unread-count:", err);
        setUnreadCount(0);
      }
    };

    fetchUnread();
    const timer = setInterval(fetchUnread, 15000);
    return () => clearInterval(timer);
  }, [user]);

  // ✅ AJOUT: logout + redirect
  const handleLogout = () => {
    logout();            // supprime token + user
    navigate("/login");  // redirect vers login
  };

  return (
    <header className="cb-nav">
      <div className="cb-nav__inner">
        {/* Logo */}
        <Link to="/" className="cb-nav__brand">
          <div className="cb-nav__logo">C</div>

          <div className="cb-nav__brandText">
            <div className="cb-nav__brandName">CareerBoost</div>
            <div className="cb-nav__brandSub">AI Talent Platform</div>
          </div>
        </Link>

        {/* Liens */}
        <nav className="cb-nav__links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `cb-nav__link ${isActive ? "is-active" : ""}`
            }
          >
            Accueil
          </NavLink>

          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `cb-nav__link ${isActive ? "is-active" : ""}`
            }
          >
            Offres
          </NavLink>

          {user?.role === "recruiter" && (
            <NavLink
              to="/recruiter"
              className={({ isActive }) =>
                `cb-nav__link ${isActive ? "is-active" : ""}`
              }
            >
              Recruteurs
            </NavLink>
          )}

          {user && (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `cb-nav__link ${isActive ? "is-active" : ""}`
              }
            >
              Profil
            </NavLink>
          )}

          {user && (
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `cb-nav__link cb-nav__notif ${isActive ? "is-active" : ""}`
              }
            >
              Notifications
              {unreadCount > 0 && (
                <span className="cb-badge" aria-label="Notifications non lues">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </NavLink>
          )}
        </nav>

        {/* Actions */}
        <div className="cb-nav__actions">
          {!user ? (
            <>
              <Link to="/login" className="cb-btn cb-btn--ghost">
                Se connecter
              </Link>
              <Link to="/register" className="cb-btn cb-btn--primary">
                S’inscrire
              </Link>
            </>
          ) : (
            <>
              <span className="cb-nav__user">
                {user.username} · {user.role}
              </span>
              <button onClick={handleLogout} className="cb-btn cb-btn--soft">
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
