"use client";
import { useState } from "react";
import BankServiceChargeForm from "../components/BankServiceChargeForm";

import BankServiceFileViewer from "./BankServiceFileViewer";
import BankViewer from "./bankViewer";

export default function Home() {
  const [declarationNumber, setDeclarationNumber] = useState<string>("");
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Left Column: Transport Fee Form */}
      <div className="w-full lg:w-1/3 p-4 border-r border-gray-200 lg:h-screen lg:overflow-y-auto">
        <BankServiceChargeForm declarationNumber={declarationNumber}
         onDeclarationNumberChange={setDeclarationNumber}/>
      </div>

      {/* Right Column: Warehouse Fee Form */}
      <div className="w-full lg:w-2/3 p-4 lg:h-screen lg:overflow-y-auto">
        <BankViewer declarationNumber={declarationNumber}/>
      </div>
    </div>
  );
}
