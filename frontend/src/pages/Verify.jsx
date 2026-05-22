import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect ,useRef} from 'react';

function Verify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const calledOnce = useRef(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // 'success', 'error', null
  const [mounted, setMounted] = useState(false);

  const [userEmail, setUserEmail] = useState(null);


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      if (calledOnce.current) return;
      calledOnce.current = true;

      if (!token) {
        setMessage("No verification token found");
        setStatus("error");
        setLoading(false);
        return;
      }

      setLoading(true);
      setMessage("");
      setStatus(null);

      try {
        const res = await fetch(`/api/users/verify?token=${token}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setMessage(data.message || "Your email has been verified!");
        setStatus("success");
        setUserEmail(data.email);
      } catch (err) {
        setMessage(err.message || "Verification failed. Token may be expired.");
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleCompleteRegistration = () => {
    navigate(`/register?email=${userEmail}`);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="verify-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .verify-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .verify-container::before {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          top: -100px;
          right: -100px;
          animation: float 6s ease-in-out infinite;
        }

        .verify-container::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          bottom: -50px;
          left: -50px;
          animation: float 8s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
        }

        .verify-card {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(203, 213, 225, 0.1);
          border-radius: 20px;
          padding: 60px 50px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 10;
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .verify-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .verify-icon {
          width: 90px;
          height: 90px;
          margin: 0 auto 24px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 44px;
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }

        .verify-icon.loading {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both, pulse 2s ease-in-out infinite;
        }

        .verify-icon.success {
          background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both, scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .verify-icon.error {
          background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes scaleUp {
          from { transform: scale(0.8); }
          to { transform: scale(1); }
        }

        .verify-title {
          font-size: 28px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }

        .verify-subtitle {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.6;
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }

        .token-display {
          background: rgba(51, 65, 85, 0.5);
          border: 1px solid rgba(203, 213, 225, 0.1);
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 28px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 11px;
          color: #cbd5e1;
          word-break: break-all;
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
          max-height: 60px;
          overflow: hidden;
        }

        .token-label {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .message {
          padding: 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.6;
          text-align: center;
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          margin-bottom: 24px;
          border: 1px solid transparent;
        }

        .message.success {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: #86efac;
        }

        .message.error {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .message.loading {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          color: #93c5fd;
        }

        .button-group {
          display: flex;
          gap: 12px;
          flex-direction: column;
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
        }

        .verify-button {
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .verify-button.primary {
          background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
          color: white;
          width: 100%;
        }

        .verify-button.secondary {
          background: rgba(51, 65, 85, 0.5);
          color: #cbd5e1;
          border: 1px solid rgba(203, 213, 225, 0.1);
          width: 100%;
        }

        .verify-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .verify-button.primary:hover:not(:disabled) {
          box-shadow: 0 12px 24px rgba(16, 185, 129, 0.3);
        }

        .verify-button.secondary:hover:not(:disabled) {
          background: rgba(51, 65, 85, 0.7);
          border-color: rgba(203, 213, 225, 0.2);
        }

        .verify-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .verify-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255, 255, 255, 0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .loading-dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: #3b82f6;
          border-radius: 50%;
          animation: bounce 1.4s infinite;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-8px); opacity: 1; }
        }

        @media (max-width: 640px) {
          .verify-card {
            padding: 40px 24px;
          }

          .verify-title {
            font-size: 24px;
          }

          .verify-icon {
            width: 80px;
            height: 80px;
            font-size: 40px;
          }
        }
      `}</style>

      <div className="verify-card">
        <div className="verify-header">
          <div className={`verify-icon ${status || 'loading'}`}>
            {loading ? '⏳' : status === 'success' ? '✅' : '❌'}
          </div>
          <h1 className="verify-title">
            {loading ? 'Verifying Email' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </h1>
          <p className="verify-subtitle">
            {loading
              ? 'Please wait while we verify your email address'
              : status === 'success'
              ? 'Your email has been confirmed. Let\'s complete your registration!'
              : 'We encountered an issue verifying your email'}
          </p>
        </div>

        {token && !loading && (
          <div className="token-display">
            <div className="token-label">Verification Token</div>
            {token}
          </div>
        )}

        {loading && (
          <div className="message loading">
            <div className="loading-text">
              <span>Verifying your email...</span>
              <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>
        )}

        {!loading && message && (
          <div className={`message ${status}`}>
            {message}
          </div>
        )}

        {!loading && status === 'success' && (
          <div className="button-group">
            <button className="verify-button primary" onClick={handleCompleteRegistration}>
              <span>Complete Registration</span>
              <span>→</span>
            </button>
          </div>
        )}

        {!loading && status === 'error' && (
          <div className="button-group">
            <button className="verify-button primary" onClick={handleRetry}>
              <span>Try Again</span>
              <span>🔄</span>
            </button>
            <button className="verify-button secondary" onClick={() => navigate('/start')}>
              <span>Back to Start</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Verify;