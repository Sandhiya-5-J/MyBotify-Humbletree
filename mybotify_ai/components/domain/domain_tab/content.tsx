/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Input } from "@/components/ui/input";
import { SetStateAction, useState, useEffect, JSX } from "react";
import { FaSearch, FaFacebook, FaInstagram } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { SiGoogleads } from "react-icons/si";

import { GrFormPrevious, GrFormNext } from "react-icons/gr";

type AddAccountProps = {
  onClickTab: (tab: string) => void;
  onClickInfo: (info: string, domainName: string) => void;
  domain: string;
};

export default function ContentDomain({
  onClickTab,
  onClickInfo,
  domain,
}: AddAccountProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
          className="flex flex-row bg-[#2e3e48] px-3 py-2 text-white font-sans font-semibold rounded-3xl text-sm"
        >
          <div className="pr-2 pt-0.5 font-bold">
            <MdAdd />
          </div>
          Add Domain
        </button>
      </div>

      {/* Account Details */}
      <div>
        <h1 className="text-[#2e3e48] font-sans font-bold px-2">
          Account Domain Details
        </h1>
      </div>
      <div>
        <h1 className="text-[#2e3e48] text-xl font-sans font-bold pt-2 px-2">
          {domain}
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
          <div className="bg-[#caf389] w-full h-10 flex flex-row items-center">
            <div className="w-1/3 px-4">
              <h1 className="text-[#2e3e48] font-sans font-bold text-sm">
                Domain Info
              </h1>
            </div>
            <div className="w-1/3 px-4 text-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-sm">
                Domain Status
              </h1>
            </div>
            <div className="w-1/2 px-4 text-start">
              <h1 className="text-[#2e3e48] font-sans font-bold text-sm">
                Campaign
              </h1>
            </div>
          </div>
        </div>

        {/* Table Rows */}
        {currentRows.length > 0 ? (
          currentRows.map((account, index) => (
            <div key={index} className="pb-4">
              <div className="bg-white w-full h-10 flex flex-row items-center">
                {/* Account Info */}
                <div className="w-1/3 px-4 truncate">
                  <h1
                    onClick={() => onClickInfo("info", account.info)}
                    className="text-[#2e3e48] font-sans text-sm font-medium cursor-pointer"
                    title={account.info}
                  >
                    {account.info}
                  </h1>
                </div>

                {/* Account Status */}
                <div className="w-1/3 px-4 flex justify-center items-center">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-lg text-[#162120] ${
                      account.status === "Active"
                        ? "bg-[#8FFF5C] "
                        : "bg-[#E5E5E5] "
                    }`}
                  >
                    {account.status}
                  </span>
                </div>

                {/* Action */}
                <div className="w-1/2 px-4 text-right flex flex-row gap-4 justify-start items-center">
                  {account.campagin.length > 0 ? (
                    account.campagin.map(
                      (campaign: {
                        id: number;
                        name: string;
                        status: string;
                        icon: JSX.Element;
                      }) => (
                        <span
                          key={campaign.id}
                          className={`px-2 py-1 gap-1 flex flex-row justify-center items-center text-xs font-medium rounded-2xl  ${
                            campaign.status === "Active"
                              ? "bg-white border-2 border-gray-200"
                              : "bg-[#E5E5E5] "
                          }  ${
                            campaign.name === "facebook" &&
                            campaign.status === "Active"
                              ? `text-[#1877F2]`
                              : campaign.name === "Instagram" &&
                                campaign.status === "Active"
                              ? `bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent`
                              : campaign.name === "Google Ad" &&
                                campaign.status === "Active"
                              ? `text-black`
                              : `text-black`
                          }`}
                        >
                          <div
                            className={`${
                              campaign.name === "facebook" &&
                              campaign.status === "Active"
                                ? `text-[#1877F2]`
                                : campaign.name === "Instagram" &&
                                  campaign.status === "Active"
                                ? `text-[#E4405F]`
                                : campaign.name === "Google Ad" &&
                                  campaign.status === "Active"
                                ? `text-green-600`
                                : `text-[black`
                            } text-sm`}
                          >
                            {campaign.icon}
                          </div>
                          {campaign.name}
                        </span>
                      )
                    )
                  ) : (
                    <div className="text-xs text-[#888686]">
                      No Campaign found
                    </div>
                  )}
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
