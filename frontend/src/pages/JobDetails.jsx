// src/pages/JobDetails.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [motivationLetter, setMotivationLetter] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // ✅ MATCH IA
  const [match, setMatch] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  // ✅ helper: normaliser src image
  const normalizeImgSrc = (val) => {
    if (!val) return null;
    if (typeof val === "string" && val.startsWith("data:image")) return val;
    if (
      typeof val === "string" &&
      (val.startsWith("http://") || val.startsWith("https://"))
    )
      return val;
    const base = api?.defaults?.baseURL || "";
    if (typeof val === "string" && val.startsWith("/")) return `${base}${val}`;
    return val;
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/jobs/${id}`);
        const jobData = res.data;
        setJob(jobData);

        const recruiterUserId = jobData?.recruiter?._id || jobData?.recruiter;
        if (recruiterUserId) {
          try {
            const cpRes = await api.get(`/company-profiles/user/${recruiterUserId}`);
            setCompanyProfile(cpRes.data);
          } catch (e) {
            console.warn("Company profile introuvable:", e);
            setCompanyProfile(null);
          }
        } else {
          setCompanyProfile(null);
        }
      } catch (err) {
        console.error(err);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

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
        return t || "—";
    }
  };

  const publishedLabel = useMemo(() => {
    if (!job?.createdAt) return "—";
    try {
      return new Date(job.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  }, [job?.createdAt]);

  const companyRoute = useMemo(() => {
    const recruiterUserId = job?.recruiter?._id || job?.recruiter;
    if (!recruiterUserId) return null;
    return `/companies/${recruiterUserId}`;
  }, [job?.recruiter]);

  const companyLogo = normalizeImgSrc(companyProfile?.logo || null);
  const companyName = companyProfile?.companyName || job?.company || "Entreprise";
  const companyInitial = (companyName || "C").trim().charAt(0).toUpperCase();

  const handleApply = async () => {
    setMessage("");
    setSending(true);
    try {
      await api.post("/applications", {
        jobOffer: id,
        motivationLetter,
      });
      setMessage("Candidature envoyée avec succès ✅");
      setMotivationLetter("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l’envoi de la candidature.");
    } finally {
      setSending(false);
    }
  };

  // ✅ Bouton Match IA
  const handleMatchIA = async () => {
    setMatchLoading(true);
    setMatchError("");
    setMatch(null);

    try {
      if (!job) throw new Error("Offre introuvable.");

      const jobSkills = Array.isArray(job?.requiredSkills)
        ? job.requiredSkills.map((s) => s?.name || s).filter(Boolean)
        : [];

      const profRes = await api.get("/profiles/me");
      const profileSkills = Array.isArray(profRes.data?.skills) ? profRes.data.skills : [];

      if (jobSkills.length === 0) throw new Error("Cette offre n'a pas de compétences requises.");
      if (profileSkills.length === 0) throw new Error("Ajoute des compétences dans ton profil d'abord.");

      const mRes = await api.post("/ai/match", { profileSkills, jobSkills });
      setMatch(mRes.data.data);
    } catch (e) {
      setMatchError(e.response?.data?.message || e.message || "Erreur match IA");
    } finally {
      setMatchLoading(false);
    }
  };

  if (loading) return <p className="page-padding">Chargement…</p>;
  if (!job) return <p className="page-padding">Offre introuvable.</p>;

  return (
    <div className="jd3-root">
      <div className="jd3-container">
        <div className="jd3-headerRight">
          <button
  type="button"
  className="jd3-back"
  onClick={() => navigate("/jobs")}
>
  ← Retour aux offres
</button>
        </div>

        <div className="jd3-heroCard">
          <div className="jd3-header">
            <div className="jd3-headerLeft">
              <h2 className="jd3-jobTitle">{job.title}</h2>

              <p className="jd3-sub">
                {typeLabel(job.type)} • Publiée le {publishedLabel}
              </p>

              <p className="jd3-sub2">
                <strong>{job.company}</strong>
                <span className="jd3-sep">•</span>
                <span className="jd3-muted">{job.location || "—"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="jd3-grid">
          {/* LEFT */}
          <div className="jd3-left">
            <div className="jd3-card">
              <h3 className="jd3-cardTitle">Description du poste</h3>
              <p className="jd3-text">{job.description || "Aucune description fournie."}</p>
            </div>

            <div className="jd3-card">
              <h3 className="jd3-cardTitle">Informations clés</h3>

              <div className="jd3-infoRows">
                <div className="jd3-infoRow">
                  <span>Entreprise</span>
                  <strong>{job.company}</strong>
                </div>
                <div className="jd3-infoRow">
                  <span>Localisation</span>
                  <strong>{job.location || "—"}</strong>
                </div>
                <div className="jd3-infoRow">
                  <span>Contrat</span>
                  <strong>{typeLabel(job.type)}</strong>
                </div>

                {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                  <div className="jd3-infoRow jd3-infoRowStack">
                    <span>Stack</span>
                    <div className="jd3-tags">
                      {job.requiredSkills.slice(0, 8).map((s, idx) => (
                        <span key={s?._id || s?.name || idx} className="jd3-tag">
                          {s?.name || s || "Compétence"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {user?.role === "candidate" && (
              <div className="jd3-card">
                <h3 className="jd3-cardTitle">Lettre de motivation</h3>

                {message && <div className="jd3-alert">{message}</div>}

                <textarea
                  className="jd3-textarea"
                  rows={7}
                  value={motivationLetter}
                  onChange={(e) => setMotivationLetter(e.target.value)}
                  placeholder="Ex : Je suis motivé(e) car..."
                />

                <button className="btn-primary jd3-btnFull" onClick={handleApply} disabled={sending}>
                  {sending ? "Envoi..." : "Postuler"}
                </button>
              </div>
            )}

            {user?.role === "recruiter" && (
              <div className="jd3-card">
                <h3 className="jd3-cardTitle">Espace recruteur</h3>
                <Link className="btn-primary jd3-btnFull" to={`/recruiter/jobs/${job._id}/applications`}>
                  Voir les candidatures
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <aside className="jd3-right">
            <div className="jd3-sideCard">
              {/* ✅ Match IA */}
              <div className="jd3-match">
                <span className="jd3-matchTitle">Match IA</span>

                <button
                  className="btn-primary jd3-btnFull"
                  onClick={handleMatchIA}
                  disabled={matchLoading}
                  style={{ marginTop: 10 }}
                >
                  {matchLoading ? "Calcul..." : "Calculer le match IA"}
                </button>

                {matchError && <div className="jd3-alert" style={{ marginTop: 10 }}>{matchError}</div>}

                {match && (
                  <div style={{ marginTop: 10 }}>
                    <p className="jd3-matchText">
                      Compatible à <strong>{match.matchPercent}%</strong> avec « {job.title} »
                    </p>

                    {match.missingSkills?.length > 0 && (
                      <>
                        <div className="jd3-muted" style={{ marginTop: 8 }}>Compétences manquantes :</div>
                        <div className="jd3-tags" style={{ marginTop: 6 }}>
                          {match.missingSkills.slice(0, 6).map((s, idx) => (
                            <span key={idx} className="jd3-tag">{s}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Company card */}
              <div className="jd3-companyCard" style={{ marginTop: 14 }}>
                <div className="jd3-avatar" aria-hidden="true">
                  {companyLogo ? (
                    <img
                      src={companyLogo}
                      alt={`Logo ${companyName}`}
                      className="jd3-avatarImg"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="jd3-avatarFallback">{companyInitial}</div>
                  )}
                </div>

                <div className="jd3-companyMeta">
                  <div className="jd3-companyName">{companyName}</div>
                </div>
              </div>

              <div className="jd3-sideActions">
                {companyRoute && (
                  <Link to={companyRoute} className="btn-ghost jd3-btnFull">
                    Voir l’entreprise
                  </Link>
                )}
                <Link to="/jobs" className="btn-ghost jd3-btnFull">
                  Offres similaires
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
