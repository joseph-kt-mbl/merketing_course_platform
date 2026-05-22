import React, { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   STYLES – injected once via a <style> tag
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

:root {
  --bg:        #0d0f14;
  --surface:   #141720;
  --surface2:  #1b1f2e;
  --surface3:  #232840;
  --border:    #2a2f45;
  --accent:    #5b6cff;
  --accent2:   #69ff5b;
  --accent3:   #00e5c0;
  --text:      #e8eaf0;
  --muted:     #6b7280;
  --danger:    #ff4545;
  --warn:      #f5a623;
  --success:   #22d48f;
  --radius:    10px;
  --mono:      'Space Mono', monospace;
  --sans:      'Syne', sans-serif;
}

.alm-root {
  font-family: var(--sans);
  background: var(--bg);
  color: var(--text);
  width: 100%;
  min-height: 100vh;
  padding: 28px 32px;
  box-sizing: border-box;
}

/* ── TOP BAR ── */
.alm-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.alm-topbar-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.alm-topbar-title span.dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent);
  display: inline-block;
  box-shadow: 0 0 8px var(--accent);
}
.alm-course-pill {
  font-family: var(--mono);
  font-size: 11px;
  background: var(--surface3);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: 20px;
  color: var(--muted);
}
.alm-course-pill b { color: var(--accent3); }

/* ── ACTION STRIP ── */
.alm-action-strip {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.alm-btn {
  font-family: var(--sans);
  font-weight: 700;
  font-size: 13px;
  border: none;
  border-radius: var(--radius);
  padding: 10px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: all .18s ease;
  white-space: nowrap;
}
.alm-btn:active { transform: scale(.97); }
.alm-btn-primary {
  background: var(--accent);
  color: #fff;
}
.alm-btn-primary:hover { background: #7080ff; box-shadow: 0 0 16px rgba(91,108,255,.4); }
.alm-btn-ghost {
  background: var(--surface2);
  color: var(--text);
  border: 1px solid var(--border);
}
.alm-btn-ghost:hover { background: var(--surface3); border-color: var(--accent); }
.alm-btn-danger {
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
}
.alm-btn-danger:hover { background: rgba(255,69,69,.1); }
.alm-btn-success {
  background: var(--success);
  color: #000;
}
.alm-btn-success:hover { filter: brightness(1.1); }
.alm-btn-warn {
  background: var(--warn);
  color: #000;
}
.alm-btn-sm {
  font-size: 11px;
  padding: 6px 12px;
}

/* ── LESSONS GRID ── */
.alm-lessons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.alm-lesson-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  position: relative;
  transition: border-color .2s, transform .2s;
  cursor: default;
}
.alm-lesson-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}
.alm-lesson-card.has-quiz { border-left: 3px solid var(--accent3); }
.alm-lesson-order {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.alm-lesson-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
  line-height: 1.3;
}
.alm-lesson-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.alm-badge {
  font-family: var(--mono);
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 400;
}
.alm-badge-pts { background: rgba(255,91,141,.12); color: var(--accent2); border: 1px solid rgba(255,91,141,.25); }
.alm-badge-quiz { background: rgba(0,229,192,.1); color: var(--accent3); border: 1px solid rgba(0,229,192,.25); }
.alm-badge-noquiz { background: rgba(107,114,128,.1); color: var(--muted); border: 1px solid var(--border); }

.alm-card-actions {
  display: flex;
  gap: 8px;
}

