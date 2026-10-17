import api from "./client.js";

/* The impersonated faculty's access token is stored separately.
   When present, use it; otherwise fall back to the main admin token. */
import { loadImpersonation } from "./impersonate.js";

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