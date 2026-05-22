/**
 * LMS MODULE — Entry Point
 * ─────────────────────────
 * Import everything you need from this single file.
 *
 * Usage:
 *   import { lmsRoutes } from "./lms-module";
 *   import { courseApi, quizApi } from "./lms-module";
 */

// Routes (plug into your <Routes>)
export { lmsRoutes } from "./routes/lmsRoutes";

// Pages (if you want to compose manually)
export { default as CourseListPage } from "./pages/CourseListPage";
export { default as CourseDetailPage } from "./pages/CourseDetailPage";
export { default as LessonViewerPage } from "./pages/LessonViewerPage";
export { default as QuizPage } from "./pages/QuizPage";
export {
  PaymentInitiatorPage,
  PaymentSuccessPage,
  PaymentFailedPage,
} from "./pages/PaymentPages";

// API layer
export { courseApi, lessonApi, progressApi, quizApi, paymentApi } from "./api/lmsApi";

// Hooks
export {
  useCourses,
  useCourse,
  useCourseLessons,
  useLessonById,
  useLessonByOrder,
  useProgress,
  useCourseQuiz,
} from "./hooks/useLms";

// Shared UI components (reusable in your app)
export { Spinner, ErrorState, ProgressBar, Badge, SectionHeader, EmptyState } from "./components/shared/Ui";
