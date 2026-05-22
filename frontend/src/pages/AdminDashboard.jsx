import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, clearUser } from '../store/AuthSlice';
import { fetchStudents , socket} from "../store/StudentsSlice";
import { fetchLogs } from '../store/ActivitySlice';
import { fetchLessonTitles } from "../store/LessonsSlice";
import { useEffect } from 'react';
import AdminLessonManager from '../components/AdminLessonManager';
// import useCompletedQuizEvent from '../store/events';

// ─── SELECTORS (fixed) ───────────────────────────────────────
// These inline selectors replace the broken ones from the slice files
const selectStudentsList   = (state) => state.students.students;  // was state.students
const selectStudentsLoading= (state) => state.students.loading;
const selectLogsList       = (state) => state.activity.logs;           // was state.logs / state.activity
const selectLessonTitles   = (state) => state.lessons.titles;
const selectTitlesLoading  = (state) => state.lessons.loading;
const needToRefetchLogs      = (state) => state.activity.needToRefetch;  // new selector for refetch flag

const AVATAR_COLORS = [
  ['#1A237E', '#E8BE3A'], ['#065F46', '#34D399'], ['#7C2D12', '#FB923C'],
  ['#312E81', '#A78BFA'], ['#1E3A5F', '#60A5FA'], ['#4C1D95', '#C084FC'],
  ['#713F12', '#FDE68A'], ['#1F2937', '#9CA3AF'],
];
const FUNNEL_COLORS = ['#E8BE3A','#C5A021','#A08018','#7A6010','#34D399','#10B981','#059669','#047857','#3B82F6','#2563EB','#1D4ED8','#1E40AF','#7C3AED'];
const QUIZ_COLORS   = ['#10B981','#34D399','#6EE7B7','#A7F3D0','#FDE68A','#FCD34D','#FBBF24','#F59E0B','#F97316','#EF4444','#EC4899','#8B5CF6','#3B82F6'];

