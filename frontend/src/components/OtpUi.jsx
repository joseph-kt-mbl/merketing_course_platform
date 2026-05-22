import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProfile } from '../store/AuthSlice';

function OtpUi() {
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('email');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // 'success', 'error', null
  const [timeLeft, setTimeLeft] = useState(60); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Focus on input change
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste functionality
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);

    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);

    if (digits.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setMessage("Please enter all 6 digits");
      setStatus("error");
      return;
    }

    if (!userEmail) {
      setMessage("Email not found. Please go back and try again.");
      setStatus("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setStatus(null);

    try {
      const res = await fetch(`/api/users/validate-otp?email=${encodeURIComponent(userEmail)}&otp=${otpString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage(data.message || "OTP verified successfully!");
      setStatus("success");

      // Store token if provided
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        const result = await dispatch(fetchProfile());

        if (fetchProfile.fulfilled.match(result)) {
          navigate('/dashboard');
        } else {
          setMessage("Session error. Please login.");
          setStatus("error");
        }
      }
      

    } catch (err) {
      setMessage(err.message || "Failed to verify OTP. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setMessage("");
    setStatus(null);

    try {
      const res = await fetch('/api/users/send-otp', {
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

      setMessage("New OTP sent to your email!");
      setStatus("success");
      setTimeLeft(300); // Reset timer
      setCanResend(false);
      setOtp(['', '', '', '', '', '']); // Clear inputs
      inputRefs.current[0]?.focus();
    } catch (err) {
      setMessage(err.message || "Failed to resend OTP. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="otp-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .otp-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1a1f36 50%, #0f172a 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .otp-container::before {
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

        .otp-container::after {
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

        .otp-card {
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

        .otp-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .otp-icon {
          width: 90px;
          height: 90px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          box-shadow: 0 20px 40px rgba(167, 139, 250, 0.2);
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }

        .otp-title {
          font-size: 32px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 12px;
          letter-spacing: -0.8px;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }

        .otp-subtitle {
          font-size: 15px;
          color: #cbd5e1;
          line-height: 1.7;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }

        .email-display {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(203, 213, 225, 0.15);
          border-radius: 12px;
          padding: 12px 16px;
          margin: 28px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }

        .email-icon {
          font-size: 18px;
          color: #a78bfa;
        }

        .email-value {
          font-size: 13px;
          color: #e2e8f0;
          word-break: break-all;
          font-weight: 500;
        }

        .otp-inputs-wrapper {
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
        }

        .otp-inputs-label {
          font-size: 12px;
          font-weight: 600;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 14px;
          display: block;
        }

        .otp-inputs {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }

        .otp-input {
          width: 100%;
          aspect-ratio: 1;
          padding: 0;
          border: 2px solid rgba(203, 213, 225, 0.15);
          border-radius: 12px;
          background: rgba(30, 41, 59, 0.6);
          color: #f1f5f9;
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          cursor: text;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
        }

        .otp-input:focus {
          outline: none;
          border-color: #a78bfa;
          background: rgba(30, 41, 59, 0.9);
          box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
        }

        .otp-input:hover:not(:focus) {
          border-color: rgba(203, 213, 225, 0.25);
        }

        .otp-input::placeholder {
          color: #64748b;
        }

        .timer-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both;
        }

        .timer-label {
          font-size: 13px;
          color: #cbd5e1;
          font-weight: 500;
        }

        .timer-value {
          font-size: 14px;
          font-weight: 700;
          color: #a78bfa;
          font-family: 'Monaco', 'Courier New', monospace;
          min-width: 40px;
          text-align: center;
        }

        .timer-value.warning {
          color: #fb923c;
        }

        .timer-value.danger {
          color: #ef4444;
        }

        .verify-button {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
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
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
        }

        .verify-button::before {
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

        .verify-button:hover:not(:disabled)::before {
          width: 300px;
          height: 300px;
        }

        .verify-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 16px 32px rgba(167, 139, 250, 0.4);
        }

        .verify-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .verify-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          margin-top: 20px;
          animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .message {
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
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

        .footer-actions {
          text-align: center;
          margin-top: 24px;
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both;
        }

        .footer-text {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 12px;
        }

        .resend-button {
          background: none;
          border: none;
          color: #a78bfa;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.3s ease;
          text-decoration: none;
        }

        .resend-button:hover:not(:disabled) {
          color: #f472b6;
          text-decoration: underline;
        }

        .resend-button:disabled {
          color: #64748b;
          cursor: not-allowed;
          opacity: 0.5;
        }

        @media (max-width: 640px) {
          .otp-card {
            padding: 40px 24px;
          }

          .otp-title {
            font-size: 24px;
          }

          .otp-icon {
            width: 80px;
            height: 80px;
            font-size: 40px;
          }

          .otp-inputs {
            gap: 8px;
          }

          .otp-input {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="otp-card">
        <div className="otp-header">
          <div className="otp-icon">📱</div>
          <h1 className="otp-title">Verify Your OTP</h1>
          <p className="otp-subtitle">
            Enter the 6-digit code sent to your email to verify your account
          </p>
        </div>

        {userEmail && (
          <div className="email-display">
            <span className="email-icon">📧</span>
            <div className="email-value">{userEmail}</div>
          </div>
        )}

        <div className="otp-inputs-wrapper">
          <label className="otp-inputs-label">One-Time Password</label>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                maxLength="1"
                placeholder="•"
              />
            ))}
          </div>
        </div>

        {!canResend && (
          <div className="timer-container">
            <span className="timer-label">Expires in:</span>
            <span className={`timer-value ${timeLeft <= 60 ? 'warning' : ''} ${timeLeft <= 30 ? 'danger' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}

        {message && (
          <div className="message-container">
            <div className={`message ${status}`}>
              {message}
            </div>
          </div>
        )}

        <button
          className="verify-button"
          onClick={verifyOtp}
          disabled={loading || otp.some(digit => !digit)}
        >
          <span>
            {loading && <div className="spinner"></div>}
            {loading ? 'Verifying...' : 'Verify OTP'}
          </span>
        </button>

        <div className="footer-actions">
          <p className="footer-text">Didn't receive the code?</p>
          <button
            className="resend-button"
            onClick={resendOtp}
            disabled={!canResend || loading}
          >
            {canResend ? "Resend OTP" : `Resend in ${formatTime(timeLeft)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OtpUi;