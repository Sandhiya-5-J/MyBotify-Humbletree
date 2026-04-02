/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Input } from "@/components/ui/input";
import { SetStateAction, useState, useEffect, JSX } from "react";
import { FaSearch, FaFacebook, FaInstagram } from "react-icons/fa";
import { SiGoogleads } from "react-icons/si";
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { IoSettings } from "react-icons/io5";
import Image from "next/image";

type AddAccountProps = {
  onClickTab: (tab: string) => void;
  onClickInfo: (info: string) => void;
  domain: string;
  name: string;
};

export default function DomainInfo({
  onClickTab,
  onClickInfo,
  domain,
  name,
}: AddAccountProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [value, setValue] = useState(30);

  type Campaign = {
    id: number;
    name: string;
    status: string;
    icon: JSX.Element;
  };

  type Account = {
    id: number;
    info: string;
    status: string;
    campagin: Campaign[];
  };

  const accounts: Account[] = [
    {
      id: 1,
      info: "cassuals.com",
      status: "Active",
      campagin: [
        { id: 1, name: "facebook", status: "Active", icon: <FaFacebook /> },
        { id: 2, name: "Instagram", status: "Inactive", icon: <FaInstagram /> },
        { id: 3, name: "Google Ad", status: "Active", icon: <SiGoogleads /> },
      ],
    },
    {
      id: 2,
      info: "kellyislands.com",
      status: "Inactive",
      campagin: [
        { id: 1, name: "facebook", status: "Active", icon: <FaFacebook /> },
        { id: 2, name: "Instagram", status: "Active", icon: <FaInstagram /> },
        { id: 3, name: "Google Ad", status: "Inactive", icon: <SiGoogleads /> },
      ],
    },
    {
      id: 3,
      info: "averyverylongaccountname.com",
      status: "Active",
      campagin: [],
    },
    {
      id: 4,
      info: "johndoe.com",
      status: "Inactive",
      campagin: [
        { id: 1, name: "facebook", status: "Inactive", icon: <FaFacebook /> },
        { id: 2, name: "Instagram", status: "Active", icon: <FaInstagram /> },
        { id: 3, name: "Google Ad", status: "Inactive", icon: <SiGoogleads /> },
      ],
    },
  ];
  const filteredAccounts = accounts.filter((data) =>
    data.info.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rowsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(accounts);

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredAccounts.length / rowsPerPage);

  // Get the rows for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredAccounts.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Pagination handler
  const handlePageChange = (page: SetStateAction<number>) => {
    if (typeof page === "number" && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, data]);

  const handleDeleteAccount = (id: number) => {
    const updatedData = data.filter((account) => account.id !== id);
    setData(updatedData);
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header with Add Account Button */}
      <div className="w-full flex flex-row justify-end items-center px-2">
        <button
          onClick={() => onClickTab("add")}
          className="flex flex-row bg-[#8FFF5C] px-3 py-2 text-[#2E3E48] font-sans font-semibold rounded-3xl text-sm"
        >
          Active
        </button>
      </div>

      {/* Account Details */}
      <div>
        <h1 className="text-[#2e3e48] font-sans font-bold px-2">Domain Info</h1>
      </div>
      <div>
        <h1 className="text-[#2e3e48] text-xl font-sans font-bold pt-2 px-2">
          {name}
        </h1>
      </div>

      {/* Search Bar */}
      <div className="w-full flex flex-row justify-end py-4 px-2">
        <div className="relative w-[20%]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <FaSearch />
          </div>
          <Input
            className="w-full pl-10 bg-white outline-none border-2 border-gray-200 rounded-md text-sm"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content (Scrollable) */}
      <div className="flex-grow overflow-y-auto">
        {/* Table Header */}
        <div className="pb-4">
          <div className="bg-[#caf389] w-full h-10 flex flex-row items-center ">
            <div className="w-[25%] px-4  truncate">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs ">
                Content
              </h1>
            </div>
            <div className="w-[15%] px-4  truncate ">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Status
              </h1>
            </div>

            <div className="w-[10%] px-4  truncate flex flex-row justify-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Imperssion
              </h1>
            </div>
            <div className="w-[10%] px-4  truncate flex flex-row justify-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Reach
              </h1>
            </div>
            <div className="w-[10%] px-4  truncate flex flex-row justify-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Interaction
              </h1>
            </div>
            <div className="w-[10%] px-4  truncate flex flex-row justify-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Site Visits
              </h1>
            </div>
            <div className="w-[10%] px-4  truncate flex flex-row justify-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Budget Spend
              </h1>
            </div>
            <div className="w-[10%] px-4  truncate flex flex-row justify-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Action
              </h1>
            </div>
          </div>
        </div>

        {/* Table Rows */}
        {currentRows.length > 0 ? (
          currentRows.map((account, index) => (
            <div key={index} className="pb-4">
              <div className="bg-white w-full h-12 flex flex-row items-center">
                <div className="w-[25%] px-4  h-full">
                  <div className="flex flex-row items-center w-full h-full">
                    <div className="rounded-sm w-[28%] h-full p-1">
                      <Image
                        src="/logo.svg"
                        alt="Augmented reality illustration"
                        className="object-cover"
                        width={100}
                        height={100}
                      />
                    </div>
                    <div className="px-2 ">
                      <h1 className="text-[#2e3e48] font-sans text-xs font-medium cursor-pointer truncate">
                        The content of image
                      </h1>
                      <h1 className="text-[#2e3e48] font-sans text-xs font-medium cursor-pointer">
                        Instagram
                      </h1>
                    </div>
                  </div>
                </div>
                <div className="w-[15%] px-4 truncate ">
                  <h1 className="text-[#2e3e48] font-sans text-xs font-medium cursor-pointer">
                    Completed
                  </h1>
                  <h1 className="text-[#2e3e48] font-sans text-xs font-medium cursor-pointer">
                    Duration: 2 Months
                  </h1>
                </div>
                <div className="w-[10%] px-4  truncate flex flex-col justify-center items-center">
                  <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                    124
                  </h1>
                  <h1 className="text-[#2e3e48] font-sans text-xs font-medium cursor-pointer">
                    35.7%
                  </h1>
                </div>
                <div className="w-[10%] px-4  truncate flex flex-col justify-center items-center">
                  <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                    124
                  </h1>
                  <h1 className="text-[#2e3e48] font-sans text-xs font-medium cursor-pointer">
                    35.7%
                  </h1>
                </div>
                <div className="w-[10%] px-4  truncate flex flex-col justify-center items-center">
                  <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                    124
                  </h1>
                  <h1 className="text-[#2e3e48] font-sans text-xs font-medium cursor-pointer">
                    35.7%
                  </h1>
                </div>
                <div className="w-[10%] px-4 truncate flex flex-col justify-center items-center">
                  <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                    124
                  </h1>
                  <h1 className="text-[#2e3e48] font-sans text-sm font-medium cursor-pointer">
                    35.7%
                  </h1>
                </div>
                <div className="w-[10%]  flex flex-row item-center justify-center">
                  <AnimatedCircularProgressBar
                    max={100}
                    min={0}
                    value={value}
                    gaugePrimaryColor="rgb(202 243 137)"
                    gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                    className=" w-[40%]"
                  />
                </div>
                <div className="w-[10%] flex flex-row item-center justify-center">
                  <div className="text-[#2e3e48] font-sans font-bold text-xs">
                    <IoSettings />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-sm text-[#2E3E48]">
            No Domain found
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center py-4 px-2">
        <div className=" text-sm font-sans text-[#2e3e48]">
          Showing {currentRows.length} of {accounts.length} rows
        </div>
        <div className="flex items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-white bg-[#2e3e48] rounded-md"
          >
            <GrFormPrevious />
          </button>
          <span className="px-2 text-sm font-sans text-[#2e3e48]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-white bg-[#2e3e48] rounded-md"
          >
            <GrFormNext />
          </button>
        </div>
      </div>
    </div>
  );
}
