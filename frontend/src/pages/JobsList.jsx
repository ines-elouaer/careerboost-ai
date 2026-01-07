// src/pages/JobsList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    api
      .get("/jobs")
      .then((res) => setJobs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const typeLabel = (t) => {
    switch (t) {
      case "full-time":
        return "Temps plein";
      case "part-time":
        return "Temps partiel";
      case "internship":
        return "Stage";
      case "freelance":
        return "Freelance";
      default:
        return t;
    }
  };

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesQuery =
        !q ||
        job.title?.toLowerCase().includes(q) ||
        job.company?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q);

      const matchesType = typeFilter === "all" || job.type === typeFilter;

      return matchesQuery && matchesType;
    });
  }, [jobs, query, typeFilter]);

  return (
    <div className="jobs-page">
      {/* Header */}
      <div className="jobs-header">
        <div className="jobs-header-left">
          <div className="chip">
            <span className="chip-dot" />
            Opportunités
          </div>
          <h1 className="jobs-title">Offres d’emploi</h1>
          <p className="jobs-subtitle">
            Parcourez les opportunités publiées par les recruteurs et trouvez
            celle qui correspond à votre profil.
          </p>
        </div>

        <div className="jobs-header-right">
          <div className="jobs-stat-card">
            <p className="jobs-stat-label">Offres disponibles</p>
            <p className="jobs-stat-value">{loading ? "…" : jobs.length}</p>
            <p className="jobs-stat-hint">Mises à jour en temps réel.</p>
          </div>
        </div>
      </div>

      {/* Barre recherche + filtres */}
      <div className="jobs-toolbar">
        <div className="jobs-search">
          <label>Rechercher</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titre, entreprise, localisation…"
          />
        </div>

        <div className="jobs-filter">
          <label>Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="full-time">Temps plein</option>
            <option value="part-time">Temps partiel</option>
            <option value="internship">Stage</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <p style={{ padding: "1rem", color: "var(--text-muted)" }}>
          Chargement des offres…
        </p>
      ) : filteredJobs.length === 0 ? (
        <div className="jobs-empty">
          <p>Aucune offre ne correspond à votre recherche.</p>
          <p className="jobs-empty-hint">
            Essayez un autre mot-clé ou changez le filtre.
          </p>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <Link key={job._id} to={`/jobs/${job._id}`} className="jobs-card">
              <div className="jobs-card-top">
                <div>
                  <h3 className="jobs-card-title">{job.title}</h3>
                  <p className="jobs-card-meta">
                    {job.company} • {job.location || "Lieu non précisé"}
                  </p>
                </div>

                <span className="jobs-badge">{typeLabel(job.type)}</span>
              </div>

              <p className="jobs-card-desc">
                {job.description
                  ? job.description.slice(0, 120) +
                    (job.description.length > 120 ? "…" : "")
                  : "Aucune description fournie."}
              </p>

              <div className="jobs-card-footer">
                <span className="jobs-view">Voir détails →</span>
                <span className="jobs-date">
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsList;
