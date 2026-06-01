import {
  Button,
  PasswordInput,
  SegmentedControl,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { PulseIcon } from "@phosphor-icons/react";
import React from "react";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const form = useForm({
    initialValues: {
      type: "PATIENT",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (!value ? "Password is Required" : null),
      confirmPassword: (value, values) => (value === values.password ? null : "Password didn't matched"),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log(values);
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
            Register
          </div>
          <SegmentedControl
            fullWidth
            size="md"
            color="#32b9a9" bg={'#cff8ef'}
            className="[&_*]:!text-dark border border-primary-700"
            data={[{label:'Patient', value:"PATIENT"}, {label:'Doctor', value:"DOCTOR"}, {label:'Admin', value:"ADMIN"}]}
            {...form.getInputProps("type")}
          />
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
          <PasswordInput
            variant="unstyled"
            size="md"
            radius={"md"}
            placeholder="Re-Enter Password"
            {...form.getInputProps("confirmPassword")}
          />
          <Button type="submit">Register</Button>
          <div className="text-neutral-700 text-sm self-center">
            Already have an Account?{" "}
            <Link to={"/login"} className="hover:underline">
              Click Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
