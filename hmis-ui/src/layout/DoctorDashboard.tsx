import Header from "../components/doctor/header/Header";
import Sidebar from "../components/doctor/sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const DoctorDashboard = () => {
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

export default DoctorDashboard;
