// src/pages/Notifications.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const statusLabel = (status) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "reviewed":
      return "En cours de revue";
    case "accepted":
      return "Acceptée";
    case "rejected":
      return "Refusée";
    default:
      return "—";
  }
};

const statusText = (status) => {
  // texte pour la phrase
  switch (status) {
    case "pending":
      return "en attente";
    case "reviewed":
      return "en cours de revue";
    case "accepted":
      return "acceptée";
    case "rejected":
      return "refusée";
    default:
      return "mise à jour";
  }
};

const typeLabel = (type) => {
  switch (type) {
    case "NEW_APPLICATION":
      return "Nouvelle candidature";
    case "APPLICATION_STATUS":
      return "Mise à jour de candidature";
    default:
      return "Notification";
  }
};

const when = (date) => {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return "—";
  }
};

// extrait un titre d'offre depuis ton message si jamais jobOffer n'est pas populé
const extractJobTitleFromMessage = (msg = "") => {
  // Ex: Votre candidature pour "Offre de Stage PFE" est maintenant ...
  const m = msg.match(/["“«](.+?)["”»]/);
  return m?.[1] || "cette offre";
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unread

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("loadNotifs:", err?.response?.data || err.message);
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const unreadCount = useMemo(
    () => notifs.filter((n) => !n.isRead).length,
    [notifs]
  );

  const shownNotifs = useMemo(() => {
    if (filter === "unread") return notifs.filter((n) => !n.isRead);
    return notifs;
  }, [notifs, filter]);

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("markAllRead:", err?.response?.data || err.message);
    }
  };

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifs((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("markOneRead:", err?.response?.data || err.message);
    }
  };

  const buildFrenchMessage = (n) => {
    // on reconstruit proprement la phrase pour éviter accepted/rejected en anglais
    if (n.type === "APPLICATION_STATUS") {
      const title = n.jobOffer?.title || extractJobTitleFromMessage(n.message);
      const st = n.application?.status;
      return `Votre candidature pour « ${title} » a été ${statusText(st)}.`;
    }
    return n.message; // NEW_APPLICATION déjà en français chez toi
  };

  const actionLink = (n) => {
    // recruteur
    if (n.type === "NEW_APPLICATION" && n.jobOffer?._id) {
      return { to: `/recruiter/jobs/${n.jobOffer._id}/applications`, label: "Voir" };
    }
    // candidat
    if (n.type === "APPLICATION_STATUS" && n.jobOffer?._id) {
      return { to: `/jobs/${n.jobOffer._id}`, label: "Voir l’offre" };
    }
    return null;
  };

  if (!user) {
    return (
      <div className="notif-page">
        <div className="notif-empty">
          <p className="text-muted" style={{ margin: 0 }}>
            Connectez-vous pour voir vos notifications.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <p style={{ padding: "2rem" }}>Chargement…</p>;

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div>
          <div className="chip">
            <span className="chip-dot" />
            Centre de notifications
          </div>

          <h1 className="notif-title">Notifications</h1>
          <p className="notif-subtitle">
            Suivez les candidatures et les mises à jour importantes.
          </p>
        </div>

        <div className="notif-header-right">
          <div className="notif-stat-card">
            <p className="notif-stat-label">NON LUES</p>
            <p className="notif-stat-value">{unreadCount}</p>
            <p className="notif-stat-hint">À traiter</p>
          </div>
        </div>
      </div>

      <div className="notif-toolbar">
        <div className="notif-tabs">
          <button
            type="button"
            className={`notif-tab ${filter === "all" ? "notif-tab-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Toutes
          </button>

          <button
            type="button"
            className={`notif-tab ${filter === "unread" ? "notif-tab-active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Non lues {unreadCount > 0 ? `(${unreadCount})` : ""}
          </button>
        </div>

        {notifs.length > 0 && unreadCount > 0 && (
          <button type="button" className="btn-ghost btn-sm" onClick={markAllRead}>
            Tout marquer comme lu
          </button>
        )}
      </div>

      {shownNotifs.length === 0 ? (
        <div className="notif-empty">
          <p className="text-muted" style={{ margin: 0 }}>
            {filter === "unread"
              ? "Aucune notification non lue."
              : "Aucune notification pour le moment."}
          </p>
        </div>
      ) : (
        <div className="notif-list">
          {shownNotifs.map((n) => {
            const link = actionLink(n);
            const rightStatus =
              n.type === "APPLICATION_STATUS" ? n.application?.status : null;

            return (
              <div
                key={n._id}
                className={`notif-item ${n.isRead ? "notif-read" : "notif-unread"}`}
              >
                <div className="notif-left">
                  {!n.isRead && <span className="notif-dot" />}

                  <div>
                    <div className="notif-topline">
                      <span className="notif-type">{typeLabel(n.type)}</span>
                    </div>

                    {/* ✅ message FR reconstruit */}
                    <div className="notif-message">{buildFrenchMessage(n)}</div>

                    <div className="notif-date">{when(n.createdAt)}</div>
                  </div>
                </div>

                {/* ✅ à droite: badge statut + bouton voir offre (plus petit) */}
                <div className="notif-right">
                  {rightStatus && (
                    <span className={`notif-status notif-${rightStatus}`}>
                      {statusLabel(rightStatus)}
                    </span>
                  )}

                  {link && (
                    <Link
                      to={link.to}
                      className="btn-ghost btn-sm"
                      onClick={() => markOneRead(n._id)}
                    >
                      {link.label}
                    </Link>
                  )}

                  {!n.isRead && (
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => markOneRead(n._id)}
                    >
                      Marquer lu
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
