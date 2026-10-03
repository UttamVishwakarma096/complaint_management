import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoutes() {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoutes;
