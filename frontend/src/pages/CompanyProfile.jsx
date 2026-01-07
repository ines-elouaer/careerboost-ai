import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

export default function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    description: "",
    location: "",
    websiteUrl: "",
    linkedinUrl: "",
    size: "1-10",
    logo: "",
    albumImages: [], // 3 photos max
  });

  const [logoPreview, setLogoPreview] = useState("");
  const [albumPreview, setAlbumPreview] = useState([]);

  const companyInitial = useMemo(
    () => (form.companyName || "C").trim().charAt(0).toUpperCase(),
    [form.companyName]
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/company-profiles/me");
      setProfile(res.data);

      const album = Array.isArray(res.data.albumImages)
        ? res.data.albumImages.slice(0, 3)
        : [];

      setForm({
        companyName: res.data.companyName || "",
        industry: res.data.industry || "",
        description: res.data.description || "",
        location: res.data.location || "",
        websiteUrl: res.data.websiteUrl || "",
        linkedinUrl: res.data.linkedinUrl || "",
        size: res.data.size || "1-10",
        logo: res.data.logo || "",
        albumImages: album,
      });

      setLogoPreview(res.data.logo || "");
      setAlbumPreview(album);
    } catch {
      // mode création
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onLogoChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await fileToBase64(f);
    setLogoPreview(b64);
    setForm((p) => ({ ...p, logo: b64 }));
    e.target.value = "";
  };

  // Ajouter jusqu'à 3 photos
  const onAlbumChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = Math.max(0, 3 - albumPreview.length);
    const selected = files.slice(0, remaining);

    const b64List = [];
    for (const f of selected) {
      const b64 = await fileToBase64(f);
      b64List.push(b64);
    }

    const next = [...albumPreview, ...b64List].slice(0, 3);
    setAlbumPreview(next);
    setForm((p) => ({ ...p, albumImages: next }));
    e.target.value = "";
  };

  const removeAlbumPhoto = (idx) => {
    const next = albumPreview.filter((_, i) => i !== idx);
    setAlbumPreview(next);
    setForm((p) => ({ ...p, albumImages: next }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = { ...form, albumImages: albumPreview.slice(0, 3) };

      let res;
      if (profile) res = await api.put("/company-profiles/me", payload);
      else res = await api.post("/company-profiles", payload);

      setProfile(res.data);
      setMessage("Profil société enregistré ✅");
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Chargement…</p>;

  return (
    <div className="cppr-page">
      <div className="cppr-header">
        <div>
          <div className="chip">
            <span className="chip-dot" />
            Page entreprise
          </div>
          <h1 className="cppr-title">Profil Société</h1>
          <p className="cppr-subtitle">
            Gérez votre page entreprise (logo, album, description, liens...). C’est ce profil qui doit être vu par les candidats.
          </p>
        </div>
      </div>

      <div className="cppr-layout">
        {/* ===================== PREVIEW ===================== */}
        <div className="cppr-preview card-light">
          <div className="cppr-previewBody">
            {/* Logo + Nom + Localisation */}
            <div className="cppr-headRow">
              <div className="cppr-logo">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" />
                ) : (
                  <div className="cppr-logoFallback">{companyInitial}</div>
                )}
              </div>

              <div className="cppr-headText">
                <h2 className="cppr-companyName">
                  {form.companyName || "Nom de l'entreprise"}
                </h2>

                <p className="cppr-companyMeta">
                  {form.industry || "Secteur d'activité"}{" "}
                  <span className="cppr-dot">•</span>{" "}
                  <span className="cppr-muted">{form.location || "—"}</span>
                </p>
              </div>
            </div>

            {/* ✅ Album */}
            <div className="cppr-albumAfter">
              {albumPreview.length ? (
                <div className="cppr-albumGrid">
                  <div className="cppr-albumMain">
                    <img src={albumPreview[0]} alt="Photo entreprise 1" />
                  </div>

                  <div className="cppr-albumSide">
                    <div className="cppr-albumSmall">
                      {albumPreview[1] ? (
                        <img src={albumPreview[1]} alt="Photo entreprise 2" />
                      ) : (
                        <div className="cppr-albumPlaceholder">Photo 2</div>
                      )}
                    </div>

                    <div className="cppr-albumSmall">
                      {albumPreview[2] ? (
                        <img src={albumPreview[2]} alt="Photo entreprise 3" />
                      ) : (
                        <div className="cppr-albumPlaceholder">Photo 3</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cppr-albumEmpty">Album de l’entreprise (3 photos max)</div>
              )}
            </div>

            {/* ✅ Taille APRÈS album */}
            <div className="cppr-infoLine">
              <span>Taille</span>
              <strong>{form.size}</strong>
            </div>

            {form.description && (
              <div className="cppr-about">
                <h3>À propos</h3>
                <p>{form.description}</p>
              </div>
            )}

            {(form.websiteUrl || form.linkedinUrl) && (
              <div className="cppr-links">
                {form.websiteUrl && (
                  <a className="btn-ghost" href={form.websiteUrl} target="_blank" rel="noreferrer">
                    Site web
                  </a>
                )}
                {form.linkedinUrl && (
                  <a className="btn-ghost" href={form.linkedinUrl} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===================== FORM ===================== */}
        <div className="cppr-form card-light">
          {message && <div className="cppr-message">{message}</div>}

          <form onSubmit={submit} className="cppr-formInner">
            <h3 className="cppr-formTitle">Informations société</h3>

            <div className="auth-form">
              <div className="auth-field">
                <label>Nom de l'entreprise</label>
                <input name="companyName" value={form.companyName} onChange={onChange} required />
              </div>

              <div className="auth-field">
                <label>Secteur</label>
                <input
                  name="industry"
                  value={form.industry}
                  onChange={onChange}
                  placeholder="Ex: ESN, Banque..."
                />
              </div>

              <div className="auth-field">
                <label>Description</label>
                <textarea name="description" rows={5} value={form.description} onChange={onChange} />
              </div>

              <div className="auth-field">
                <label>Localisation</label>
                <input name="location" value={form.location} onChange={onChange} />
              </div>

              <div className="auth-field">
                <label>Site web</label>
                <input name="websiteUrl" value={form.websiteUrl} onChange={onChange} />
              </div>

              <div className="auth-field">
                <label>LinkedIn</label>
                <input name="linkedinUrl" value={form.linkedinUrl} onChange={onChange} />
              </div>

              <div className="auth-field">
                <label>Logo</label>
                <input type="file" accept="image/*" onChange={onLogoChange} />
              </div>

              <div className="auth-field">
                <label>Album entreprise (3 photos max)</label>
                <input type="file" accept="image/*" multiple onChange={onAlbumChange} />

                <div className="cppr-miniRow">
                  {albumPreview.map((src, idx) => (
                    <div className="cppr-mini" key={`${src}-${idx}`}>
                      <img src={src} alt={`Mini ${idx + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeAlbumPhoto(idx)}
                        aria-label="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ Taille APRÈS album (comme tu as demandé) */}
              <div className="auth-field">
                <label>Taille</label>
                <select name="size" value={form.size} onChange={onChange}>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
            </div>

            <button className="btn-primary cppr-save" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
