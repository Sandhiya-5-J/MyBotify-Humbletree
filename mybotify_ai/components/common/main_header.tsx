"use client";
import { useRef, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getUserRole, removeToken } from "@/lib/auth";

type LoginModalProps = {
  onLoginClick: () => void;
};

export default function MainHeader({
  onLoginClick
}: LoginModalProps) {
    const router = useRouter();
    const pathname = usePathname();
    const channelTab = useRef<Window | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
      setIsLoggedIn(isAuthenticated());
      setRole(getUserRole());
    }, [pathname]);

    const clickLogout = () => {
        removeToken();
        setIsLoggedIn(false);
        setRole(null);
        router.refresh();
    };

    const clickProfile = () => {
        if (role === "admin") {
            router.push("/admin");
        } else {
            router.push("/account");
        }
    };
    const handleChannelClick = () => {
  const url = "https://whatsapp.mybotify.com/";

  if (!channelTab.current || channelTab.current.closed) {
    channelTab.current = window.open(url, "_blank");
  } else {
    channelTab.current.focus(); // Focus the tab if it's already open
  }
};
  return (
    <div className="flex items-center justify-between px-20 pt-8 ">
        <div>
          <h1 className="text-2xl font-bold text-[#2E3E48] font-sans">
            MyBotify<span className="font-normal font-sans cursor-pointer" onClick={() => router.back()}>.com</span>
          </h1>
        </div>
        <div className="flex gap-10 items-center">
           <nav className="flex gap-8 font-sans text-[#2E3E48] font-medium">
             <Button variant="ghost" className="hover:underline font-sans text-[#2E3E48] p-1 font-medium" onClick={() => router.push("/about-us")}>
        About us
      </Button>
     
    <Button
    variant="ghost"
  onClick={handleChannelClick}
  className="hover:underline font-sans text-[#2E3E48] p-1 font-medium"
>
  Channel
</Button>
      <Button variant="ghost" className="hover:underline font-sans text-[#2E3E48] p-1 font-medium">
       Support
      </Button>
     
    </nav>
    <div className="flex gap-4">
          {isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                onClick={clickProfile}
                className="px-4 py-2 font-sans text-[#2E3E48] font-medium"
              >
                Profile
              </Button>
              <Button
                onClick={clickLogout}
                className="px-4 py-2 font-sans bg-[#162120] text-white rounded-3xl font-medium"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={onLoginClick}
                className="px-4 py-2 font-sans text-[#2E3E48] font-medium"
              >
                Log in
              </Button>
              <Button
                onClick={() => router.push("/signup")}
                className="px-4 py-2 font-sans bg-[#162120] text-white rounded-3xl font-medium"
              >
                Sign up
              </Button>
            </>
          )}
        </div>
        </div>
        
      </div>)
};

