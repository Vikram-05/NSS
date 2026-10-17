import { useState } from "react";
import { createEvent, geocodeAddress } from "../api/events.js";

export default function CreateEventPanel({ session, collegeId, categories, onCreated }) {
  const u = session.user;
  const [busy, setBusy] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    eventTitle: "",
    description: "",
    eventVisibility: "Private",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    location: "",
    address: "",
    id_category: "",
    locationMap: "",
    latitude: "",
    longitude: "",
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function doGeocode() {
    if (!form.address) {
      setError("Enter an address before geocoding.");
      return;
    }
    setGeocoding(true);
    setError(null);
    try {
      const r = await geocodeAddress(form.address);
      if (r.status === "success") {
        set("latitude", r.lat);
        set("longitude", r.lng);
        set("locationMap", r.map_url);
      } else {
        setError("Could not geocode address.");
      }
    } catch {
      setError("Geocode failed.");
    } finally {
      setGeocoding(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      !form.eventTitle ||
      !form.start_date ||
      !form.start_time ||
      !form.end_date ||
      !form.end_time ||
      !form.id_category
    ) {
      setError("Fill title, dates, times, and category.");
      return;
    }

    const idCollege = collegeId ?? u.id_college;
    console.log("[create-event] sending id_college =", idCollege, "for", u.email);

    setBusy(true);
    try {
      const payload = {
        id_college: String(idCollege),
        eventTitle: form.eventTitle,
        description: form.description,
        eventVisibility: form.eventVisibility,
        start_date: form.start_date,
        start_time: form.start_time,
        end_date: form.end_date,
        end_time: form.end_time,
        location: form.location,
        address: form.address,
        id_category: String(form.id_category),
        locationMap: form.locationMap,
        facultyEmail: u.email,
        contactDetail: String(u.mobile || ""),
        addedBy: String(u.id_adminuser),
        latitude: String(form.latitude || ""),
        longitude: String(form.longitude || ""),
      };
      const r = await createEvent(payload);
      if (r.status === "success") {
        setSuccess(`Event created — ID ${r.eventID || r.api_eventID}`);
        onCreated?.(r);
      } else {
        setError(r.message || "Create failed.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Create failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10 hairline bg-cream p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="num">New</p>
          <h2 className="font-display text-3xl">Create event</h2>
        </div>
        <p className="num">
          {u.college_name} · id {collegeId ?? u.id_college}
        </p>
      </div>
      <hr className="my-5 rule" />

      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
        <Field label="Event title" span2>
          <input
            value={form.eventTitle}
            onChange={(e) => set("eventTitle", e.target.value)}
            className="input"
            required
          />
        </Field>

        <Field label="Description" span2>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="input"
          />
        </Field>

        <Field label="Visibility">
          <select
            value={form.eventVisibility}
            onChange={(e) => set("eventVisibility", e.target.value)}
            className="input"
          >
            <option value="Private">Private</option>
            <option value="Public">Public</option>
          </select>
        </Field>

        <Field label="Category">
          <select
            value={form.id_category}
            onChange={(e) => set("id_category", e.target.value)}
            className="input"
            required
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Start date">
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => set("start_date", e.target.value)}
            className="input"
            required
          />
        </Field>
        <Field label="Start time">
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => set("start_time", e.target.value)}
            className="input"
            required
          />
        </Field>
        <Field label="End date">
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => set("end_date", e.target.value)}
            className="input"
            required
          />
        </Field>
        <Field label="End time">
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => set("end_time", e.target.value)}
            className="input"
            required
          />
        </Field>

        <Field label="Location name">
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className="input"
            placeholder="e.g. Bell circle"
          />
        </Field>
        <Field label="Address">
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className="input"
            placeholder="Full address for geocoding"
          />
        </Field>

        <div className="md:col-span-2 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={doGeocode}
            disabled={geocoding}
            className="px-4 py-2 text-xs uppercase tracking-widest hairline hover:bg-sand disabled:opacity-40"
          >
            {geocoding ? "Geocoding…" : "Geocode address"}
          </button>
          {form.latitude && form.longitude && (
            <span className="font-mono text-[11px] text-ink/60">
              {form.latitude}, {form.longitude}
            </span>
          )}
          {form.locationMap && (
            <a
              href={form.locationMap}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-ember hover:underline"
            >
              Map ↗
            </a>
          )}
        </div>

        {error && (
          <p className="md:col-span-2 text-sm text-ember hairline p-2 bg-ember/5">
            {error}
          </p>
        )}
        {success && (
          <p className="md:col-span-2 text-sm text-moss hairline p-2 bg-moss/5">
            {success}
          </p>
        )}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="px-6 py-2 text-xs uppercase tracking-widest bg-ink text-paper hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Creating…" : "Create event"}
          </button>
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          background: transparent;
          border-bottom: 1px solid rgba(14,14,16,.2);
          padding: 0.5rem 0.25rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus { border-bottom-color: #c2452d; }
        .input::placeholder { color: rgba(14,14,16,.4); }
      `}</style>
    </section>
  );
}

function Field({ label, children, span2 }) {
  return (
    <label className={span2 ? "md:col-span-2" : ""}>
      <span className="num block mb-1">{label}</span>
      {children}
    </label>
  );
}