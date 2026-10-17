import StudentRow from "./StudentRow.jsx";

export default function StudentsTable({ students, startIndex = 0, searching = false }) {
  if (!students?.length) {
    return (
      <div className="hairline bg-cream p-10 text-center">
        <p className="font-display text-2xl">
          {searching ? "No matches" : "No students"}
        </p>
        <p className="text-sm text-ink/60 mt-2">
          {searching
            ? "No student matches this search. Try a different name or USN."
            : "No student records match the current filters."}
        </p>
      </div>
    );
  }
  return (
    <div className="hairline bg-cream overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-ink/15">
            <th className="px-3 py-2 num">#</th>
            <th className="px-3 py-2 num">Name</th>
            <th className="px-3 py-2 num hidden sm:table-cell">USN</th>
            <th className="px-3 py-2 num hidden sm:table-cell">Sem</th>
            <th className="px-3 py-2 num hidden md:table-cell">Year</th>
            <th className="px-3 py-2 num hidden lg:table-cell">Mentor</th>
            <th className="px-3 py-2 num text-right">Mobile</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {students.map((s, i) => (
            <StudentRow
              key={s.id}
              student={s}
              index={i}
              startIndex={startIndex}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}