import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import ComplaintDetail from "./pages/ComplaintDetail";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import AdminRoutes from "./routes/AdminRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import TechnicianRoutes from "./routes/TechnicianRoutes";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Authenticated Common & Customer Routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/complaints/:id" element={<ComplaintDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Technician Portal Routes */}
      <Route element={<TechnicianRoutes />}>
        <Route path="/technician" element={<TechnicianDashboard />} />
        <Route
          path="/technician/complaints/:id"
          element={<ComplaintDetail />}
        />
      </Route>

      {/* Admin Management Routes */}
      <Route element={<AdminRoutes />}>
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
