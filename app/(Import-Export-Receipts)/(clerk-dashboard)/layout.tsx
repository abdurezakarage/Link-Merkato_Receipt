"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBars, // New import for the mobile menu icon
  FaTimes, // New import for the close icon
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile menu
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-15 left-4 z-50 p-2 rounded-md text-gray-700 md:hidden bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* White Sidebar */}
      <aside
        className={`w-64 h-screen fixed top-0 left-0 bg-white shadow-lg text-black p-4 flex flex-col overflow-y-auto border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:top-4 md:left-0 md:h-[calc(100vh-2rem)] md:rounded-lg`}
      >
        {/* Adjusted top and left for md screens to maintain layout */}
        <div className="flex-shrink-0 mb-6 mt-2 px-2 md:mt-0">
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
              onClick={() => setIsSidebarOpen(false)} // Close sidebar on link click
            >
              <span className="mr-3 text-base text-gray-500">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content with adjusted margin and padding */}
      <main
        className={`flex-1 p-6 bg-white overflow-auto ${
          isSidebarOpen ? "md:ml-64" : "md:ml-0"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
