import { useEffect } from "react";
import "./payment.css";

export default function PaymentPage() {
  useEffect(() => {
    const startPayment = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No token");

        const res = await fetch("/api/payments/create", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        window.location.href = data.checkout_url;
      } catch (err) {
        console.error(err);
        window.location.href = "/payment-failed";
      }
    };

    startPayment();
  }, []);

  return (
    <div className="pay-page">
      <div className="pay-card">
        <div className="pay-strip" />
        <div className="pay-body">
          <div className="chargily-badge">
            <div className="chargily-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 3L4 14h8l-1 7 9-11h-8l1-10z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="chargily-label">
              Powered by <strong>Chargily Pay</strong>
            </span>
          </div>

          <h1 className="pay-title">Preparing your payment</h1>
          <p className="pay-subtitle">
            We're securely connecting you to Chargily's checkout. This only
            takes a moment.
          </p>

          <div className="spinner-wrap">
            <div className="spinner" />
            <span className="spinner-text">Initializing secure session...</span>
          </div>

          <div className="pay-meta">
            <span>🔒 256-bit TLS encryption</span>
            <span className="meta-dot">·</span>
            <span>🛡️ PCI DSS compliant</span>
          </div>
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