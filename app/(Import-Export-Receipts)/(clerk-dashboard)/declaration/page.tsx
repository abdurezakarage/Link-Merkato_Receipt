"use client";

import DeclarationForm from "../components/DeclarationForm";
import CUstomFile from "../components/customFileViewer";

export default function MainLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* First Column: Receipt Upload Form */}
      <div className="w-full lg:w-1/2 p-4 border-r border-gray-200 lg:h-screen lg:overflow-y-auto">
        <DeclarationForm />
      </div>

      {/* Second Column: Warehouse File Viewer */}
      <div className="w-full lg:w-1/2 p-4 lg:h-screen lg:overflow-y-auto">
        <CUstomFile />
      </div>
    </div>
  );
}
