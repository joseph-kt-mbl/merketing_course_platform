import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { paymentApi } from "../api/lmsApi";
import "../styles/lms.css";

// ─── Payment Initiator ────────────────────────────────────────────────────────
// Used when clicking "Pay to Unlock" from the course detail page
// Usage: navigate to /courses/:courseId/pay
export function PaymentInitiatorPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | error
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Not authenticated");
        const data = await paymentApi.createCheckout(courseId);
        if (data?.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          throw new Error("No checkout URL received");
        }
      } catch (err) {
        setErrMsg(err?.message || "Payment initiation failed");
        setStatus("error");
      }
    })();
  }, [courseId]);

  return (
    <div className="lms-module" style={pageStyle}>
      <div className="lms-card" style={cardStyle}>
        <div style={{ height: 4, background: "#00B37D", margin: "-1.5rem -1.5rem 1.5rem", borderRadius: "var(--lms-radius-lg) var(--lms-radius-lg) 0 0" }} />

        <ChargilyBadge />

        {status === "loading" ? (
          <>
            <h1 className="lms-display" style={titleStyle}>Preparing your payment</h1>
            <p style={subtitleStyle}>We're securely connecting you to the checkout page…</p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, margin: "1.5rem 0" }}>
              <div className="lms-spinner" />
              <span style={{ fontSize: 12, color: "var(--lms-text-3)", fontFamily: "var(--lms-font-mono)" }}>
                Initializing secure session...
              </span>
            </div>
            <MetaRow />
          </>
        ) : (
          <>
            <div style={{ fontSize: 52, textAlign: "center" }}>⚠️</div>
            <h1 className="lms-display" style={titleStyle}>Something went wrong</h1>
            <p style={{ ...subtitleStyle, color: "var(--lms-red)" }}>{errMsg}</p>
            <button
              className="lms-btn lms-btn-ghost"
              style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              ← Back to Course
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Payment Success ──────────────────────────────────────────────────────────
export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { courseId } = useParams(); // optional, depends on your callback URL

  return (
    <div className="lms-module" style={pageStyle}>
      <div className="lms-card lms-fade-up" style={cardStyle}>
        <div style={{ height: 4, background: "#00B37D", margin: "-1.5rem -1.5rem 1.5rem", borderRadius: "var(--lms-radius-lg) var(--lms-radius-lg) 0 0" }} />

        <ChargilyBadge />

        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(16,185,129,0.1)",
            border: "1.5px solid rgba(16,185,129,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            animation: "lms-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </div>

        <h1 className="lms-display" style={titleStyle}>Payment Successful</h1>
        <p style={subtitleStyle}>Your enrollment is confirmed. You now have full access to all lessons and quizzes.</p>

        <div style={{ width: "100%", borderRadius: 10, border: "1px solid var(--lms-border)", overflow: "hidden", margin: "0.5rem 0" }}>
          {[
            { label: "Status", value: "Confirmed", color: "#10b981" },
            { label: "Access", value: "Full course unlocked" },
            { label: "Processed via", value: "Chargily Pay" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "11px 16px", borderBottom: "1px solid var(--lms-border)", fontSize: 13 }}>
              <span style={{ color: "var(--lms-text-3)" }}>{label}</span>
              <span style={{ fontWeight: 500, color: color || "var(--lms-text)" }}>{value}</span>
            </div>
          ))}
        </div>

        <button
          className="lms-btn lms-btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
          onClick={() => navigate(courseId ? `/courses/${courseId}` : "/courses")}
        >
          Start Learning →
        </button>

        <MetaRow />
      </div>
    </div>
  );
}

// ─── Payment Failed ───────────────────────────────────────────────────────────
export function PaymentFailedPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  return (
    <div className="lms-module" style={pageStyle}>
      <div className="lms-card lms-fade-up" style={cardStyle}>
        <div style={{ height: 4, background: "#ef4444", margin: "-1.5rem -1.5rem 1.5rem", borderRadius: "var(--lms-radius-lg) var(--lms-radius-lg) 0 0" }} />

        <ChargilyBadge />

        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.08)",
            border: "1.5px solid rgba(239,68,68,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            animation: "lms-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h1 className="lms-display" style={titleStyle}>Payment Failed</h1>
        <p style={subtitleStyle}>We couldn't complete your transaction. Please check your payment details and try again.</p>

        <div
          style={{
            width: "100%",
            background: "var(--lms-red-dim)",
            border: "1px solid var(--lms-red-border)",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 13,
            color: "var(--lms-red)",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 3 }}>Transaction declined</div>
            <div style={{ opacity: 0.85 }}>This may be due to insufficient funds or a temporary issue. Contact your bank or try a different payment method.</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, width: "100%", marginTop: "0.5rem" }}>
          <button
            className="lms-btn lms-btn-ghost"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => navigate(courseId ? `/courses/${courseId}` : "/courses")}
          >
            ← Course
          </button>
          <button
            className="lms-btn lms-btn-primary"
            style={{ flex: 1, justifyContent: "center", background: "#ef4444" }}
            onClick={() => navigate(courseId ? `/courses/${courseId}/pay` : "/courses")}
          >
            ↻ Try Again
          </button>
        </div>

        <MetaRow />
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function ChargilyBadge() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--lms-surface-2)", border: "1px solid var(--lms-border)", borderRadius: 100, padding: "7px 14px 7px 9px", margin: "0 auto" }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: "#00B37D", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M13 3L4 14h8l-1 7 9-11h-8l1-10z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontSize: 13, color: "var(--lms-text-2)" }}>
        Powered by <strong style={{ color: "#00B37D" }}>Chargily Pay</strong>
      </span>
    </div>
  );
}

function MetaRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 11, color: "var(--lms-text-3)" }}>
      <span>🔒</span>
      <span>256-bit TLS encryption</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span>🛡️</span>
      <span>PCI DSS compliant</span>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem 1rem",
};

const cardStyle = {
  width: "100%",
  maxWidth: 420,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.25rem",
  textAlign: "center",
};

const titleStyle = {
  fontSize: 26,
  color: "var(--lms-text)",
  margin: 0,
};

const subtitleStyle = {
  fontSize: 14,
  color: "var(--lms-text-2)",
  lineHeight: 1.65,
  margin: 0,
  maxWidth: 320,
};
