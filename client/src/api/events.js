import api from "./client.js";

import { loadImpersonation } from "./impersonate.js";
const OFFICIAL_VTU_LOGIN = "https://vtuapts.zdotapps.in/api/accounts/adminlogin/";

function withImpersonation(cfg = {}) {
  const imp = loadImpersonation();
  if (imp?.access) {
    cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${imp.access}` };
    cfg.skipAuth = true; // bypass the admin-token interceptor
  }
  return cfg;
}

/* 1. Paginated events list */
export const getEvents = (payload) =>
  api.post(`/events`, payload, withImpersonation()).then((r) => r.data);

/* 2. Create event */
export const createEvent = (payload) =>
  api.post(`/events/create`, payload, withImpersonation()).then((r) => r.data);

/* 3. Geocode an address */
export const geocodeAddress = (address) =>
  api.post(`/events/geocode`, { address }, withImpersonation()).then((r) => r.data);

/* 4. Categories for a college */
export const getCollegeCategories = (collegeId) =>
  api
    .get(`/events/categories/college${collegeId ? `?collegeId=${collegeId}` : ""}`, withImpersonation())
    .then((r) => r.data);

/* 5. Simple all-events list */
export const getAllEventsSimple = (payload) =>
  api.post(`/events/all`, payload, withImpersonation()).then((r) => r.data);

/* 7. Global active categories */
export const getGlobalCategories = () =>
  api.get(`/events/categories`, withImpersonation()).then((r) => r.data);

// This URL is the official VTU portal login endpoint



export async function redirectToVtuPortal(email, password) {
  try {
    const res = await fetch(OFFICIAL_VTU_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: email,
        password: password,
        whichapp: "apts",
        typeofway: "web",
      }),
    });

    const data = await res.json();

    if (data.token && data.token.access) {
      // VTU stores tokens in localStorage. We inject them and redirect.
      // (Adjust the keys based on what VTU uses, usually 'token' or 'access_token')
      localStorage.setItem("vtu_access", data.token.access);
      localStorage.setItem("vtu_refresh", data.token.refresh);
      localStorage.setItem("vtu_user", JSON.stringify(data.user));
      
      // Redirect to their dashboard
      window.location.href = "https://vtuapts.zdotapps.in/dashboard";
    } else {
      alert("Could not log into VTU. Credentials might be invalid.");
    }
  } catch (err) {
    alert("Error connecting to VTU portal.");
  }
}