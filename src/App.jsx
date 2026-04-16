import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import HomePage from "./pages/Home";
import ProfilePage from "./pages/Profile";
import NewEpisodePage from "./pages/NewEpisode";
import EpisodeDetailPage from "./pages/EpisodeDetail";
import { RequireAuth, RequireProfile } from "./components/RequireAuth";

function App() {
  return (
    /* Vibrant mesh gradient wrapper applied across all pages */
    <div className="min-h-screen bg-soft-mesh bg-fixed font-sans antialiased text-slate-900 transition-colors duration-500 selection:bg-brand-200 selection:text-brand-900">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />

          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route element={<RequireProfile />}>
              <Route path="/dashboard" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/dashboard" replace />} />
              <Route path="/episodes/new" element={<NewEpisodePage />} />
              <Route path="/episodes/:episodeId" element={<EpisodeDetailPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;