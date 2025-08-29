"use client";

import React, { useRef } from "react";
import { ItemInfo } from "./AccountantTaxViewer";
import { useEffect, useState } from "react";
import { BASE_API_URL } from "@/app/(Import-Export-Receipts)/import-api/ImportApi";

interface CostSheetProps {
  items: ItemInfo[];
  declarationNumber: string;
  companyName: string;
}

interface ReportItem {
  costPeritem: number;
  declarationDate: string;
  declarationnumber: string;
  hscode: string;
  itemdescription: string;
  natureofitem: string;
  quantity: number;
  unitCost: number;
  unitofmeasurement: string;
  vatPeritem: number;
}

export default function CostSheet({ items, declarationNumber, companyName }: CostSheetProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printContent = printRef.current.innerHTML;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Cost Sheet - ${companyName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .print-header { margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .print-header h2 { margin: 0; color: #333; }
            .print-header p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .no-print { display: none; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h2>${companyName}</h2>
            <p>Declaration Number: ${declarationNumber}</p>
            <p>Cost Sheet</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.addEventListener("afterprint", () => printWindow.close());
    }, 250);
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${BASE_API_URL}/api/v1/accountant/report1/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("report",result)        // Handle different response formats
        let reportData: ReportItem[] = [];
        
        if (Array.isArray(result)) {
          // If the response is directly an array
          reportData = result;
        } else if (result.data && Array.isArray(result.data)) {
          // If the response has a data property that is an array
          reportData = result.data;
        } else if (result.items && Array.isArray(result.items)) {
          // If the response has an items property that is an array
          reportData = result.items;
        } else if (result.report && Array.isArray(result.report)) {
          // If the response has a report property that is an array
          reportData = result.report;
        } else {
          // Try to find any array property in the response
          const arrayKeys = Object.keys(result).filter(key => Array.isArray(result[key]));
          if (arrayKeys.length > 0) {
            reportData = result[arrayKeys[0]];
          } else {
            console.warn("API response format unexpected:", result);
          }
        }
        
        setData(reportData || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  // Safe calculations that won't crash if data is not an array
  const safeData = Array.isArray(data) ? data : [];
  const totalQuantity = safeData.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalUnitCost = safeData.reduce((sum, item) => sum + (item.unitCost || 0), 0);
  const totalCost = safeData.reduce((sum, item) => sum + ((item.unitCost || 0) * (item.quantity || 0)), 0);

  if (loading) return <p>Loading report...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  
  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-semibold text-blue-600 font-sarif italic bold strong">Import/Export Cost Sheet</h3>
        <button
          onClick={handlePrint}
          className="no-print bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
        >
          Print Report
        </button>
      </div>
          <h2 className="font-sarif italic bold strong">{companyName}</h2>
            <p className="font-sarif italic bold strong">Declaration Number: {declarationNumber}</p>


      
      <div ref={printRef}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit cost (ETB)
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total cost (ETB)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeData.length > 0 ? (
                safeData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                      {item.itemdescription || "N/A"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                      {item.unitofmeasurement || "N/A"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                      {item.quantity?.toLocaleString() || "0"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                      {item.unitCost?.toLocaleString() || "0"} ETB
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                      {((item.quantity || 0) * (item.unitCost || 0))?.toLocaleString() || "0"} ETB
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-2 text-center text-xs text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
              
              {/* Footer row with totals */}
              {safeData.length > 0 && (
                <tr className="bg-blue-50 font-bold">
                  <td colSpan={3} className="px-3 py-2 text-right text-xs uppercase">
                    TOTAL:
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {totalQuantity.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {totalUnitCost.toLocaleString()} ETB
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {totalCost.toLocaleString()} ETB
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}