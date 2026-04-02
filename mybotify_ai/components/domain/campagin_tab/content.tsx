"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { SiGoogleads } from "react-icons/si";

import { FaMoneyCheck } from "react-icons/fa6";
import { JSX } from "react";

export default function ContentCampagin() {
  interface Campaign {
    id: number;
    name: string;
    status: string;
    icon: JSX.Element;
  }

  interface Account {
    id: number;
    info: string;
    status: string;
    campagin: Campaign[];
  }

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

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header with Add Account Button */}
      <div className="w-full flex flex-row justify-end items-center px-2">
        <button className="flex flex-row bg-[#2e3e48] px-3 py-2 text-white font-sans font-semibold rounded-3xl text-sm">
          <div className="pr-2 pt-0.5 font-bold">
            <MdAdd />
          </div>
          Add Campagin
        </button>
      </div>
      {/* Account Details */}
      <div>
        <h1 className="text-[#2e3e48] text-2xl font-sans font-bold px-2">
          Domain Name
        </h1>
      </div>
      <div>
        <h1 className="text-[#2e3e48] text-sm font-sans font-bold pt-2 px-2">
          Overall revenue
        </h1>
      </div>
      <div>
        <h1 className="text-[#2e3e48] text-xl font-sans font-bold pt-2 px-2">
          $900.00
        </h1>
      </div>

      <div className="flex-grow  pt-2 bg-red-300">
        <div className="p-4">
          {accounts.map((account) => (
            <div key={account.id} className="mb-4">
              <h2 className="text-lg font-bold">{account.info}</h2>
              <p>Status: {account.status}</p>
              <ul>
                {account.campagin.map((campaign) => (
                  <li key={campaign.id} className="flex items-center gap-2">
                    {campaign.icon}
                    <span>{campaign.name} - {campaign.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-row justify-between items-center p-4">
          <div className="bg-white p-2 rounded-sm border-gray-500">
            <div className="flex flex-row gap-2 ">
              <div className="flex flex-col gap-1">
                <div className="text-sm">New Subscriptions</div>
                <div className="text-lg font-bold">0</div>
                <div className="text-xs text-[#797979]">
                  0 % of last month subscriptions
                </div>
              </div>
              <div className="bg-[#caf389] h-6 p-2 flex items-center rounded-sm">
                <FaMoneyCheck className="text-[#2e3e48]" />
              </div>
            </div>
          </div>
          <div className="bg-white p-2 rounded-sm border-gray-500">
            <div className="flex flex-row gap-2 ">
              <div className="flex flex-col gap-1">
                <div className="text-sm">New Order</div>
                <div className="text-lg font-bold">0</div>
                <div className="text-xs text-[#797979]">
                  0 % of last week order
                </div>
              </div>
              <div className="bg-[#caf389] h-6 p-2 flex items-center rounded-sm">
                <FaMoneyCheck className="text-[#2e3e48]" />
              </div>
            </div>
          </div>
          <div className="bg-white p-2 rounded-sm border-gray-500">
            <div className="flex flex-row gap-2 ">
              <div className="flex flex-col gap-1">
                <div className="text-sm">Avg. order revenue</div>
                <div className="text-lg font-bold">0.00</div>
                <div className="text-xs text-[#797979]">
                  0 % of last week order
                </div>
              </div>
              <div className="bg-[#caf389] h-6 p-2 flex items-center rounded-sm">
                <FaMoneyCheck className="text-[#2e3e48]" />
              </div>
            </div>
          </div>
        </div>
        <h1 className="text-[#2e3e48] text-sm font-sans font-bold p-4">
          Recent Campagin
        </h1>
        <div className="bg-blue-300 flex-grow ">hi</div>
      </div>
    </div>
  );
}
