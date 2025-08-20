"use client";

import AccountantTaxViewer from "./components/AccountantTaxViewer";
import AccountantAllFileViewer from "./components/AccountantAllFileViewer";

export default function DashboardPage() {
  return (
    <div className="bg-green text-black min-h-screen w-full p-4">
      {/* Centered header section */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Accountant Dashboard</h1>
        <p className="text-gray-600">
          All tax information and file management in one place.
        </p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column - Tax Viewer */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Tax Information</h2>
          <div className="h-[calc(100%-2rem)]">
            <AccountantTaxViewer />
          </div>
        </div>

        {/* Right column - File Viewer */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-3">File Management</h2>
          <div className="h-[calc(100%-2rem)]">
            <AccountantAllFileViewer />
          </div>
        </div>
      </div>
    </div>
  );
}
