import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectAuthLoading } from "../store/AuthSlice";

function AuthGuard({ children }) {
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);

  if (loading) {
    return <div className="loading-screen">Verifying session...</div>;
  }

  if (!user  || !localStorage.getItem('accessToken')) {
    return <Navigate to="/" replace />;
  }

  if(user.role === 'admin'){
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default AuthGuard;