import { Navigate ,Outlet} from "react-router-dom";
import { useSelector } from "react-redux";


import {
  selectPaymentStatus,
  selectPaymentLoading,
} from "../store/PaymentSlice";

import {
  selectUser,
  selectAuthLoading,
} from "../store/AuthSlice";

function PaymentGuard({ children }) {
  const user = useSelector(selectUser);

  const authLoading = useSelector(selectAuthLoading);

  const paymentLoading = useSelector(selectPaymentLoading);

  const paymentStatus = useSelector(selectPaymentStatus);

  // Wait for auth/payment
  if (authLoading || paymentLoading) {
    return (
      <div className="loading-screen">
        Checking access...
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Fully paid
  if (paymentStatus === "paid") {
      return <Outlet />;
  }

  // Payment created but still pending
  if (paymentStatus === "pending") {
    return <Navigate to="/payment/pending" replace />;
  }

  // No payment exists
  return <Navigate to="/dashboard" replace />;
}

export default PaymentGuard;