import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchProfile } from '../store/AuthSlice';
import { useDispatch } from 'react-redux';

function Welcome() {
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('email');
  const navigate = useNavigate();

  const dispatch = useDispatch()

  const [emailExists, setEmailExists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // 'success', 'error', null
  const [sendingUrl, setSendingUrl] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Check if email exists
  useEffect(() => {
    const checkEmail = async () => {
      if (!userEmail) {
        setMessage("No email found. Please go back and try again.");
        setStatus("error");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/users/check-email?email=${userEmail}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setEmailExists(data.exists);
        setLoading(false);
      } catch (err) {
        setMessage(err.message || "Failed to check email. Please try again.");
        setStatus("error");
        setLoading(false);
      }
    };

    checkEmail();
  }, [userEmail]);

  // Send URL for new email registration
  const sendUrlToEmail = async () => {
    if (!userEmail) {
      setMessage("No email found. Please go back and try again.");
      setStatus("error");
      return;
    }

    setSendingUrl(true);
    setMessage("");
    setStatus(null);

    try {
      const res = await fetch('/api/users/send-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver: userEmail
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("Verification email sent! Check your inbox.");
      setStatus("success");
    } catch (err) {
      setMessage(err.message || "Failed to send email. Please try again.");
      setStatus("error");
    } finally {
      setSendingUrl(false);
    }
  };

  // Send OTP for existing email
  const sendOtp = async () => {
    if (!userEmail) {
      setMessage("No email found. Please go back and try again.");
      setStatus("error");
      return;
    }

    setOtpLoading(true);
    setMessage("");
    setStatus(null);

    try {
      const res = await fetch('/api/users/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("OTP sent to your email!");
      setStatus("success");
      // Navigate to OTP verification page
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(userEmail)}`);
      }, 1500);
    } catch (err) {
      setMessage(err.message || "Failed to send OTP. Please try again.");
      setStatus("error");
    } finally {
      setOtpLoading(false);
    }
  };

  // Login with password
  const loginWithPassword = async (e) => {
    e.preventDefault();

    if (!userEmail || !password) {
      setMessage("Please enter your password");
      setStatus("error");
      return;
    }

    setPasswordLoading(true);
    setMessage("");
    setStatus(null);

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          password: password
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("Login successful!");
      setStatus("success");
      // Store token and redirect to dashboard
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        const result = await dispatch(fetchProfile());
          if(fetchProfile.fulfilled.match(result)){
            navigate('/dashboard');
          }
      }
    } catch (err) {
      setMessage(err.message || "Invalid password. Please try again.");
      setStatus("error");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="welcome-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .welcome-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1a1f36 50%, #0f172a 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .welcome-container::before {
          content: '';
          position: absolute;
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
          border-radius: 50%;
          top: -100px;
          right: -100px;
          animation: pulse-glow 6s ease-in-out infinite;
        }

        .welcome-container::after {
          content: '';
          position: absolute;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
          border-radius: 50%;
          bottom: -50px;
          left: -50px;
          animation: pulse-glow 8s ease-in-out infinite reverse;
        }

        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        .welcome-card {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(203, 213, 225, 0.15);
          border-radius: 24px;
          padding: 60px 50px;
          max-width: 520px;
          width: 90%;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          z-index: 10;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .welcome-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .welcome-icon {
          width: 90px;
          height: 90px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }

        .welcome-title {
          font-size: 32px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 12px;
          letter-spacing: -0.8px;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }

        .welcome-subtitle {
          font-size: 15px;
          color: #cbd5e1;
          line-height: 1.7;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }

        .email-display {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(203, 213, 225, 0.15);
          border-radius: 12px;
          padding: 16px 18px;
          margin: 32px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }

        .email-icon {
          font-size: 22px;
          color: #3b82f6;
        }

        .email-text {
          flex: 1;
          min-width: 0;
        }

        .email-label {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .email-value {
          font-size: 14px;
          color: #e2e8f0;
          word-break: break-all;
          font-weight: 500;
        }

        .button-group {
          display: flex;
          gap: 12px;
          flex-direction: column;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
        }

        .welcome-button {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
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

        .welcome-button.secondary {
          background: rgba(51, 65, 85, 0.5);
          border: 1px solid rgba(203, 213, 225, 0.15);
        }

        .welcome-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .welcome-button:hover:not(:disabled)::before {
          width: 300px;
          height: 300px;
        }

        .welcome-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 16px 32px rgba(59, 130, 246, 0.4);
        }

        .welcome-button.secondary:hover:not(:disabled) {
          box-shadow: 0 16px 32px rgba(59, 130, 246, 0.2);
          background: rgba(51, 65, 85, 0.7);
        }

        .welcome-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .welcome-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .button-text {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2.5px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .message-container {
          margin-top: 24px;
          animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .message {
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.6;
          text-align: center;
          border: 1px solid transparent;
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .message.success {
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.3);
          color: #86efac;
        }

        .message.error {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .loading-skeleton {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton {
          height: 48px;
          background: rgba(203, 213, 225, 0.1);
          border-radius: 12px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .password-form {
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }

        .form-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input {
          width: 100%;
          padding: 12px 14px 12px 40px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(203, 213, 225, 0.15);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .password-input::placeholder {
          color: #64748b;
        }

        .password-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(30, 41, 59, 0.8);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .password-icon {
          position: absolute;
          left: 12px;
          font-size: 16px;
          color: #64748b;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #64748b;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: #3b82f6;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(203, 213, 225, 0.15);
        }

        .divider-text {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          white-space: nowrap;
        }

        .footer-text {
          text-align: center;
          font-size: 12px;
          color: #64748b;
          margin-top: 24px;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
        }

        .footer-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .welcome-card {
            padding: 40px 24px;
          }

          .welcome-title {
            font-size: 24px;
          }

          .welcome-icon {
            width: 80px;
            height: 80px;
            font-size: 40px;
          }

          .button-group {
            gap: 10px;
          }

          .welcome-button {
            padding: 12px 20px;
            font-size: 14px;
          }
        }
      `}</style>

      <div className="welcome-card">
        <div className="welcome-header">
          <div className="welcome-icon">👋</div>
          <h1 className="welcome-title">
            {loading ? 'Loading...' : emailExists ? 'Welcome Back!' : 'Welcome aboard!'}
          </h1>
          <p className="welcome-subtitle">
            {loading
              ? 'Checking your email...'
              : emailExists
              ? 'Sign in to your account to continue'
              : "We're excited to have you. Let's verify your email address to get started."}
          </p>
        </div>

        {userEmail && (
          <div className="email-display">
            <span className="email-icon">📧</span>
            <div className="email-text">
              <div className="email-label">Your Email</div>
              <div className="email-value">{userEmail}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-skeleton">
            <div className="skeleton"></div>
            <div className="skeleton"></div>
          </div>
        ) : message ? (
          <div className="message-container">
            <div className={`message ${status}`}>
              {message}
            </div>
          </div>
        ) : emailExists ? (
          // EXISTING EMAIL - LOGIN FLOW
          <>
            <form onSubmit={loginWithPassword} className="password-form">
              <div className="form-group">
                <label className="form-label">🔑 Password</label>
                <div className="password-input-wrapper">
                  <span className="password-icon">🔒</span>
                  <input
                    className="password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button
                className="welcome-button"
                type="submit"
                disabled={passwordLoading || !password}
              >
                <span className="button-text">
                  {passwordLoading && <div className="spinner"></div>}
                  {passwordLoading ? 'Signing In...' : 'Sign In with Password'}
                </span>
              </button>
            </form>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">or</span>
              <div className="divider-line"></div>
            </div>

            <button
              className="welcome-button secondary"
              onClick={sendOtp}
              disabled={otpLoading}
            >
              <span className="button-text">
                {otpLoading && <div className="spinner"></div>}
                {otpLoading ? 'Sending OTP...' : 'Receive OTP via Email'}
              </span>
            </button>

            <p className="footer-text">
              <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>
                Forgot password?
              </a>
            </p>
          </>
        ) : (
          // NEW EMAIL - SIGNUP FLOW
          <>
            <button
              className="welcome-button"
              onClick={sendUrlToEmail}
              disabled={sendingUrl || !userEmail}
            >
              <span className="button-text">
                {sendingUrl && <div className="spinner"></div>}
                {sendingUrl ? 'Sending...' : 'Send Verification Email'}
              </span>
            </button>

            <p className="footer-text">
              We'll send a secure verification link to your inbox
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Welcome;