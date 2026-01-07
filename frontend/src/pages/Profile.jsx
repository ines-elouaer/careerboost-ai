import { useEffect, useState } from "react";
import api from "../api/axios";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    bio: "",
    location: "",
    yearsOfExperience: 0,
    skills: [],
    goals: "",          // ✅ AJOUT ICI

    linkedinUrl: "",
    portfolioUrl: "",
    avatar: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Bio IA
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState("");

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [skillsRes, profileRes] = await Promise.all([
          api.get("/skills").catch(() => ({ data: [] })),
          api.get("/profiles/me").catch(() => null),
        ]);

        setSuggestions((skillsRes.data || []).map((s) => s.name).filter(Boolean));

        if (profileRes?.status === 200) {
          const p = profileRes.data;
          setProfile(p);
          setForm({
            fullName: p.fullName || "",
            headline: p.headline || "",
            bio: p.bio || "",
            location: p.location || "",
            yearsOfExperience: p.yearsOfExperience || 0,
            skills: Array.isArray(p.skills) ? p.skills : [],
            goals: p.goals || "",
            linkedinUrl: p.linkedinUrl || "",
            portfolioUrl: p.portfolioUrl || "",
            avatar: p.avatar || "",
          });
          setAvatarPreview(p.avatar || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ---------------- HELPERS ---------------- */
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setForm((f) => ({ ...f, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const addSkill = (raw) => {
    const name = raw.trim();
    if (!name) return;

    setForm((f) => {
      if (f.skills.some((s) => s.toLowerCase() === name.toLowerCase())) return f;
      return { ...f, skills: [...f.skills, name] };
    });

    setSkillInput("");
  };

  const removeSkill = (name) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.filter((s) => s !== name),
    }));
  };

  const handleSkillKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  /* ---------------- BIO IA ---------------- */
  const handleGenerateBioIA = async () => {
  setBioLoading(true);
  setBioError("");
  setMessage("");

  try {
    // 1) Générer la bio (IA / fallback)
    const payload = {
      fullName: form.fullName,
      title: form.headline,
      location: form.location,
      skills: form.skills,
      experienceYears: form.yearsOfExperience,
      goals: form.goals, // ✅ objectifs écrits par candidat
    };

    const aiRes = await api.post("/ai/generate-bio", payload);
    const bio = aiRes.data?.data?.bio || "";

    // 2) Mettre à jour le state local
    const newForm = { ...form, bio };
    setForm(newForm);

    // 3) ✅ SAUVEGARDER DIRECTEMENT en DB (PUT si existe sinon POST)
    const saveRes = profile
      ? await api.put("/profiles/me", newForm)
      : await api.post("/profiles", newForm);

    setProfile(saveRes.data);
    setMessage("Bio générée + profil sauvegardé ✅");

  } catch (e) {
    setBioError(e.response?.data?.message || "Erreur génération/sauvegarde bio");
  } finally {
    setBioLoading(false);
  }
};

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = profile ? await api.put("/profiles/me", form) : await api.post("/profiles", form);

      setProfile(res.data);
      setMessage("Profil enregistré avec succès ✅");
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l’enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Chargement…</p>;

  return (
    <div className="profile-page">
      <h1 style={{ marginBottom: "0.5rem" }}>Mon profil professionnel</h1>
      <p className="text-muted" style={{ marginBottom: "1.2rem" }}>
        Profil public visible par les recruteurs
      </p>

      <div className="profile-layout">
        {/* PREVIEW */}
        <div className="profile-summary-card">
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                form.fullName?.[0]?.toUpperCase() || "?"
              )}
            </div>

            <div>
              <h2 style={{ margin: 0 }}>{form.fullName || "Nom non renseigné"}</h2>
              <p className="text-muted">{form.headline || "Titre professionnel"}</p>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                {form.location || "Localisation"} •{" "}
                {form.yearsOfExperience ? `${form.yearsOfExperience} ans` : "Débutant"}
              </p>
            </div>
          </div>

          <hr />

          <h3>À propos</h3>
          <p className="text-muted">{form.bio || "Aucune description fournie."}</p>

          <h3>Compétences</h3>
          {form.skills.length === 0 ? (
            <p className="text-muted">Aucune compétence ajoutée.</p>
          ) : (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {form.skills.map((s) => (
                <span key={s} className="skill-tag">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* FORM */}
        <div className="profile-form-card">
          {message && <p>{message}</p>}

          <form onSubmit={handleSubmit}>
            <label>Nom complet</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} />

            <label>Titre</label>
            <input name="headline" value={form.headline} onChange={handleChange} />

            <label>Localisation</label>
            <input name="location" value={form.location} onChange={handleChange} />

            <label>Années d’expérience</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={form.yearsOfExperience}
              onChange={handleChange}
              min={0}
            />

            <label>Bio</label>

            <button
              type="button"
              onClick={handleGenerateBioIA}
              disabled={bioLoading}
              style={{ marginBottom: "0.6rem" }}
            >
              {bioLoading ? "Génération..." : "✨ Générer ma bio (IA)"}
            </button>

            {bioError && <p style={{ color: "red", marginTop: 0 }}>{bioError}</p>}

            <textarea name="bio" rows={4} value={form.bio} onChange={handleChange} />

            <label>Photo de profil</label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />

            <label>Compétences</label>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKey}
              list="skill-suggestions"
              placeholder="Ex : React, Python, Docker…"
            />
            <datalist id="skill-suggestions">
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>

            <button type="button" onClick={() => addSkill(skillInput)}>
              Ajouter
            </button>

            <div style={{ marginTop: "0.6rem" }}>
              {form.skills.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => removeSkill(s)}
                  className="skill-pill"
                >
                  {s} ×
                </button>
              ))}
            </div>
<label>Objectifs (Goals)</label>
<input
  name="goals"
  value={form.goals}
  onChange={handleChange}
  placeholder="Ex: Cherche un stage PFE, poste junior, alternance..."
/>

            <label>LinkedIn</label>
            <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} />

            <label>Portfolio / GitHub</label>
            <input name="portfolioUrl" value={form.portfolioUrl} onChange={handleChange} />

            <button type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
