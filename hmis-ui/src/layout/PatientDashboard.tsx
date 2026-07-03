import Header from "../components/patient/header/Header";
import Sidebar from "../components/patient/sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const PatientDashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full flex flex-col min-w-0">
        <Header />
        <Outlet />
      </div>
    </div>
  );
};

export default PatientDashboard;
