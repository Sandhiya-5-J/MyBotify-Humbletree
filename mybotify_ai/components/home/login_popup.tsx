/* eslint-disable @typescript-eslint/no-explicit-any */
import { IoIosCloseCircle } from "react-icons/io";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  confirmResetPassword,
  loginUser,
  requestResetPassword,
} from "@/api/login";
import { getUserRole } from "@/lib/auth";
import toast from "react-hot-toast";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isSignUp: boolean;
};

type FormValues = {
  email: string;
  password: string;
  code: string;
  newPassword: string;
};

export default function LoginPopup({
  isOpen,
  onClose,
  isSignUp,
}: LoginModalProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const clickSignUp = () => {
    router.push("/signup");
  };

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const passwordValidation = {
    required: "Password is required",
    minLength: { value: 8, message: "At least 8 characters" },
    pattern: {
      value:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: "Must contain uppercase, lowercase, number & special character",
    },
  };

  const codeValidation = {
    required: "Code is required",
    minLength: { value: 6, message: "Invalid code, Check your Email" },
  };
  const onSubmit = async (value: FormValues) => {
    setLoading(true);
    try {
      await loginUser(value.email, value.password);
      toast.success("Successfully logged in!");
      // Role-based redirect
      const role = getUserRole();
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitVerify = async (value: FormValues) => {
    try {
      const res = await requestResetPassword(value.email);
      setIsReset(true);
      toast.success(res.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const onResetPassword = async (value: FormValues) => {
    try {
      const res = await confirmResetPassword(
        value.email,
        value.code,
        value.newPassword
      );
      setIsReset(false);
      setIsForgotPassword(false);
      reset();
      toast.success(res.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const clickClose = () => {
    onClose();
    setIsForgotPassword(false);
    setIsReset(false);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative w-96 bg-white rounded-lg shadow-lg p-6 z-10">
        {isForgotPassword && !isReset && (
          <div className="flex-column">
            <h3 className="font-bold text-start font-sans">Forgot Password</h3>
            <h3 className="text-sm text-[#888686] font-semibold text-start font-sans">
              Enter your email to reset password
            </h3>
            <form onSubmit={handleSubmit(onSubmitVerify)}>
              <div className="pt-5 ">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#888686]"
                >
                  Email
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                  })}
                  id="email"
                  className="w-full  p-2 border border-gray-300 rounded-lg outline-none "
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>
              <h1
                className="text-xs text-blue-500 pt-4 justify-end flex  font-semibold cursor-pointer hover:underline"
                onClick={() => setIsForgotPassword(false)}
              >
                Login ?
              </h1>
              <div className="pt-5 justify-center flex ">
                <button
                  className=" bg-[#2e3e48] text-white px-4 py-1 rounded-3xl font-medium hover:bg-[#162120] w-full"
                  type="submit"
                >
                  {isSubmitting ? "Loading..." : "Send OTP"}
                </button>
              </div>
            </form>
          </div>
        )}
        {!isForgotPassword && (
          <div className="flex-column">
            <h3 className="font-bold text-start font-sans">
              Login to MyBotify account
            </h3>
            <h3 className="text-sm text-[#888686] font-semibold text-start font-sans">
              continue to interact with AI
            </h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="pt-5 ">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#888686]"
                >
                  Email
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                  })}
                  id="email"
                  className="w-full  p-2 border border-gray-300 rounded-lg outline-none "
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>
              <div className="pt-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#888686]"
                >
                  Password
                </label>
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  id="password"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none "
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <h1
                className="text-xs text-blue-500 pt-4 justify-end flex  font-semibold cursor-pointer hover:underline"
                onClick={() => setIsForgotPassword(true)}
              >
                Forgot Password ?
              </h1>
              <div className="pt-5 justify-center flex ">
                <button
                  type="submit"
                  className=" bg-[#2e3e48] text-white px-4 py-1 rounded-3xl font-medium hover:bg-[#162120] w-full"
                  disabled={loading}
                >
                  {loading ? "loading...." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        )}
        {isReset && (
          <div className="flex-column">
            <h3 className="font-bold text-start font-sans">Reset Password</h3>
            <h3 className="text-sm text-[#888686] font-semibold text-start font-sans">
              Check your email for the verification code and enter it below to
              reset your password.
            </h3>
            <form onSubmit={handleSubmit(onResetPassword)}>
              <div className="pt-5 ">
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-[#888686]"
                >
                  Enter your Code
                </label>
                <input
                  type="code"
                  {...register("code", codeValidation)}
                  id="email"
                  className="w-full  p-2 border border-gray-300 rounded-lg outline-none "
                />
                {errors.code && (
                  <p className="text-red-500 text-xs">{errors.code.message}</p>
                )}
              </div>
              <div className="pt-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#888686]"
                >
                  New Password
                </label>
                <input
                  type="password"
                  {...register("newPassword", passwordValidation)}
                  id="newPassword"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none "
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              <h1
                className="text-xs text-blue-500 pt-4 justify-end flex  font-semibold cursor-pointer hover:underline"
                onClick={() => setIsReset(false)}
              >
                Change Email ?
              </h1>
              <div className="pt-5 justify-center flex ">
                <button
                  className=" bg-[#2e3e48] text-white px-4 py-1 rounded-3xl font-medium hover:bg-[#162120] w-full"
                  type="submit"
                >
                  {isSubmitting ? "Loading..." : "Verify"}
                </button>
              </div>
            </form>
          </div>
        )}

        <button
          onClick={() => clickClose()}
          className="absolute  top-3 right-3 text-red-400 hover:text-red-600"
        >
          <IoIosCloseCircle />
        </button>

        {isSignUp && (
          <h2 className="text-xs font-regular font-sans text-start pt-5 text-[#2E3E48]">
            New to MyBotify ?{" "}
            <span
              onClick={() => clickSignUp()}
              className="text-[#2E3E48] font-bold cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </h2>
        )}
      </div>
    </div>
  );
}
