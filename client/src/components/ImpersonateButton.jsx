import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { impersonateFaculty } from "../api/impersonate.js";

const ALLOWED = import.meta.env.VITE_ALLOW_IMPERSONATION === "true";

export default function ImpersonateButton({ person }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  if (!ALLOWED) return null;

  async function run() {
    setBusy(true);
    setError(null);
    const result = await impersonateFaculty(person);

    if (!result.ok) {
      setBusy(false);
      setError(result.reason || "Login failed.");
      return;
    }

    // straight to dashboard — no confirmation, no delay
    navigate("/dashboard");
  }

  return (
    <div>
      <button
        onClick={run}
        disabled={busy}
        className="btn border-ember text-ember hover:bg-ember hover:text-paper disabled:opacity-40"
        title="Log in as this faculty member"
      >
        {busy ? "Signing in…" : `Log in as ${person.first_name}`}
      </button>

      {error && (
        <p className="mt-3 text-sm text-ember hairline p-2 bg-ember/5">
          {error}
        </p>
      )}
    </div>
  );
}