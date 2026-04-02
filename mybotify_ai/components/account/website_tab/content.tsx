"use client";
import { Input } from "@/components/ui/input";
import { SetStateAction, useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { IoSettings } from "react-icons/io5";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type AddAccountProps = {
  onClickTab: (tab: string) => void;
};

export default function ContentWebsite({ onClickTab }: AddAccountProps) {
  const [searchQuery, setSearchQuery] = useState("");

  type Account = {
    id: number;
    info: string;
    status: "Active" | "Inactive";
  };

  const accounts: Account[] = [
    { id: 1, info: "cassuals.com", status: "Active" },
    { id: 2, info: "kellyislands.com", status: "Inactive" },
    { id: 3, info: "averyverylongaccountname.com", status: "Active" },
    { id: 4, info: "johndoe.com", status: "Inactive" },
    { id: 5, info: "example4.com", status: "Active" },
    { id: 6, info: "example5.com", status: "Inactive" },
    { id: 7, info: "example6.com", status: "Active" },
    { id: 8, info: "testacc7unt.com", status: "Inactive" },
    { id: 9, info: "newacco8nt.com", status: "Active" },
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
          Add Account
        </button>
      </div>

      {/* Account Details */}
      <div>
        <h1 className="text-[#2e3e48] font-sans font-bold px-2">
          Account Details
        </h1>
      </div>
      <div>
        <h1 className="text-[#2e3e48] text-xl font-sans font-bold pt-2 px-2">
          Useremailid@email.com
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
                Account Info
              </h1>
            </div>
            <div className="w-1/3 px-4 text-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-sm">
                Account Status
              </h1>
            </div>
            <div className="w-1/3 px-4 text-right">
              <h1 className="text-[#2e3e48] font-sans font-bold text-sm">
                Action
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
                    className="text-[#2e3e48] font-sans text-sm font-medium"
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
                <div className="w-1/3 px-4 text-right flex justify-end items-center">
                  <Popover>
                    <PopoverTrigger className="px-6">
                      <IoSettings />
                    </PopoverTrigger>
                    <PopoverContent className="w-30 cursor-pointer">
                      <ol className="text-[#3CB106] pb-2">Active</ol>
                      <ol className="text-[#797979] pb-2">Inactive</ol>
                      <ol className="text-[#DBA304] pb-2">Edit</ol>
                      <ol
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-[#F20109]"
                      >
                        Delete
                      </ol>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-sm text-[#2E3E48]">
            No accounts found
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
