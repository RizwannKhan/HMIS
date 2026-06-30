import React, { useEffect } from "react";
import { ActionIcon, Button } from "@mantine/core";
import {
  BellRingingIcon,
  ListIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import ProfileMenu from "./ProfileMenu";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeJwt } from "../../slices/JwtSlice";
import { removeUser } from "../../slices/UserSlice";

const Header = () => {
  const dispatch = useDispatch();
  const jwt = useSelector((state: any) => state.jwt);
  const handleLogout = () => {
    // console.log("Logout");
    dispatch(removeJwt());
    dispatch(removeUser());
  };
  return (
    <div className="bg-light shadow w-full h-16 flex justify-between px-5 items-center">
      <ActionIcon variant="transparent" size={"lg"} aria-label="Settings">
        <ListIcon size={38} />
      </ActionIcon>
      <div className="flex gap-3 items-center">
        {jwt ? (
          <Button color="red" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Link to="login">
            <Button>Login</Button>
          </Link>
        )}
        {jwt && (
          <>
            <ActionIcon variant="transparent" size={"md"} aria-label="Settings">
              <BellRingingIcon size={32} />
            </ActionIcon>
            <ProfileMenu />{" "}
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
