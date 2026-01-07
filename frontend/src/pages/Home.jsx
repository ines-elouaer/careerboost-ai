// src/pages/Home.jsx
import { Link, useNavigate } from "react-router-dom";
import heroImg from "../assets/hero.jpg";
import officeImg from "../assets/office.jpg";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ Redirection intelligente
  const handleCreateProfile = () => {
    // pas connecté
    if (!user) return navigate("/register");

    // candidat
    if (user.role === "candidate") return navigate("/profile");

    // ✅ société / recruteur => va vers /profile (ProfileRouter va décider la bonne page)
    if (user.role === "recruiter") return navigate("/profile");

    // fallback
    return navigate("/profile");
  };

  return (
    <div className="home-root">
      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-inner">
          {/* Colonne gauche */}
          <div className="home-hero-left">
            <div className="chip">
              <span className="chip-dot" />
              Plateforme MERN + IA
            </div>

            <h1 className="home-hero-title">
              Construisez le <span>profil</span> qui décroche votre prochain job.
            </h1>

            <p className="home-hero-subtitle">
              CareerBoost AI analyse vos compétences, génère un profil
              professionnel et vous connecte avec des offres adaptées, comme sur
              LinkedIn mais pensé pour les jeunes développeurs.
            </p>

            <div className="home-hero-cta">
              <Link to="/jobs" className="btn-primary">
                Voir les offres
              </Link>

              {/* ✅ bouton smart */}
              <button
                type="button"
                className="btn-ghost"
                onClick={handleCreateProfile}
              >
                Créer mon profil
              </button>
            </div>

            <div className="home-hero-meta">
              <div>
                <p className="hero-metric">+120</p>
                <p className="hero-metric-label">offres tech publiées</p>
              </div>
              <div>
                <p className="hero-metric">98%</p>
                <p className="hero-metric-label">
                  de profils complétés en moins de 10 min
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="home-hero-right">
            <div className="hero-circle">
              <img src={heroImg} alt="Talents en discussion" />
            </div>

            <div className="hero-floating-card">
              <p className="hero-floating-title">Match IA</p>
              <p className="hero-floating-text">
                Votre profil est compatible à <strong>87%</strong> avec
                “Développeur MERN Junior”.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION À PROPOS */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="home-section-media">
            <img src={officeImg} alt="Espace de travail moderne" />
          </div>

          <div className="home-section-content">
            <h2 className="section-kicker">À propos</h2>
            <h3 className="section-title">Une expérience inspirée des apps pro.</h3>
            <p className="section-text">
              CareerBoost AI est une plateforme conçue pour aider les candidats et
              les recruteurs à se connecter facilement dans le monde du travail
              moderne. Notre objectif est d’offrir un espace simple, intelligent
              et efficace où chacun peut valoriser ses compétences ou trouver les
              talents qu’il recherche.
            </p>
            <p className="section-text">
              Grâce à un profil structuré, des offres d’emploi ciblées et un
              système de matching intelligent, CareerBoost AI vous permet de
              construire un parcours professionnel clair, de suivre vos
              candidatures et de découvrir les opportunités qui vous correspondent
              réellement.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION AVANTAGES */}
      <section className="home-section home-section-alt">
        <div className="home-section-inner stacked">
          <div className="home-section-header">
            <h2 className="section-kicker">Pour les candidats</h2>
            <h3 className="section-title">Vos atouts mis en avant automatiquement.</h3>
            <p className="section-text">
              Le système de profil vous guide pour mettre en valeur vos
              compétences, projets et expériences. Le tout connecté à un moteur
              de matching d’offres.
            </p>
          </div>

          <div className="home-grid">
            <div className="home-card">
              <h4>Profil structuré</h4>
              <p>
                Un modèle de profil clair : infos personnelles, compétences,
                années d’expérience, liens LinkedIn/portfolio.
              </p>
            </div>
            <div className="home-card">
              <h4>Matching d’offres</h4>
              <p>
                Les candidatures sont liées à chaque offre, ce qui permet de
                visualiser facilement où vous en êtes.
              </p>
            </div>
            <div className="home-card">
              <h4>Suivi des candidatures</h4>
              <p>
                Consultez en un coup d’œil le statut de vos candidatures :
                en attente, vues, acceptées ou refusées.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION OPPORTUNITÉS */}
      <section className="home-section home-section-alt">
        <div className="home-section-inner stacked">
          <div className="home-section-header">
            <h2 className="section-kicker">Pour les recruteurs</h2>
            <h3 className="section-title">Un tableau de bord clair.</h3>
            <p className="section-text">
              Publiez vos offres, recevez des candidatures centralisées et filtrez
              rapidement les profils pertinents grâce aux compétences.
            </p>
          </div>

          <div className="home-grid">
            <div className="home-card">
              <h4>Gestion des offres</h4>
              <p>
                Créez, modifiez et désactivez vos annonces en quelques clics.
              </p>
            </div>
            <div className="home-card">
              <h4>Suivi des candidatures</h4>
              <p>
                Visualisez les candidatures pour chaque offre, consultez les profils
                complets des candidats et mettez à jour leur statut.
              </p>
            </div>
            <div className="home-card">
              <h4>Recherche de talents</h4>
              <p>
                Accédez à des profils détaillés et structurés pour trouver rapidement
                les talents correspondant aux besoins de votre entreprise.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ textAlign: "center" }}>
        Bienvenue sur CareerBoost AI. Une plateforme pensée pour vous, conçue pour
        aller plus loin.
      </div>
    </div>
  );
};

export default Home;
