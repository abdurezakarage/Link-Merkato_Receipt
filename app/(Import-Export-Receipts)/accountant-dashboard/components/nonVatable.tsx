import React, { useRef, useState, useEffect } from "react";
import { ItemInfo } from "./AccountantTaxViewer";
import { BASE_API_URL } from "@/app/(Import-Export-Receipts)/import-api/ImportApi";

interface NonVatableItemsProps {
   items: ItemInfo[];
  declarationNumber: string;
  companyName: string;
  // totalvat: number;
  companyTin: string;
   totalvat?: number;  
}


interface ReportItem {
  declarationnumber: string;
  declarationDate: string;
  unitCostInETBPerItem: number;
  taxAmountPerItem?: { vat: number }[];
  quantity: number;
  unitCost: number;
}
interface ReportResponse {
  totalcost75: number;
  totalcost85: number;
  totalcost110: number;
  totalcost130: number;
  vatAmount115: number;
  vatAmoutn80: number;
  item75: ReportItem[];
  item85: ReportItem[];
  item130: ReportItem[];
}

export default function NonVatableItems({
  declarationNumber,
  companyName,
  companyTin,
}: NonVatableItemsProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchReport = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) throw new Error("User ID or token not found");

      const response = await fetch(
        `${BASE_API_URL}/api/v1/accountant/report1/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result: ReportResponse = await response.json();
      setData(result);  // Use API data as-is
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  fetchReport();
}, []);

if (loading) return <div className="p-4">Loading Non-VAT report data...</div>;
if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
// if (!data || data.item130.length === 0) return null;  // <-- check item130


  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) return;

    const filename = `Ministry_of_Revenue_Non_VAT_Items_${companyName.replace(/\s+/g, "_")}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; word-break: break-word; }
            th { background-color: #f5f5f5; }
            .vat-zero { color: red; font-weight: bold; }
            .no-print { display: none; }
            .signature-field { display: inline-block; min-width: 200px; border-bottom: 1px solid #000; margin-left: 5px; }
            @media print { body { margin: 0; } .no-print { display: none; } @page { size: portrait; margin: 0.5in; } }
          </style>
        </head>
        <body>
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

  const currentDate = new Date();

  if (loading) return <div className="p-4">Loading Non-VAT report data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="mt-6 border-t pt-4" style={{ fontFamily: "Times New Roman, Times, serif", fontSize: "16px" }}>
      <div className="flex justify-end">
        <button
          onClick={handlePrint}
          className="no-print bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm text-right"
        >
          Print Form
        </button>
      </div>

      <div ref={printRef}>
        <div className="mb-6">
          <div className="text-center mb-4 border-b-2 border-gray-300 pb-2">
            <h1 className="text-2xl font-bold text-blue-800">Ministry of Revenue</h1>
            <h2 className="text-lg font-semibold text-gray-700">Non-VAT Import/Export Announcement</h2>
          </div>

          <div className="flex justify-between mb-6">
            <div className="w-2/5">
              <div className="mb-2">
                <span className="font-semibold">TIN Number: </span>{companyTin || "________________"}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Name: </span>{companyName || "________________"}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Date: </span>{currentDate.toLocaleDateString()}
              </div>
            </div>

            <div className="w-1/5 text-center">
              <div className="mb-2 font-semibold">Export Type:</div>
              <div className="flex justify-center space-x-6">
                <div>
                  <input type="checkbox" id="goods" className="mr-1" />
                  <label htmlFor="goods">Goods</label>
                </div>
                <div>
                  <input type="checkbox" id="services" className="mr-1" />
                  <label htmlFor="services">Services</label>
                </div>
              </div>
            </div>

            <div className="w-2/5 text-right">
              <div className="mb-2">
                <span className="font-semibold">Office Phone: </span>_________
              </div>
              <div>
                <span className="font-semibold">Mobile: </span>_________
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                {["No.", "Company Name", "TIN Number", "Total Unit Cost (ETB)", "Total VAT (ETB)", "Receipt Number", "Receipt Date", "Calendar Type", "Sales Registration NO.(MRC)"].map((header) => (
                  <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
           <tbody className="bg-white divide-y divide-gray-200">
  {data.item130.map((item, index) => (
    <tr key={index}>
      <td className="px-3 py-2">{index + 1}</td>
      <td className="px-3 py-2">{companyName}</td>
      <td className="px-3 py-2">{companyTin || "N/A"}</td>
      <td className="px-3 py-2">{data.totalcost130?.toLocaleString()}</td>
      <td className="px-3 py-2 vat-zero">-</td>
      <td className="px-3 py-2">{item.declarationnumber}-NONVAT-{index + 1}</td>
      <td className="px-3 py-2">{item.declarationDate}</td>
      <td className="px-3 py-2">Gregorian</td>
      {/* MRC */}
      <td className="px-3 py-2">--</td>
    </tr>
  ))}
</tbody>

          </table>
        </div>

        <div className="flex justify-between mt-10">
          <div className="w-2/5">
            <div className="font-semibold mb-2">Information Provider:</div>
            <div className="mb-2">Name:___________________ <span className="signature-field"></span></div>
            <div className="mb-2">Signature:____________ <span className="signature-field"></span></div>
            <div>Date:______________ <span className="signature-field"></span></div>
          </div>

          <div className="w-1/5 text-center">
            <div className="font-semibold mb-2">Company Stamp</div>
            <div className="border border-dashed border-gray-400 h-24 flex items-center justify-center text-gray-500">
              Stamp Area
            </div>
          </div>

          <div className="w-2/5 text-right">
            <div className="font-semibold mb-2">Information Checker:</div>
            <div className="mb-2">Name:-___________________<span className="signature-field"></span></div>
            <div className="mb-2">Signature:_______________ <span className="signature-field"></span></div>
            <div>Date:____________________ <span className="signature-field"></span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
