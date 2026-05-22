import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, clearUser } from '../store/AuthSlice';
import { useState, useEffect, useRef, useCallback } from 'react';
import './Dashboard.css';

import { useProgress} from '../lms-module/hooks/useLms';
import { progressApi } from '../lms-module/api/lmsApi';


const LESSONS = [
  {
    num: 1, icon: '📡', module: 1, free: true,
    title: 'Fundamentals of Digital Marketing',
    duration: '34 min', type: 'Video + Quiz',
    summary: 'Begin your journey with a comprehensive overview of the digital marketing landscape. Understand the <strong>4Ps framework</strong>, the difference between organic and paid strategies, and how modern brands build integrated marketing machines from scratch.',
    learns: [
      'The core 4Ps of Marketing and their modern extensions',
      'Difference between push vs. pull marketing strategies',
      'How to map a customer journey from awareness to purchase',
      'The digital marketing funnel and key conversion metrics',
    ],
    skills: ['Marketing Strategy', 'Customer Journey', 'Brand Positioning', 'Funnel Basics'],
    bonus: { label: 'Lesson Resource', items: ['📄 4Ps Cheat Sheet', '🎯 Funnel Template'] },
    difficulty: 'Beginner',
  },
  {
    num: 2, icon: '🎯', module: 1, free: false,
    title: 'Identifying Your Target Audience (Personas)',
    duration: '31 min', type: 'Video + Quiz',
    summary: 'Stop marketing to everyone and start converting someone. This lesson teaches you to <strong>build data-backed buyer personas</strong> that reflect real humans — their fears, motivations, and buying triggers — using research methods that professional agencies rely on.',
    learns: [
      'How to conduct audience research using surveys and analytics',
      'The 5 components of a powerful buyer persona',
      'Psychographic vs. demographic segmentation',
      'How to validate personas with real customer interviews',
    ],
    skills: ['Audience Research', 'Buyer Personas', 'Segmentation', 'Customer Psychology'],
    bonus: { label: 'Lesson Resource', items: ['📊 Persona Template', '🔍 Research Checklist'] },
    difficulty: 'Beginner',
  },
  {
    num: 3, icon: '✍️', module: 1, free: false,
    title: 'Content Marketing Strategy',
    duration: '38 min', type: 'Video + Quiz',
    summary: 'Content is the fuel of every digital marketing channel. Learn the <strong>pillar-cluster model</strong>, how to build a content calendar that drives consistent organic traffic, and how to repurpose one piece of content across 7+ formats without burning out.',
    learns: [
      'Building a Topic Cluster strategy for SEO authority',
      'Content calendar framework — plan 90 days in 1 hour',
      'TOFU / MOFU / BOFU content types and when to use each',
      'Repurposing content across blog, video, social, and email',
    ],
    skills: ['Content Strategy', 'Topic Clusters', 'Content Calendar', 'Repurposing'],
    bonus: { label: 'Lesson Resource', items: ['📅 90-Day Calendar', '🗂️ Content Audit Sheet'] },
    difficulty: 'Beginner',
  },
  {
    num: 4, icon: '📱', module: 1, free: false,
    title: 'Social Media Mastery (Facebook & Instagram)',
    duration: '45 min', type: 'Video + Quiz',
    summary: 'Master the two most powerful social commerce platforms. Understand <strong>algorithm mechanics</strong>, content formats that win organic reach, community building tactics, and how to turn followers into paying customers through strategic storytelling.',
    learns: [
      'Facebook & Instagram algorithm decoded — what gets shown',
      'Reels, Stories, Carousels: which format wins in 2025',
      'Building a social content system that runs in 30 min/day',
      'Community management and DM conversion strategies',
    ],
    skills: ['Facebook Marketing', 'Instagram Strategy', 'Reels', 'Community Building'],
    bonus: { label: 'Lesson Resource', items: ['📸 Content Grid Planner', '📊 Engagement Tracker'] },
    difficulty: 'Intermediate',
  },
  {
    num: 5, icon: '🔍', module: 2, free: false,
    title: 'Search Engine Optimization (SEO) Basics',
    duration: '42 min', type: 'Video + Quiz',
    summary: 'SEO is the only marketing channel that compounds over time. This lesson covers <strong>Technical SEO, On-Page optimization, and Link Building</strong> using the same strategies that have ranked client sites to page 1 in competitive niches with zero ad spend.',
    learns: [
      'Keyword research using Ahrefs, SEMrush, and free tools',
      'On-page SEO: Title tags, H1s, internal linking done right',
      'Technical SEO: Core Web Vitals, site speed, indexability',
      'Link building strategies that actually work in 2025',
    ],
    skills: ['SEO Strategy', 'Keyword Research', 'Technical SEO', 'Link Building'],
    bonus: { label: 'Lesson Resource', items: ['🔑 Keyword Research Template', '✅ SEO Audit Checklist'] },
    difficulty: 'Intermediate',
  },
  {
    num: 6, icon: '💰', module: 2, free: false,
    title: 'Paid Advertising (Google & Meta Ads)',
    duration: '52 min', type: 'Video + Quiz',
    summary: 'The fastest path to scalable revenue — when done right. Learn to set up <strong>Google Search campaigns and Meta Ads</strong> that generate measurable ROI from day one. Master audience targeting, ad creative principles, budget allocation, and ROAS optimization.',
    learns: [
      'Google Ads campaign structure: keywords, match types, bids',
      'Meta Ads: Audiences, creatives, and the campaign funnel',
      'Reading and acting on performance data (CTR, CPC, ROAS)',
      'Retargeting strategies to convert warm audiences at 3× efficiency',
    ],
    skills: ['Google Ads', 'Meta Ads', 'ROAS Optimization', 'Retargeting'],
    bonus: { label: 'Lesson Resource', items: ['📊 Ad Budget Calculator', '🎨 Ad Creative Swipe File'] },
    difficulty: 'Intermediate',
  },
  {
    num: 7, icon: '📧', module: 2, free: false,
    title: 'Email Marketing & Automation',
    duration: '36 min', type: 'Video + Quiz',
    summary: 'Email generates $42 for every $1 spent — making it the highest-ROI channel in digital marketing. Master <strong>list building, segmentation, 5-sequence automation flows</strong>, and the subject line psychology that lifts open rates above 35%.',
    learns: [
      'Building and segmenting an email list from zero',
      'The 5 essential automation sequences every business needs',
      'Subject line formulas with proven 35%+ open rates',
      'Email deliverability — staying out of spam folders',
    ],
    skills: ['Email Marketing', 'Automation Flows', 'List Building', 'Deliverability'],
    bonus: { label: 'Lesson Resource', items: ['✉️ 5-Sequence Template', '📝 Subject Line Swipe File'] },
    difficulty: 'Intermediate',
  },
  {
    num: 8, icon: '🧠', module: 2, free: false,
    title: 'Psychology of Selling & Copywriting',
    duration: '40 min', type: 'Video + Quiz',
    summary: 'Words make or break campaigns. This lesson reveals the <strong>6 psychological triggers</strong> behind every purchase decision, and teaches you to write copy that converts — headlines, ad copy, landing page text, and CTAs that stop thumbs and open wallets.',
    learns: [
      "Cialdini's 6 Principles of Persuasion applied to marketing copy",
      'The PAS and AIDA copywriting frameworks for any channel',
      'Writing headlines that stop the scroll in competitive feeds',
      'CTA optimization: micro-copy that lifts conversion rates',
    ],
    skills: ['Copywriting', 'Persuasion Psychology', 'PAS / AIDA', 'CTA Writing'],
    bonus: { label: 'Lesson Resource', items: ['📝 Copy Formula Cheat Sheet', '🔥 Headline Generator Framework'] },
    difficulty: 'Intermediate',
  },
  {
    num: 9, icon: '📊', module: 3, free: false,
    title: 'Analytics & Data Tracking',
    duration: '44 min', type: 'Video + Quiz',
    summary: 'Marketing without data is guesswork. Master <strong>Google Analytics 4, Meta Pixel, and UTM tracking</strong> to understand exactly which campaigns drive revenue. Learn to build dashboards that impress clients and make decisions that improve ROAS month over month.',
    learns: [
      'Google Analytics 4 setup, events, and conversion tracking',
      'UTM parameters: how to tag every link for clean attribution',
      'Building a marketing KPI dashboard in under 30 minutes',
      'Multi-touch attribution models and when to use each',
    ],
    skills: ['GA4', 'UTM Tracking', 'Attribution Models', 'KPI Dashboards'],
    bonus: { label: 'Lesson Resource', items: ['📈 KPI Dashboard Template', '🏷️ UTM Builder Spreadsheet'] },
    difficulty: 'Advanced',
  },
  {
    num: 10, icon: '🔧', module: 3, free: false,
    title: 'Building a Sales Funnel',
    duration: '48 min', type: 'Video + Quiz',
    summary: 'A funnel without leaks is a printing press. Learn to architect <strong>end-to-end sales funnels</strong> — from cold traffic to closed sale — using landing pages, lead magnets, tripwires, upsells, and email sequences that work while you sleep.',
    learns: [
      'The 6-stage sales funnel architecture from zero',
      'Lead magnet strategy: what converts in 2025',
      'Tripwires, order bumps, and upsell sequences',
      'Connecting traffic sources to CRM and automation',
    ],
    skills: ['Sales Funnels', 'Lead Magnets', 'Upsell Strategy', 'CRM Integration'],
    bonus: { label: 'Lesson Resource', items: ['🗺️ Funnel Map Template', '💡 Lead Magnet Idea Generator'] },
    difficulty: 'Advanced',
  },
  {
    num: 11, icon: '🤝', module: 3, free: false,
    title: 'Influencer Marketing Tactics',
    duration: '29 min', type: 'Video + Quiz',
    summary: 'Borrowed audiences beat built ones — when done strategically. Learn the <strong>influencer tier system</strong>, how to identify and negotiate with micro-influencers for maximum ROI, set up affiliate tracking, and measure impact beyond vanity metrics.',
    learns: [
      'Mega vs. Macro vs. Micro vs. Nano influencer strategy',
      'Finding influencers using free and paid research tools',
      'Outreach templates and negotiation tactics that close deals',
      'Affiliate tracking setup and commission structure design',
    ],
    skills: ['Influencer Strategy', 'Affiliate Marketing', 'Partnership Negotiation', 'UGC'],
    bonus: { label: 'Lesson Resource', items: ['📩 Outreach Template Pack', '📊 Influencer ROI Calculator'] },
    difficulty: 'Advanced',
  },
  {
    num: 12, icon: '⚡', module: 3, free: false,
    title: 'Conversion Rate Optimization (CRO)',
    duration: '37 min', type: 'Video + Quiz',
    summary: 'Doubling your conversion rate is worth more than doubling your traffic budget. Master <strong>A/B testing methodology, heatmap analysis, and landing page psychology</strong> to extract maximum revenue from your existing traffic — the most leveraged skill in marketing.',
    learns: [
      'CRO audit framework: finding the highest-impact fixes fast',
      'A/B testing protocol: hypothesis, sample size, significance',
      'Heatmaps and session recordings — reading user behavior',
      'Landing page trust signals and friction reduction techniques',
    ],
    skills: ['A/B Testing', 'Heatmap Analysis', 'Landing Page CRO', 'UX Psychology'],
    bonus: { label: 'Lesson Resource', items: ['🔬 CRO Audit Checklist', '📐 Landing Page Teardown Framework'] },
    difficulty: 'Advanced',
  },
  {
    num: 13, icon: '🚀', module: 3, free: false,
    title: 'Final Strategy: Scaling Your Business',
    duration: '55 min', type: 'Masterclass + Quiz',
    summary: 'The capstone. Synthesize all 12 previous modules into a <strong>full-stack, integrated marketing strategy</strong> — the same framework used to scale 7-figure brands. Build your personal roadmap, launch your first integrated campaign, and earn your verified certificate.',
    learns: [
      'The Integrated Marketing Framework (IMF): all channels unified',
      'T-shaped marketer career roadmap for the next 3 years',
      'Building a portfolio with real campaigns and real results',
      'Launching your first full-funnel campaign from lesson 1–12 knowledge',
    ],
    skills: ['Full-Stack Strategy', 'Campaign Planning', 'Portfolio Building', 'Career Roadmap'],
    bonus: { label: 'Capstone Reward', items: ['🏆 Verified Certificate', '📋 Full Strategy Template', '🎓 Alumni Community Access'] },
    difficulty: 'Masterclass',
  },
];

