import { useAuth } from './../authContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Content() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  // Sample courses data
  const courses = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Master the basics of JavaScript programming',
      progress: 65,
      lessons: 12,
      completedLessons: 8,
      rating: 4.8,
      instructor: 'John Doe',
      thumbnail: '🎯',
      videoUrl: 'https://example.com/video1',
      materials: ['Lecture Notes', 'Code Examples', 'Practice Exercises']
    },
    {
      id: 2,
      title: 'React Advanced Patterns',
      description: 'Learn advanced patterns in React development',
      progress: 40,
      lessons: 15,
      completedLessons: 6,
      rating: 4.9,
      instructor: 'Jane Smith',
      thumbnail: '⚛️',
      videoUrl: 'https://example.com/video2',
      materials: ['Lecture Notes', 'GitHub Repo', 'Live Coding Sessions']
    },
    {
      id: 3,
      title: 'Full Stack Web Development',
      description: 'Complete guide to building full stack applications',
      progress: 20,
      lessons: 20,
      completedLessons: 4,
      rating: 4.7,
      instructor: 'Mike Johnson',
      thumbnail: '🚀',
      videoUrl: 'https://example.com/video3',
      materials: ['Project Files', 'Documentation', 'API Guides']
    }
  ];

  return (
    <div className="content-container">
      <style>{`
        :root {
          --navy:       #1A237E;
          --navy-dark:  #0D1257;
          --navy-light: #283593;
          --gold:       #C5A021;
          --gold-light: #E8BE3A;
          --gold-dark:  #9C7D12;
          --gray:       #6B7280;
          --border:     #E5E4EF;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .content-container {
          min-height: 100vh;
          background: linear-gradient(145deg, var(--navy-dark) 0%, var(--navy) 40%, #1e2d8f 70%, #0a0e3d 100%);
          font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #f1f5f9;
          padding-bottom: 60px;
          position: relative;
        }

        /* Background grid */
        .content-container::before {
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

        /* Header */
        .content-header {
          background: rgba(13, 18, 87, 0.6);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(197, 160, 33, 0.12);
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .logo {
          font-size: 20px;
          font-weight: 900;
          color: white;
          letter-spacing: -0.4px;
          cursor: pointer;
        }

        .logo em {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          color: var(--gold-light);
        }

        .nav-items {
          display: flex;
          gap: 30px;
        }

        .nav-item {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          padding-bottom: 2px;
        }

        .nav-item:hover,
        .nav-item.active {
          color: white;
        }

        .nav-item.active::after,
        .nav-item:hover::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, var(--gold-dark), var(--gold-light));
          border-radius: 2px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .search-bar {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 10px 16px;
          color: white;
          font-size: 13px;
          font-family: 'Montserrat', inherit;
          transition: all 0.3s ease;
        }

        .search-bar::placeholder { color: rgba(255, 255, 255, 0.35); }

        .search-bar:focus {
          outline: none;
          border-color: rgba(197, 160, 33, 0.4);
          background: rgba(255, 255, 255, 0.11);
          box-shadow: 0 0 0 3px rgba(197, 160, 33, 0.1);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold-dark), var(--gold));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 16px;
          color: var(--navy-dark);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(197, 160, 33, 0.35);
        }

        /* Main Content */
        .content-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 30px;
          position: relative;
          z-index: 1;
        }

        .content-header-section {
          margin-bottom: 40px;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .content-title {
          font-size: 36px;
          font-weight: 900;
          margin-bottom: 10px;
          color: white;
          letter-spacing: -0.8px;
        }

        .content-title em {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          color: var(--gold-light);
        }

        .content-subtitle {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.7;
        }

        /* Course Grid */
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .course-card {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(197, 160, 33, 0.12);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }

        .course-card:nth-child(2) { animation-delay: 0.1s; }
        .course-card:nth-child(3) { animation-delay: 0.2s; }

        .course-card:hover {
          border-color: rgba(197, 160, 33, 0.4);
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(197, 160, 33, 0.2);
        }

        .course-thumbnail {
          width: 100%;
          height: 180px;
          background: linear-gradient(135deg, rgba(26, 35, 126, 0.6) 0%, rgba(197, 160, 33, 0.2) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          border-bottom: 1px solid rgba(197, 160, 33, 0.1);
        }

        .course-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .course-title {
          font-size: 16px;
          font-weight: 800;
          color: white;
          margin-bottom: 8px;
          letter-spacing: -0.2px;
        }

        .course-instructor {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 12px;
          font-weight: 500;
        }

        .course-description {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.55);
          margin-bottom: 16px;
          line-height: 1.6;
          flex: 1;
        }

        .course-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.45);
          font-weight: 600;
        }

        .progress-bar {
          width: 100%;
          height: 5px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--gold-dark), var(--gold-light));
          border-radius: 50px;
          transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .course-rating {
          font-size: 12px;
          color: var(--gold-light);
          margin-bottom: 16px;
          font-weight: 700;
        }

        .course-button {
          background: linear-gradient(135deg, var(--navy), var(--navy-light));
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 800;
          font-family: 'Montserrat', inherit;
          cursor: pointer;
          transition: all 0.3s ease;
          align-self: flex-start;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.3px;
        }

        .course-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--gold), var(--gold-dark));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .course-button:hover::before { opacity: 1; }

        .course-button:hover {
          color: var(--navy-dark);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(197, 160, 33, 0.3);
        }

        .course-button span { position: relative; z-index: 1; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(7, 11, 52, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .modal {
          background: linear-gradient(160deg, #111827 0%, #1a1f4e 100%);
          border: 1px solid rgba(197, 160, 33, 0.2);
          border-radius: 24px;
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
        }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-accent {
          height: 4px;
          background: linear-gradient(90deg, var(--gold-dark), var(--gold-light), var(--gold-dark));
          border-radius: 24px 24px 0 0;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid rgba(197, 160, 33, 0.1);
        }

        .modal-title {
          font-size: 20px;
          font-weight: 900;
          color: white;
          letter-spacing: -0.4px;
        }

        .modal-close {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          line-height: 1;
        }

        .modal-close:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #EF4444;
        }

        .modal-content { padding: 24px; }

        .video-placeholder {
          width: 100%;
          height: 400px;
          background: linear-gradient(135deg, rgba(26, 35, 126, 0.5) 0%, rgba(197, 160, 33, 0.15) 100%);
          border: 1px solid rgba(197, 160, 33, 0.15);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          margin-bottom: 24px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .video-placeholder:hover { border-color: rgba(197, 160, 33, 0.35); }

        .course-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .info-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(197, 160, 33, 0.1);
          border-radius: 10px;
          padding: 12px;
        }

        .info-label {
          font-size: 11px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 4px;
        }

        .info-value {
          color: white;
          font-weight: 800;
          font-size: 15px;
        }

        .materials-section { margin-top: 24px; }

        .materials-title {
          font-size: 11px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .material-item {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(197, 160, 33, 0.1);
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .material-item:hover {
          background: rgba(197, 160, 33, 0.07);
          border-color: rgba(197, 160, 33, 0.3);
        }

        .material-name {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
        }

        .material-download {
          color: var(--gold-light);
          cursor: pointer;
          font-size: 18px;
          transition: transform 0.2s;
        }

        .material-item:hover .material-download { transform: translateY(2px); }

        @media (max-width: 768px) {
          .content-header { flex-direction: column; gap: 16px; }
          .nav-items      { display: none; }
          .search-bar     { display: none; }
          .content-title  { font-size: 24px; }
          .courses-grid   { grid-template-columns: 1fr; }
          .course-info    { grid-template-columns: 1fr; }
          .modal          { width: 95%; max-height: 95vh; }
          .video-placeholder { height: 250px; }
        }
      `}</style>

      {/* Header */}
      <div className="content-header">
        <div className="header-left">
          <div className="logo" onClick={() => navigate('/dashboard')}>
            Master<em>Mind</em>
          </div>
          <div className="nav-items">
            <a className="nav-item" onClick={() => navigate('/dashboard')}>Dashboard</a>
            <a className="nav-item active" onClick={() => navigate('/content')}>Courses</a>
            <a className="nav-item" onClick={() => navigate('/profile')}>Profile</a>
          </div>
        </div>

        <div className="header-right">
          <input className="search-bar" type="text" placeholder="Search courses..." />
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-main">
        <div className="content-header-section">
          <h1 className="content-title">My Courses 📖</h1>
          <p className="content-subtitle">
            Continue learning and expand your skills with our premium courses
          </p>
        </div>

        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card" onClick={() => setSelectedCourse(course)}>
              <div className="course-thumbnail">{course.thumbnail}</div>
              <div className="course-content">
                <div className="course-title">{course.title}</div>
                <div className="course-instructor">by {course.instructor}</div>
                <div className="course-description">{course.description}</div>

                <div className="course-meta">
                  <span>{course.completedLessons}/{course.lessons} lessons</span>
                  <span className="course-rating">★ {course.rating}</span>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                </div>

                <button className="course-button" onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCourse(course);
                }}>
                  <span>Continue →</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Modal */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-accent"></div>
            <div className="modal-header">
              <div className="modal-title">{selectedCourse.title}</div>
              <button className="modal-close" onClick={() => setSelectedCourse(null)}>×</button>
            </div>

            <div className="modal-content">
              <div className="video-placeholder">▶️</div>

              <div className="course-info">
                <div className="info-item">
                  <div className="info-label">Instructor</div>
                  <div className="info-value">{selectedCourse.instructor}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Rating</div>
                  <div className="info-value">★ {selectedCourse.rating}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Progress</div>
                  <div className="info-value">{selectedCourse.progress}%</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Lessons</div>
                  <div className="info-value">{selectedCourse.completedLessons}/{selectedCourse.lessons}</div>
                </div>
              </div>

              <div className="materials-section">
                <div className="materials-title">Course Materials</div>
                {selectedCourse.materials.map((material, index) => (
                  <div key={index} className="material-item">
                    <span className="material-name">📄 {material}</span>
                    <span className="material-download">⬇️</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Content;