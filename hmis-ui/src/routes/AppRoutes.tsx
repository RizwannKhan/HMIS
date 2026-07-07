import { BrowserRouter, Route, Routes } from "react-router-dom";
import Random from "../components/Random";
import AdminDashboard from "../layout/AdminDashboard";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import PatientDashboard from "../layout/PatientDashboard";
import DoctorDashboard from "../layout/DoctorDashboard";
import DoctorProfilePage from "../pages/doctor/DoctorProfilePage";
import PatientProfilePage from "../pages/patient/PatientProfilePage";
import PatientAppointmentPage from "../pages/patient/PatientAppointmentPage";
import DoctorAppointmentPage from "../pages/doctor/DoctorAppointmentPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Random />} />
          <Route path="/doctors" element={<Random />} />
          <Route path="/patients" element={<Random />} />
          <Route path="/appointments" element={<Random />} />
          <Route path="/pharmacy" element={<Random />} />
          <Route path="/departments" element={<Random />} />
        </Route>
        <Route path="/doctor" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>}>
          <Route path="dashboard" element={<Random />} />
          <Route path="profile" element={<DoctorProfilePage />} />
          <Route path="patients" element={<Random />} />
          <Route path="appointments" element={<DoctorAppointmentPage />} />
          <Route path="departments" element={<Random />} />
        </Route>
        <Route path="/patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}>
          <Route path="profile" element={<PatientProfilePage />} />
          <Route path="dashboard" element={<Random />} />
          <Route path="appointments" element={<PatientAppointmentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
