import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourseQuiz } from "../hooks/useLms";
import { quizApi } from "../api/lmsApi";
import { Spinner, ErrorState } from "../components/shared/Ui";
import { setNeedToRefetch } from "../../store/ActivitySlice";
import { useDispatch } from "react-redux";
// import useCompletedQuizEvent from '../../store/events'

/* ─── Design tokens (from Dashboard.css) ─────────────────────────────────── */


const T = {
  navy:       "#1A237E",
  navyDark:   "#0D1257",
  navyLight:  "#283593",
  gold:       "#C5A021",
  goldLight:  "#E8BE3A",
  goldDark:   "#9C7D12",
  green:      "#059669",
  greenLight: "#10B981",
  red:        "#DC2626",
  offWhite:   "#F8F7F2",
};


const QUIZ_STATE = { IDLE: "idle", SUBMITTING: "submitting", RESULT: "result" };

/* ─── Result banner ───────────────────────────────────────────────────────── */
function ResultBanner({ result, passingScore, onRetry, onContinue }) {
  const passed = result?.passed;
  console.log("Quiz result:", result);  // Debug log to inspect the result object
  const score = result?.score ?? 0;

  return (
    <div style={{
      marginBottom: "2rem",
      background: passed ? "rgba(5,150,105,.08)" : "rgba(220,38,38,.07)",
      border: `1px solid ${passed ? "rgba(5,150,105,.3)" : "rgba(220,38,38,.28)"}`,
      borderRadius: 20,
      padding: "1.75rem",
      display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap",
    }}>
      <div style={{ fontSize: 52 }}>{passed ? "🎉" : "😔"}</div>

      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 26, fontWeight: 900,
          color: passed ? T.greenLight : "#F87171",
          marginBottom: 6, letterSpacing: "-.3px",
        }}>
          {passed ? "Quiz Passed!" : "Quiz Failed"}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.6 }}>
          You scored{" "}
          <strong style={{ color: "white", fontSize: 16, fontWeight: 900 }}>{score}%</strong>
          {" "}· Passing: <strong style={{ color: "rgba(255,255,255,.7)" }}>{passingScore}%</strong>
        </div>
        {passed && (
          <div style={{ fontSize: 12, color: T.greenLight, marginTop: 6, fontWeight: 700 }}>
            ✓ Next lesson unlocked
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {!passed && (
          <button
            onClick={onRetry}
            style={{
              background: "rgba(197,160,33,.1)", color: T.goldLight,
              border: "1px solid rgba(197,160,33,.3)", borderRadius: 10,
              padding: ".7rem 1.4rem", fontWeight: 700, fontSize: 13,
              fontFamily: "'Montserrat', sans-serif", cursor: "pointer",
              transition: "background .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(197,160,33,.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(197,160,33,.1)"}
          >
            ↻ Retry
          </button>
        )}
        <button
          onClick={onContinue}
          style={{
            background: `linear-gradient(135deg, ${T.goldLight}, ${T.goldDark})`,
            color: T.navyDark, fontWeight: 800, padding: ".7rem 1.6rem",
            borderRadius: 10, border: "none", cursor: "pointer",
            fontFamily: "'Montserrat', sans-serif", fontSize: 13,
            boxShadow: "0 6px 20px rgba(197,160,33,.35)", transition: "transform .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}
        >
          {passed ? "Continue →" : "← Course"}
        </button>
      </div>
    </div>
  );
}

/* ─── Question card ───────────────────────────────────────────────────────── */
function QuestionCard({ question, index, selected, onSelect, showResult }) {
  const correctAnswer = question.correctAnswer;

  return (
    <div style={{
      background: "rgba(255,255,255,.04)", backdropFilter: "blur(20px)",
      border: "1px solid rgba(197,160,33,.15)", borderRadius: 18,
      padding: "1.5rem",
      transition: "transform .2s, border-color .2s",
    }}>
      {/* Question header */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 900,
          background: selected !== undefined
            ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`
            : `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
          color: "white",
          boxShadow: selected !== undefined
            ? "0 3px 12px rgba(197,160,33,.4)"
            : "0 3px 10px rgba(26,35,126,.3)",
          fontFamily: "'Montserrat', sans-serif",
        }}>
          {index + 1}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "white", lineHeight: 1.55, margin: 0 }}>
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 48 }}>
        {question.options.map((option, optIdx) => {
          const isSelected = selected === optIdx;
          const isCorrect = showResult && correctAnswer === option;
          const isWrong = showResult && isSelected && correctAnswer !== option;

          let border = "1px solid rgba(255,255,255,.1)";
          let bg = "rgba(255,255,255,.03)";
          let color = "rgba(255,255,255,.6)";
          let markerBg = `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`;

          if (isCorrect) {
            border = "1px solid rgba(5,150,105,.4)";
            bg = "rgba(5,150,105,.09)";
            color = T.greenLight;
            markerBg = `linear-gradient(135deg, ${T.green}, ${T.greenLight})`;
          } else if (isWrong) {
            border = "1px solid rgba(220,38,38,.35)";
            bg = "rgba(220,38,38,.08)";
            color = "#F87171";
            markerBg = "linear-gradient(135deg, #DC2626, #EF4444)";
          } else if (isSelected && !showResult) {
            border = "1px solid rgba(197,160,33,.4)";
            bg = "rgba(197,160,33,.08)";
            color = T.goldLight;
            markerBg = `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`;
          }

          return (
            <button
              key={optIdx}
              onClick={() => onSelect(optIdx)}
              disabled={showResult}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: bg, border, borderRadius: 12,
                padding: "11px 14px", color, cursor: showResult ? "default" : "pointer",
                fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 600,
                textAlign: "left", transition: "background .15s, border-color .15s, transform .1s",
              }}
              onMouseEnter={e => { if (!showResult) e.currentTarget.style.transform = "translateX(3px)"; }}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >
              {/* Letter marker */}
              <span style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 900, color: "white",
                background: markerBg,
              }}>
                {String.fromCharCode(65 + optIdx)}
              </span>
              <span style={{ flex: 1 }}>{option}</span>
              {isCorrect && <span style={{ fontSize: 15 }}>✓</span>}
              {isWrong && <span style={{ fontSize: 15 }}>✗</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function QuizPage() {
  const { courseId, order } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: quiz, loading, error } = useCourseQuiz(order);
  // const { completedQuizEvent,setCompletedQuizEvent} = useCompletedQuizEvent();

  const [answers, setAnswers] = useState({});
  const [quizState, setQuizState] = useState(QUIZ_STATE.IDLE);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const pageStyle = {
    minHeight: "100vh",
    fontFamily: "'Montserrat', sans-serif",
    background: `linear-gradient(135deg, ${T.navyDark} 0%, ${T.navy} 50%, #0b0f42 100%)`,
    position: "relative",
  };

  const gridBg = {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: "linear-gradient(rgba(197,160,33,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(197,160,33,.03) 1px, transparent 1px)",
    backgroundSize: "50px 50px",
  };

  if (loading) return (
    <div style={{ ...pageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner text="Loading quiz…" />
    </div>
  );

  if (error) return (
    <div style={{ ...pageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ErrorState message={error} />
    </div>
  );

  if (!quiz || !quiz.questions?.length) return (
    <div style={pageStyle}>
      <div style={gridBg} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
        <div style={{ fontSize: 52 }}>📝</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>No quiz available for this course yet.</div>
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          style={{
            background: "rgba(197,160,33,.1)", color: T.goldLight,
            border: "1px solid rgba(197,160,33,.3)", borderRadius: 10,
            padding: ".65rem 1.5rem", fontWeight: 700, fontSize: 13,
            fontFamily: "'Montserrat', sans-serif", cursor: "pointer",
          }}
        >
          ← Back to Course
        </button>
      </div>
    </div>
  );

  const questions = quiz.questions;
  const answered = Object.keys(answers).length;
  const allAnswered = answered === questions.length;

  function selectAnswer(qi, si) {
    if (quizState === QUIZ_STATE.RESULT) return;
    setAnswers(prev => ({ ...prev, [qi]: si }));
  }

  async function handleSubmit() {
    if (!allAnswered) return;
    setQuizState(QUIZ_STATE.SUBMITTING); setSubmitError("");
    try {
      const payload = Object.entries(answers).map(([qi, si]) => ({ questionIndex: Number(qi), selectedIndex: si }));
      const data = await quizApi.submitAttempt(quiz._id, payload);
      if (data.success === false) throw new Error(data.message);
      setResult(data.attempt);
      if(data.attempt.passed) {
        dispatch(setNeedToRefetch(true)); // Trigger refetch of activity logs in admin dashboard
      }
      setQuizState(QUIZ_STATE.RESULT);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err?.message || "Submission failed. Please try again.");
      setQuizState(QUIZ_STATE.IDLE);
    }
  }

  function handleRetry() {
    setAnswers({}); setResult(null); setQuizState(QUIZ_STATE.IDLE);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const progressPct = (answered / questions.length) * 100;

  return (
    <div style={pageStyle}>
      <div style={gridBg} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto", padding: "5rem 2rem 5rem" }}>

        {/* Back */}
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          style={{
            background: "rgba(197,160,33,.1)", color: T.goldLight,
            border: "1px solid rgba(197,160,33,.3)", borderRadius: 8,
            padding: ".45rem 1rem", fontSize: 12, fontWeight: 700,
            fontFamily: "'Montserrat', sans-serif", cursor: "pointer",
            marginBottom: "2rem", display: "inline-flex", alignItems: "center", gap: 5,
          }}
        >
          ← Back to Course
        </button>

        {/* Result banner */}
        {quizState === QUIZ_STATE.RESULT && result && (
          <ResultBanner
            result={result}
            passingScore={quiz.passingScore}
            onRetry={handleRetry}
            onContinue={() => navigate(`/courses/${courseId}/lessons/${parseInt(order) + 1}`)}
          />
        )}

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 11, fontWeight: 800, letterSpacing: "3px",
            textTransform: "uppercase", color: T.gold, marginBottom: 10,
          }}>
            <span style={{ display: "block", width: 22, height: 2, background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`, borderRadius: 2 }} />
            {questions.length} questions · {quiz.passingScore}% to pass
          </div>
          <h1 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 900, color: "white", letterSpacing: "-.4px", marginBottom: 0 }}>
            Course Quiz
          </h1>
          <div style={{ width: 50, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`, marginTop: 10 }} />
        </div>

        {/* Progress bar */}
        <div style={{
          background: "rgba(255,255,255,.04)", border: "1px solid rgba(197,160,33,.18)",
          borderRadius: 16, padding: "1.25rem 1.5rem", marginBottom: "2rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12, fontWeight: 700 }}>
            <span style={{ color: "rgba(255,255,255,.45)" }}>{answered} of {questions.length} answered</span>
            {allAnswered && quizState === QUIZ_STATE.IDLE && (
              <span style={{ color: T.greenLight }}>Ready to submit ✓</span>
            )}
          </div>
          <div style={{ height: 7, background: "rgba(255,255,255,.1)", borderRadius: 50, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 50, width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${T.goldDark}, ${T.goldLight})`,
              boxShadow: "0 0 12px rgba(197,160,33,.35)", transition: "width .4s ease",
            }} />
          </div>
          {/* Dot strip */}
          <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
            {questions.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: answers[i] !== undefined ? T.gold : "rgba(255,255,255,.08)",
                transition: "background .3s",
              }} />
            ))}
          </div>
        </div>

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {questions.map((q, qIdx) => (
            <QuestionCard
              key={qIdx}
              question={q}
              index={qIdx}
              selected={answers[qIdx]}
              onSelect={si => selectAnswer(qIdx, si)}
              showResult={quizState === QUIZ_STATE.RESULT}
              result={result}
            />
          ))}
        </div>

        {/* Submit */}
        {quizState !== QUIZ_STATE.RESULT && (
          <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            {submitError && (
              <div style={{
                width: "100%", fontSize: 13, color: "#F87171",
                background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.25)",
                borderRadius: 12, padding: "11px 16px",
              }}>
                {submitError}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || quizState === QUIZ_STATE.SUBMITTING}
              style={{
                minWidth: 220,
                background: allAnswered
                  ? `linear-gradient(135deg, ${T.goldLight}, ${T.goldDark})`
                  : "rgba(255,255,255,.06)",
                color: allAnswered ? T.navyDark : "rgba(255,255,255,.3)",
                fontWeight: 800, padding: "13px 28px", fontSize: 15,
                borderRadius: 12, border: "none", cursor: allAnswered ? "pointer" : "not-allowed",
                fontFamily: "'Montserrat', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: allAnswered ? "0 8px 28px rgba(197,160,33,.4)" : "none",
                transition: "transform .2s, box-shadow .2s",
              }}
              onMouseEnter={e => { if (allAnswered) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(197,160,33,.55)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = allAnswered ? "0 8px 28px rgba(197,160,33,.4)" : "none"; }}
            >
              {quizState === QUIZ_STATE.SUBMITTING ? "Submitting…" : "Submit Quiz →"}
            </button>
            {!allAnswered && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", fontWeight: 600 }}>
                Answer all {questions.length} questions to submit
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}