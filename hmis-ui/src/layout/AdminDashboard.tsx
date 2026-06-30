import Sidebar from "../components/doctor/sidebar/Sidebar";
import Header from "../components/header/Header";
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full flex flex-col">
        <Header />
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