const DIFF_COLORS = {
  Beginner:    { bg: 'rgba(5,150,105,.08)',  text: 'var(--green)',      border: 'rgba(5,150,105,.2)' },
  Intermediate:{ bg: 'rgba(197,160,33,.08)', text: 'var(--gold-dark)',  border: 'rgba(197,160,33,.2)' },
  Advanced:    { bg: 'rgba(26,35,126,.08)',  text: 'var(--navy-light)', border: 'rgba(26,35,126,.15)' },
  Masterclass: { bg: 'rgba(124,45,18,.08)',  text: '#c2410c',           border: 'rgba(124,45,18,.2)' },
};

/* ══════════════════════════════════════════
   TOAST COMPONENT
══════════════════════════════════════════ */
function Toast({ message, icon, visible }) {
  return (
    <div className={`toast${visible ? ' show' : ''}`}>
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   ACCORDION ITEM COMPONENT
══════════════════════════════════════════ */
function AccordionItem({ lesson, idx, isOpen, onToggle, courseState, onLockedToast, onGoToLesson }) {
  const isCompleted = courseState.completedLessons.includes(idx);
  const isUnlocked  = lesson.free || (courseState.paid && (idx === 0 || courseState.completedLessons.includes(idx - 1)));
  const isLocked    = !isUnlocked;
  const diff        = DIFF_COLORS[lesson.difficulty] || DIFF_COLORS['Beginner'];

  const lockIcon = isLocked
    ? <span className="lock-icon">🔒</span>
    : isCompleted
    ? <span style={{ color: 'var(--green)', fontSize: '1.1rem' }}>✓</span>
    : null;

  const tagEl = lesson.free
    ? <span className="tag tag-free">✦ Free Preview</span>
    : isLocked
    ? <span className="tag tag-locked">🔒 Locked</span>
    : isCompleted
    ? <span className="tag tag-done">✓ Completed</span>
    : <span className="tag tag-type">▶ Unlocked</span>;

  const ctaText = isLocked
    ? '🔒 Complete Previous Lesson'
    : isCompleted
    ? '✓ Review Lesson'
    : lesson.free
    ? '▶ Start Free — Lesson 1'
    : '▶ Continue Learning';

  const ctaClass = isLocked ? 'lesson-cta locked-cta' : isCompleted ? 'lesson-cta completed-cta' : 'lesson-cta';

  const handleHeaderClick = () => {
    if (isLocked) { onLockedToast(idx); return; }
    onToggle(idx);
  };

  const handleCta = (e) => {
    e.stopPropagation();
    if (isLocked) { onLockedToast(idx); return; }
    onGoToLesson(idx);
  };

  const itemClass = [
    'accordion-item reveal',
    `delay-${(idx % 3) + 1}`,
    isLocked ? 'locked' : '',
    isCompleted ? 'completed' : '',
    isOpen ? 'open visible' : 'visible',
  ].filter(Boolean).join(' ');

  return (
    <div className={itemClass} id={`lesson-${idx}`}>
      {/* Header */}
      <div
        className={`accordion-header${isLocked ? ' no-hover' : ''}`}
        onClick={handleHeaderClick}
      >
        <div className="lesson-number">{String(lesson.num).padStart(2, '0')}</div>
        <div className="lesson-icon-wrap">{lesson.icon}</div>
        <div className="lesson-title-block">
          <div className="lesson-title-text">
            {lesson.title}
            {lockIcon}
            {lesson.num === 13 && (
              <span className="tag tag-popular" style={{ fontSize: '.62rem' }}>FINAL</span>
            )}
          </div>
          <div className="lesson-meta">
            <span className="tag tag-duration">⏱ {lesson.duration}</span>
            <span className="tag tag-type">{lesson.type}</span>
            <span className="tag" style={{ background: diff.bg, color: diff.text, border: `1px solid ${diff.border}` }}>
              {lesson.difficulty}
            </span>
            {tagEl}
          </div>
        </div>
        {!isLocked && <div className="chevron">▾</div>}
      </div>

      {/* Body */}
      <div className="accordion-body">
        <div className="accordion-body-inner">
          <div className="lesson-overview">
            <div>
              <p
                className="lesson-summary"
                dangerouslySetInnerHTML={{ __html: lesson.summary }}
              />
              <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--navy-dark)', marginBottom: '.75rem' }}>
                What You'll Learn
              </div>
              <div className="learn-list">
                {lesson.learns.map((l, i) => (
                  <div className="learn-item" key={i}>
                    <div className="learn-check">✓</div>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--navy-dark)', marginBottom: '.625rem' }}>
                Skills You'll Gain
              </div>
              <div className="skill-tags">
                {lesson.skills.map((s, i) => (
                  <span className="skill-tag" key={i}>{s}</span>
                ))}
              </div>
              <div className="lesson-footer">
                <div className="lesson-details-pills">
                  <div className="detail-pill">⏱ {lesson.duration}</div>
                  <div className="detail-pill">📋 {lesson.type}</div>
                  <div className="detail-pill">📊 {lesson.difficulty}</div>
                </div>
                <button className={ctaClass} onClick={handleCta}>{ctaText}</button>
              </div>
            </div>
            <div className="bonus-card">
              <div className="bonus-label">{lesson.bonus.label}</div>
              {lesson.bonus.items.map((b, i) => (
                <div className="bonus-item" key={i}>{b}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
══════════════════════════════════════════ */
function Dashboard() {
  const user       = useSelector(selectUser);
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const courseId = localStorage.getItem("courseId");

   const [enrolling, setEnrolling] = useState(false);
   const [enrollError, setEnrollError] = useState("");

  const {data:progress, loading:progressLoading} = useProgress(courseId);



  
  /* ── Course state (localStorage, same key as script.js) ── */
  const [courseState, setCourseState] = useState(() => {
    try {
      const raw = localStorage.getItem('mmCourseState');
      return raw ? { paid: false, completedLessons: [], ...JSON.parse(raw) } : { paid: false, completedLessons: [] };
    } catch { return { paid: false, completedLessons: [] }; }
  });

  /* ── Accordion & filter state ── */
  const [openIdx,      setOpenIdx]      = useState(0);
  const [activeModule, setActiveModule] = useState(0);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [navShadow,    setNavShadow]    = useState(false);

  /* ── Dashboard tab: show dashboard overview or curriculum ── */
  const [activeTab, setActiveTab] = useState('dashboard');

  /* ── Toast ── */
  const [toast, setToast] = useState({ visible: false, message: '', icon: 'ℹ️' });
  const toastTimer = useRef(null);

  /* ── Scroll shadow on navbar ── */
  useEffect(() => {
    const onScroll = () => setNavShadow(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Auto-open first lesson when curriculum tab is opened ── */
  useEffect(() => {
    if (activeTab === 'curriculum') {
      setTimeout(() => setOpenIdx(0), 400);
    }
  }, [activeTab]);

  const showToast = useCallback((msg, icon = 'ℹ️') => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message: msg, icon });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    dispatch(clearUser());
    navigate('/');
  };

    async function handleEnroll() {
        setEnrolling(true);
        setEnrollError("");
        try {
          const result = await progressApi.enroll(courseId);
          if(result.success) {
            showToast('🎉 Enrollment successful! Welcome to the course.', '🎉');
            setTimeout(() => {
              navigate(`/courses/${courseId}`);
            }, 1000);
          }

          // await refetchProgress(); // Keep refetchProgress for now, but we'll refetch after enrollment
        } catch (err) {
          setEnrollError(err?.message || "Enrollment failed.");
        } finally {
          setEnrolling(false);
        }
      }


  const handleToggleAccordion = (idx) => {
    const lesson = LESSONS[idx];
    const isUnlocked = lesson.free || (courseState.paid && (idx === 0 || courseState.completedLessons.includes(idx - 1)));
    if (!isUnlocked) { handleLockedToast(idx); return; }
    setOpenIdx(prev => (prev === idx ? null : idx));
  };

  const handleLockedToast = (idx) => {
    const prev = idx > 0 ? LESSONS[idx - 1].title : '';
    if (!courseState.paid) {
      showToast('🔒 Enroll to unlock all 13 lessons', '🔒');
    } else {
      showToast(`🔒 Complete "${prev}" first`, '🔒');
    }
  };

  const handleGoToLesson = () => {
    navigate('/content');
  };

  const filterModule = (mod, e) => {
    setActiveModule(mod);
    setOpenIdx(null);
  };

  /* ── Derived progress ── */
  const pct = Math.round((progress?.completedLessons.length / 13) * 100) || 0;

  /* ── Filtered lessons ── */
  const filteredLessons = activeModule === 0
    ? LESSONS
    : LESSONS.filter(l => l.module === activeModule);


    if (progressLoading) {
        return (
          <div className="dashboard-root">
            <nav id="navbar" style={{ boxShadow: 'none' }}>
              <div className="nav-logo">
                <a href="/">📚 MasterMind</a>
              </div>
            </nav>
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading your progress...</p> 
            </div>
          </div>
        );
      }
  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="dashboard-root">

      {/* ── NAVBAR ── */}
      <nav
        id="navbar"
        style={{ boxShadow: navShadow ? '0 4px 28px rgba(0,0,0,.28)' : 'none' }}
      >
        <div className="nav-logo">
          <a href="/">📚 MasterMind</a>
        </div>
        <div className={`nav-links${menuOpen ? ' open' : ''}`}>
          <a href="/">Home</a>
          <span
            className={`nav-tab-link${activeTab === 'curriculum' ? ' active-tab-link' : ''}`}
            onClick={() => setActiveTab('curriculum')}
          >
            Curriculum
          </span>
          {!user?.hasPaid && (
            <a href={`/courses/${courseId}/pay`} className="nav-cta">Start Now →</a>
          )}
          <span className="nav-tab-link icon" onClick={() => setActiveTab('dashboard')}>
            {user?.firstname || 'Account'} 👤
          </span>
        </div>
        <div
          className="hamburger"
          onClick={() => setMenuOpen(m => !m)}
        >
          <span /><span /><span />
        </div>
      </nav>

      {/* ════════════════════════════════════
          TAB: DASHBOARD OVERVIEW
      ════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <main className="dashboard-main" style={{ paddingTop: '68px' }}>
          {/* Background effects */}
          <div className="page-bg" />
          <div className="bg-grid" />
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />

          {/* Hero */}
          <div className="hero-section">
            <div className="hero-content">
              <div className="greeting-icon">🎓</div>
              <h1 className="hero-title">Welcome back, {user?.firstname?.split(' ')[0] || 'there'}!</h1>
              <p className="hero-sub">You're on your way to becoming a marketing expert. Let's continue your journey.</p>
              <button
                className="btn-primary"
                style={{ marginTop: '1.5rem', cursor: 'pointer', border: 'none' }}
                onClick={() => setActiveTab('curriculum')}
              >
                📚 View Full Curriculum
              </button>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-grid">

            {/* Progress Card */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2 className="card-title">Your Learning Progress</h2>
                <span className="badge">{pct}% Complete</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="progress-stats">
                  <div className="stat">
                    <div className="stat-number">{progress?.completedLessons.length}</div>
                    <div className="stat-label">Lessons Completed</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">13</div>
                    <div className="stat-label">Total Lessons</div>
                  </div>
                </div>
              </div>
              <button className="primary-button" onClick={() => navigate(`/courses/${courseId}`)}>
                <span>Start Learning</span>
                <span>→</span>
              </button>
            </div>

            {/* Course Info */}
            <div className="dashboard-card">
              <h2 className="card-title">Course Information</h2>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-icon">✉️</span>
                  <div>
                    <div className="info-label">Email</div>
                    <div className="info-value">{user?.email}</div>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">🔐</span>
                  <div>
                    <div className="info-label">Status</div>
                    <div className="info-value">{user?.hasPaid ? '✅ Active' : '⏳ Pending Payment'}</div>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">📅</span>
                  <div>
                    <div className="info-label">Enrollment Date</div>
                    <div className="info-value">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="dashboard-card">
              <h2 className="card-title">Next Steps</h2>
              <div className="steps-list">
                <div className={`step-item ${user?.hasPaid ? 'completed' : 'pending'}`}>
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <div className="step-title">Complete Payment</div>
                    <div className="step-desc">Unlock full course access</div>
                  </div>
                  {user?.hasPaid && <span className="step-badge">✓</span>}
                </div>
                <div className={`step-item ${!user?.hasPaid ? 'locked' : user?.hasPaid && progress?.completedLessons.length > 0 ? 'completed' : 'pending'}`}>
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <div className="step-title">Start Module 1</div>
                    <div className="step-desc">Fundamentals of Marketing Strategy</div>
                  </div>
                </div>
                <div className={`step-item ${!user?.hasPaid ? 'locked' : progress?.completedLessons.length >= 13 ? 'completed' : 'pending'}`}>
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <div className="step-title">Complete Quiz</div>
                    <div className="step-desc">Prove your mastery</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="dashboard-card stats-card">
              <h2 className="card-title">Community</h2>
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-big-number">12,400+</div>
                  <div className="stat-big-label">Students Enrolled</div>
                </div>
                <div className="stat-box">
                  <div className="stat-big-number">4.9★</div>
                  <div className="stat-big-label">Course Rating</div>
                </div>
                <div className="stat-box">
                  <div className="stat-big-number">40+</div>
                  <div className="stat-big-label">Countries</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {!user?.isSubscribed && (
              <button className="secondary-button" onClick={() => navigate('/pricing')}>
                <span>View Pricing</span>
              </button>
            )}
            <button className="outline-button" onClick={handleLogout}>
              <span>Logout</span>
            </button>
          </div>
        </main>
      )}

      {/* ════════════════════════════════════
          TAB: CURRICULUM PAGE
      ════════════════════════════════════ */}
      {activeTab === 'curriculum' && (
        <>
          {/* HERO BANNER */}
          <section id="hero-banner">
            <div className="hero-grid-bg" />
            <div className="hero-radial" />
            <div className="hero-inner">
              <div className="hero-eyebrow">
                <span className="pulse-dot" />
                13 Lessons · Full Curriculum
              </div>
              <h1 className="hero-title">
                Everything You'll Master<br />
                <em className="serif gold-grad">Inside the Course</em>
              </h1>
              <p className="hero-sub">
                A battle-tested, quiz-gated curriculum built from 14 years of live campaign data.
                Every lesson unlocks the next — because real mastery is non-negotiable.
              </p>
              <div className="hero-stats">
                <div className="stat-pill">🎓 <span className="pill-val">13</span> Lessons</div>
                <div className="stat-pill">⏱ <span className="pill-val">7.5</span> Hours Total</div>
                <div className="stat-pill">🧠 <span className="pill-val">13</span> Quiz Gates</div>
                <div className="stat-pill">♾️ <span className="pill-val">Lifetime</span> Access</div>
              </div>

              {/* Hero Progress (only when enrolled) */}
              {(courseState.paid || courseState.completedLessons.length > 0) && (
                <div className="progress-track-wrap">
                  <div className="progress-track-label">
                    <span>Your Progress</span>
                    <strong>{pct}% Complete</strong>
                  </div>
                  <div className="track-bar">
                    <div className="track-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="track-dots">
                    {Array.from({ length: 13 }, (_, i) => (
                      <div
                        key={i}
                        className={[
                          'track-dot',
                          courseState.completedLessons.includes(i) ? 'done' : '',
                          i === courseState.completedLessons.length && courseState.paid ? 'active' : '',
                        ].filter(Boolean).join(' ')}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* MAIN CURRICULUM LAYOUT */}
          <div id="curriculum-section">
            <div className="curriculum-layout">

              {/* LEFT: ACCORDION */}
              <div>
                {/* Module Tabs */}
                <div className="module-tabs">
                  {[
                    { mod: 0, num: 'ALL',   label: 'All Lessons' },
                    { mod: 1, num: '01–04', label: 'Foundation' },
                    { mod: 2, num: '05–08', label: 'Growth' },
                    { mod: 3, num: '09–13', label: 'Mastery' },
                  ].map(({ mod, num, label }) => (
                    <button
                      key={mod}
                      className={`module-tab${activeModule === mod ? ' active' : ''}`}
                      onClick={(e) => filterModule(mod, e)}
                    >
                      <span className="tab-num">{num}</span>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Section Header */}
                <div className="reveal visible" style={{ marginBottom: '2rem' }}>
                  <div className="section-eyebrow">Complete Curriculum</div>
                  <h2 className="section-title">
                    13 Steps to <span style={{ color: 'var(--navy)' }}>Marketing</span>{' '}
                    <em className="serif" style={{ color: 'var(--gold-dark)' }}>Excellence</em>
                  </h2>
                  <div className="section-divider" />
                  <p style={{ color: 'var(--gray-soft)', fontSize: '.875rem', lineHeight: 1.8, maxWidth: '580px' }}>
                    Each lesson builds on the last. Pass the comprehension quiz at the end of each
                    module to unlock the next — proving mastery, not just completion.
                  </p>
                </div>

                {/* Accordion List */}
                <div className="accordion-list">
                  {filteredLessons.map((lesson) => {
                    const idx = LESSONS.indexOf(lesson);
                    return (
                      <AccordionItem
                        key={idx}
                        lesson={lesson}
                        idx={idx}
                        isOpen={openIdx === idx}
                        onToggle={handleToggleAccordion}
                        courseState={courseState}
                        onLockedToast={handleLockedToast}
                        onGoToLesson={handleGoToLesson}
                      />
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: STICKY SIDEBAR */}
              <div className="sticky-sidebar">
                <div className="sidebar-card reveal visible delay-2">
                  <div className="sidebar-card-header">
                    <div className="sidebar-price">
                      <span className="old-price">$297</span>
                      $147<small>/one-time</small>
                    </div>
                    <div className="sidebar-badge">🔥 50% Off — Limited Time</div>
                  </div>
                  <div className="sidebar-content">
                    <div className="sidebar-includes">
                      <div className="include-item"><div className="include-icon">📹</div>7.5 Hours of Video Content</div>
                      <div className="include-item"><div className="include-icon">🧠</div>13 Comprehension Quizzes</div>
                      <div className="include-item"><div className="include-icon">📄</div>Downloadable Lesson Guides</div>
                      <div className="include-item"><div className="include-icon">👥</div>Private Community Access</div>
                      <div className="include-item"><div className="include-icon">♾️</div>Lifetime Access + Updates</div>
                    </div>
                    
                      <button onClick={handleEnroll} disabled={enrolling || progress}
                       className="sidebar-cta">🚀 Enroll Now — $147</button>
                    
                    <div className="sidebar-guarantee">🔒 30-Day Money-Back Guarantee</div>

                    {/* Live Progress */}
                    <div className="sidebar-progress">
                      <div className="prog-header">
                        <span className="prog-label">Your Progress</span>
                        <span className="prog-pct">{pct}%</span>
                      </div>
                      <div className="prog-bar">
                        <div className="prog-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="prog-sub">
                        {courseState.paid
                          ? `${courseState.completedLessons.length} of 13 lessons completed`
                          : 'Complete registration to start'}
                      </div>
                      <div className="module-mini">
                        {[
                          ['Foundation', '01–04', 0, 4],
                          ['Growth',     '05–08', 4, 8],
                          ['Mastery',    '09–13', 8, 13],
                        ].map(([name, range, start, end]) => {
                          const total = end - start;
                          return (
                            <div className="module-mini-item" key={name}>
                              <span className="module-mini-name">{name} ({range})</span>
                              <div className="module-mini-dots">
                                {Array.from({ length: total }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`module-mini-dot${courseState.completedLessons.includes(start + i) ? ' done' : ''}`}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Card */}
                <div className="sidebar-card reveal visible delay-3" style={{ marginTop: '1.25rem' }}>
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gray-soft)', marginBottom: '1rem' }}>
                      Course At a Glance
                    </div>
                    {[
                      ['Level',        'Beginner → Advanced'],
                      ['Language',     'English'],
                      ['Certificate',  '✓ Included', 'var(--green)'],
                      ['Quiz Gates',   '13 / 13 lessons'],
                      ['Access',       'Lifetime'],
                      ['Last Updated', 'Jan 2025'],
                    ].map(([label, value, color]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.82rem', marginBottom: '.75rem' }}>
                        <span style={{ color: 'var(--gray-soft)' }}>{label}</span>
                        <span style={{ fontWeight: 700, color: color || 'var(--navy-dark)' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM CTA */}
          <section id="bottom-cta">
            <div className="cta-inner reveal visible">
              <h2 className="cta-title">
                13 Lessons Stand Between You<br />
                and <em className="serif gold-grad">Marketing Mastery</em>
              </h2>
              <p className="cta-sub">
                Every concept is proven in real campaigns. Every quiz ensures you actually learned it.
                Enroll today and start building a skill set that pays for itself.
              </p>
              <div className="cta-actions">
                <a href="/login" className="btn-primary">🚀 Start Learning Now</a>
                <a href="/about" className="btn-outline">About the Course →</a>
              </div>
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer id="footer">
        <div className="footer-logo">Learn Marketing</div>
        <p>© 2025 MasterMind Marketing Academy · All Rights Reserved</p>
        <p style={{ marginTop: '.5rem' }}>Privacy Policy · Terms of Service · Contact</p>
      </footer>

      {/* TOAST */}
      <Toast message={toast.message} icon={toast.icon} visible={toast.visible} />
    </div>
  );
}

export default Dashboard;