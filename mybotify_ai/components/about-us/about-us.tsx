"use client";
import { useState } from "react";

import Image from "next/image";


import MainFooter from "../common/main_footer";
import { IoAnalytics, IoSearch } from "react-icons/io5";

import { GrTarget } from "react-icons/gr";
import { BsBarChartFill } from "react-icons/bs";
import MainHeader from "../common/main_header";
import LoginPopup from "../home/login_popup";
const features = [
    {
      id: 1,
      title: "Analyze customer behavior, buying patterns",
      icon: <IoSearch />,
    },
    {
      id: 2,
      title: "Spot trends and suggest winning strategies",
      icon: <IoAnalytics />,
    },
    {
      id: 3,
      title: "Maximize conversions with precise targeting",
      icon: <GrTarget />,
    },
    {
      id: 4,
      title:
        "Track performance with unified dashboard",
      icon: <BsBarChartFill />,
    },
  ];

export default function AboutUs() {

    const [isModalOpen, setIsModalOpen] = useState(false);
   
  
    return (
      <div className="flex flex-col min-h-screen bg-[#F1F5F2]">
         <MainHeader 
                onLoginClick={() => setIsModalOpen(true)}
                />
        <div className="flex flex-row flex-1 items-start pt-24 pb-[8%] px-20 gap-10">
          {/* Left: Content Section */}
          <div className="w-1/2 px-[5%]">
            <h4 className="text-[#2E3E48] font-light font-sans">
              <i>About MyBotify</i>
            </h4>
            <h1 className="text-4xl text-[#2E3E48] font-medium font-sans">
              AI-powered partner for scaling <br /> your Shopify store
            </h1>
            <p className="text-[#2E3E48] pt-4 text-lg font-light font-sans text-justify leading-relaxed">
              Our mission with MyBotify is to empower online store owners with the intelligence
              and automation tools they need to thrive in todays competitive eCommerce world.
              Whether you are just starting out or scaling up, MyBotify helps you make smarter
              and more profitable decisions across the platforms that matter most.
            </p>
          </div>

          {/* Right: Image Section */}
          <div className="w-1/2 flex justify-center items-start">
            <Image
              src="/aboutus.svg"
              alt="Mybotify logo"
              className="max-w-full max-h-full object-contain"
              width={500}
              height={500}
            />
          </div>
        </div>

        <div className="flex flex-1 justify-center pb-[5%]">
            
            <div className="w-[85%]">
                <div className="h-[50vh] rounded-lg flex flex-col bg-white p-2 relative flex-1 text-center outline-none border-grey-500 border-2 border-sizing ]
                      overflow-y-auto pt-4 no-scrollbar ">
                    <h1                    
                     className="text-4xl text-[#2E3E48] pt-10 font-medium font-sans "
                     
                    >Why MyBotify?</h1>
                    <h1 className="text-[#2E3E48] pt-4 px-10 text-lg font-light font-sans text-left">
                        Modern eCommerce is no longer about simply posting ads and waiting. Its about understanding your customers; how they behave, what they need, and when they are most likely to buy. MyBotify puts real AI power in your hands, helping you:                
                    </h1>

                    {/* features */}
                    <div className="w-full flex gap-6 px-20  pt-10  justify-center items-center">
                        {features.map((item) => (
                        <div
                             key={item.id}                             
                             className="w-1/4 bg-[#FFFFFF] py-4 px-2 rounded-2xl shadow-lg shadow-[#C0C0C0] relative border border-[#C0C0C0]"
                            >
                            <div className="absolute top-2 left-2 bg-[#CAF389] p-1.5 rounded-lg">
                                <span className="text-[#2E3E48] text-lg">{item.icon}</span>{" "}
                            </div>
                            <div className="mt-10">
                              <p className="text-[#2E3E48] text-sm justify-start">{item.title}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div> 
            </div>
                
        </div>
        <div className="flex flex-row flex-1 pt-10 pb-[5%]">
          {/* Left: Image Section */}
          <div className="w-1/2 flex items-center justify-center">
            <Image
              src="/dashboard.svg"
              alt="Mybotify logo"
              className="max-w-full max-h-full object-contain"
              width={500}
              height={500}
            />
          </div>

          {/* Right: Content Section */}
          <div className="w-1/2 pl-10 pr-[12%]">
            
            <h1 className="text-4xl text-[#2E3E48] font-medium font-sans">
            Smarter Campaigns, Seamless<br /> Shopify Integration 
            </h1>
            <h1 className="text-[#2E3E48] pt-4 text-lg font-light font-sans text-justify">
            Campaigns That Convert: With MyBotify, you do not need to jump between
            platforms or guess whats working. We provide a centralized, intelligent
            campaign dashboard that gives you instant visibility into whats driving clicks,
            conversations, and conversions.
            </h1>
            <h1 className="text-[#2E3E48] pt-4 text-lg font-light font-sans text-justify">
            Built for Shopify, Tailored for You: We focus exclusively on Shopify because we
            believe in doing one thing extremely well. MyBotify seamlessly integrates with
            your store, bringing you a plug-and-play AI solution that works in the
            background while you focus on running your business.
            </h1>
          </div>
        </div> 
        
        {/* footer */}
        <MainFooter />
        <LoginPopup
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isSignUp={true}
              />
        
      </div>
    );
  }
  