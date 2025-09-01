"use client";
import { useState } from "react";
import TransitorForm from "../components/TransitorForm";
import ClearanceFileViewer from "../components/clearanceFileViewer";
import ClearanceViewer from "./clearanceViewer";


export default function MainLayout() {
  const [declarationNumber, setDeclarationNumber] = useState<string>("");
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* First Column: Receipt Upload Form */}
      <div className="w-full lg:w-1/3 p-4 border-r border-gray-200 lg:h-screen lg:overflow-y-auto">
        <TransitorForm declarationNumber={declarationNumber}
         onDeclarationNumberChange={setDeclarationNumber}/>
      </div>

      {/* Second Column: Warehouse File Viewer */}
      <div className="w-full lg:w-2/3 p-4 lg:h-screen lg:overflow-y-auto">
        <ClearanceViewer declarationNumber={declarationNumber}/>
      </div>
    </div>
  );
}
