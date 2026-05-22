import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourse, useCourseLessons, useProgress } from "../hooks/useLms";
import { progressApi, paymentApi } from "../api/lmsApi";
import { Spinner, ErrorState } from "../components/shared/Ui";
import { useSelector } from "react-redux";
import { selectPaymentStatus } from "../../store/PaymentSlice";

/* ─── Design tokens (mapped from Dashboard.css) ──────────────────────────── */
const T = {
  navy:       "#1A237E",
  navyDark:   "#0D1257",
  navyMid:    "#1B2590",
  navyLight:  "#283593",
  gold:       "#C5A021",
  goldLight:  "#E8BE3A",
  goldPale:   "#F5DFA0",
  goldDark:   "#9C7D12",
  offWhite:   "#F8F7F2",
  cardBg:     "#FFFFFF",
  graySoft:   "#6B7280",
  grayLight:  "#F0EFE9",
  green:      "#059669",
  greenLight: "#10B981",
  borderSoft: "rgba(26,35,126,.09)",
  goldGlow:   "rgba(197,160,33,.18)",
};

/* ─── Shared primitive components ─────────────────────────────────────────── */
function Tag({ children, variant = "gold" }) {
  const styles = {
    gold: { background: `rgba(197,160,33,.12)`, color: T.goldDark, border: `1px solid rgba(197,160,33,.28)` },
    green: { background: `rgba(5,150,105,.1)`, color: T.green, border: `1px solid rgba(5,150,105,.2)` },
    navy: { background: `rgba(26,35,126,.08)`, color: T.navyLight, border: `1px solid rgba(26,35,126,.15)` },
    gray: { background: `rgba(107,114,128,.08)`, color: "#9CA3AF", border: `1px solid rgba(107,114,128,.15)` },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 50,
      fontSize: 11, fontWeight: 700, letterSpacing: ".4px",
      fontFamily: "'Montserrat', sans-serif",
      ...styles[variant],
    }}>
      {children}
    </span>
  );
}

function GoldBar({ value = 0 }) {
  return (
    <div style={{ height: 7, background: "rgba(255,255,255,.12)", borderRadius: 50, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 50, width: `${value}%`,
        background: `linear-gradient(90deg, ${T.goldDark}, ${T.goldLight})`,
        boxShadow: "0 0 12px rgba(197,160,33,.4)", transition: "width .8s ease",
      }} />
    </div>
  );
}

/* ─── Enrollment card ─────────────────────────────────────────────────────── */
function EnrollCard({ isEnrolled, hasPaid, progressPct, enrolling, paying, error, onEnroll, onPay, onContinue }) {
  return (
    <div style={{
      width: 290, flexShrink: 0,
      background: "rgba(255,255,255,.04)", backdropFilter: "blur(20px)",
      border: `1px solid rgba(197,160,33,.22)`, borderRadius: 20,
      padding: "1.75rem",
      display: "flex", flexDirection: "column", gap: "1.1rem",
    }}>
      {isEnrolled && hasPaid ? (
        <>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
            Your Progress
          </div>
          <GoldBar value={progressPct} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>
            <span>{Math.round(progressPct)}% complete</span>
            {progressPct === 100 && <Tag variant="green">✓ Done</Tag>}
          </div>
          <button
            onClick={onContinue}
            disabled={progressPct === 100}
            style={{
              width: "100%",
              background: progressPct === 100
                ? `linear-gradient(135deg, ${T.green}, ${T.greenLight})`
                : `linear-gradient(135deg, ${T.goldLight}, ${T.goldDark})`,
              color: progressPct === 100 ? "#fff" : T.navyDark,
              fontWeight: 800, padding: ".85rem 1rem", borderRadius: 10,
              border: "none", cursor: "pointer",
              fontFamily: "'Montserrat', sans-serif", fontSize: ".88rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: "0 8px 24px rgba(197,160,33,.35)",
              transition: "transform .2s, box-shadow .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 35px rgba(197,160,33,.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(197,160,33,.35)"; }}
          >
            {progressPct > 0 ? "Continue Learning →" : "Start Learning →"}
          </button>
        </>
      ) : isEnrolled && !hasPaid ? (
        <>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.7 }}>
            You're enrolled! Unlock all lessons by completing your payment.
          </div>
          <button
            onClick={onPay} disabled={paying}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${T.goldLight}, ${T.goldDark})`,
              color: T.navyDark, fontWeight: 800, padding: ".85rem 1rem",
              borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: "'Montserrat', sans-serif", fontSize: ".88rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: "0 8px 24px rgba(197,160,33,.35)",
              transition: "transform .2s, box-shadow .2s",
            }}
          >
            {paying ? "Redirecting…" : "💳 Pay to Unlock"}
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.7 }}>
            Enroll to get full access to all lessons, quizzes and progress tracking.
          </div>
          <button
            onClick={onEnroll} disabled={enrolling}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${T.goldLight}, ${T.goldDark})`,
              color: T.navyDark, fontWeight: 800, padding: ".85rem 1rem",
              borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: "'Montserrat', sans-serif", fontSize: ".88rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: "0 8px 24px rgba(197,160,33,.35)",
              transition: "transform .2s, box-shadow .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
          >
            {enrolling ? "Enrolling…" : "Enroll Now"}
          </button>
        </>
      )}

      {error && (
        <div style={{
          fontSize: 12, color: "#F87171",
          background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.25)",
          borderRadius: 10, padding: "10px 14px",
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 600 }}>
        🔒 Secure checkout via Chargily
      </div>
    </div>
  );
}

