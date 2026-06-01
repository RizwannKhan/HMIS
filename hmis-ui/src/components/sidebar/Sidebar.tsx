import { Avatar, Text } from "@mantine/core";
import {
  AsclepiusIcon,
  BuildingOfficeIcon,
  CalendarCheckIcon,
  PillIcon,
  PulseIcon,
  SquaresFourIcon,
  UserCircleCheckIcon,
} from "@phosphor-icons/react";
import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  {
    name: "Dashboard",
    url: "/dashboard",
    icon: <SquaresFourIcon size={32} stroke="1.5" />,
  },
  {
    name: "Doctors",
    url: "/doctors",
    icon: <AsclepiusIcon size={32} stroke="1.5" />,
  },
  {
    name: "Patients",
    url: "/patients",
    icon: <UserCircleCheckIcon size={32} stroke="1.5" />,
  },
  {
    name: "Appointments",
    url: "/appointments",
    icon: <CalendarCheckIcon size={32} stroke="1.5" />,
  },
  {
    name: "Pharmacy",
    url: "/pharmacy",
    icon: <PillIcon size={32} stroke="1.5" />,
  },
  {
    name: "Departments",
    url: "/departments",
    icon: <BuildingOfficeIcon size={32} stroke="1.5" />,
  },
];

const Sidebar = () => {
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
                src="Avatar.png"
                size={"xl"}
                alt="Profile"
              />
            </div>
            <span className="font-medium text-light">Rocky</span>
            <Text c="dimmed" size="xs" className="text-light">
              Admin
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
