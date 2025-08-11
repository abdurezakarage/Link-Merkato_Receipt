"use client";

import AccountantTaxViewer from "./components/AccountantTaxViewer";
import AccountantAllFileViewer from "./components/AccountantAllFileViewer";

export default function DashboardPage() {
  return (
    <div className="bg-white text-black min-h-screen container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Accountant Dashboard</h1>
      <p className="mb-8">
        All tax information and file management in one place.
      </p>

      {/* Grid container for parallel columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Tax Viewer */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tax Information</h2>
          <AccountantTaxViewer />
        </div>

        {/* Right column - File Viewer */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">File Management</h2>
          <AccountantAllFileViewer />
        </div>
      </div>
    </div>
  );
}