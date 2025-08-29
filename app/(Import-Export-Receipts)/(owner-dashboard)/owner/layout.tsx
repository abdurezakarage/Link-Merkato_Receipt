"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiTruck,
  FiPackage,
  FiFileText,
  FiCheckCircle,
  FiMenu, // New import for the mobile menu icon
  FiX, // New import for the close icon
} from "react-icons/fi";

// The function name must start with an uppercase letter to be a valid React component
export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage mobile sidebar visibility

  const navItems = [
    {
      href: "/owner",
      label: "Dashboard",
      icon: <FiHome className="w-5 h-5" />,
    },
    {
      href: "/owner/clearance",
      label: "transitor",
      icon: <FiCheckCircle className="w-5 h-5" />,
    },
    {
      href: "/owner/custom-documents",
      label: "Custom",
      icon: <FiFileText className="w-5 h-5" />,
    },
    {
      href: "/owner/transport-fee",
      label: "Transport Fee",
      icon: <FiTruck className="w-5 h-5" />,
    },
    {
      href: "/owner/warehouse-fee",
      label: "Warehouse Fee",
      icon: <FiPackage className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-15 left-4 z-50 p-2 rounded-md text-gray-700 md:hidden bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-white w-64 h-screen fixed top-0 left-0 text-black p-6 z-40 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:bg-gray-800 md:text-white`}
      >
        <h2 className="text-xl font-bold mb-8">Owner Portal</h2>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                pathname === href
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setIsSidebarOpen(false)} // Close sidebar on link click
            >
              <span className="mr-3">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content with adjusted margin and padding */}
      <main className={`flex-1 p-8 ${isSidebarOpen ? "md:ml-64" : "md:ml-0"}`}>
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
