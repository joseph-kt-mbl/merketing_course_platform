import { useNavigate } from "react-router-dom";
import "./payment.css";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="pay-page">
      <div className="pay-card">
        <div className="pay-strip failed" />
        <div className="pay-body">
          <div className="status-icon-wrap failed">
            <div className="status-icon failed">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
          </div>

          <h1 className="pay-title">Payment failed</h1>
          <p className="pay-subtitle">
            We couldn't complete your transaction. Please check your details and
            try again.
          </p>

          <div className="error-box">
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
            <div>
              <div className="error-title">Transaction declined</div>
              <div className="error-desc">
                Your payment could not be processed. This may be due to
                insufficient funds or a temporary issue with your bank.
              </div>
            </div>
          </div>

          <div className="detail-rows">
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value failed">Failed</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Error code</span>
              <span className="detail-value mono small">ERR_CARD_DECLINED</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Processed via</span>
              <span className="detail-value chargily-inline">
                <ChargilyMini />
                Chargily Pay
              </span>
            </div>
          </div>

          <button
            className="pay-btn primary failed-btn"
            onClick={() => navigate("/payment")}
          >
            ↻ Try again
          </button>
          <button className="pay-btn" onClick={() => navigate("/support")}>
            🎧 Contact support
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