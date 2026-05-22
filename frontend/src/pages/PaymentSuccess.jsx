import { useNavigate } from "react-router-dom";
import "./payment.css";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const txnId = "TXN-2026-CRG-" + Math.floor(Math.random() * 9000 + 1000);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="pay-page">
      <div className="pay-card">
        <div className="pay-strip success" />
        <div className="pay-body">
          <div className="status-icon-wrap success">
            <div className="status-icon success">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>

          <h1 className="pay-title">Payment successful</h1>
          <p className="pay-subtitle">
            Your transaction was completed. A confirmation has been sent to your
            email.
          </p>

          <div className="detail-rows">
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value success">Confirmed</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Transaction ID</span>
              <span className="detail-value mono small">{txnId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Processed via</span>
              <span className="detail-value chargily-inline">
                <ChargilyMini />
                Chargily Pay
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date</span>
              <span className="detail-value">{date}</span>
            </div>
          </div>

          <button className="pay-btn primary" onClick={() => navigate("/")}>
            ← Back to dashboard
          </button>
          <button className="pay-btn" onClick={() => window.print()}>
            🧾 View receipt
          </button>
        </div>

        <div className="pay-divider" />
        <div className="pay-footer">
          <div className="pay-footer-left">
            <span className="dot" />
            Chargily Pay
          </div>
          <div className="pay-footer-right">🔒 Secure checkout</div>
        </div>
      </div>
    </div>
  );
}

function ChargilyMini() {
  return (
    <span
      style={{
        width: 16,
        height: 16,
        background: "#00B37D",
        borderRadius: 4,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
        <path
          d="M13 3L4 14h8l-1 7 9-11h-8l1-10z"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}