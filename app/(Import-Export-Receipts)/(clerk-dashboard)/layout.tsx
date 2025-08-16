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
  { href: "/transport", label: "Transport Fee", icon: <FaCar /> },
  { href: "/declaration", label: "Declaration", icon: <FaFileSignature /> },
  { href: "/warehouse-fee", label: "Warehouse Fee", icon: <FaWarehouse /> },
  {
    href: "/custom-clearance",
    label: "Custom Clearance",
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
];

export default function ClerkDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showDocuments, setShowDocuments] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Adjusted Sidebar - pulled left with transform */}
      <aside className="w-56 h-screen fixed top-0 left-0 -translate-x-[2px] bg-slate-900 shadow-xl text-white p-3 flex flex-col overflow-y-auto border-r border-slate-700">
        <div className="flex-shrink-0 mb-6 mt-2 px-2">
          <h2 className="text-xl font-bold text-white tracking-wide">
            Clerk Panel
          </h2>
          <p className="text-xs text-slate-400 mt-1">Document Management</p>
        </div>

        <nav className="flex-grow flex flex-col space-y-1">
          {navItems.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                pathname === href
                  ? "bg-slate-700 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="mr-2 text-base">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}

          {/* Documents Dropdown */}
          <button
            onClick={() => setShowDocuments(!showDocuments)}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none text-sm ${
              pathname.includes("FileViewer")
                ? "bg-slate-700 text-white shadow-md"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="flex items-center">
              <span className="mr-2 text-base">
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
          </button>

          {showDocuments && (
            <div className="ml-4 space-y-1 mt-1 border-l-2 border-slate-600 pl-2">
              <Link
                href="/customFileViewer"
                className={`block px-3 py-1 rounded text-xs transition-colors duration-200 ${
                  pathname === "/customFileViewer"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Custom
              </Link>
              <Link
                href="/wareHouseFileViewer"
                className={`block px-3 py-1 rounded text-xs transition-colors duration-200 ${
                  pathname === "/wareHouseFileViewer"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Warehouse
              </Link>
              <Link
                href="/transportFileViewer"
                className={`block px-3 py-1 rounded text-xs transition-colors duration-200 ${
                  pathname === "/transportFileViewer"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Transport
              </Link>
              <Link
                href="/clearanceFileViewer"
                className={`block px-3 py-1 rounded text-xs transition-colors duration-200 ${
                  pathname === "/clearanceFileViewer"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Clearance
              </Link>
            </div>
          )}
        </nav>
      </aside>

      {/* Main content with adjusted margin */}
      <main className="ml-[calc(224px-2px)] flex-1 p-6 bg-white overflow-auto">
        {children}
      </main>
    </div>
  );
}
