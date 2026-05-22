// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ text = "Loading..." }) {
  return (
    <div className="lms-spinner-wrap">
      <div className="lms-spinner" />
      <span style={{ fontSize: 13, color: "var(--lms-text-3)", fontFamily: "var(--lms-font-mono)" }}>
        {text}
      </span>
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────
export function ErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <div className="lms-error">
      <div style={{ fontSize: 40 }}>⚠️</div>
      <div style={{ fontSize: 15, fontWeight: 500 }}>{message}</div>
      {onRetry && (
        <button className="lms-btn lms-btn-ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value = 0, label }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div>
      {label !== undefined && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--lms-text-3)" }}>{label}</span>
          <span style={{ fontSize: 12, color: "var(--lms-amber)", fontWeight: 500 }}>{pct}%</span>
        </div>
      )}
      <div className="lms-progress-bar">
        <div className="lms-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = "amber" }) {
  return (
    <span className={`lms-badge lms-badge-${variant}`}>
      {children}
    </span>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({ overline, title, subtitle }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      {overline && <div className="lms-label" style={{ marginBottom: 8 }}>{overline}</div>}
      <h1 className="lms-display" style={{ fontSize: "clamp(28px, 4vw, 42px)", color: "var(--lms-text)", marginBottom: subtitle ? 10 : 0 }}>
        {title}
      </h1>
      {subtitle && <p style={{ color: "var(--lms-text-2)", fontSize: 15, maxWidth: 560 }}>{subtitle}</p>}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon = "📭", title, subtitle }) {
  return (
    <div className="lms-error">
      <div style={{ fontSize: 48 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: "var(--lms-text-2)" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: "var(--lms-text-3)" }}>{subtitle}</div>}
    </div>
  );
}
