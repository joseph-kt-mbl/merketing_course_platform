import { Route } from "react-router-dom";
import CourseListPage from "../pages/CourseListPage";
import CourseDetailPage from "../pages/CourseDetailPage";
import LessonViewerPage from "../pages/LessonViewerPage";
import QuizPage from "../pages/QuizPage";
import {
  PaymentInitiatorPage,
  PaymentSuccessPage,
  PaymentFailedPage,
} from "../pages/PaymentPages";

export const lmsRoutes = (
  <>
    {/* Course list */}
    <Route path="/courses" element={<CourseListPage />} />

    {/* Course detail */}
    <Route path="/courses/:courseId" element={<CourseDetailPage />} />

    {/* Lesson viewer */}
    <Route path="/courses/:courseId/lessons/:order" element={<LessonViewerPage />} />

    {/* Quiz */}
    <Route path="/courses/:courseId/quiz/:order" element={<QuizPage />} />

    {/* Payment */}
    <Route path="/courses/:courseId/pay" element={<PaymentInitiatorPage />} />
    <Route path="/courses/:courseId/payment-success" element={<PaymentSuccessPage />} />
    <Route path="/courses/:courseId/payment-failed" element={<PaymentFailedPage />} />

    {/* Generic fallbacks (without courseId, if your backend redirects here) */}
    <Route path="/payment-success" element={<PaymentSuccessPage />} />
    <Route path="/payment-failed" element={<PaymentFailedPage />} />
  </>
);

/**
 * ROUTE MAP
 * ─────────
 * /courses                              → CourseListPage
 * /courses/:courseId                    → CourseDetailPage
 * /courses/:courseId/lessons/:order  → LessonViewerPage
 * /courses/:courseId/quiz/:order               → QuizPage
 * /courses/:courseId/pay               → PaymentInitiatorPage
 * /courses/:courseId/payment-success    → PaymentSuccessPage
 * /courses/:courseId/payment-failed     → PaymentFailedPage
 * /payment-success                      → PaymentSuccessPage (generic)
 * /payment-failed                       → PaymentFailedPage  (generic)
 */
