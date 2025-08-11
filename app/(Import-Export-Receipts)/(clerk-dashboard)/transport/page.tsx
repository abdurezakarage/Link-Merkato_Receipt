"use client";

import TransportFeeForm from "../components/transportForm";
import WarehouseFeeForm from "../components/transportFileViewer";

export default function Home() {
  return (
    <div className="flex flex-col bg-gray-100">
      {/* Left Column: Transport Fee Form */}
      <div className="w-full lg:w-1/3 p-4 border-r border-gray-200  lg:overflow-y-auto">
        <TransportFeeForm />
      </div>

      {/* Right Column: Warehouse Fee Form */}
      <div className="w-full lg:w-2/3 p-4 lg:h-screen lg:overflow-y-auto">
        <WarehouseFeeForm />
      </div>
    </div>
  );
}
