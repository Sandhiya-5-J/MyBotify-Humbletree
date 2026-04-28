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
import { getMyWebsites, createWebsite, updateWebsite, deleteWebsite } from "@/api/website";

type AddAccountProps = {
  onClickTab: (tab: string) => void;
};

type WebsiteItem = {
  id: number;
  url: string;
  name: string;
  status: string;
  is_active: boolean;
};

export default function ContentWebsite({ onClickTab }: AddAccountProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      const data = await getMyWebsites();
      if (data) {
        setWebsites(
          data.map((w: any) => ({
            id: w.id,
            url: w.url,
            name: w.name || w.url,
            status: w.status || (w.is_active ? "Active" : "Inactive"),
            is_active: w.is_active,
          }))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleAddWebsite = async () => {
    if (!newUrl.trim()) return;
    setIsSubmitting(true);
    try {
      await createWebsite({ url: newUrl.trim(), name: newName.trim() || undefined });
      setNewUrl("");
      setNewName("");
      setShowAddModal(false);
      fetchWebsites();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateWebsite(id, { status: newStatus });
      fetchWebsites();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteWebsite = async (id: number) => {
    try {
      await deleteWebsite(id);
      fetchWebsites();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredWebsites = websites.filter((w) =>
    (w.name || w.url).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rowsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(filteredWebsites.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredWebsites.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page: SetStateAction<number>) => {
    if (typeof page === "number" && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#2e3e48]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header with Add Website Button */}
      <div className="w-full flex flex-row justify-end items-center px-2">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex flex-row bg-[#2e3e48] px-3 py-2 text-white font-sans font-semibold rounded-3xl text-sm"
        >
          <div className="pr-2 pt-0.5 font-bold">
            <MdAdd />
          </div>
          Add Website
        </button>
      </div>

      {/* Account Details */}
      <div>
        <h1 className="text-[#2e3e48] font-sans font-bold px-2">
          Website Details
        </h1>
      </div>
      <div>
        <h1 className="text-[#2e3e48] text-xl font-sans font-bold pt-2 px-2">
          My Websites
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
                Website Info
              </h1>
            </div>
            <div className="w-1/3 px-4 text-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-sm">
                Status
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
          currentRows.map((website) => (
            <div key={website.id} className="pb-4">
              <div className="bg-white w-full h-10 flex flex-row items-center">
                {/* Website Info */}
                <div className="w-1/3 px-4 truncate">
                  <h1
                    className="text-[#2e3e48] font-sans text-sm font-medium"
                    title={website.url}
                  >
                    {website.name || website.url}
                  </h1>
                </div>

                {/* Website Status */}
                <div className="w-1/3 px-4 flex justify-center items-center">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-lg text-[#162120] ${
                      website.status === "Active"
                        ? "bg-[#8FFF5C] "
                        : "bg-[#E5E5E5] "
                    }`}
                  >
                    {website.status}
                  </span>
                </div>

                {/* Action */}
                <div className="w-1/3 px-4 text-right flex justify-end items-center">
                  <Popover>
                    <PopoverTrigger className="px-6">
                      <IoSettings />
                    </PopoverTrigger>
                    <PopoverContent className="w-30 cursor-pointer">
                      <ol
                        onClick={() => handleStatusChange(website.id, "Active")}
                        className="text-[#3CB106] pb-2"
                      >
                        Active
                      </ol>
                      <ol
                        onClick={() => handleStatusChange(website.id, "Inactive")}
                        className="text-[#797979] pb-2"
                      >
                        Inactive
                      </ol>
                      <ol
                        onClick={() => handleDeleteWebsite(website.id)}
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
            {websites.length === 0
              ? "No websites added yet. Click 'Add Website' to get started."
              : "No websites found"}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center py-4 px-2">
        <div className=" text-sm font-sans text-[#2e3e48]">
          Showing {currentRows.length} of {filteredWebsites.length} rows
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

      {/* Add Website Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-[#2e3e48] mb-4">Add New Website</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Website URL</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="example.com"
                  className="mt-1 w-full p-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Display Name (Optional)</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Website"
                  className="mt-1 w-full p-2 border rounded text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowAddModal(false); setNewUrl(""); setNewName(""); }}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWebsite}
                disabled={!newUrl.trim() || isSubmitting}
                className="bg-[#2e3e48] text-white px-4 py-2 rounded font-semibold text-sm disabled:opacity-50"
              >
                {isSubmitting ? "Adding..." : "Add Website"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
