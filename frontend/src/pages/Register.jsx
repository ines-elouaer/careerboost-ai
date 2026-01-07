// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "candidate",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.role);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de la création du compte."
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
            Créez votre espace en quelques minutes
          </div>
          <h1 className="auth-title">Rejoignez CareerBoost AI.</h1>
          <p className="auth-subtitle">
            Que vous soyez candidat ou recruteur, créez un compte pour
            construire votre profil, publier des offres et suivre vos
            opportunités dans une interface moderne et épurée.
          </p>
        </div>

        {/* Carte inscription */}
        <div className="auth-card">
          <h2 className="auth-card-title">Créer un compte</h2>
          <p className="auth-card-subtitle">
            Quelques informations suffisent pour démarrer.
          </p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Nom d’utilisateur</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="ex : dev_junior"
                required
              />
            </div>

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

            <div className="auth-field">
              <label>Rôle</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="candidate">Candidat</option>
                <option value="recruiter">Recruteur</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? "Création du compte..." : "Créer mon compte"}
            </button>
          </form>

          <p className="auth-footer-text">
            Déjà un compte ?{" "}
            <Link to="/login" className="auth-link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