// ─── HELPERS ─────────────────────────────────────────────────
function getInitials(name) {
  return (name || '').split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
}
function getAvatarColors(idx) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}
function getProgress(s) {
  return s.completedLessons.length;
}
function getProgressPct(s) {
  return Math.round((s.completedLessons.length / 13) * 100);
}
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}
function escHtml(str) {
  return String(str || '');
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────

function FunnelChart({ students, lessonTitles }) {
  const paid = students.filter(s => s.paid);
  if (!paid.length) return (
    <div className="empty-state" style={{ padding: '2rem' }}>
      <div className="empty-icon">📊</div><p>No paid students yet</p>
    </div>
  );
  return (
    <div>
      {lessonTitles.map((title, i) => {
        const count = paid.filter(s => s.completedLessons.includes(i)).length;
        const pct = paid.length ? Math.round((count / paid.length) * 100) : 0;
        const short = title.split(' ').slice(0, 2).join(' ');
        return (
          <div className="funnel-bar" key={i}>
            <div className="funnel-label" title={title}>L{i + 1} · {short}</div>
            <div className="funnel-track">
              <div className="funnel-fill" style={{ width: `${pct}%`, background: FUNNEL_COLORS[i] }} />
            </div>
            <div className="funnel-count">{count}</div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ students }) {
  const total = students.length;
  const paid = students.filter(s => s.paid).length;
  const pending = total - paid;
  const premium = students.filter(s => s.plan === 'premium' && s.paid).length;
  const standard = students.filter(s => s.plan === 'standard' && s.paid).length;
  const circ = 326.7;
  const paidArc = total ? (paid / total) * circ : 0;
  const pendingArc = circ - paidArc;
  const pendingRot = -90 + (total ? (paid / total) : 0) * 360;
  return (
    <div className="donut-wrap">
      <svg className="donut-svg" width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="18" />
        <circle cx="65" cy="65" r="52" fill="none" stroke="var(--green)" strokeWidth="18"
          strokeDasharray={`${paidArc} ${pendingArc}`} strokeLinecap="round"
          transform="rotate(-90 65 65)" />
        <circle cx="65" cy="65" r="52" fill="none" stroke="var(--amber)" strokeWidth="18"
          strokeDasharray={`0 ${paidArc} ${pendingArc} 0`} strokeLinecap="round"
          transform={`rotate(${pendingRot} 65 65)`} />
        <text x="65" y="60" textAnchor="middle" fontSize="18" fontWeight="900" fill="white" fontFamily="Montserrat,sans-serif">{total}</text>
        <text x="65" y="76" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,.45)" fontFamily="Montserrat,sans-serif">students</text>
      </svg>
      <div className="donut-legend">
        {[
          { color: 'var(--green)',    label: 'Paid',          val: paid },
          { color: 'var(--amber)',    label: 'Pending',        val: pending },
          { color: 'var(--blue-acc)', label: 'Premium Plan',  val: premium },
          { color: 'var(--gold)',     label: 'Standard Plan', val: standard },
        ].map(({ color, label, val }) => (
          <div className="legend-item" key={label}>
            <div className="legend-dot" style={{ background: color }} />
            <span className="legend-text">{label}</span>
            <span className="legend-val">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizDots({ s }) {
  const progress = getProgress(s);
  return (
    <div className="quiz-dots">
      {Array.from({ length: 13 }, (_, i) => {
        let cls = '';
        if (s.completedLessons.includes(i)) cls = 'passed';
        else if (i === progress && s.paid) cls = 'current';
        return <div key={i} className={`quiz-dot ${cls}`} title={`L${i + 1}: ${cls || 'locked'}`} />;
      })}
    </div>
  );
}

function StudentRow({ s, idx, onUnlock, onReset }) {
  const [bgC, textC] = getAvatarColors(idx);
  const progress = getProgress(s);
  const pct = getProgressPct(s);
  const isComplete = progress === 13;
  const isStuck = s.paid && progress === 0;
  return (
    <tr>
      <td>
        <div className="cell-name">
          <div className="user-avatar" style={{ background: bgC, color: textC }}>{getInitials(s.name)}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{s.name}</div>
            {s.isMainUser && <div style={{ fontSize: '.7rem', color: 'var(--gold-light)' }}>◆ Main User</div>}
          </div>
        </div>
      </td>
      <td>
        <div className="cell-mono">{s.email}</div>
        <div style={{ fontSize: '.72rem', color: 'var(--text-dim)', marginTop: '.2rem' }}>{s.phone}</div>
      </td>
      <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.85rem' }}>{s.age}</span></td>
      <td>
        {s.paid
          ? <span className="badge badge-paid"><span className="status-ring ring-green" />Paid · {s.plan || 'standard'}</span>
          : <span className="badge badge-pending"><span className="status-ring ring-amber" />Pending</span>}
      </td>
      <td>
        <div className="lesson-progress">
          <div className="lesson-bar-bg">
            <div className={`lesson-bar-fill${isComplete ? ' complete' : ''}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="lesson-label">{progress}/13</div>
        </div>
        {isComplete && <div style={{ fontSize: '.68rem', color: 'var(--green)', fontWeight: 700, marginTop: '.25rem' }}>● Complete</div>}
        {isStuck && !isComplete && <div style={{ fontSize: '.68rem', color: 'var(--amber)', fontWeight: 700, marginTop: '.25rem' }}>● Not started</div>}
      </td>
      <td><QuizDots s={s} /></td>
      <td>
        <div className="action-btns">
          <button className="act-btn unlock" onClick={() => onUnlock(s._id || s.id)}>🔓 Unlock</button>
          <button className="act-btn reset" onClick={() => onReset(s._id || s.id)}>↺ Reset</button>
        </div>
      </td>
    </tr>
  );
}

function PaymentRow({ s, idx, onToggle }) {
  const [bgC, textC] = getAvatarColors(idx);
  const amount = 49.99;
  return (
    <tr>
      <td>
        <div className="cell-name">
          <div className="user-avatar" style={{ background: bgC, color: textC }}>{getInitials(s.name)}</div>
          <span>{s.name}</span>
        </div>
      </td>
      <td><div className="cell-mono">{s.email}</div></td>
      <td><span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{s.plan || '—'}</span></td>
      <td><span style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--gold-light)', fontWeight: 700 }}>${amount}</span></td>
      <td>{s.paid ? <span className="badge badge-paid">● Paid</span> : <span className="badge badge-pending">● Pending</span>}</td>
      <td><span style={{ fontSize: '.75rem', color: 'var(--text-dim)' }}>{timeAgo(s.enrolledAt || new Date().toISOString())}</span></td>
      <td>
        <button className={`act-btn ${s.paid ? 'reset' : 'unlock'}`} onClick={() => onToggle(s._id || s.id)}>
          {s.paid ? '↺ Mark Pending' : '✓ Mark Paid'}
        </button>
      </td>
    </tr>
  );
}

function QuizRow({ s, globalIdx, onUnlock, onReset, lessonTitles }) {
  const [bgC, textC] = getAvatarColors(globalIdx);
  const progress = getProgress(s);
  const isComplete = progress === 13;
  const lastLesson = progress > 0 ? `L${progress}: ${lessonTitles[progress - 1] || ''}` : '—';
  let statusBadge;
  if (isComplete) statusBadge = <span className="badge badge-complete">● Completed</span>;
  else if (progress === 0) statusBadge = <span className="badge badge-pending">● Not Started</span>;
  else statusBadge = <span className="badge badge-stuck">● In Progress</span>;
  return (
    <tr>
      <td>
        <div className="cell-name">
          <div className="user-avatar" style={{ background: bgC, color: textC }}>{getInitials(s.name)}</div>
          <span>{s.name}</span>
        </div>
      </td>
      <td>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.9rem', fontWeight: 700, color: 'var(--gold-light)' }}>
          {progress}<span style={{ color: 'var(--text-dim)' }}>/13</span>
        </span>
      </td>
      <td><QuizDots s={s} /></td>
      <td>{statusBadge}</td>
      <td><div style={{ fontSize: '.78rem', color: 'var(--text-mid)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastLesson}</div></td>
      <td>
        <div className="action-btns">
          <button className="act-btn unlock" onClick={() => onUnlock(s._id || s.id)}>🔓 Unlock</button>
          <button className="act-btn reset"  onClick={() => onReset(s._id || s.id)}>↺ Reset</button>
        </div>
      </td>
    </tr>
  );
}

function QuizBreakdown({ students, lessonTitles }) {
  const paid = students.filter(s => s.paid);
  if (!paid.length) return <div className="empty-state" style={{ padding: '1.5rem' }}><p>No data</p></div>;
  return (
    <div>
      {lessonTitles.map((title, i) => {
        const passed = paid.filter(s => s.completedLessons.includes(i)).length;
        const pct = paid.length ? Math.round((passed / paid.length) * 100) : 0;
        return (
          <div className="funnel-bar" key={i}>
            <div className="funnel-label" title={title}>L{i + 1} · {title.split(' ').slice(0, 3).join(' ')}</div>
            <div className="funnel-track">
              <div className="funnel-fill" style={{ width: `${pct}%`, background: QUIZ_COLORS[i] }} />
            </div>
            <div className="funnel-count" style={{ color: QUIZ_COLORS[i] }}>{pct}%</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MODALS ──────────────────────────────────────────────────

function UnlockModal({ student, onConfirm, onClose, lessonTitles }) {
  const [target, setTarget] = useState(student ? student.completedLessons.length + 1 : 1);
  useEffect(() => {
    if (student) setTarget(Math.min(student.completedLessons.length + 1, 13));
  }, [student]);
  if (!student) return null;
  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">🔓 Unlock Lessons</div>
        <div className="modal-sub">Student: {student.name} · Currently at Lesson {student.completedLessons.length}/13</div>
        <div className="modal-field">
          <label>Unlock Up To Lesson</label>
          <select value={target} onChange={e => setTarget(parseInt(e.target.value))}>
            {lessonTitles.map((t, i) => (
              <option key={i} value={i + 1}>Lesson {i + 1}: {t}</option>
            ))}
          </select>
        </div>
        <div className="modal-btns">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-confirm" onClick={() => onConfirm(target)}>🔓 Unlock</button>
        </div>
      </div>
    </div>
  );
}

function ResetModal({ student, onConfirm, onClose }) {
  if (!student) return null;
  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title" style={{ color: 'var(--red)' }}>⚠️ Reset Progress</div>
        <div className="modal-sub">
          This will reset <strong>{student.name}</strong>'s progress ({student.completedLessons.length} lessons completed). This cannot be undone.
        </div>
        <div className="modal-btns">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-confirm danger" onClick={onConfirm}>🗑️ Reset Progress</button>
        </div>
      </div>
    </div>
  );
}

function AddStudentModal({ onConfirm, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', age: '', plan: 'premium', lessons: 5 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleConfirm = () => {
    if (!form.name || !form.email) return;
    onConfirm(form);
  };
  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">＋ Add Test Student</div>
        <div className="modal-sub">Inject a simulated student into LocalStorage to preview dashboard behaviour.</div>
        <div className="modal-field">
          <label>Full Name</label>
          <input type="text" placeholder="e.g. Sara Al-Mansoori" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="modal-field">
          <label>Email</label>
          <input type="email" placeholder="sara@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="modal-field">
          <label>Phone</label>
          <input type="text" placeholder="+213 5XX XXX XXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="modal-field">
            <label>Age</label>
            <input type="number" placeholder="28" min="16" max="80" value={form.age} onChange={e => set('age', e.target.value)} />
          </div>
          <div className="modal-field">
            <label>Plan</label>
            <select value={form.plan} onChange={e => set('plan', e.target.value)}>
              <option value="premium">Premium ($147)</option>
              <option value="standard">Standard ($97)</option>
              <option value="pending">Pending (unpaid)</option>
            </select>
          </div>
        </div>
        <div className="modal-field">
          <label>Lessons Completed (0–13)</label>
          <input type="range" min="0" max="13" value={form.lessons} onChange={e => set('lessons', parseInt(e.target.value))} style={{ width: '100%', marginBottom: '.4rem' }} />
          <div style={{ fontSize: '.8rem', color: 'var(--gold-light)', fontWeight: 700 }}>{form.lessons} / 13 lessons</div>
        </div>
        <div className="modal-btns">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-confirm" onClick={handleConfirm}>Add Student</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, icon, visible }) {
  return (
    <div className={`toast${visible ? ' show' : ''}`}>
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const user      = useSelector(selectUser);
  // ── Fixed selectors ───────────────────────────────────────
  const students     = useSelector(selectStudentsList);   // state.students.students
  const logs         = useSelector(selectLogsList);       // state.logs.logs  ← was "activityLog" / state.activity
  const lessonTitles = useSelector(selectLessonTitles);   // state.lessons.titles

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchLessonTitles());
    dispatch(fetchLogs());
    socket.on("activity_updated", () => {
      dispatch(fetchLogs());
    });

    return () => {
      socket.off("activity_updated");
    };
  }, [dispatch]);

  // ── Local state for optimistic UI mutations ───────────────
  // Because unlock/reset/toggle need instant feedback without a full API round-trip,
  // we keep a local overlay on top of the Redux-sourced list.
  const [localOverrides, setLocalOverrides] = useState({}); // { [id]: partialStudent }

  // Merge Redux students with any local overrides
  const mergedStudents = students.map(s => {
    const id = s._id || s.id;
    return localOverrides[id] ? { ...s, ...localOverrides[id] } : s;
  });

  const [currentView,  setCurrentView]  = useState('overview');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [lastSync,     setLastSync]     = useState('Synced just now');

  // filters
  const [searchStudents, setSearchStudents] = useState('');
  const [filterPayment,  setFilterPayment]  = useState('');
  const [filterProgress, setFilterProgress] = useState('');
  const [searchPayment,  setSearchPayment]  = useState('');

  // modals
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [resetTarget,  setResetTarget]  = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // toast
  const [toast, setToast] = useState({ visible: false, message: '', icon: 'ℹ️' });
  const toastTimer = { current: null };

  const showToast = useCallback((message, icon = 'ℹ️') => {
    setToast({ visible: true, message, icon });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    dispatch(clearUser());
    navigate('/');
  };

  // ── Computed stats ────────────────────────────────────────
  const paidStudents  = mergedStudents.filter(s => s.paid);
  const revenue       = 49.99 * paidStudents.length;
  const completeCount = mergedStudents.filter(s => s.completedLessons.length === 13).length;
  const stuckCount    = mergedStudents.filter(s => s.paid && s.completedLessons.length === 0).length;
  const navStuck      = stuckCount;

  // ── Filtered views ────────────────────────────────────────
  const filteredStudents = mergedStudents.filter(s => {
    const q = searchStudents.toLowerCase();
    const matchQ   = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchPay = !filterPayment || (filterPayment === 'paid' ? s.paid : !s.paid);
    let matchProg  = true;
    if      (filterProgress === 'complete') matchProg = s.completedLessons.length === 13;
    else if (filterProgress === 'active')   matchProg = s.completedLessons.length > 0 && s.completedLessons.length < 13 && s.paid;
    else if (filterProgress === 'stuck')    matchProg = s.paid && s.completedLessons.length === 0;
    else if (filterProgress === 'new')      matchProg = !s.paid;
    return matchQ && matchPay && matchProg;
  });

  const filteredPayments = mergedStudents.filter(s => {
    const q = searchPayment.toLowerCase();
    return !q || s.name.toLowerCase().includes(q);
  });

  // ── Helpers ───────────────────────────────────────────────
  const applyOverride = (id, patch) =>
    setLocalOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));

  // ── Actions ───────────────────────────────────────────────
  const openUnlock = (id) => {
    const s = mergedStudents.find(s => (s._id || s.id) === id);
    if (s) setUnlockTarget(s);
  };

  const confirmUnlock = async (target) => {
    const id = unlockTarget._id || unlockTarget.id;
    const completed = Array.from({ length: target }, (_, i) => i);

    // 1. Optimistic local update so UI reflects change immediately
    applyOverride(id, { paid: true, completedLessons: completed });
    showToast(`🔓 Unlocked up to Lesson ${target} for ${unlockTarget.name}`, '🔓');
    setUnlockTarget(null);

    // 2. Persist to API
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/users/${id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ completedLessons: completed, paid: true }),
      });
      // Re-sync Redux after API confirms
      dispatch(fetchStudents());
    } catch (err) {
      console.error('Unlock failed:', err);
      showToast('⚠️ Failed to save unlock to server', '⚠️');
    }
  };

  const openReset = (id) => {
    const s = mergedStudents.find(s => (s._id || s.id) === id);
    if (s) setResetTarget(s);
  };

  const confirmReset = async () => {
    const id = resetTarget._id || resetTarget.id;

    // 1. Optimistic update
    applyOverride(id, { completedLessons: [] });
    showToast(`↺ Progress reset for ${resetTarget.name}`, '↺');
    setResetTarget(null);

    // 2. Persist to API
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/users/${id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ completedLessons: [] }),
      });
      dispatch(fetchStudents());
    } catch (err) {
      console.error('Reset failed:', err);
      showToast('⚠️ Failed to save reset to server', '⚠️');
    }
  };

  const togglePayment = async (id) => {
    const s = mergedStudents.find(s => (s._id || s.id) === id);
    if (!s) return;
    const newPaid = !s.paid;

    // 1. Optimistic update
    applyOverride(id, { paid: newPaid, completedLessons: newPaid ? s.completedLessons : [] });
    showToast(`${newPaid ? '✅ Marked Paid' : '⏳ Marked Pending'}: ${s.name}`, newPaid ? '✅' : '⏳');

    // 2. Persist to API
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/users/${id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paid: newPaid }),
      });
      dispatch(fetchStudents());
    } catch (err) {
      console.error('Toggle payment failed:', err);
      showToast('⚠️ Failed to update payment on server', '⚠️');
    }
  };

  const confirmAddStudent = async (form) => {
    const completed = Array.from({ length: form.lessons }, (_, i) => i);
    const newStudent = {
      name: form.name, email: form.email,
      phone: form.phone || '—', age: form.age || '—',
      plan: form.plan, paid: form.plan !== 'pending',
      completedLessons: completed,
      enrolledAt: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newStudent),
      });
      dispatch(fetchStudents()); // Re-fetch to get the real _id from server
      showToast(`✅ Student "${form.name}" added!`, '✅');
    } catch (err) {
      console.error('Add student failed:', err);
      showToast('⚠️ Failed to add student on server', '⚠️');
    }
    setShowAddModal(false);
  };

  const exportCSV = () => {
    if (!mergedStudents.length) { showToast('⚠️ No students to export', '⚠️'); return; }
    const headers = ['Name','Email','Phone','Age','Plan','Paid','Lessons Completed','Progress %','Enrolled'];
    const rows = mergedStudents.map(s => [
      s.name, s.email, s.phone, s.age, s.plan,
      s.paid ? 'Yes' : 'No', s.completedLessons.length,
      getProgressPct(s) + '%', s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : '—',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'mastermind_students.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('📥 CSV exported successfully!', '📥');
  };

  // ── Nav helper ────────────────────────────────────────────
  const VIEW_LABELS = { overview: 'Overview', students: 'Students', payments: 'Payments', quizzes: 'Quiz Logs' };
  const switchView = (name) => { setCurrentView(name); setSidebarOpen(false); };

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <>
      {/* ════ STYLES ════ */}
      <style>{`
        :root {
          --navy: #1A237E; --navy-dark: #0D1257; --navy-mid: #1e2a8a; --navy-light: #283593;
          --gold: #C5A021; --gold-light: #E8BE3A; --gold-dark: #9C7D12;
          --slate: #1E2433; --slate-mid: #252D3D; --slate-light: #2E3850;
          --border: rgba(255,255,255,0.07);
          --text-dim: rgba(255,255,255,0.45); --text-mid: rgba(255,255,255,0.7); --text-full: rgba(255,255,255,0.95);
          --green: #10B981; --red: #EF4444; --amber: #F59E0B; --blue-acc: #3B82F6;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Montserrat', sans-serif; background: var(--slate); color: var(--text-full); min-height: 100vh; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: var(--slate); }
        ::-webkit-scrollbar-thumb { background: var(--slate-light); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--gold-dark); }
        #sidebar {
          width: 260px; min-height: 100vh; flex-shrink: 0; background: var(--slate-mid);
          border-right: 1px solid var(--border); display: flex; flex-direction: column;
          position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; transition: transform .3s ease;
          overflow-y: auto;
          }
        #sidebar.open { transform: translateX(0) !important; }
        .sidebar-logo { padding: 1.75rem 1.5rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: .875rem; }
        .sidebar-logo img { background: white; width: 100px; border-radius: 6px; }
        .sidebar-section { padding: 1.25rem 1rem .5rem; }
        .sidebar-section-label { font-size: .65rem; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--text-dim); padding: 0 .5rem; margin-bottom: .5rem; }
        .nav-item { display: flex; align-items: center; gap: .875rem; padding: .7rem .875rem; border-radius: 10px; cursor: pointer; font-size: .85rem; font-weight: 600; color: var(--text-mid); transition: all .2s; margin-bottom: 2px; user-select: none; border: 1px solid transparent; }
        .nav-item:hover { background: var(--slate-light); color: var(--text-full); }
        .nav-item.active { background: rgba(197,160,33,.12); color: var(--gold-light); border-color: rgba(197,160,33,.25); }
        .nav-icon { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }
        .nav-badge { margin-left: auto; background: var(--gold); color: var(--navy-dark); font-size: .65rem; font-weight: 800; padding: .15rem .5rem; border-radius: 50px; min-width: 22px; text-align: center; }
        .nav-badge.green { background: var(--green); color: white; }
        .nav-badge.red { background: var(--red); color: white; }
        .sidebar-footer { margin-top: auto; padding: 1.25rem 1rem; border-top: 1px solid var(--border); }
        .admin-chip { display: flex; align-items: center; gap: .75rem; padding: .75rem; border-radius: 10px; background: var(--slate-light); }
        .admin-avatar { width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0; background: linear-gradient(135deg, var(--navy), var(--navy-mid)); display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 800; border: 1px solid rgba(197,160,33,.3); }
        .admin-name { font-size: .8rem; font-weight: 700; }
        .admin-role { font-size: .68rem; color: var(--gold); font-weight: 600; letter-spacing: .5px; }
        #main { margin-left: 260px; flex: 1; min-height: 100vh; display: flex; flex-direction: column; }
        #topbar { height: 64px; background: var(--slate-mid); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; position: sticky; top: 0; z-index: 90; backdrop-filter: blur(10px); }
        .topbar-title { font-size: 1.1rem; font-weight: 800; }
        .topbar-title span { color: var(--gold-light); }
        .topbar-actions { display: flex; align-items: center; gap: 1rem; }
        .topbar-btn { display: flex; align-items: center; gap: .5rem; padding: .5rem 1rem; border-radius: 8px; font-size: .8rem; font-weight: 700; cursor: pointer; font-family: 'Montserrat', sans-serif; transition: all .2s; border: none; letter-spacing: .3px; }
        .topbar-btn.primary { background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: var(--navy-dark); }
        .topbar-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(197,160,33,.35); }
        .topbar-btn.outline { background: transparent; color: var(--text-mid); border: 1px solid var(--border); }
        .topbar-btn.outline:hover { border-color: rgba(197,160,33,.4); color: var(--gold-light); }
        .logout { border: 1px solid var(--red); color: var(--red); background: transparent; }
        .logout:hover { background: rgba(239,68,68,.1); }
        .hamburger-btn { display: none; background: none; border: none; cursor: pointer; color: var(--text-mid); font-size: 1.2rem; padding: .25rem; }
        #page-body { padding: 2rem; flex: 1; }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.25rem; margin-bottom: 2rem; }
        .stat-card { background: var(--slate-mid); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem; position: relative; overflow: hidden; transition: transform .2s, border-color .2s; }
        .stat-card:hover { transform: translateY(-3px); border-color: rgba(197,160,33,.3); }
        .stat-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--gold-dark), var(--gold-light)); }
        .stat-card.green-accent::after { background: linear-gradient(90deg, #059669, var(--green)); }
        .stat-card.blue-accent::after  { background: linear-gradient(90deg, #1d4ed8, var(--blue-acc)); }
        .stat-card.red-accent::after   { background: linear-gradient(90deg, #b91c1c, var(--red)); }
        .stat-label { font-size: .72rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-dim); margin-bottom: .75rem; display: flex; align-items: center; gap: .5rem; }
        .stat-label .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .stat-value { font-size: 2.2rem; font-weight: 900; line-height: 1; margin-bottom: .4rem; }
        .stat-sub { font-size: .75rem; color: var(--text-dim); font-weight: 500; }
        .stat-icon { position: absolute; right: 1.25rem; top: 50%; transform: translateY(-50%); font-size: 2.5rem; opacity: .08; }
        .section-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
        .section-hdr-left { display: flex; align-items: center; gap: .75rem; }
        .section-hdr-title { font-size: 1rem; font-weight: 800; }
        .section-hdr-count { background: var(--slate-light); border: 1px solid var(--border); font-size: .7rem; font-weight: 700; color: var(--text-dim); padding: .2rem .6rem; border-radius: 50px; }
        .controls-bar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .search-wrap { position: relative; flex: 1; min-width: 220px; }
        .search-icon { position: absolute; left: .875rem; top: 50%; transform: translateY(-50%); color: var(--text-dim); font-size: .9rem; pointer-events: none; }
        .search-input { width: 100%; background: var(--slate-mid); border: 1px solid var(--border); border-radius: 9px; padding: .65rem .875rem .65rem 2.4rem; font-size: .85rem; font-family: 'Montserrat', sans-serif; color: var(--text-full); outline: none; transition: border-color .2s, box-shadow .2s; }
        .search-input::placeholder { color: var(--text-dim); }
        .search-input:focus { border-color: rgba(197,160,33,.5); box-shadow: 0 0 0 3px rgba(197,160,33,.08); }
        .filter-select { background: var(--slate-mid); border: 1px solid var(--border); border-radius: 9px; padding: .65rem .875rem; font-size: .82rem; font-family: 'Montserrat', sans-serif; color: var(--text-mid); outline: none; cursor: pointer; min-width: 130px; transition: border-color .2s; }
        .filter-select:focus { border-color: rgba(197,160,33,.5); }
        .filter-select option { background: var(--slate-mid); }
        .table-card { background: var(--slate-mid); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-bottom: 2rem; }
        .table-scroll { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 900px; }
        thead tr { background: var(--slate-light); border-bottom: 1px solid var(--border); }
        thead th { padding: .875rem 1.25rem; font-size: .7rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-dim); text-align: left; white-space: nowrap; }
        tbody tr { border-bottom: 1px solid var(--border); transition: background .15s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: rgba(255,255,255,0.025); }
        tbody td { padding: 1rem 1.25rem; font-size: .83rem; vertical-align: middle; }
        .cell-name { font-weight: 700; display: flex; align-items: center; gap: .75rem; }
        .user-avatar { width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 800; border: 1px solid rgba(255,255,255,.1); }
        .cell-mono { font-family: 'JetBrains Mono', monospace; font-size: .78rem; color: var(--text-mid); }
        .badge { display: inline-flex; align-items: center; gap: .35rem; padding: .25rem .7rem; border-radius: 50px; font-size: .7rem; font-weight: 700; letter-spacing: .5px; white-space: nowrap; }
        .badge-paid    { background: rgba(16,185,129,.15); color: var(--green);    border: 1px solid rgba(16,185,129,.3); }
        .badge-pending { background: rgba(245,158,11,.12); color: var(--amber);    border: 1px solid rgba(245,158,11,.3); }
        .badge-stuck   { background: rgba(239,68,68,.12);  color: var(--red);      border: 1px solid rgba(239,68,68,.3); }
        .badge-complete{ background: rgba(59,130,246,.12); color: var(--blue-acc); border: 1px solid rgba(59,130,246,.3); }
        .lesson-progress { display: flex; align-items: center; gap: .75rem; }
        .lesson-bar-bg { flex: 1; height: 5px; background: rgba(255,255,255,.08); border-radius: 50px; overflow: hidden; min-width: 80px; }
        .lesson-bar-fill { height: 100%; border-radius: 50px; background: linear-gradient(90deg, var(--gold-dark), var(--gold-light)); transition: width .5s ease; }
        .lesson-bar-fill.complete { background: linear-gradient(90deg, #059669, var(--green)); }
        .lesson-label { font-size: .75rem; font-weight: 700; color: var(--text-mid); white-space: nowrap; font-family: 'JetBrains Mono', monospace; }
        .quiz-dots { display: flex; gap: 3px; flex-wrap: wrap; max-width: 160px; }
        .quiz-dot { width: 10px; height: 10px; border-radius: 2px; background: rgba(255,255,255,.07); flex-shrink: 0; }
        .quiz-dot.passed  { background: var(--green); }
        .quiz-dot.current { background: var(--amber); }
        .quiz-dot.stuck   { background: var(--red); animation: blinkDot 1.5s infinite; }
        @keyframes blinkDot { 0%,100%{opacity:1} 50%{opacity:.3} }
        .action-btns { display: flex; gap: .5rem; }
        .act-btn { padding: .35rem .7rem; border-radius: 6px; font-size: .7rem; font-weight: 700; cursor: pointer; font-family: 'Montserrat', sans-serif; border: 1px solid transparent; transition: all .2s; display: flex; align-items: center; gap: .3rem; white-space: nowrap; }
        .act-btn.unlock { background: rgba(197,160,33,.1); color: var(--gold-light); border-color: rgba(197,160,33,.25); }
        .act-btn.unlock:hover { background: rgba(197,160,33,.2); border-color: rgba(197,160,33,.5); }
        .act-btn.reset { background: rgba(239,68,68,.08); color: var(--red); border-color: rgba(239,68,68,.2); }
        .act-btn.reset:hover { background: rgba(239,68,68,.18); border-color: rgba(239,68,68,.45); }
        .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 2rem; }
        .chart-card { background: var(--slate-mid); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; }
        .chart-title { font-size: .85rem; font-weight: 800; margin-bottom: 1.25rem; display: flex; align-items: center; gap: .5rem; }
        .chart-title span { color: var(--text-dim); font-weight: 500; font-size: .75rem; }
        .funnel-bar { display: flex; align-items: center; gap: .875rem; margin-bottom: .875rem; }
        .funnel-label { font-size: .78rem; font-weight: 600; color: var(--text-mid); width: 110px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .funnel-track { flex: 1; height: 10px; background: rgba(255,255,255,.06); border-radius: 50px; overflow: hidden; }
        .funnel-fill  { height: 100%; border-radius: 50px; transition: width .6s ease; }
        .funnel-count { font-size: .75rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text-mid); width: 30px; text-align: right; flex-shrink: 0; }
        .donut-wrap { display: flex; align-items: center; gap: 2rem; }
        .donut-svg { flex-shrink: 0; }
        .donut-legend { flex: 1; }
        .legend-item { display: flex; align-items: center; gap: .625rem; margin-bottom: .625rem; }
        .legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
        .legend-text { font-size: .8rem; font-weight: 600; color: var(--text-mid); }
        .legend-val  { margin-left: auto; font-size: .8rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
        .log-list { display: flex; flex-direction: column; gap: .625rem; }
        .log-item { display: flex; align-items: flex-start; gap: .875rem; padding: .875rem 1rem; background: var(--slate-light); border-radius: 10px; border: 1px solid var(--border); transition: border-color .2s; }
        .log-item:hover { border-color: rgba(197,160,33,.2); }
        .log-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; margin-top: .35rem; }
        .log-content { flex: 1; }
        .log-text { font-size: .82rem; font-weight: 500; color: var(--text-mid); line-height: 1.5; }
        .log-text strong { color: var(--text-full); font-weight: 700; }
        .log-time { font-size: .7rem; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; margin-top: .2rem; }
        .modal-overlay { display: none; position: fixed; inset: 0; z-index: 1000; background: rgba(8,10,30,.85); backdrop-filter: blur(8px); align-items: center; justify-content: center; padding: 1.5rem; }
        .modal-overlay.open { display: flex; }
        .modal-box { background: var(--slate-mid); border: 1px solid rgba(197,160,33,.3); border-radius: 20px; padding: 2rem; width: 100%; max-width: 480px; box-shadow: 0 30px 80px rgba(0,0,0,.6); animation: modalIn .3s cubic-bezier(.34,1.56,.64,1); }
        @keyframes modalIn { from{transform:scale(.9);opacity:0} to{transform:scale(1);opacity:1} }
        .modal-title { font-size: 1.1rem; font-weight: 800; margin-bottom: .5rem; }
        .modal-sub { font-size: .82rem; color: var(--text-dim); margin-bottom: 1.5rem; line-height: 1.6; }
        .modal-field { margin-bottom: 1rem; }
        .modal-field label { display: block; font-size: .72rem; font-weight: 700; color: var(--text-dim); letter-spacing: 1px; text-transform: uppercase; margin-bottom: .4rem; }
        .modal-field select, .modal-field input { width: 100%; background: var(--slate-light); border: 1px solid var(--border); border-radius: 8px; padding: .65rem .875rem; font-size: .85rem; font-family: 'Montserrat', sans-serif; color: var(--text-full); outline: none; transition: border-color .2s; }
        .modal-field select:focus, .modal-field input:focus { border-color: rgba(197,160,33,.5); }
        .modal-field option { background: var(--slate-mid); }
        .modal-btns { display: flex; gap: .75rem; margin-top: 1.5rem; justify-content: flex-end; }
        .modal-cancel { padding: .65rem 1.25rem; border-radius: 8px; font-size: .82rem; font-weight: 700; background: var(--slate-light); border: 1px solid var(--border); color: var(--text-mid); cursor: pointer; font-family: 'Montserrat', sans-serif; transition: all .2s; }
        .modal-cancel:hover { border-color: rgba(255,255,255,.2); color: var(--text-full); }
        .modal-confirm { padding: .65rem 1.5rem; border-radius: 8px; font-size: .82rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: var(--navy-dark); border: none; cursor: pointer; font-family: 'Montserrat', sans-serif; transition: all .2s; }
        .modal-confirm:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(197,160,33,.35); }
        .modal-confirm.danger { background: linear-gradient(135deg, var(--red), #b91c1c); color: white; }
        .toast { position: fixed; bottom: 2rem; right: 2rem; z-index: 9999; background: var(--slate-light); border: 1px solid rgba(197,160,33,.35); color: var(--text-full); padding: .875rem 1.25rem; border-radius: 12px; font-size: .82rem; font-weight: 600; box-shadow: 0 10px 40px rgba(0,0,0,.5); display: flex; align-items: center; gap: .65rem; transform: translateX(400px); transition: transform .4s cubic-bezier(.34,1.56,.64,1); max-width: 300px; }
        .toast.show { transform: translateX(0); }
        .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-dim); }
        .empty-state .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: .5; }
        .empty-state p { font-size: .875rem; }
        .status-ring { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: .35rem; flex-shrink: 0; }
        .ring-green { background: var(--green); box-shadow: 0 0 6px rgba(16,185,129,.6); }
        .ring-amber { background: var(--amber); box-shadow: 0 0 6px rgba(245,158,11,.6); }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .animate-in { animation: fadeInUp .4s ease both; }
        .delay-1 { animation-delay: .05s; } .delay-2 { animation-delay: .1s; } .delay-3 { animation-delay: .15s; } .delay-4 { animation-delay: .2s; }
        @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2,1fr); } .charts-row { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          #sidebar { transform: translateX(-100%); }
          #main { margin-left: 0; }
          .hamburger-btn { display: block !important; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          #page-body { padding: 1.25rem; }
        }
        @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* ════ SIDEBAR ════ */}
      <aside id="sidebar" className={sidebarOpen ? 'open' : ''}>
        <div className="sidebar-logo">
          <img src="/img/logo-removebg-preview.png" alt="" />
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-label">Main</div>
          {[
            { key: 'overview',  icon: '◈', label: 'Overview',  badge: null },
            { key: 'students',  icon: '◎', label: 'Students',  badge: { val: mergedStudents.length, cls: '' } },
            { key: 'payments',  icon: '◉', label: 'Payments',  badge: { val: paidStudents.length, cls: 'green' } },
            { key: 'quizzes',   icon: '◐', label: 'Quiz Logs', badge: { val: navStuck, cls: 'red' } },
          ].map(({ key, icon, label, badge }) => (
            <div key={key} className={`nav-item${currentView === key ? ' active' : ''}`} onClick={() => switchView(key)}>
              <span className="nav-icon">{icon}</span> {label}
              {badge && <span className={`nav-badge${badge.cls ? ' ' + badge.cls : ''}`}>{badge.val}</span>}
            </div>
          ))}
           <button className='course_studio' onClick={() => navigate('/admin/course-studio')}>
                Course Studio
           </button>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-label">Tools</div>
          <div className="nav-item" onClick={() => setShowAddModal(true)}>
            <span className="nav-icon">＋</span> Add Test Student
          </div>
          <div className="nav-item" onClick={exportCSV}>
            <span className="nav-icon">↓</span> Export CSV
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="admin-chip">
            <div className="admin-avatar">A</div>
            <div>
              <div className="admin-name">Admin Panel</div>
              <div className="admin-role">● LIVE DASHBOARD</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <div id="main">
        <div id="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="hamburger-btn" style={{ display: 'none' }} onClick={() => setSidebarOpen(o => !o)}>☰</button>
            <div className="topbar-title">Dashboard <span>— {VIEW_LABELS[currentView]}</span></div>
          </div>
          <div className="topbar-actions">
            <div style={{ fontSize: '.75rem', color: 'var(--text-dim)', fontFamily: "'JetBrains Mono',monospace" }}>{lastSync}</div>
            <button className="topbar-btn primary" onClick={() => setShowAddModal(true)}>+ Add Student</button>
            <button className="topbar-btn logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div id="page-body">

          {/* ── OVERVIEW ── */}
          {currentView === 'overview' && (
            <div>
              <div className="stats-grid">
                <div className="stat-card green-accent animate-in">
                  <div className="stat-label"><span className="dot" style={{ background: 'var(--green)' }} />Total Students</div>
                  <div className="stat-value">{mergedStudents.length}</div>
                  <div className="stat-sub">Registered accounts</div>
                  <div className="stat-icon">◎</div>
                </div>
                <div className="stat-card animate-in delay-1">
                  <div className="stat-label"><span className="dot" style={{ background: 'var(--gold)' }} />Revenue</div>
                  <div className="stat-value">${revenue.toLocaleString()}</div>
                  <div className="stat-sub">Simulated payments</div>
                  <div className="stat-icon">◈</div>
                </div>
                <div className="stat-card blue-accent animate-in delay-2">
                  <div className="stat-label"><span className="dot" style={{ background: 'var(--blue-acc)' }} />Completions</div>
                  <div className="stat-value">{completeCount}</div>
                  <div className="stat-sub">Finished all 13 lessons</div>
                  <div className="stat-icon">✓</div>
                </div>
                <div className="stat-card red-accent animate-in delay-3">
                  <div className="stat-label"><span className="dot" style={{ background: 'var(--red)' }} />Stuck Students</div>
                  <div className="stat-value">{stuckCount}</div>
                  <div className="stat-sub">Paid but not started</div>
                  <div className="stat-icon">⚠</div>
                </div>
              </div>

              <div className="charts-row animate-in delay-4">
                <div className="chart-card">
                  <div className="chart-title">📊 Lesson Drop-off Funnel <span>students per lesson</span></div>
                  <FunnelChart students={mergedStudents} lessonTitles={lessonTitles} />
                </div>
                <div className="chart-card">
                  <div className="chart-title">◉ Payment Distribution <span>plan breakdown</span></div>
                  <DonutChart students={mergedStudents} />
                </div>
              </div>

              {/* ── Activity Log (fixed: was "activityLog", now uses "logs" from Redux) ── */}
              <div className="chart-card animate-in">
                <div className="chart-title">📋 Recent Activity Log</div>
                <div className="log-list">
                  {!logs || logs.length === 0
                    ? <div className="empty-state"><div className="empty-icon">📭</div><p>No activity yet</p></div>
                    : logs.slice(0, 10).map((a, i) => (
                      <div className="log-item" key={i}>
                        <div className="log-dot" style={{ background: a.color || 'var(--blue-acc)' }} />
                        <div className="log-content">
                          <div className="log-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                          <div className="log-time">{timeAgo(a.time)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STUDENTS ── */}
          {currentView === 'students' && (
            <div>
              <div className="section-hdr">
                <div className="section-hdr-left">
                  <div className="section-hdr-title">All Students</div>
                  <div className="section-hdr-count">{filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}</div>
                </div>
                <div className="controls-bar">
                  <div className="search-wrap">
                    <span className="search-icon">🔍</span>
                    <input className="search-input" placeholder="Search name or email…" value={searchStudents} onChange={e => setSearchStudents(e.target.value)} />
                  </div>
                  <select className="filter-select" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
                    <option value="">All Payments</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                  <select className="filter-select" value={filterProgress} onChange={e => setFilterProgress(e.target.value)}>
                    <option value="">All Progress</option>
                    <option value="complete">Completed</option>
                    <option value="active">In Progress</option>
                    <option value="stuck">Stuck</option>
                    <option value="new">Not Started</option>
                  </select>
                </div>
              </div>
              <div className="table-card">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th><th>Contact</th><th>Age</th>
                        <th>Payment</th><th>Progress</th><th>Quiz Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0
                        ? <tr><td colSpan="7"><div className="empty-state"><div className="empty-icon">🎓</div><p>No students match your filters.</p></div></td></tr>
                        : filteredStudents.map((s) => (
                          <StudentRow key={s._id || s.id} s={s} idx={mergedStudents.indexOf(s)} onUnlock={openUnlock} onReset={openReset} />
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {currentView === 'payments' && (
            <div>
              <div className="section-hdr">
                <div className="section-hdr-left">
                  <div className="section-hdr-title">Payment Records</div>
                </div>
                <div className="controls-bar">
                  <div className="search-wrap">
                    <span className="search-icon">🔍</span>
                    <input className="search-input" placeholder="Search by name…" value={searchPayment} onChange={e => setSearchPayment(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="table-card">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th><th>Email</th><th>Plan</th>
                        <th>Amount</th><th>Status</th><th>Enrolled</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.length === 0
                        ? <tr><td colSpan="7"><div className="empty-state"><div className="empty-icon">💳</div><p>No payment records.</p></div></td></tr>
                        : filteredPayments.map((s, i) => (
                          <PaymentRow key={s._id || s.id} s={s} idx={i} onToggle={togglePayment} />
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── QUIZ LOGS ── */}
          {currentView === 'quizzes' && (
            <div>
              <div className="section-hdr">
                <div className="section-hdr-left">
                  <div className="section-hdr-title">Quiz Performance Log</div>
                </div>
              </div>
              <div className="chart-card" style={{ marginBottom: '1.25rem' }}>
                <div className="chart-title">🧠 Quiz Pass Rate by Lesson</div>
                <QuizBreakdown students={mergedStudents} lessonTitles={lessonTitles} />
              </div>
              <div className="table-card">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th><th>Lessons Completed</th><th>Quiz Map</th>
                        <th>Current Status</th><th>Last Lesson</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mergedStudents.filter(s => s.paid).length === 0
                        ? <tr><td colSpan="6"><div className="empty-state"><div className="empty-icon">🧠</div><p>No paid students with quiz data.</p></div></td></tr>
                        : mergedStudents.filter(s => s.paid).map(s => (
                          <QuizRow key={s._id || s.id} s={s} globalIdx={mergedStudents.indexOf(s)} onUnlock={openUnlock} onReset={openReset} lessonTitles={lessonTitles} />
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ════ MODALS ════ */}
      <UnlockModal student={unlockTarget} onConfirm={confirmUnlock} onClose={() => setUnlockTarget(null)} lessonTitles={lessonTitles} />
      <ResetModal  student={resetTarget}  onConfirm={confirmReset}  onClose={() => setResetTarget(null)} />
      {showAddModal && <AddStudentModal onConfirm={confirmAddStudent} onClose={() => setShowAddModal(false)} />}

      {/* ════ TOAST ════ */}
      <Toast visible={toast.visible} message={toast.message} icon={toast.icon} />
    </>
  );
}