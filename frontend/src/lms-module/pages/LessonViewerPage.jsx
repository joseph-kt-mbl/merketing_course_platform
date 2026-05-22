import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLessonByOrder, useCourseLessons, useProgress } from "../hooks/useLms";
import { lessonApi } from "../api/lmsApi";
import "./LessonViewerPage.css";

function Spinner({ text = "Loading..." }) {
  return (
    <div className="lms-spinner">{text}</div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="lms-error-state">
      <p style={{ color: "var(--navy-dark)", fontWeight: 700, fontSize: 16 }}>Something went wrong</p>
      <p style={{ fontSize: 14 }}>{message}</p>
    </div>
  );
}

function Badge({ variant = "amber", children }) {
  return (
    <span className={`lms-badge lms-badge-${variant}`}>{children}</span>
  );
}

function ProgressBar({ value = 0, label = "Progress" }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className="lms-progress-wrap">
      <div className="lms-progress-label">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="lms-progress-track">
        <div className="lms-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function LessonViewerPage() {
  const { courseId, order } = useParams();
  const navigate = useNavigate();

  const { data: lesson,   loading: lLoading, error: lError } = useLessonByOrder(order);
  const { data: lessons }                                     = useCourseLessons(courseId);
  const { data: progress, refetch: refetchProgress }         = useProgress(courseId);

  const [completing,   setCompleting]   = useState(false);
  const [completed,    setCompleted]    = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);

  const sortedLessons  = lessons ? [...lessons].sort((a, b) => a.order - b.order) : [];
  const currentIndex   = sortedLessons.findIndex(l => l._id === lesson?._id);
  const prevLesson     = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson     = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  async function handleComplete() {
    if (completed || completing) return;
    setCompleting(true);
    try {
      await lessonApi.complete(lesson._id);
      setCompleted(true);
      await refetchProgress();
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  }

  function goToLesson(lessonOrder) {
    setCompleted(false);
    navigate(`/courses/${courseId}/lessons/${lessonOrder}`);
  }

  function goToQuiz() {
    navigate(`/courses/${courseId}/quiz/${order}`);
  }

  /* ── Loading / error states ── */
  if (lLoading) return (
    <div className="lms-viewer-layout" style={{ alignItems: "center", justifyContent: "center" }}>
      <Spinner text="Loading lesson..." />
    </div>
  );

  if (lError) return (
    <div className="lms-viewer-layout" style={{ alignItems: "center", justifyContent: "center" }}>
      <ErrorState message={lError} />
    </div>
  );

  const progressValue = progress
    ? (progress.completedLessons.length / (sortedLessons.length || 1)) * 100
    : 0;

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="lms-viewer-layout">

      {/* ── Sidebar ── */}
      <aside className={`lms-sidebar${sidebarOpen ? " open" : " closed"}`}>

        {/* Sidebar header */}
        <div className="lms-sidebar-header">
          <button
            className="lms-btn lms-btn-ghost"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            ← Course
          </button>
          <button
            className="lms-btn lms-btn-ghost"
            onClick={() => setSidebarOpen(false)}
            style={{ padding: "6px 10px" }}
          >
            ✕
          </button>
        </div>

        {/* Progress */}
        {progress && (
          <div style={{ padding: "1rem 1rem 0" }}>
            <ProgressBar value={progressValue} label="Your Progress" />
          </div>
        )}

        {/* Section label */}
        <div className="lms-sidebar-label">Lessons</div>

        {/* Lesson list */}
        <nav className="lms-lesson-nav">
          {sortedLessons.map((l, idx) => {
            const isActive = l._id === lesson._id;
            const isDone   = progress?.completedLessons?.includes(l._id);
            return (
              <button
                key={l._id}
                className={`lms-lesson-nav-item${isActive ? " active" : ""}`}
                onClick={() => goToLesson(l.order)}
              >
                <span className="lms-lesson-num">
                  {isDone ? "✓" : idx + 1}
                </span>
                <span className="lms-lesson-nav-title">{l.title}</span>
                {l.points && (
                  <span className="lms-lesson-pts">{l.points}pt</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quiz shortcut */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(197,160,33,.15)", marginTop: "auto" }}>
          <button
            className="lms-btn lms-btn-ghost"
            onClick={goToQuiz}
            style={{ width: "100%", justifyContent: "center" }}
          >
            📝 Take Quiz
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="lms-viewer-main">

        {/* Top bar */}
        <div className="lms-viewer-topbar">
          {!sidebarOpen && (
            <button
              className="lms-btn lms-btn-ghost"
              onClick={() => setSidebarOpen(true)}
            >
              ☰ Lessons
            </button>
          )}
          <div style={{ flex: 1 }} />
          <Badge variant={completed ? "green" : "amber"}>
            {completed
              ? "✓ Completed"
              : `Lesson ${currentIndex + 1} of ${sortedLessons.length}`}
          </Badge>
        </div>

        {/* Lesson article */}
        <article className="lms-lesson-content lms-fade-up">
          <h1 className="lms-display" style={{ fontSize: "clamp(24px,3vw,38px)" }}>
            {lesson.title}
          </h1>
          <div
            className="lms-html-content"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </article>

        {/* Bottom actions */}
        <div className="lms-viewer-actions">
          <button
            className="lms-btn lms-btn-ghost"
            disabled={!prevLesson}
            onClick={() => prevLesson && goToLesson(prevLesson.order)}
          >
            ← Previous
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            {!completed ? (
              <button
                className="lms-btn lms-btn-success"
                onClick={handleComplete}
                disabled={completing}
              >
                {completing ? "Marking..." : "✓ Mark as Complete"}
              </button>
            ) : (
              <button
                className="lms-btn lms-btn-ghost"
                onClick={goToQuiz}
                style={{ borderColor: "rgba(197,160,33,.4)", color: "var(--gold-dark)" }}
              >
                📝 Take Quiz
              </button>
            )}

            {nextLesson && (
              <button
                className="lms-btn lms-btn-primary"
                onClick={() => goToLesson(nextLesson.order)}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}