// src/pages/JobApplications.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

const JobApplications = () => {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState(null);

  const statusLabel = useMemo(
    () => ({
      pending: "En attente",
      reviewed: "En revue",
      accepted: "Acceptée",
      rejected: "Refusée",
    }),
    []
  );

  const loadData = async () => {
    setLoading(true);
    setMessage("");
    try {
      // 1) récupérer l'offre
      const jobRes = await api.get(`/jobs/${jobId}`);
      setJob(jobRes.data);

      // 2) récupérer les candidatures (recruteur propriétaire)
      const appsRes = await api.get(`/applications/job/${jobId}`);
      setApplications(appsRes.data);
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          "Erreur lors du chargement des candidatures."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const updateStatus = async (applicationId, status) => {
    setMessage("");
    setSavingId(applicationId);

    try {
      await api.patch(`/applications/${applicationId}/status`, { status });

      if (status === "accepted") {
        setMessage("Candidature acceptée ✅ — le candidat a reçu une notification.");
      } else if (status === "rejected") {
        setMessage("Candidature refusée ❌ — le candidat a reçu une notification.");
      } else if (status === "reviewed") {
        setMessage("Statut mis à jour : En revue 👀");
      } else {
        setMessage("Statut mis à jour ✅");
      }

      await loadData();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour du statut."
      );
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Chargement…</p>;
  if (!job) return <p style={{ padding: "2rem" }}>Offre introuvable.</p>;

  return (
    <div className="dash-page">
      {/* Retour */}
      <Link to="/recruiter" className="btn-ghost btn-sm">
        ← Retour dashboard
      </Link>

      {/* Header */}
      <div className="dash-header" style={{ marginTop: "1rem" }}>
        <div className="dash-header-left">
          <div className="chip">
            <span className="chip-dot" />
            Candidatures
          </div>

          <h1 className="dash-title">Candidatures · {job.title}</h1>
          <p className="dash-subtitle">
            {job.company} • {job.location || "Lieu non précisé"}
          </p>
        </div>

        <div className="dash-header-right">
          <div className="dash-stat-card">
            <p className="dash-stat-label">Total</p>
            <p className="dash-stat-value">{applications.length}</p>
            <p className="dash-stat-hint">Candidatures reçues</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && <p className="dash-message">{message}</p>}

      {/* Liste */}
      {applications.length === 0 ? (
        <div className="dash-card">
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            Aucune candidature pour cette offre.
          </p>
        </div>
      ) : (
        <div className="dash-card">
          <div className="dash-jobs-list">
            {applications.map((app) => (
              <div key={app._id} className="dash-job-item">
                <div className="dash-job-top">
                  <div>
                    <h3 className="dash-job-title">
                      {app.candidate?.username || "Candidat"}{" "}
                      <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                        ({app.candidate?.email || "email"})
                      </span>
                    </h3>

                    <p className="dash-job-meta">
                      Statut :{" "}
                      <strong>
                        {statusLabel[app.status] || app.status}
                      </strong>
                    </p>
                  </div>

                  <div className="dash-job-badge">
                    {statusLabel[app.status] || app.status}
                  </div>
                </div>

                {app.motivationLetter && (
                  <p className="dash-job-desc">
                    <strong>Motivation :</strong> {app.motivationLetter}
                  </p>
                )}

                <div className="dash-job-actions">
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => updateStatus(app._id, "reviewed")}
                    disabled={savingId === app._id}
                  >
                    {savingId === app._id ? "..." : "En revue"}
                  </button>

                  <button
                    className="btn-primary btn-sm"
                    onClick={() => updateStatus(app._id, "accepted")}
                    disabled={savingId === app._id}
                  >
                    {savingId === app._id ? "..." : "Accepter"}
                  </button>

                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => updateStatus(app._id, "rejected")}
                    disabled={savingId === app._id}
                  >
                    {savingId === app._id ? "..." : "Refuser"}
                  </button>
                  <Link
  to={`/candidates/${app.candidate._id}`}
  className="btn-ghost btn-sm"
>
  Voir profil
</Link>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplications;
