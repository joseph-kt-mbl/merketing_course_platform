import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AlertProvider } from "./components/AlertProvider";

import { fetchProfile } from "./store/AuthSlice";
import { fetchPaymentStatus } from "./store/PaymentSlice";
import AdminLessonManager from "./components/AdminLessonManager";

import Start from "./pages/Start";
import Welcome from "./pages/Welcome";
import Content from "./pages/Content";
import Verify from "./pages/Verify";
import Register from "./pages/Register";
import OtpUi from "./components/OtpUi";
import Dashboard from "./pages/Dashboard";

import AuthGuard from "./guards/AuthGuard";
import PaymentGuard from "./guards/PaymentGuard";
import AdminGuard from "./guards/AdminGuard";

import { lmsRoutes } from "./lms-module";

import AdminDashboard from "./pages/AdminDashboard";
import CreateCourse from "./pages/CreateCourse";
import ManageLessons from "./pages/ManageLessons";
import ManageQuiz from "./pages/ManageQuiz";

import PaymentPage from "./pages/PaymentPage";

import "./App.css";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";

import { useProgress, useCourseInterface } from "./lms-module/hooks/useLms";

function App() {
  const dispatch = useDispatch();
  const { data: infos, loading: infoLoading, error: infosReadingErr } = useCourseInterface();

  // console.log("Course Infos:", infos);
  // console.log("Infos Loading:", infoLoading);

  // On every app boot / refresh → verify session once
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchPaymentStatus());
  }, [dispatch]);

  // // Separate effect to fetch progress when course ID is available
   useEffect(() => {
     const getProgress = () => {
      // Only fetch if we have a course ID
      if (!infos?._id) return;
        localStorage.setItem("courseId", infos._id);      
     } 
    getProgress(); // Removed the argument since the function doesn't need it (it uses infos from closure)
  }, [infos?._id]);

  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<OtpUi />} />

      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />

      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        }
      />

      <Route path="/admin" element={<AdminGuard />}>
        <Route index element={<AdminDashboard />} />
        {/* <Route path="course-studio" element={<AdminLessonManager/>} /> */}
        <Route path="lessons" element={<ManageLessons />} />
        <Route path="quiz" element={<ManageQuiz />} />
        <Route path="course-studio" element={
           <AdminLessonManager/>
            
        } />
      </Route>

      
      {/* <Route element={<PaymentGuard />}> */}
        {lmsRoutes}
      {/* </Route> */}
        {/* {lmsRoutes} */}

    </Routes>
  );
}

export default App;