/* ── EMPTY / LOADING ── */
.alm-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
  font-size: 14px;
}
.alm-empty svg { margin-bottom: 12px; opacity: .3; }
.alm-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  color: var(--muted);
  grid-column: 1 / -1;
}
.alm-spinner {
  width: 18px; height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── OVERLAY BACKDROP ── */
.alm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.7);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn .15s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ── MODAL ── */
.alm-modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px 30px;
  width: min(560px, 90vw);
  max-height: 88vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp .2s ease;
}
.alm-modal-wide { width: min(860px, 94vw); }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);    }
}
.alm-modal-close {
  position: absolute;
  top: 16px; right: 16px;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--muted);
  width: 30px; height: 30px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s;
}
.alm-modal-close:hover { color: var(--text); border-color: var(--danger); }
.alm-modal-title {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.alm-modal-title .icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.icon-blue { background: rgba(91,108,255,.2); }
.icon-pink { background: rgba(255,91,141,.2); }
.icon-teal { background: rgba(0,229,192,.2); }
.icon-red  { background: rgba(255,69,69,.2); }

/* ── FORM FIELDS ── */
.alm-field {
  margin-bottom: 16px;
}
.alm-field label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .8px;
  margin-bottom: 6px;
}
.alm-field label span.req { color: var(--accent2); }
.alm-input {
  width: 100%;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  font-family: var(--sans);
  font-size: 14px;
  color: var(--text);
  box-sizing: border-box;
  transition: border-color .15s;
  outline: none;
}
.alm-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(91,108,255,.12); }
.alm-input::placeholder { color: var(--muted); }
textarea.alm-input { resize: vertical; min-height: 80px; font-family: var(--mono); font-size: 12px; }
.alm-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.alm-form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

/* ── QUIZ BUILDER ── */
.alm-quiz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.alm-question-card {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
  transition: border-color .15s;
}
.alm-question-card:hover { border-color: var(--accent); }
.alm-question-num {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--accent);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.alm-options-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}
.alm-option-wrap {
  position: relative;
}
.alm-option-wrap input[type=radio] {
  position: absolute;
  opacity: 0;
  width: 0; height: 0;
}
.alm-option-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 4px;
  cursor: pointer;
}
.alm-option-dot {
  width: 14px; height: 14px;
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s;
}
.alm-option-dot.correct {
  border-color: var(--success);
  background: rgba(34,212,143,.2);
}
.alm-option-dot.correct::after {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--success);
}
.alm-q-delete {
  position: absolute;
  top: 10px; right: 10px;
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 13px;
  padding: 4px;
  transition: color .15s;
}
.alm-q-delete:hover { color: var(--danger); }

/* ── QUIZ PREVIEW ── */
.alm-quiz-preview {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  margin-top: 16px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
  max-height: 220px;
  overflow-y: auto;
}
.alm-quiz-preview pre { margin: 0; white-space: pre-wrap; word-break: break-all; }

