

"use client";
import CommercialInvoiceForm from "../components/CommercialInvoiceForm";
import CommercialInvoiceFileViewer from "./CommercialInvoiceFileViewer";

export default function Home() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Left Column: Transport Fee Form */}
      <div className="w-full lg:w-1/3 p-4 border-r border-gray-200 lg:h-screen lg:overflow-y-auto">
        <CommercialInvoiceForm />
      </div>

      {/* Right Column: Warehouse Fee Form */}
      <div className="w-full lg:w-2/3 p-4 lg:h-screen lg:overflow-y-auto">
        <CommercialInvoiceFileViewer />
      </div>
    </div>
  );
}
