import { useNavigate } from "react-router-dom";

export default function StudentRow({ student, index, startIndex = 0 }) {
  const navigate = useNavigate();
  const fullName =
    [student.firstName, student.lastName].filter(Boolean).join(" ") || "Unnamed";

  function open() {
    sessionStorage.setItem("student:" + student.id, JSON.stringify(student));
    navigate(`/student/${student.id}`, { state: { student } });
  }

  return (
    <tr onClick={open} className="cursor-pointer hover:bg-sand/50 transition-colors">
      <td className="px-3 py-3 font-mono text-[11px] text-ink/40">
        {String(startIndex + index + 1).padStart(2, "0")}
      </td>
      <td className="px-3 py-3">
        <p className="font-display text-base leading-tight">{fullName}</p>
        <p className="num mt-0.5">{student.emailID}</p>
      </td>
      <td className="px-3 py-3 hidden sm:table-cell">
        <span className="font-mono text-xs text-ink/70">{student.usn || "—"}</span>
      </td>
      <td className="px-3 py-3 text-sm text-ink/70 hidden sm:table-cell">
        {student.semester ?? "—"}
      </td>
      <td className="px-3 py-3 text-sm text-ink/70 hidden md:table-cell">
        {student.admitted_year ?? "—"}
      </td>
      <td className="px-3 py-3 text-sm text-ink/70 hidden lg:table-cell truncate max-w-[140px]">
        {student.mentor_name || <span className="text-ink/30 italic">unassigned</span>}
      </td>
      <td className="px-3 py-3 text-right font-mono text-xs text-ink/60">
        {student.mobileNumber}
      </td>
    </tr>
  );
}