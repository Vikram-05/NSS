import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getColleges,
  getDepartments,
  getFaculty,
  getStudents,
} from "../api/client.js";
import Header from "../components/Header.jsx";
import CollegeRail from "../components/CollegeRail.jsx";
import DepartmentTabs from "../components/DepartmentTabs.jsx";
import FacultyGrid from "../components/FacultyGrid.jsx";
import StudentsTable from "../components/StudentsTable.jsx";
import Pagination from "../components/Pagination.jsx";
import Loader from "../components/Loader.jsx";

export default function Home() {
  const [colleges, setColleges] = useState([]);
  const [activeCollege, setActiveCollege] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState(null);

  const [faculty, setFaculty] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);

  const [view, setView] = useState("faculty");
  const [mentor, setMentor] = useState("");

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentPage, setStudentPage] = useState(1);
  const [studentLength, setStudentLength] = useState(10);
  const [studentTotal, setStudentTotal] = useState(0);

  // ── NEW: search state + debounce ──────────────────────────────
  const [studentSearch, setStudentSearch] = useState("");     // input value
  const [searchTerm, setSearchTerm] = useState("");           // debounced value sent to API

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(studentSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [studentSearch]);

  // Step 1 — colleges
  useEffect(() => {
    getColleges(1).then((res) => {
      const list = res?.data ?? [];
      setColleges(list);
      if (list.length) setActiveCollege(list[0]);
    });
  }, []);

  // Step 2 — departments
  useEffect(() => {
    if (!activeCollege) return;
    setDepartments([]);
    setActiveDept(null);
    getDepartments(activeCollege.id).then((res) => {
      const list = res?.data ?? [];
      setDepartments(list);
      if (list.length) setActiveDept(list[0]);
    });
  }, [activeCollege]);

  // Step 3 — faculty
  useEffect(() => {
    if (!activeCollege || !activeDept) return;
    setLoadingFaculty(true);
    getFaculty({
      page: 1,
      length: 900,
      search: "",
      from_date: "",
      to_date: "",
      id_university: 1,
      id_college: activeCollege.id,
      id_department: activeDept.id_department,
      id_role: "",
      role_hierarchy: 7,
    })
      .then((res) => setFaculty(res?.data ?? []))
      .catch(() => setFaculty([]))
      .finally(() => setLoadingFaculty(false));
  }, [activeCollege, activeDept]);

  // reset page on any filter change (including search)
  useEffect(() => {
    setStudentPage(1);
  }, [activeCollege, activeDept, mentor, studentLength, searchTerm]);

  // Step 4 — students (paginated + search)
  useEffect(() => {
    if (view !== "students" || !activeCollege || !activeDept) return;
    setLoadingStudents(true);

    const body = {
      page: studentPage,
      length: studentLength,
      search: searchTerm,                 // ⬅ sent to API
      from_date: "",
      to_date: "",
      id_role: 5,
      mentor_status: "",
      id_university: "1",
      id_college: String(activeCollege.id),
      id_department: activeDept.id_department,
      semester: "",
      admitted_year: "",
      order_by: "created_at",
      order_direction: "desc",
    };
    if (mentor) body.id_adminuser = Number(mentor);

    getStudents(body)
      .then((res) => {
        setStudents(res?.data ?? []);
        setStudentTotal(res?.total_records ?? 0);
      })
      .catch(() => {
        setStudents([]);
        setStudentTotal(0);
      })
      .finally(() => setLoadingStudents(false));
  }, [view, activeCollege, activeDept, mentor, studentPage, studentLength, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(studentTotal / studentLength));
  const rangeStart = studentTotal === 0 ? 0 : (studentPage - 1) * studentLength + 1;
  const rangeEnd = Math.min(studentPage * studentLength, studentTotal);

  const topCount = view === "faculty" ? faculty.length : studentTotal;

  return (
    <div className="min-h-screen">
      <Header count={topCount} />

      <main className="max-w-7xl mx-auto px-6 md:px-10 pb-24 grid md:grid-cols-[280px_1fr] gap-10">
        <CollegeRail
          colleges={colleges}
          activeId={activeCollege?.id}
          onSelect={setActiveCollege}
        />

        <section className="min-w-0">
          {activeCollege && (
            <>
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                  <p className="num">College</p>
                  <h2 className="font-display text-3xl md:text-4xl leading-tight mt-1">
                    {activeCollege.college_name}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="num">Records</p>
                  <p className="font-display text-2xl">
                    {String(topCount).padStart(2, "0")}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="num mb-2">Departments · {departments.length}</p>
                {departments.length ? (
                  <DepartmentTabs
                    departments={departments}
                    activeId={activeDept?.id_department}
                    onSelect={setActiveDept}
                  />
                ) : (
                  <Loader label="Loading departments" />
                )}
              </div>

              <hr className="my-6 rule" />

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex gap-1 hairline bg-cream p-1">
                  <button
                    onClick={() => setView("faculty")}
                    className={`px-4 py-1.5 text-xs uppercase tracking-widest ${view === "faculty" ? "bg-ink text-paper" : "hover:bg-sand"
                      }`}
                  >
                    Faculty
                  </button>
                  <button
                    onClick={() => setView("students")}
                    className={`px-4 py-1.5 text-xs uppercase tracking-widest ${view === "students" ? "bg-ink text-paper" : "hover:bg-sand"
                      }`}
                  >
                    Students
                  </button>
                </div>

                {view === "students" && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* ── NEW: search input ─────────────────── */}
                    <div className="relative hairline bg-cream">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 font-mono text-xs">
                        ⌕
                      </span>
                      <input
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by name, USN, email…"
                        className="pl-8 pr-8 py-2 text-sm bg-transparent outline-none w-64 placeholder:text-ink/40"
                      />
                      {studentSearch && (
                        <button
                          onClick={() => setStudentSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ember text-xs"
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <select
                      value={mentor}
                      onChange={(e) => setMentor(e.target.value)}
                      className="hairline bg-cream px-3 py-2 text-sm"
                    >
                      <option value="">All students</option>
                      {faculty.map((f) => (
                        <option key={f.id_adminuser} value={f.id_adminuser}>
                          {f.first_name} {f.last_name} — {f.role_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <AnimatePresence mode="wait">
                  {view === "faculty" && (
                    <motion.div
                      key={`faculty-${activeCollege.id}-${activeDept?.id_department}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {loadingFaculty ? (
                        <Loader label="Fetching roster" />
                      ) : (
                        <FacultyGrid faculty={faculty} />
                      )}
                    </motion.div>
                  )}

                  {view === "students" && (
                    <motion.div
                      key={`students-${activeCollege.id}-${activeDept?.id_department}-${mentor}-${searchTerm}-${studentPage}-${studentLength}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {loadingStudents ? (
                        <Loader label="Fetching students" />
                      ) : (
                        <>
                          {/* search context line */}
                          {searchTerm && (
                            <p className="mb-3 text-xs text-ink/60">
                              Showing results for{" "}
                              <span className="font-mono text-ink">“{searchTerm}”</span>{" "}
                              · {studentTotal} match{studentTotal === 1 ? "" : "es"}
                            </p>
                          )}
                          <StudentsTable
                            students={students}
                            startIndex={(studentPage - 1) * studentLength}
                            searching={!!searchTerm}
                          />
                          <Pagination
                            page={studentPage}
                            totalPages={totalPages}
                            total={studentTotal}
                            rangeStart={rangeStart}
                            rangeEnd={rangeEnd}
                            length={studentLength}
                            onPage={setStudentPage}
                            onLength={setStudentLength}
                          />
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
          {!activeCollege && <Loader label="Opening ledger" />}
        </section>
      </main>
    </div>
  );
}