import { Avatar, Text } from "@mantine/core";
import {
  AsclepiusIcon,
  BuildingOfficeIcon,
  CalendarCheckIcon,
  PillIcon,
  PulseIcon,
  SquaresFourIcon,
  UserCircleCheckIcon,
  UserIcon,
} from "@phosphor-icons/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { getPatient } from "../../../services/PatientProfileService";

interface PatientDto {
  id: number;
  name: string;
  email: string;
  dob: string | null;
  phone: string;
  address: string;
  aadhaarNo: string | null;
  bloodGroup: string;
  allergies: string; // comma-separated from backend
  chronicDisease: string; // comma-separated from backend
  avatarUrl: string | null;
}

const links = [
  {
    name: "Dashboard",
    url: "/patient/dashboard",
    icon: <SquaresFourIcon size={32} stroke="1.5" />,
  },
  {
    name: "Profile",
    url: "/patient/profile",
    icon: <UserIcon size={32} stroke="1.5" />,
  },
  {
    name: "Appointments",
    url: "/patient/appointments",
    icon: <CalendarCheckIcon size={32} stroke="1.5" />,
  }
];

const Sidebar = () => {
  const user = useSelector((state: any) => state.user);
  const [patient, setPatient] = useState<PatientDto | null>(null);
  useEffect(() => {
      getPatient(user?.profileId)
        .then((data: PatientDto) => {
          setPatient(data);
        })
        .catch((err: any) => {
          console.error("Error fetching patient profile:", err);
          // setError("Failed to load profile. Please try again later.");
        });
    }, []);
  return (
    <div className="flex">
      <div className="w-64"></div>
      <div className="w-64 fixed h-screen overflow-y-auto hide-scrollbar bg-dark flex flex-col gap-7 items-center">
        <div className="text-primary-400 flex gap-1 py-3 items-center fixed z-[500] bg-dark">
          <PulseIcon size={40} stroke="2.5" />
          <span className="font-heading font-semibold text-3xl">HMIS</span>
        </div>
        <div className="flex flex-col gap-5 mt-20">
          <div className="flex flex-col gap-1 items-center">
            <div className="p-1 bg-white rounded-full shadow-lg">
              <Avatar
                variant="filled"
                src={patient?.avatarUrl ?? "/Avatar.png"}
                size={"xl"}
                alt="Profile"
              />
            </div>
            <span className="font-medium text-light">{user.name}</span>
            <Text c="dimmed" size="xs" className="text-light">
              {user.role}
            </Text>
          </div>
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              return (
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-3 w-full font-medium  px-4 py-5 rounded-lg  text-light
                ${isActive ? "bg-primary-400 text-dark" : "hover:bg-gray-100 hover:text-dark"}`
                  }
                  to={link.url}
                  key={link.url}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
