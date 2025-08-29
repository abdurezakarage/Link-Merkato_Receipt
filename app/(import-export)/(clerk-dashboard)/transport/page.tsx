"use client";

import TransportForm from "../components/transportForm";
import TransportFileViewer from "../components/transportFileViewer";

export default function MainLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* First Column: Receipt Upload Form */}
      <div className="w-full lg:w-1/3 p-4 border-r border-gray-200 lg:h-screen lg:overflow-y-auto">
        <TransportForm />
      </div>

      {/* Second Column: Warehouse File Viewer */}
      <div className="w-full lg:w-2/3 p-4 lg:h-screen lg:overflow-y-auto">
        <TransportFileViewer />
      </div>
    </div>
  );
}