/* ─── Lesson row ──────────────────────────────────────────────────────────── */
function LessonRow({ lesson, index, progress, isEnrolled, hasPaid, onClick }) {
  const isAccessible = isEnrolled && hasPaid;
  const isCompleted = progress?.completedLessons?.includes(lesson._id);
  const isCurrent = progress?.currentLesson === lesson._id;

  return (
    <div
      onClick={isAccessible ? onClick : undefined}
      style={{
        display: "flex", alignItems: "center", gap: "1rem",
        padding: "13px 16px", borderRadius: 14,
        border: `1px solid ${isCurrent ? "rgba(197,160,33,.4)" : isCompleted ? "rgba(5,150,105,.25)" : "rgba(255,255,255,.06)"}`,
        background: isCurrent
          ? "rgba(197,160,33,.06)"
          : isCompleted
          ? "rgba(5,150,105,.04)"
          : "rgba(255,255,255,.02)",
        cursor: isAccessible ? "pointer" : "default",
        transition: "background .15s, border-color .15s, transform .15s",
      }}
      onMouseEnter={e => { if (isAccessible && !isCurrent) { e.currentTarget.style.background = "rgba(197,160,33,.05)"; e.currentTarget.style.transform = "translateX(3px)"; } }}
      onMouseLeave={e => { e.currentTarget.style.background = isCurrent ? "rgba(197,160,33,.06)" : isCompleted ? "rgba(5,150,105,.04)" : "rgba(255,255,255,.02)"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Badge */}
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 900,
        fontFamily: "'Montserrat', sans-serif",
        background: isCompleted
          ? `linear-gradient(135deg, ${T.green}, ${T.greenLight})`
          : isAccessible
          ? `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`
          : "rgba(107,114,128,.15)",
        color: isAccessible || isCompleted ? "white" : "#9CA3AF",
        boxShadow: isAccessible ? "0 3px 10px rgba(26,35,126,.25)" : "none",
      }}>
        {isCompleted ? "✓" : isAccessible ? index + 1 : "🔒"}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: isCompleted ? T.greenLight : isAccessible ? "white" : "#6B7280", marginBottom: 3 }}>
          {lesson.title}
        </div>
        {lesson.points && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 600 }}>
            {lesson.points} pts
          </div>
        )}
      </div>

      {isCurrent && <Tag variant="gold">▶ Current</Tag>}
      {isCompleted && !isCurrent && <Tag variant="green">Done</Tag>}
      {!isAccessible && <Tag variant="gray">Locked</Tag>}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function CourseDetailPage() {
  const paymentStatus = useSelector(selectPaymentStatus);
  console.log("Payment Status:", paymentStatus);
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data: course, loading: cLoading, error: cError } = useCourse(courseId);
  const { data: lessons, loading: lLoading } = useCourseLessons(courseId);
  const { data: progress, loading: pLoading } = useProgress(courseId);
  console.log("progress:", progress);

  const [enrolling, setEnrolling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  if (cLoading || lLoading || pLoading) return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${T.navyDark} 0%, ${T.navy} 50%, #0b0f42 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner text="Loading course…" />
    </div>
  );

  if (cError) return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${T.navyDark} 0%, ${T.navy} 50%, #0b0f42 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ErrorState message={cError} />
    </div>
  );

  const sortedLessons = lessons ? [...lessons].sort((a, b) => a.order - b.order) : [];
  const currentOrder = lessons?.find(l => l._id === progress?.currentLesson)?.order;
  const isEnrolled = !!progress;
  const hasPaid = paymentStatus === "paid";
  const completedCount = progress?.completedLessons?.length ?? 0;
  const totalLessons = 13;
  const progressPct = (completedCount / totalLessons) * 100;

  async function handleEnroll() {
    setEnrolling(true); setEnrollError("");
    try { await progressApi.enroll(courseId); }
    catch (err) { setEnrollError(err?.message || "Enrollment failed."); }
    finally { setEnrolling(false); }
  }

  async function handlePay() {
    setPaying(true); setEnrollError("");
    try { const data = await paymentApi.createCheckout(courseId); window.location.href = data.checkout_url; }
    catch (err) { setEnrollError(err?.message || "Payment initiation failed."); setPaying(false); }
  }

  function handleContinue() {
    if (currentOrder !== undefined) navigate(`/courses/${courseId}/lessons/${currentOrder}`);
    else if (sortedLessons.length > 0) navigate(`/courses/${courseId}/lessons/${sortedLessons[0].order}`);
  }

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Montserrat', sans-serif",
      background: `linear-gradient(135deg, ${T.navyDark} 0%, ${T.navy} 50%, #0b0f42 100%)`,
      position: "relative",
    }}>
      {/* Grid bg */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(197,160,33,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(197,160,33,.03) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />

      {/* ── Hero ── */}
      <div style={{
        position: "relative", zIndex: 1,
        borderBottom: "1px solid rgba(197,160,33,.18)",
        padding: "5rem 2rem 3.5rem",
      }}>
        {/* Gold radial glow */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 60% at 50% 60%, rgba(197,160,33,.07) 0%, transparent 70%)" }} />

        <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <button
            onClick={() => navigate("/courses")}
            style={{
              background: "rgba(197,160,33,.1)", color: T.goldLight,
              border: "1px solid rgba(197,160,33,.3)", borderRadius: 8,
              padding: ".45rem 1rem", fontSize: 12, fontWeight: 700,
              fontFamily: "'Montserrat', sans-serif", cursor: "pointer",
              marginBottom: "2rem", display: "inline-flex", alignItems: "center", gap: 5,
              transition: "background .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(197,160,33,.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(197,160,33,.1)"}
          >
            ← All Courses
          </button>

          <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Left */}
            <div style={{ flex: 1, minWidth: 260 }}>
              {/* Eyebrow */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(197,160,33,.12)", border: "1px solid rgba(197,160,33,.32)",
                color: T.goldLight, padding: ".38rem 1rem", borderRadius: 50,
                fontSize: 11, fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}>
                <span style={{ width: 7, height: 7, background: T.goldLight, borderRadius: "50%", display: "inline-block" }} />
                {course.isPublished ? "Published" : "Draft"}
              </div>

              <h1 style={{
                fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, color: "white",
                lineHeight: 1.12, marginBottom: "1rem", letterSpacing: "-.5px",
              }}>
                {course.title}
              </h1>

              {course.description && (
                <p style={{ color: "rgba(255,255,255,.55)", fontSize: 15, lineHeight: 1.8, maxWidth: 520, marginBottom: "1.5rem" }}>
                  {course.description}
                </p>
              )}

              {/* Stat pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,.06)", border: "1px solid rgba(197,160,33,.2)",
                  padding: ".5rem 1rem", borderRadius: 50, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.75)",
                }}>
                  📚 <span style={{ color: T.goldLight }}>{sortedLessons.length}</span> lessons
                </div>
                {isEnrolled && hasPaid && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,.06)", border: "1px solid rgba(197,160,33,.2)",
                    padding: ".5rem 1rem", borderRadius: 50, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.75)",
                  }}>
                    ✅ <span style={{ color: T.goldLight }}>{completedCount}</span> completed
                  </div>
                )}
              </div>
            </div>

            {/* Enroll card */}
            <EnrollCard
              isEnrolled={isEnrolled}
              hasPaid={hasPaid}
              progressPct={progressPct}
              enrolling={enrolling}
              paying={paying}
              error={enrollError}
              onEnroll={handleEnroll}
              onPay={handlePay}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </div>

      {/* ── Lesson list ── */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "2.5rem 2rem 5rem" }}>
        {/* Section header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 11, fontWeight: 800, letterSpacing: "3px",
            textTransform: "uppercase", color: T.gold, marginBottom: 8,
          }}>
            <span style={{ display: "block", width: 22, height: 2, background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`, borderRadius: 2 }} />
            Course Content
          </div>
          <div style={{ width: 50, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})` }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sortedLessons.map((lesson, idx) => (
            <LessonRow
              key={lesson._id}
              lesson={lesson}
              index={idx}
              progress={progress}
              isEnrolled={isEnrolled}
              hasPaid={hasPaid}
              onClick={() => { if (isEnrolled && hasPaid) navigate(`/courses/${courseId}/lessons/${lesson.order}`); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}