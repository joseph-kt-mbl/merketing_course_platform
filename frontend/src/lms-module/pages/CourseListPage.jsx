import { useNavigate } from "react-router-dom";
import { useCourses } from "../hooks/useLms";
import { Spinner, ErrorState, SectionHeader, Badge } from "../components/shared/Ui";
import "../styles/lms.css";

export default function CourseListPage() {
  const { data: courses, loading, error, refetch } = useCourses();
  const navigate = useNavigate();

  if (loading) return (
    <div className="lms-module" style={{ minHeight: "100vh" }}>
      <Spinner text="Fetching courses..." />
    </div>
  );

  if (error) return (
    <div className="lms-module" style={{ minHeight: "100vh" }}>
      <ErrorState message={error} onRetry={refetch} />
    </div>
  );

  return (
    <div className="lms-module">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div className="lms-fade-up">
          <SectionHeader
            overline="Learning Library"
            title="Explore Courses"
            subtitle="Master new skills with structured, expert-crafted courses."
          />
        </div>

        {(!courses || courses.length === 0) ? (
          <div className="lms-fade-up lms-fade-up-1">
            <div className="lms-error">
              <div style={{ fontSize: 48 }}>📚</div>
              <div style={{ fontSize: 16, color: "var(--lms-text-2)" }}>No courses available yet.</div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {courses.map((course, i) => (
              <CourseCard
                key={course._id}
                course={course}
                delay={i}
                onClick={() => navigate(`/courses/${course._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course, delay, onClick }) {
  const delayClass = delay < 5 ? ` lms-fade-up-${delay + 1}` : "";

  return (
    <div
      className={`lms-card lms-fade-up${delayClass}`}
      onClick={onClick}
      style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {/* Thumbnail placeholder */}
      <div
        style={{
          height: 140,
          borderRadius: 10,
          background: `linear-gradient(135deg, var(--lms-surface-2) 0%, #1a2035 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 30% 50%, rgba(245,158,11,0.07) 0%, transparent 60%)`,
          }}
        />
        📘
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Badge variant={course.isPublished ? "green" : "amber"}>
            {course.isPublished ? "✓ Published" : "Draft"}
          </Badge>
        </div>

        <h2
          className="lms-display"
          style={{ fontSize: 20, color: "var(--lms-text)", lineHeight: 1.3 }}
        >
          {course.title}
        </h2>

        {course.description && (
          <p
            style={{
              fontSize: 13,
              color: "var(--lms-text-2)",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {course.description}
          </p>
        )}
      </div>

      <button
        className="lms-btn lms-btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        View Course →
      </button>
    </div>
  );
}
