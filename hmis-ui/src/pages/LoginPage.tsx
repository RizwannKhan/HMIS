import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { PulseIcon } from "@phosphor-icons/react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/UserService";
import {
  errorNotification,
  successNotification,
} from "../utility/NotificationUtil";
import { useDispatch } from "react-redux";
import { setJwt } from "../slices/JwtSlice";
import { jwtDecode } from "jwt-decode";
import { setUser } from "../slices/UserSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (!value ? "Password is Required" : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    //console.log(values);
    setLoading(true);
    loginUser(values)
      .then((_data) => {
        //console.log(data);
        //console.log(jwtDecode(_data));
        const decodedUser: any = jwtDecode(_data);
        successNotification("Logged in Successfully !!!");
        // console.log(decodedUser);        
        //navigate(`${decodedUser?.role?.toLowerCase()}/dashboard`);
        dispatch(setJwt(_data));
        dispatch(setUser(decodedUser));
        // navigate("/dashboard");
      })
      .catch((error) => {
        //console.log(error);
        const errMsg = error.response?.data?.errorMessage;
        errorNotification(errMsg);
      }).finally(() => setLoading(false));
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
      style={{
        backgroundImage: 'url("/back.png")',
      }}
    >
      <div className="text-primary-400 flex gap-1 py-3 items-center">
        <PulseIcon size={50} stroke="2.5" />
        <span className="font-heading font-semibold text-4xl">HMIS</span>
      </div>
      <div className="w-[450px] backdrop-blur-md p-10 py-8 rounded-lg">
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex flex-col gap-5 
                  [&_input]:placeholder:neutral-100 [&_.mantine-Input-input]:!border-primary-950 [&_.mantine-Input-input]:!border 
                  [&_input]:!pl-2 [&_svg]:!text-dark [&_input]:!text-dark 
                  focus-within:[&_.mantine-Input-input]:!border-primary-500"
        >
          <div className="self-center font-medium font-heading text-dark text-2xl">
            Login
          </div>
          <TextInput
            className="transition duration-100"
            variant="unstyled"
            size="md"
            radius={"md"}
            placeholder="Enter Email"
            {...form.getInputProps("email")}
          />
          <PasswordInput
            variant="unstyled"
            size="md"
            radius={"md"}
            placeholder="Enter Password"
            {...form.getInputProps("password")}
          />
          <Button loading={loading} type="submit">Login</Button>
          <div className="text-neutral-700 text-sm self-center">
            Don't have an Account?{" "}
            <Link to={"/register"} className="hover:underline">
              Register Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
