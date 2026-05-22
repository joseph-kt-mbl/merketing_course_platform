import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminGuard = () => {
  const { user } = useSelector(state => state.auth);

  if (!user) return <Navigate to="/" />;

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

export default AdminGuard;