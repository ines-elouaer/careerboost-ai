import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function CandidateProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await api.get(`/profiles/user/${userId}`);
        setProfile(res.data);
      } catch (e) {
        console.error(e);
        setProfile(null);
        setErrorMsg(e.response?.data?.message || "Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const fullName = profile?.fullName || "Candidat";
  const initial = useMemo(() => fullName.trim().charAt(0).toUpperCase(), [fullName]);

  const yearsLabel =
    profile?.yearsOfExperience && Number(profile.yearsOfExperience) > 0
      ? `${profile.yearsOfExperience} an(s)`
      : "Débutant";

  // ✅ skills strings
  const skills = useMemo(() => {
    const arr = profile?.skills;
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
  }, [profile]);

  if (loading) return <p className="page-padding">Chargement…</p>;
  if (!profile) return <p className="page-padding">{errorMsg || "Profil introuvable."}</p>;

  return (
    <div className="cand-page">
      <div className="cand-container">
        <Link to={-1} className="cand-back">
          ← Retour
        </Link>

        <div className="cand-titleBlock">
          <h1 className="cand-pageTitle">Profil du candidat</h1>
          <p className="cand-pageSub">Informations visibles par le recruteur</p>
        </div>

        <div className="cand-card">
          {/* ✅ LEFT: AVATAR */}
          <div className="cand-photoWrap">
            {profile.avatar ? (
              <img className="cand-photo" src={profile.avatar} alt="Photo du candidat" />
            ) : (
              <div className="cand-photoFallback">{initial}</div>
            )}
          </div>

          {/* RIGHT */}
          <div className="cand-body">
            <div className="cand-head">
              <h2 className="cand-name">{profile.fullName}</h2>
              <p className="cand-headline">{profile.headline || "—"}</p>
              <p className="cand-meta">
                {profile.location || "—"} <span className="cand-dot">•</span> {yearsLabel}
              </p>
            </div>

            <div className="cand-divider" />

            <div className="cand-section">
              <h3 className="cand-h3">À propos</h3>
              <p className="cand-text">{profile.bio || "—"}</p>
            </div>

            <div className="cand-divider" />

            <div className="cand-section">
              <h3 className="cand-h3">Compétences</h3>

              <div className="cand-skills">
                {skills.length ? (
                  skills.map((s, idx) => (
                    <span key={`${s}-${idx}`} className="cand-skillTag">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="cand-muted">Aucune compétence renseignée.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}
