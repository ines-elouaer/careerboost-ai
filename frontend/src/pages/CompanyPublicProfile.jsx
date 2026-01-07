import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function CompanyPublicProfile() {
  const { userId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/company-profiles/user/${userId}`);
        setCompany(res.data);
      } catch {
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const album = useMemo(() => {
    return Array.isArray(company?.albumImages)
      ? company.albumImages.slice(0, 3)
      : [];
  }, [company]);

  if (loading) return <p className="page-padding">Chargement…</p>;
  if (!company) return <p className="page-padding">Entreprise introuvable.</p>;

  return (
  <div className="cp2-page">
      
      <div className="cp2-container">
        
 <Link to={-1} className="cand-back">
          ← Retour
        </Link>
<p className="cp2-sub"></p>
        {/* ================= HEADER ================= */}
        <div className="cp2-header card">
          <div className="cp2-headerLeft">
            <div className="cp2-logo">
              {company.logo ? (
                <img src={company.logo} alt="Logo" />
              ) : (
                <span>{company.companyName[0]}</span>
              )}
            </div>

            <div>
              <h1 className="cp2-title">{company.companyName}</h1>
              <p className="cp2-sub">
                {company.industry} • {company.location}
              </p>
              <p className="cp2-meta">
                {company.size} employés
                {company.websiteUrl && (
                  <>
                    {" "}•{" "}
                    <a href={company.websiteUrl} target="_blank" rel="noreferrer">
                      {company.websiteUrl.replace("https://", "")}
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="cp2-headerRight">
  {company.websiteUrl && (
    <a
      className="cp2-pillLink"
      href={company.websiteUrl}
      target="_blank"
      rel="noreferrer"
      title="Ouvrir le site"
    >
      🌐 Site web
    </a>
  )}

  {company.linkedinUrl && (
    <a
      className="cp2-pillLink cp2-pillLinkedin"
      href={company.linkedinUrl}
      target="_blank"
      rel="noreferrer"
      title="Voir LinkedIn"
    >
      LinkedIn
    </a>
  )}
</div>

        </div>

        {/* ================= ALBUM ================= */}
        {album.length > 0 && (
          <div className="cp2-album card">
            <div className="cp2-albumHeader">
              <h3>Album <span>Photos ({album.length})</span></h3>
             
            </div>

            <div className="cp2-albumGrid">
              <div className="cp2-albumMain">
                <img src={album[0]} alt="Entreprise" />
              </div>

              <div className="cp2-albumSide">
                {album.slice(1).map((img, i) => (
                  <div key={i} className="cp2-albumSmall">
                    <img src={img} alt={`Entreprise ${i + 2}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= CONTENT ================= */}
        <div className="cp2-grid">
          <div className="card">
            <h3>À propos</h3>
            <p>{company.description}</p>
          </div>

          <div className="card">
            <h3>Informations</h3>
            <div className="cp2-info">
              <div><span>Localisation</span><strong>{company.location}</strong></div>
              <div><span>Secteur</span><strong>{company.industry}</strong></div>
              <div><span>Taille</span><strong>{company.size}</strong></div>
            </div>
          </div>
        </div>

        
      </div>

      {/* ================= LIGHTBOX ================= */}
      {lightboxOpen && (
        <div className="cp2-lightbox" onClick={() => setLightboxOpen(false)}>
          <img src={album[activeIdx]} alt="Entreprise" />
        </div>
      )}
    </div>
  );
}
