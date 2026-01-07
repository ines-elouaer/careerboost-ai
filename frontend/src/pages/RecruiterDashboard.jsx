// src/pages/RecruiterDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const RecruiterDashboard = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ required skills input
  const [reqSkillInput, setReqSkillInput] = useState("");

  // ✅ edit mode
  const [editingJobId, setEditingJobId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "full-time",
    description: "",
    requiredSkills: [],
  });

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const userId = useMemo(() => user?.id || user?._id || null, [user]);

  const fetchJobs = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await api.get("/jobs");
      const myJobs = res.data.filter(
        (job) => job.recruiter && job.recruiter._id === userId
      );
      setJobs(myJobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const resetForm = () => {
    setEditingJobId(null);
    setForm({
      title: "",
      company: "",
      location: "",
      type: "full-time",
      description: "",
      requiredSkills: [],
    });
    setReqSkillInput("");
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ✅ add/remove required skill
  const addReqSkill = () => {
    const s = reqSkillInput.trim();
    if (!s) return;

    setForm((f) => {
      if (f.requiredSkills.some((x) => x.toLowerCase() === s.toLowerCase()))
        return f;
      return { ...f, requiredSkills: [...f.requiredSkills, s] };
    });

    setReqSkillInput("");
  };

  const removeReqSkill = (skill) => {
    setForm((f) => ({
      ...f,
      requiredSkills: f.requiredSkills.filter((x) => x !== skill),
    }));
  };

  const handleReqSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addReqSkill();
    }
  };

  // ✅ create OR update job
  const handleSubmitJob = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      if (editingJobId) {
        // ✅ UPDATE
        const res = await api.put(`/jobs/${editingJobId}`, form);

        setJobs((prev) =>
          prev.map((j) => (j._id === editingJobId ? res.data : j))
        );
        setMessage("Offre mise à jour ✅");
        resetForm();
      } else {
        // ✅ CREATE
        const res = await api.post("/jobs", form);
        setJobs((prev) => [res.data, ...prev]);
        setMessage("Offre créée avec succès ✅");
        resetForm();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l’opération.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ click "Modifier" -> fill form
  const handleEditClick = (job) => {
    setMessage("");
    setEditingJobId(job._id);

    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      type: job.type || "full-time",
      description: job.description || "",
      requiredSkills: Array.isArray(job.requiredSkills)
        ? job.requiredSkills
        : [],
    });

    setReqSkillInput("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ delete job
  const handleDeleteJob = async (jobId) => {
    const ok = window.confirm("Supprimer cette offre ?");
    if (!ok) return;

    setMessage("");
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setMessage("Offre supprimée ✅");

      // si on supprime l’offre qu’on éditait
      if (editingJobId === jobId) resetForm();
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur suppression.");
    }
  };

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

  return (
    <div className="dash-page">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-left">
          <div className="chip">
            <span className="chip-dot" />
            Espace recruteur
          </div>

          <h1 className="dash-title">Dashboard Recruteur</h1>
          <p className="dash-subtitle">
            Publiez des offres, recevez des candidatures et suivez vos postes en
            cours.
          </p>
        </div>

        <div className="dash-header-right">
          <div className="dash-stat-card">
            <p className="dash-stat-label">Offres publiées</p>
            <p className="dash-stat-value">{jobs.length}</p>
            <p className="dash-stat-hint">Gérez vos annonces depuis cette page.</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && <p className="dash-message">{message}</p>}

      {/* Layout 2 colonnes */}
      <div className="dash-layout">
        {/* Colonne gauche : formulaire */}
        <div className="dash-card">
          <div className="dash-card-head">
            <h2>{editingJobId ? "Modifier l’offre" : "Créer une nouvelle offre"}</h2>
            <p>
              {editingJobId
                ? "Modifie les informations puis clique sur Mettre à jour."
                : "Remplissez les informations essentielles pour publier."}
            </p>
          </div>

          <form onSubmit={handleSubmitJob} className="dash-form">
            <div className="dash-grid">
              <div className="auth-field">
                <label>Titre</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ex : Développeur MERN Junior"
                  required
                />
              </div>

              <div className="auth-field">
                <label>Entreprise</label>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Ex : TechCorp"
                  required
                />
              </div>

              <div className="auth-field">
                <label>Localisation</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Ex : Tunis / Remote"
                />
              </div>

              <div className="auth-field">
                <label>Type</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="full-time">Temps plein</option>
                  <option value="part-time">Temps partiel</option>
                  <option value="internship">Stage</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div className="auth-field dash-textarea">
                <label>Description</label>
                <textarea
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Mission, technologies, profil recherché..."
                />
              </div>
            </div>

            {/* ✅ Required skills */}
            <div className="auth-field">
              <label>Compétences requises (pour Match IA)</label>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={reqSkillInput}
                  onChange={(e) => setReqSkillInput(e.target.value)}
                  onKeyDown={handleReqSkillKeyDown}
                  placeholder="Ex: React, Node.js, MongoDB"
                />
                <button type="button" className="btn-ghost" onClick={addReqSkill}>
                  Ajouter
                </button>
              </div>

              {form.requiredSkills.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {form.requiredSkills.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => removeReqSkill(s)}
                      className="skill-pill"
                      title="Supprimer"
                    >
                      {s} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ Submit + cancel edit */}
            <button type="submit" className="btn-primary dash-submit" disabled={saving}>
              {saving
                ? "Enregistrement..."
                : editingJobId
                ? "Mettre à jour l’offre"
                : "Publier l’offre"}
            </button>

            {editingJobId && (
              <button
                type="button"
                className="btn-ghost dash-submit"
                style={{ marginTop: 10 }}
                onClick={resetForm}
              >
                Annuler la modification
              </button>
            )}
          </form>
        </div>

        {/* Colonne droite : liste des offres */}
        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Mes offres publiées</h2>
            <p>Liste de vos offres. Cliquez pour voir le détail.</p>
          </div>

          {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Chargement…</p>
          ) : jobs.length === 0 ? (
            <div className="dash-empty">
              <p>Vous n’avez pas encore publié d’offres.</p>
              <p className="dash-empty-hint">Créez votre première annonce à gauche.</p>
            </div>
          ) : (
            <div className="dash-jobs-list">
              {jobs.map((job) => (
                <div className="dash-job-item" key={job._id}>
                  <div className="dash-job-top">
                    <div>
                      <h3 className="dash-job-title">{job.title}</h3>
                      <p className="dash-job-meta">
                        {job.company} • {job.location || "N/A"} • {typeLabel(job.type)}
                      </p>
                    </div>

                    <div className="dash-job-badge">
                      {job.isActive === false ? "Fermée" : "Active"}
                    </div>
                  </div>

                  <p className="dash-job-desc">
                    {job.description
                      ? job.description.slice(0, 160) + (job.description.length > 160 ? "…" : "")
                      : "Aucune description."}
                  </p>

                  {/* ✅ show requiredSkills small preview */}
                  {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {job.requiredSkills.slice(0, 6).map((s) => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="dash-job-actions">
                    <Link className="btn-ghost btn-sm" to={`/jobs/${job._id}`}>
                      Voir détails
                    </Link>

                    {/* ✅ Modifier */}
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => handleEditClick(job)}
                    >
                      Modifier
                    </button>

                    {/* ✅ Supprimer */}
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => handleDeleteJob(job._id)}
                      style={{ color: "crimson" }}
                    >
                      Supprimer
                    </button>

                    {/* 🔒 Candidatures */}
                    {job.recruiter &&
                      (job.recruiter._id === user?.id || job.recruiter === user?.id) && (
                        <Link
                          className="btn-primary btn-sm"
                          to={`/recruiter/jobs/${job._id}/applications`}
                        >
                          Candidatures
                        </Link>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
