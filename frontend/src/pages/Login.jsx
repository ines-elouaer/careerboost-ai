// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur de connexion. Vérifiez vos identifiants."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        {/* Colonne texte */}
        <div className="auth-side">
          <div className="chip">
            <span className="chip-dot" />
            Espace sécurisé
          </div>
          <h1 className="auth-title">Bienvenue sur CareerBoost AI.</h1>
          <p className="auth-subtitle">
            Connectez-vous pour accéder à votre profil, suivre vos candidatures
            ou gérer vos offres d’emploi. Une expérience claire, inspirée des
            meilleures plateformes pro.
          </p>
        </div>

        {/* Carte login */}
        <div className="auth-card">
          <h2 className="auth-card-title">Se connecter</h2>
          <p className="auth-card-subtitle">
            Entrez vos identifiants pour continuer.
          </p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="vous@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="auth-footer-text">
            Pas encore de compte ?{" "}
            <Link to="/register" className="auth-link">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
