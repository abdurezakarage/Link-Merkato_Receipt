"use client";

import AccountantTaxViewer from "./components/AccountantTaxViewer";
import AccountantAllFileViewer from "./components/AccountantAllFileViewer";

export default function DashboardPage() {
  return (
    <div className="bg-white text-black min-h-screen container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Accountant Dashboard</h1>
      <p className="mb-6 text-gray-600">
        All tax information and file management in one place.
      </p>

      {/* Grid container with reduced gap and tighter layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column - Tax Viewer */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Tax Information</h2>
          <div className="h-[calc(100%-2rem)]">
            {" "}
            {/* Adjust height as needed */}
            <AccountantTaxViewer />
          </div>
        </div>

        {/* Right column - File Viewer */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-3">File Management</h2>
          <div className="h-[calc(100%-2rem)]">
            {" "}
            {/* Adjust height as needed */}
            <AccountantAllFileViewer />
          </div>
        </div>
      </div>
    </div>
  );
}
