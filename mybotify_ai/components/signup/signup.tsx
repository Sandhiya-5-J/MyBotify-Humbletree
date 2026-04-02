
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FaHandshake } from "react-icons/fa";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { useForm, Controller } from "react-hook-form";

import Select from "react-select";
import LoginPopup from "../home/login_popup";
import OtpPopup from "./otp";
import Image from "next/image";
import MainFooter from "../common/main_footer";
import { registerUser } from "@/api/signup";
import countryOptions from "../common/country";

type FormValues = {
  name: string;
  email: string;
  countryCode: { value: string; label: string };
  phoneNumber: string;
  password: string;
};

export default function SignUp() {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOtp, setIsOtp] = useState(false);
  const [checked, setChecked] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<FormValues>();

  const selectedCountry = watch("countryCode", countryOptions[0]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      const role = getUserRole();
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    }
  }, [router]);

  // Phone validation based on country
  const getPhoneValidation = () => {
    switch (selectedCountry?.value) {
      case "+91":
        return {
          pattern: /^[6-9]\d{9}$/,
          message: "Enter a valid 10-digit Indian phone number",
        };
      case "+1":
        return {
          pattern: /^[2-9]\d{2}[2-9]\d{6}$/,
          message: "Enter a valid 10-digit US phone number",
        };
      case "+44":
        return {
          pattern: /^7\d{9}$/,
          message: "Enter a valid UK mobile number (7XXXXXXXXX)",
        };
      case "+61":
        return {
          pattern: /^4\d{8}$/,
          message: "Enter a valid Australian mobile number (4XXXXXXXX)",
        };
      default:
        return { required: "Phone number is required" };
    }
  };

  // Password validation
  const passwordValidation = {
    required: "Password is required",
    minLength: { value: 8, message: "At least 8 characters" },
    pattern: {
      value:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: "Must contain uppercase, lowercase, number & special character",
    },
  };

  const onSubmit = async (value: FormValues) => {
    if (!checked) {
      alert("Please accept the terms and conditions");
      return;
    }

    setLoading(true);

    const payload = {
      name: value.name,
      email: value.email,
      password: value.password,
      phone_number: value.phoneNumber,
    };

    try {
      const response = await registerUser(payload);
      setEmail(value.email);

      // null or undefined means auto-verified (dev mode) — skip OTP, open login
      if (response?.email_verification == null) {
        alert("Account created successfully! Please log in.");
        setIsModalOpen(true);
      } else {
        // Production: OTP sent to email, show OTP popup
        setIsOtp(true);
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F2]">
      <div className="flex items-center justify-center  pt-6 ">
        <div>
          <h1
            className="text-2xl font-bold text-[#2E3E48] font-sans cursor-pointer"
            onClick={() => router.back()}
          >
            MyBotify<span className="font-normal font-sans">.com</span>
          </h1>
        </div>
      </div>
      <div className="flex flex-1">
        <div className="w-3/4 ">
          <div className="px-20 pt-8 ">
            <h1 className="text-xl text-[#162120] font-bold font-sans">
              Get Started with MyBotify
            </h1>
            <h1 className="text-[#162120]  text-lg font-light font-sans">
              Power up your Shopify campaigns with AI-driven automation. Sign up
              in seconds !
            </h1>
            <h2 className="text-lg font-light font-sans text-start  text-[#162120]">
              Already have an account ?{" "}
              <span
                onClick={() => setIsModalOpen(true)}
                className="text-[#162120] font-bold cursor-pointer hover:underline"
              >
                Log in
              </span>
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 w-[80%] pt-3"
            >
              {/* Name */}
              <div>
                <label className="block text-gray-700 pb-1">Name</label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full  py-2 border rounded-md p-3  outline-none resize-none"
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium pb-1">Email</label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                  })}
                  className="w-full px-3 py-2 border rounded-md  outline-none resize-none"
                  placeholder="Your email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>
              {/* Country Code & Phone Number */}
              <div>
                <label className="block text-sm font-medium">
                  Phone Number
                </label>
                <div className="flex items-center space-x-2 pt-1">
                  {/* Country Code Dropdown */}
                  <Controller
                    name="countryCode"
                    control={control}
                    defaultValue={countryOptions[0]}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={countryOptions}
                        className="w-[40%] h-full outline-none border-none resize-none"
                        classNamePrefix="react-select"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            height: "40px",
                            minHeight: "40px",
                          }),
                        }}
                      />
                    )}
                  />
                  {/* Phone Number Input */}
                  <input
                    type="tel"
                    {...register("phoneNumber", {
                      required: "Phone number is required",
                      ...getPhoneValidation(),
                    })}
                    className="w-full px-3 py-2 border rounded-md h-10 outline-none resize-none"
                    placeholder="Your contact number"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
              {/* Password */}
              <div>
                <label className="block text-sm font-medium pb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password", passwordValidation)}
                  className="w-full px-3 py-2 border rounded-md h-10 outline-none resize-none"
                  placeholder="Secure password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4  ">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setChecked(!checked)}
                  className="w-4 h-4 accent-[#2E3E48]"
                />
                <h1 className="text-[#162120] text-sm font-regular">
                  I agree to the{" "}
                  <a href="#" className="text-[#2E3E48] underline">
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-[#2E3E48] underline">
                    Privacy Policy
                  </a>
                </h1>
              </div>

              <div className="border-t border-gray-300 my-4 w-[90%]"></div>

              <div className="flex flex-col items-center  text-[#162120] w-full ">
                <FaHandshake size={24} color="#2E3E48" />
                <p className="text-sm justify-stretch pt-2 leading-6">
                  Why MyBotify? Effortlessly run AI-powered campaigns with
                  automated ad optimization and seamless Shopify integration;
                  ensuring your data is always encrypted & secure.
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-[#2E3E48] text-white py-2 rounded-md text-lg hover:bg-[#162120] items-center justify-center flex gap-2"
                disabled={loading}
              >
                {loading ? "loading...." : "Sign up"}
              </button>
            </form>
          </div>
        </div>

        <div className="w-1/2 pt-20">
          <Image
            src="/logo.svg"
            alt="Mybotify logo"
            className="max-w-full max-h-full object-contain"
            width={500}
            height={500}
          />
        </div>
      </div>

      {/* footer */}
      <MainFooter />
      <LoginPopup
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSignUp={false}
      />
      <OtpPopup
        isOpen={isOtp}
        onClose={() => setIsOtp(false)}
        email={email}
      ></OtpPopup>
    </div>
  );
}
