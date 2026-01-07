import { useAuth } from "../context/AuthContext";
import Profile from "./Profile";
import CompanyProfile from "./CompanyProfile";

export default function ProfileRouter() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "recruiter") return <CompanyProfile />;
  return <Profile />; // ton profil candidat actuel
}
