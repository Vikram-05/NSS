import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import DetailShell from "../components/DetailShell.jsx";
import KV from "../components/KV.jsx";
import Loader from "../components/Loader.jsx";
import ImpersonateButton from "../components/ImpersonateButton.jsx";
import { impersonateTryLogin, impersonateResetPassword } from "../api/client.js";

export default function PersonDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const [person, setPerson] = useState(state?.person ?? null);
  const [loading, setLoading] = useState(!state?.person);
  const [vtuLoading, setVtuLoading] = useState(false);

  useEffect(() => {
    if (person) return;
    const cached = JSON.parse(sessionStorage.getItem("person:" + id) || "null");
    if (cached) {
      setPerson(cached);
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [id, person]);

  if (loading) return <Loader label="Opening record" />;
  if (!person) return <div className="p-10">Record not found.</div>;

  const initials = `${person.first_name?.[0] ?? ""}${person.last_name?.[0] ?? ""}`
    .replace(/\s+/g, "")
    .toUpperCase();

  


  return (
    <DetailShell
      kicker={`${person.role_name} · ${person.role_code}`}
      title={`${person.first_name} ${person.last_name}`}
      subtitle={person.department_name}
      initials={initials || "?"}
      aside={
        <>
          <KV label="ID" value={person.id_adminuser} />
          <KV label="Role" value={person.role_name} />
          <KV label="Hierarchy" value={person.role_hierarchy} />
          <KV label="Status" value={person.is_active ? "Active" : "Inactive"} />
          <KV label="Created" value={person.created_at?.replace("T", " ")} />
          <KV label="College" value={person.college_name} />
          <KV label="University" value={person.university_name} />
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="hairline bg-cream p-5">
          <p className="num mb-3">Contact</p>
          <KV label="Email" value={person.email} />
          <KV label="Mobile" value={person.mobile} />
        </div>
        <div className="hairline bg-cream p-5">
          <p className="num mb-3">Department</p>
          <KV label="Name" value={person.department_name} />
          <KV label="Dept ID" value={person.id_department} />
          <KV label="Extra" value={person.additional_role} />
        </div>
      </div>

      {/* Actions Row */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <ImpersonateButton person={person} />

      
      </div>
    </DetailShell>
  );
}