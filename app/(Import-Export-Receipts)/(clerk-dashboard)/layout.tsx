"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBuilding,
  FaFileInvoice,
  FaFileSignature,
  FaWarehouse,
  FaCheckCircle,
  FaUniversity,
  FaFileAlt,
  FaCaretDown,
  FaCar,
  FaClipboardCheck,
} from "react-icons/fa";

const navItems = [
  { href: "/declaration", label: "Declaration", icon: <FaFileSignature /> },
  // {
  //   href: "/customFileViewer",
  //   label: "Custom document",
  //   icon: <FaCheckCircle />,
  // },
  { href: "/warehouse-fee", label: "Warehouse Fee", icon: <FaWarehouse /> },
  { href: "/transport", label: "Transport Fee", icon: <FaCar /> },
  {
    href: "/custom-transitor",
    label: "Custom transitor",
    icon: <FaCheckCircle />,
  },
  { href: "/bank-service", label: "Bank Service", icon: <FaUniversity /> },
  {
    href: "/commercial-invoice",
    label: "Commercial Invoice",
    icon: <FaFileInvoice />,
  },
  {
    href: "/inland2",
    label: "inland2 ",
    icon: <FaFileInvoice />,
  },
  {
    href: "/",
    label: "history ",
    icon: <FaFileInvoice />,
  },
];

export default function ClerkDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showDocuments, setShowDocuments] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* White Sidebar */}
      <aside className="w-64 h-screen fixed top-4 left-0 bg-white shadow-lg text-black p-4 flex flex-col overflow-y-auto border-r border-gray-200">
        <div className="flex-shrink-0 mb-6 mt-2 px-2">
          <h2 className="text-xl font-bold text-gray-900 tracking-wide">
            Clerk Panel
          </h2>
          <p className="text-lg text-black-500 mt-1">Document Management</p>
        </div>

        <nav className="flex-grow flex flex-col space-y-1">
          {navItems.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-sm ${
                pathname === href
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="mr-3 text-base text-gray-500">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}

          {/* Documents Dropdown */}
          {/* <button
            onClick={() => setShowDocuments(!showDocuments)}
            className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-all duration-200 focus:outline-none text-sm ${
              pathname.includes("FileViewer")
                ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center">
              <span className="mr-3 text-base text-gray-500">
                <FaFileAlt />
              </span>
              <span>Documents</span>
            </span>
            <FaCaretDown
              className={`transform transition-transform duration-200 ${
                showDocuments ? "rotate-180" : ""
              }`}
              size={14}
            />
          </button> */}

          {/* {showDocuments && (
            <div className="ml-4 space-y-1 mt-1 border-l-2 border-gray-200 pl-2">
              <Link
                href="/customFileViewer"
                className={`block px-3 py-2 rounded text-sm transition-colors duration-200 ${
                  pathname === "/customFileViewer"
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                Custom
              </Link>
              <Link
                href="/wareHouseFileViewer"
                className={`block px-3 py-2 rounded text-sm transition-colors duration-200 ${
                  pathname === "/wareHouseFileViewer"
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                Warehouse
              </Link>
              <Link
                href="/transportFileViewer"
                className={`block px-3 py-2 rounded text-sm transition-colors duration-200 ${
                  pathname === "/transportFileViewer"
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                Transport
              </Link>
              <Link
                href="/clearanceFileViewer"
                className={`block px-3 py-2 rounded text-sm transition-colors duration-200 ${
                  pathname === "/clearanceFileViewer"
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                Clearance
              </Link>
            </div>
          )} */}
        </nav>
      </aside>

      {/* Main content with adjusted margin */}
      <main className="ml-64 flex-1 p-6 bg-white overflow-auto">
        {children}
      </main>
    </div>
  );
}