/* ── TOAST ── */
.alm-toast-stack {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.alm-toast {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: toastIn .2s ease;
  min-width: 240px;
  box-shadow: 0 8px 32px rgba(0,0,0,.4);
}
.alm-toast.success { border-left: 3px solid var(--success); }
.alm-toast.error   { border-left: 3px solid var(--danger); }
.alm-toast.info    { border-left: 3px solid var(--accent); }
@keyframes toastIn {
  from { opacity:0; transform: translateX(20px); }
  to   { opacity:1; transform: translateX(0);    }
}

/* ── CONFIRM DIALOG ── */
.alm-confirm {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
  width: min(380px, 90vw);
  animation: slideUp .15s ease;
}
.alm-confirm-msg { font-size: 15px; margin-bottom: 22px; line-height: 1.5; }
.alm-confirm-msg strong { color: var(--danger); }
.alm-confirm-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
`;

/* ─────────────────────────────────────────────
   TOAST HOOK
───────────────────────────────────────────── */
let toastId = 0;
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = 'info') => {
    const id = ++toastId;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };
  return { toasts, toast: add };
}

/* ─────────────────────────────────────────────
   CONFIRM DIALOG
───────────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="alm-backdrop" onClick={onCancel}>
      <div className="alm-confirm" onClick={e => e.stopPropagation()}>
        <div className="alm-confirm-msg" dangerouslySetInnerHTML={{ __html: message }} />
        <div className="alm-confirm-actions">
          <button className="alm-btn alm-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="alm-btn alm-btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ADD / EDIT LESSON MODAL
───────────────────────────────────────────── */
function LessonModal({ lesson, courseId, accessToken, onClose, onSaved, toast }) {
  const isEdit = !!lesson;
  const [form, setForm] = useState({
    title:   lesson?.title   || '',
    content: lesson?.content || '',
    order:   lesson?.order   ?? '',
    points:  lesson?.points  ?? 10,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title || form.order === '') { toast('Title and order are required', 'error'); return; }
    setSaving(true);
    try {
      const url = isEdit ? `/api/lessons/edit/${lesson._id}` : '/api/lessons/add';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit
        ? { title: form.title, content: form.content, order: +form.order, points: +form.points }
        : { title: form.title, content: form.content, courseId, order: +form.order, points: +form.points };
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      toast(isEdit ? 'Lesson updated ✓' : 'Lesson created ✓', 'success');
      onSaved();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="alm-backdrop" onClick={onClose}>
      <div className="alm-modal" onClick={e => e.stopPropagation()}>
        <button className="alm-modal-close" onClick={onClose}>✕</button>
        <div className="alm-modal-title">
          <span className={`icon ${isEdit ? 'icon-pink' : 'icon-blue'}`}>{isEdit ? '✏️' : '➕'}</span>
          {isEdit ? 'Edit Lesson' : 'New Lesson'}
        </div>

        <div className="alm-field">
          <label>Title <span className="req">*</span></label>
          <input className="alm-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Introduction to React" />
        </div>

        <div className="alm-field-row">
          <div className="alm-field">
            <label>Order <span className="req">*</span></label>
            <input className="alm-input" type="number" value={form.order} onChange={e => set('order', e.target.value)} placeholder="1, 2, 3…" />
          </div>
          <div className="alm-field">
            <label>Points</label>
            <input className="alm-input" type="number" value={form.points} onChange={e => set('points', e.target.value)} />
          </div>
        </div>

        <div className="alm-field">
          <label>Content (Markdown / HTML)</label>
          <textarea className="alm-input" rows={5} value={form.content} onChange={e => set('content', e.target.value)} placeholder="Lesson body…" />
        </div>

        <div className="alm-form-footer">
          <button className="alm-btn alm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="alm-btn alm-btn-primary" onClick={save} disabled={saving}>
            {saving ? <><span className="alm-spinner" /> Saving…</> : (isEdit ? '✓ Save Changes' : '✓ Create Lesson')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   QUIZ MODAL
───────────────────────────────────────────── */
function QuizModal({ lesson, courseId, accessToken, onClose, toast }) {
  const [quizTitle, setQuizTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingQuizId, setExistingQuizId] = useState(null);

  // Load existing quiz on open
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/quiz/order/${lesson.order}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const d = await r.json();
        if (d.success && d.quiz) {
          setExistingQuizId(d.quiz._id);
          setQuizTitle(d.quiz.title || '');
          setPassingScore(d.quiz.passingScore ?? 70);
          setQuestions(
            d.quiz.questions.map(q => ({
              question: q.question,
              options: q.options,
              correctAnswerIndex: q.options.indexOf(q.correctAnswer),
            }))
          );
          setPreview(d.quiz);
        }
      } catch { /* no quiz yet */ }
      setLoading(false);
    })();
  }, []);

  const addQuestion = () => setQuestions(q => [...q, { question: '', options: ['', '', ''], correctAnswerIndex: 0 }]);
  const removeQuestion = i => setQuestions(q => q.filter((_, idx) => idx !== i));
  const setQ = (i, val) => setQuestions(q => { const n=[...q]; n[i]={...n[i],question:val}; return n; });
  const setOpt = (qi, oi, val) => setQuestions(q => { const n=[...q]; const opts=[...n[qi].options]; opts[oi]=val; n[qi]={...n[qi],options:opts}; return n; });
  const setCorrect = (qi, ci) => setQuestions(q => { const n=[...q]; n[qi]={...n[qi],correctAnswerIndex:ci}; return n; });

  const saveQuiz = async () => {
    if (!questions.length) { toast('Add at least one question', 'error'); return; }
    setSaving(true);
    try {
      // Always create fresh (API returns 400 if exists → we handle that via PATCH if we have ID)
      if (existingQuizId) {
        // Use editQuiz endpoint with patch format
        const updates = questions.map((q, idx) => ({
          index: idx,
          question: {
            question: q.question,
            options: q.options.filter(Boolean),
            correctAnswerIndex: q.correctAnswerIndex,
          }
        }));
        const r = await fetch(`/api/quiz/${existingQuizId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ updates, passingScore: +passingScore }),
        });
        const d = await r.json();
        if (!d.success) throw new Error(d.message);
      } else {
        const payload = {
          courseId,
          lessonId: lesson._id,
          title: quizTitle || 'Quiz',
          passingScore: +passingScore,
          questions: questions.map(q => ({
            question: q.question,
            options: q.options.filter(Boolean),
            correctAnswerIndex: q.correctAnswerIndex,
          })),
        };
        const r = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(payload),
        });
        const d = await r.json();
        if (!d.success) throw new Error(d.message);
        setExistingQuizId(d.quiz._id);
      }
      toast('Quiz saved ✓', 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="alm-backdrop" onClick={onClose}>
      <div className="alm-modal alm-modal-wide" onClick={e => e.stopPropagation()}>
        <button className="alm-modal-close" onClick={onClose}>✕</button>
        <div className="alm-modal-title">
          <span className="icon icon-teal">🧩</span>
          Quiz — <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 14 }}>{lesson.title}</span>
        </div>

        {loading ? (
          <div className="alm-loading"><span className="alm-spinner" /> Loading quiz…</div>
        ) : (
          <>
            <div className="alm-field-row">
              <div className="alm-field">
                <label>Quiz title</label>
                <input className="alm-input" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="e.g. JS Fundamentals Quiz" />
              </div>
              <div className="alm-field">
                <label>Passing score %</label>
                <input className="alm-input" type="number" min="0" max="100" value={passingScore} onChange={e => setPassingScore(e.target.value)} />
              </div>
            </div>

            <div className="alm-quiz-header">
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Questions ({questions.length})
              </span>
              <button className="alm-btn alm-btn-ghost alm-btn-sm" onClick={addQuestion}>+ Add Question</button>
            </div>

            {questions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: 13 }}>
                No questions yet — click "Add Question"
              </div>
            )}

            {questions.map((q, qi) => (
              <div className="alm-question-card" key={qi}>
                <button className="alm-q-delete" onClick={() => removeQuestion(qi)}>✕</button>
                <div className="alm-question-num">Question {qi + 1}</div>
                <input
                  className="alm-input"
                  value={q.question}
                  onChange={e => setQ(qi, e.target.value)}
                  placeholder="Enter your question…"
                />
                <div className="alm-options-row">
                  {[0, 1, 2].map(oi => (
                    <div className="alm-option-wrap" key={oi}>
                      <div
                        className="alm-option-label"
                        onClick={() => setCorrect(qi, oi)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className={`alm-option-dot ${q.correctAnswerIndex === oi ? 'correct' : ''}`} />
                        {String.fromCharCode(65 + oi)}
                      </div>
                      <input
                        className="alm-input"
                        value={q.options[oi] || ''}
                        onChange={e => setOpt(qi, oi, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {preview && (
              <div className="alm-quiz-preview">
                <div style={{ marginBottom: 8, color: 'var(--accent3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Loaded from server
                </div>
                <pre>{JSON.stringify(preview, null, 2).slice(0, 600)}</pre>
              </div>
            )}

            <div className="alm-form-footer">
              <button className="alm-btn alm-btn-ghost" onClick={onClose}>Cancel</button>
              <button className="alm-btn alm-btn-success" onClick={saveQuiz} disabled={saving}>
                {saving ? <><span className="alm-spinner" /> Saving…</> : '✓ Save Quiz'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function AdminLessonManager() {
  const accessToken = localStorage.getItem('accessToken') || '';
  const courseId    = localStorage.getItem('courseId')    || '';
  const { toasts, toast } = useToast();

  const [lessons,  setLessons]  = useState([]);
  const [loading,  setLoading]  = useState(false);

  // Modal states
  const [addModal,     setAddModal]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);  // lesson object
  const [quizTarget,   setQuizTarget]   = useState(null);  // lesson object
  const [deleteTarget, setDeleteTarget] = useState(null);  // lesson object

  const load = async () => {
    if (!courseId) { toast('No courseId in localStorage', 'error'); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/lessons/course/${courseId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      setLessons((d.lessons || []).sort((a, b) => a.order - b.order));
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    try {
      const r = await fetch(`/api/lessons/delete/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      toast('Lesson deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="alm-root">
        {/* TOP BAR */}
        <div className="alm-topbar">
          <div className="alm-topbar-title">
            <span className="dot" />
            Lesson &amp; Quiz Studio
          </div>
          <div className="alm-course-pill">
            Course: <b>{courseId || '—'}</b>
          </div>
        </div>

        {/* ACTION STRIP */}
        <div className="alm-action-strip">
          <button className="alm-btn alm-btn-primary" onClick={() => setAddModal(true)}>
            + New Lesson
          </button>
          <button className="alm-btn alm-btn-ghost" onClick={load}>
            ↺ Refresh
          </button>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)', alignSelf: 'center' }}>
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* LESSONS GRID */}
        <div className="alm-lessons-grid">
          {loading ? (
            <div className="alm-loading">
              <span className="alm-spinner" />
              Loading lessons…
            </div>
          ) : lessons.length === 0 ? (
            <div className="alm-empty">
              <div style={{ fontSize: 40 }}>📚</div>
              <p>No lessons yet. Click <strong>"+ New Lesson"</strong> to get started.</p>
            </div>
          ) : (
            lessons.map(lesson => (
              <div key={lesson._id} className="alm-lesson-card">
                <div className="alm-lesson-order">Lesson #{lesson.order}</div>
                <div className="alm-lesson-title">{lesson.title}</div>
                <div className="alm-lesson-meta">
                  <span className="alm-badge alm-badge-pts">★ {lesson.points} pts</span>
                  {lesson.content
                    ? <span style={{ fontSize: 11, color: 'var(--muted)' }}>{lesson.content.slice(0, 50)}…</span>
                    : <span style={{ fontSize: 11, color: 'var(--muted)' }}>No content</span>
                  }
                </div>
                <div className="alm-card-actions">
                  <button
                    className="alm-btn alm-btn-ghost alm-btn-sm"
                    onClick={() => setEditTarget(lesson)}
                  >✏️ Edit</button>
                  <button
                    className="alm-btn alm-btn-ghost alm-btn-sm"
                    style={{ color: 'var(--accent3)', borderColor: 'rgba(0,229,192,.3)' }}
                    onClick={() => setQuizTarget(lesson)}
                  >🧩 Quiz</button>
                  <button
                    className="alm-btn alm-btn-danger alm-btn-sm"
                    onClick={() => setDeleteTarget(lesson)}
                  >🗑</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── MODALS ── */}
      {addModal && (
        <LessonModal
          courseId={courseId}
          accessToken={accessToken}
          onClose={() => setAddModal(false)}
          onSaved={() => { setAddModal(false); load(); }}
          toast={toast}
        />
      )}
      {editTarget && (
        <LessonModal
          lesson={editTarget}
          courseId={courseId}
          accessToken={accessToken}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); load(); }}
          toast={toast}
        />
      )}
      {quizTarget && (
        <QuizModal
          lesson={quizTarget}
          courseId={courseId}
          accessToken={accessToken}
          onClose={() => setQuizTarget(null)}
          toast={toast}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete lesson <strong>"${deleteTarget.title}"</strong>?<br/><br/>This will also remove any associated quiz.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── TOASTS ── */}
      <div className="alm-toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`alm-toast ${t.type}`}>
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}