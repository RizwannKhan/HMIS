import React from "react";
import { ActionIcon, Button } from "@mantine/core";
import {
  BellRingingIcon,
  ListIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import ProfileMenu from "./ProfileMenu";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="bg-light shadow w-full h-16 flex justify-between px-5 items-center">
      <ActionIcon variant="transparent" size={"lg"} aria-label="Settings">
        <ListIcon size={38} />
      </ActionIcon>
      <div className="flex gap-3 items-center">
        <Link to="login"><Button>Login</Button></Link>
        <ActionIcon variant="transparent" size={"md"} aria-label="Settings">
          <BellRingingIcon size={32} />
        </ActionIcon>
        <ProfileMenu />
      </div>
    </div>
  );
};

export default Header;
