import { useState ,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './../authContext';

function Start() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user]);

  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      navigate(`/welcome?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="start-container">
      <style>{`
        :root {
          --navy:        #1A237E;
          --navy-dark:   #0D1257;
          --navy-light:  #283593;
          --gold:        #C5A021;
          --gold-light:  #E8BE3A;
          --gold-dark:   #9C7D12;
          --off-white:   #F8F7F2;
          --gray:        #6B7280;
          --border:      #E5E4EF;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        .start-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, var(--navy-dark) 0%, var(--navy) 40%, #1e2d8f 70%, #0a0e3d 100%);
          font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow: hidden;
          position: relative;
          gap: 2.5rem;
          padding: 2rem;
        }

        /* Background grid */
        .start-container::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(197,160,33,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(197,160,33,.04) 1px, transparent 1px);
          background-size: 56px 56px;
          z-index: 0;
        }

        /* Orbs */
        .bg-orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .bg-orb-1 {
          width: 700px; height: 700px;
          top: -200px; right: -200px;
          background: radial-gradient(circle, rgba(197,160,33,.07) 0%, transparent 70%);
        }
        .bg-orb-2 {
          width: 500px; height: 500px;
          bottom: -150px; left: -150px;
          background: radial-gradient(circle, rgba(197,160,33,.05) 0%, transparent 70%);
        }

        /* ── LEFT INFO PANEL ── */
        .info-panel {
          width: 340px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          z-index: 10;
        }

        .info-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          background: rgba(197,160,33,.12);
          border: 1px solid rgba(197,160,33,.3);
          color: var(--gold-light);
          padding: .35rem .9rem;
          border-radius: 50px;
          font-size: .68rem;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .pulse-dot {
          width: 6px; height: 6px;
          background: var(--gold-light);
          border-radius: 50%;
          animation: pulseDot 2s infinite;
          flex-shrink: 0;
        }

        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: .5; }
        }

        .info-headline {
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          font-weight: 900;
          color: white;
          line-height: 1.2;
          margin-top: 1.25rem;
        }

        .info-headline em {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          color: var(--gold-light);
        }

        .info-sub {
          color: rgba(255,255,255,.55);
          font-size: .875rem;
          line-height: 1.85;
        }

        .perks-list {
          display: flex;
          flex-direction: column;
          gap: .75rem;
        }

        .perk-item {
          display: flex;
          align-items: flex-start;
          gap: .875rem;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(197,160,33,.15);
          border-radius: 12px;
          padding: .875rem 1rem;
          transition: border-color .2s, background .2s;
        }

        .perk-item:hover {
          border-color: rgba(197,160,33,.35);
          background: rgba(197,160,33,.05);
        }

        .perk-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: .05rem; }

        .perk-text strong {
          display: block;
          font-size: .83rem;
          font-weight: 800;
          color: white;
          margin-bottom: .15rem;
        }

        .perk-text span {
          font-size: .76rem;
          color: rgba(255,255,255,.5);
          line-height: 1.55;
        }

        .social-proof {
          display: flex;
          align-items: center;
          gap: .875rem;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          padding: 1rem;
        }

        .avatars { display: flex; }

        .avatar-sm {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: .68rem;
          font-weight: 800;
          margin-left: -8px;
          flex-shrink: 0;
        }

        .avatar-sm:first-child { margin-left: 0; }

        .proof-text strong { display: block; font-size: .82rem; font-weight: 800; color: white; }
        .proof-text span   { font-size: .72rem; color: rgba(255,255,255,.5); }
        .stars-sm          { color: var(--gold-light); font-size: .7rem; letter-spacing: .1rem; }

        .trust-row { display: flex; align-items: center; gap: .625rem; flex-wrap: wrap; }
        .trust-item { display: flex; align-items: center; gap: .35rem; font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.5); }
        .trust-sep  { width: 4px; height: 4px; border-radius: 50%; background: rgba(197,160,33,.5); flex-shrink: 0; }

        /* ── CARD ── */
        .start-card {
          background: white;
          border-radius: 24px;
          padding: 60px 50px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(197, 160, 33, 0.12);
          position: relative;
          z-index: 10;
          animation: cardIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .card-accent {
          height: 4px;
          background: linear-gradient(90deg, var(--gold-dark), var(--gold-light), var(--gold-dark));
          margin: -60px -50px 40px -50px;
        }

        .start-header {
          margin-bottom: 48px;
          text-align: center;
        }

        .start-emoji {
          font-size: 56px;
          margin-bottom: 20px;
          display: block;
          animation: bounce 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-12px); }
        }

        .start-title {
          font-size: 32px;
          font-weight: 900;
          color: var(--navy-dark);
          margin-bottom: 12px;
          letter-spacing: -0.8px;
          line-height: 1.2;
        }

        .start-subtitle {
          font-size: 15px;
          color: var(--gray);
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .form-group {
          margin-bottom: 28px;
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 18px;
          font-size: 20px;
          color: var(--gray);
          transition: color 0.3s ease;
          pointer-events: none;
        }

        .start-input {
          width: 100%;
          padding: 14px 18px 14px 52px;
          border: 2px solid var(--border);
          border-radius: 12px;
          font-size: 16px;
          font-family: 'Montserrat', inherit;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          background: #FAFAF8;
          color: var(--navy-dark);
        }

        .start-input::placeholder { color: #9CA3AF; }

        .start-input:focus {
          outline: none;
          border-color: var(--navy);
          background: white;
          box-shadow: 0 0 0 4px rgba(26, 35, 126, 0.08);
        }

        .start-input:focus ~ .input-icon { color: var(--navy); }

        .start-button {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, var(--navy), var(--navy-light));
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.4px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s both;
          box-shadow: 0 8px 28px rgba(26, 35, 126, 0.3);
          font-family: 'Montserrat', inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 54px;
        }

        .start-button::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(135deg, var(--gold), var(--gold-dark));
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 0;
        }

        .start-button:hover:not(:disabled)::before { opacity: 1; }

        .start-button:hover:not(:disabled) {
          color: var(--navy-dark);
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(197, 160, 33, 0.4);
        }

        .start-button:active:not(:disabled) { transform: translateY(0); }

        .start-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none !important;
        }

        .button-text {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .button-loader {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          position: relative;
          z-index: 1;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 40px 0;
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s both;
        }

        .divider-line { flex: 1; height: 1px; background: var(--border); }

        .divider-text {
          font-size: 13px;
          color: var(--gray);
          font-weight: 600;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 900px) {
          .info-panel { display: none; }
          .start-container { justify-content: center; }
        }

        @media (max-width: 640px) {
          .start-card { padding: 40px 24px; }
          .card-accent { margin: -40px -24px 30px -24px; }
          .start-title { font-size: 24px; }
          .start-emoji { font-size: 48px; }
          .start-button { min-height: 48px; font-size: 15px; }
        }
      `}</style>

      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      {/* LEFT INFO PANEL */}
      <aside className="info-panel">
        <div>
          <div className="info-eyebrow">
            <span className="pulse-dot"></span>FREE TO START
          </div>
          <h2 className="info-headline">
            Begin Your<br /><em>Marketing</em><br />Mastery Journey
          </h2>
        </div>
        <p className="info-sub">
          Enter your email and we'll send you instant access. No credit card required to get started.
        </p>

        <div className="perks-list">
          <div className="perk-item">
            <span className="perk-icon">🎓</span>
            <div className="perk-text">
              <strong>13 Expert-Crafted Lessons</strong>
              <span>From fundamentals to full-stack strategy</span>
            </div>
          </div>
          <div className="perk-item">
            <span className="perk-icon">🔒</span>
            <div className="perk-text">
              <strong>Quiz-Gated Mastery System</strong>
              <span>Prove comprehension before advancing</span>
            </div>
          </div>
          <div className="perk-item">
            <span className="perk-icon">📜</span>
            <div className="perk-text">
              <strong>Verified Certificate</strong>
              <span>Shareable credential backed by real mastery</span>
            </div>
          </div>
          <div className="perk-item">
            <span className="perk-icon">♾️</span>
            <div className="perk-text">
              <strong>Lifetime Access + Updates</strong>
              <span>Learn at your pace — content never expires</span>
            </div>
          </div>
        </div>

        <div className="social-proof">
          <div className="avatars">
            <div className="avatar-sm" style={{background:'linear-gradient(135deg,#1A237E,#283593)',color:'#E8BE3A'}}>FA</div>
            <div className="avatar-sm" style={{background:'linear-gradient(135deg,#065F46,#047857)',color:'#34D399'}}>YM</div>
            <div className="avatar-sm" style={{background:'linear-gradient(135deg,#7C2D12,#9A3412)',color:'#FB923C'}}>NC</div>
            <div className="avatar-sm" style={{background:'linear-gradient(135deg,#312E81,#4338CA)',color:'#A78BFA'}}>KB</div>
            <div className="avatar-sm" style={{background:'rgba(255,255,255,.12)',color:'rgba(255,255,255,.6)',fontSize:'.6rem'}}>+12k</div>
          </div>
          <div className="proof-text">
            <div className="stars-sm">★★★★★</div>
            <strong>4.9 / 5 — 4,200+ Reviews</strong>
            <span>Marketers in 40+ countries</span>
          </div>
        </div>

        <div className="trust-row">
          <div className="trust-item">🔒 SSL Encrypted</div>
          <div className="trust-sep"></div>
          <div className="trust-item">✉️ No Spam Ever</div>
          <div className="trust-sep"></div>
          <div className="trust-item">↩️ Unsubscribe Anytime</div>
        </div>
      </aside>

      {/* RIGHT CARD — untouched logic */}
      <div className="start-card">
        <div className="card-accent"></div>

        <div className="start-header">
          <span className="start-emoji">🎓</span>
          <h1 className="start-title">Start Learning Today</h1>
          <p className="start-subtitle">
            Enter your email to begin your marketing mastery journey
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-wrapper">
              <input
                className="start-input"
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="yourname@email.com"
                required
              />
              <span className="input-icon">✉️</span>
            </div>
          </div>

          <button
            className="start-button"
            type="submit"
            disabled={!email.trim()}
          >
            <span className="button-text">
                  <span>Get Started</span>
                  <span>→</span>
            </span>
          </button>
        </form>

        <div className="divider">
          <div className="divider-line"></div>
          <span className="divider-text">secure & encrypted</span>
          <div className="divider-line"></div>
        </div>
      </div>
    </div>
  );
}

export default Start;