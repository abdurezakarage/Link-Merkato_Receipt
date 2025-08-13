"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiTruck,
  FiPackage,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";

// The function name must start with an uppercase letter to be a valid React component
export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/owner",
      label: "Dashboard",
      icon: <FiHome className="w-5 h-5" />,
    },
    {
      href: "/owner/clearance",
      label: "Clearance",
      icon: <FiCheckCircle className="w-5 h-5" />,
    },
    {
      href: "/owner/custom-documents",
      label: "Custom Documents",
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
      <aside className="w-64 h-screen fixed top-0 left-0 bg-gray-800 text-white p-6">
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
            >
              <span className="mr-3">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
          {children}
        </div>
      </main>
    </div>
  );
}