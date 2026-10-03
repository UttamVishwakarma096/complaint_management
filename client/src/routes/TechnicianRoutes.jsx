import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function TechnicianRoutes() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "technician") return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export default TechnicianRoutes;
