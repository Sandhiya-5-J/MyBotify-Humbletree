"use client";
import { IoIosCloseCircle } from "react-icons/io";
import { useRouter } from "next/navigation";
import { Key, useRef, useState } from "react";
import Image from "next/image";
import { resendOtp, verifyOtp } from "@/api/verify_otp";
import toast from "react-hot-toast";

type OtpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  email: string;
};

export default function OtpPopup({ isOpen, onClose, email }: OtpModalProps) {
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index] !== "") {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus(); // focus first input
  };
  const handleVerify = () => {
    const finalOtp = otp.join("");
    setLoading(true);
    if (finalOtp.length < 6) {
      setLoading(false);
      toast.error("Please enter a valid OTP");
      return;
    }

    verifyOtp(email, finalOtp)
      .then((response) => {
        console.log(response.data);
        toast.success("Email verified successfully! Please log in.");
        onClose();
        router.push("/");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response?.data?.detail || "Verification failed");
      })
      .finally(() => {
        setLoading(false); // stop loading
      });
  };

  const handleResend = () => {
    resendOtp(email)
      .then((response) => {
        console.log(response.data);
        clearOtp();
        toast.success(response.data.message);
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response?.data?.detail || "Resend failed");
      });
  };

  const clickClose = () => {
    onClose();
    clearOtp();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative w-[70%] bg-white rounded-lg shadow-lg  z-10 min-h-80">
        <div>
          <div className="w-full bg-[#2E3E48] h-40 rounded-b-[60%]">
            <Image
              src="/otp.svg"
              alt="Mybotify logo"
              className="max-w-full max-h-full object-contain absolute top-10 left-1/2 transform -translate-x-1/2"
              width={200}
              height={200}
            />
          </div>
          <button
            onClick={() => clickClose()}
            className="absolute  top-3 right-3 text-red-400 hover:text-red-600"
          >
            <IoIosCloseCircle size={30} />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 pt-24 text-center">
          Please verify your Email Id!
        </h2>
        <p className="text-sm text-gray-600 mt-2 text-center">
          {
            "We`ve sent a 6-digit verification code via Email. Please enter it below to continue"
          }
          .
        </p>
        <div className="flex justify-center mt-6 space-x-2">
          {otp.map(
            (
              digit: string | number | readonly string[] | undefined,
              idx: Key | null | undefined
            ) => (
              <input
                key={idx}
                ref={(el) => {
                  inputsRef.current[idx as number] = el;
                }}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx as number, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx as number, e)}
                className="w-12 h-14 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162120]"
              />
            )
          )}
        </div>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Verification code is sent to: <strong>{email}</strong>. For security
          reasons, the code will expire in <strong>10 minute</strong>.
        </p>
        <div className="pt-2 justify-center flex">
          <button
            className="text-red-500 text-sm mt-2 hover:underline text-center font-bold"
            onClick={() => handleResend()}
          >
            Resend code
          </button>
        </div>

        <div className="pt-5 justify-center flex pb-10 p-60">
          <button
            className=" bg-[#2e3e48] text-white px-4 py-2 rounded-3xl font-medium hover:bg-[#162120] w-full "
            onClick={() => handleVerify()}
            disabled={loading}
          >
            {loading ? "loading...." : "Verify code"}
          </button>
        </div>
      </div>
    </div>
  );
}
