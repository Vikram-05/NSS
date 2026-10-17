import FacultyCard from "./FacultyCard.jsx";

export default function FacultyGrid({ faculty }) {
  if (!faculty?.length) {
    return (
      <div className="hairline bg-cream p-10 text-center">
        <p className="font-display text-2xl">Empty roster</p>
        <p className="text-sm text-ink/60 mt-2">
          No faculty records for this department yet.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
      {faculty.map((p, i) => (
        <FacultyCard key={p.id_adminuser} person={p} index={i} />
      ))}
    </div>
  );
}