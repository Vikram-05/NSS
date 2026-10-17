import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import PersonDetail from "./pages/PersonDetail.jsx";
import StudentDetail from "./pages/StudentDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";          // ⬅ new import
import { ensureAuth, loadAuth } from "./api/auth.js";
import Loader from "./components/Loader.jsx";

export default function App() {
  const [ready, setReady] = useState(!!loadAuth()?.access);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ready) return;
    ensureAuth()
      .then(() => setReady(true))
      .catch((e) => setError(e.message));
  }, [ready]);

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="hairline bg-cream p-8 max-w-md text-center">
          <p className="font-display text-3xl text-ember">Sign-in failed</p>
          <p className="text-sm text-ink/60 mt-3">{error}</p>
          <button onClick={() => { setError(null); setReady(false); }} className="btn mt-6">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader label="Signing in" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/person/:id" element={<PersonDetail />} />
      <Route path="/student/:id" element={<StudentDetail />} />
      <Route path="/dashboard" element={<Dashboard />} />   {/* ⬅ new */}
    </Routes>
  );
}