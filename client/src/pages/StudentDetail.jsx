import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DetailShell from "../components/DetailShell.jsx";
import KV from "../components/KV.jsx";

export default function StudentDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [student, setStudent] = useState(state?.student ?? null);

  useEffect(() => {
    if (!student) {
      const cached = JSON.parse(
        sessionStorage.getItem("student:" + id) || "null"
      );
      setStudent(cached);
    }
  }, [id, student]);

  if (!student)
    return <div className="p-10">Record not found. Go back and open again.</div>;

  const fullName =
    [student.firstName, student.lastName].filter(Boolean).join(" ") || "Unnamed";
  const initials = (student.firstName?.[0] ?? "") + (student.lastName?.[0] ?? "");

  return (
    <DetailShell
      kicker={`Student · USN ${student.usn || "—"}`}
      title={fullName}
      subtitle={student.department_name}
      initials={initials || "?"}
      aside={
        <>
          <KV label="Record ID" value={student.id} />
          <KV label="Rider ID" value={student.rider_id} />
          <KV label="Semester" value={student.semester} />
          <KV label="Admitted Yr" value={student.admitted_year} />
          <KV label="Mentor" value={student.mentor_name || "unassigned"} />
          <KV label="Mentor ID" value={student.id_mentor || "—"} />
          <KV label="Platform" value={student.os} />
          <KV label="Status" value={student.is_active ? "Active" : "Inactive"} />
          <KV label="Registered" value={student.created_at?.replace("T", " ")} />
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="hairline bg-cream p-5">
          <p className="num mb-3">Contact</p>
          <KV label="Email" value={student.emailID} />
          <KV label="Mobile" value={student.mobileNumber} />
        </div>
        <div className="hairline bg-cream p-5">
          <p className="num mb-3">Academic</p>
          <KV label="USN" value={student.usn} />
          <KV label="College" value={student.college_name} />
          <KV label="Dept" value={student.department_name} />
          <KV label="Dept ID" value={student.id_department} />
          <KV label="University" value={student.university_name} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mt-6">
        <div className="hairline bg-cream p-5">
          <p className="num mb-3">App</p>
          <KV label="Tile" value={student.checkTile} />
          <KV label="Downloaded" value={student.app_download_date?.replace("T", " ")} />
        </div>
        <div className="hairline bg-cream p-5">
          <p className="num mb-3">Flags</p>
          <KV label="Change College" value={student.change_college} />
          <KV label="Reassigned By" value={student.reassign_mentorby} />
        </div>
      </div>

      <div className="mt-8">
        <button onClick={() => navigate(-1)} className="btn">
          Close
        </button>
      </div>
    </DetailShell>
  );
}