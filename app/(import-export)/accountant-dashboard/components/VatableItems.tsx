import React, { useRef, useState, useEffect } from "react";
import { ItemInfo } from "./AccountantTaxViewer";
import { BASE_API_URL } from "@/app/(Import-Export-Receipts)/import-api/ImportApi";

interface VatableItemsProps {
  items: ItemInfo[];
  declarationNumber: string;
  companyName: string;
  totalvat: number;
  companyTin: string;
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

interface ReportResponse {
  totalcost75: number;
  totalcost85: number;
  totalcost110: number;
  totalcost130: number;
  vatAmount115: number;
  vatAmoutn80: number;
  item75: ReportItem[];
  item85: ReportItem[];
  item110: ReportItem[];
  item130: ReportItem[];
}

export default function VatableItems({ 
  items, 
  declarationNumber, 
  companyName, 
  totalvat, 
  companyTin, 
}: VatableItemsProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  
  // Filter items with VAT > 0
  const vatItems = items.filter(item => {
    const vatAmount = item.taxAmountPerItem?.[0]?.vat;
    return vatAmount !== null && vatAmount !== undefined && vatAmount > 0;
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          throw new Error("User ID or token not found in localStorage");
        }

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
        console.log("report data", result);
        console.log("totalcost110",result.totalcost110)
        
        // Handle the specific response format based on your API response
        let extractedData: ReportItem[] = [];
        
        // Use item110 array from the response
        if (result.item110 && Array.isArray(result.item110)) {
          extractedData = result.item110;
        } else if (Array.isArray(result)) {
          extractedData = result;
        } else {
          console.warn("Unexpected API response format:", result);
          throw new Error("Unexpected API response format");
        }
        
        setData(result as ReportResponse);
        console.log("daya",data)
        setReportData(extractedData);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;
    
    const filename = `Ministry_of_Revenue_Export_Announcement_${companyName.replace(/\s+/g, '_')}`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .ministry-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .ministry-header h1 { margin: 0; color: #1e40af; font-size: 24px; }
            .ministry-header h2 { margin: 5px 0; color: #333; font-size: 18px; }
            .company-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-left { width: 40%; }
            .info-center { width: 30%; text-align: center; }
            .info-right { width: 30%; text-align: right; }
            .info-section { margin-bottom: 10px; }
            .info-label { font-weight: bold; margin-right: 5px; }
            .checkbox-group { display: flex; justify-content: center; margin: 15px 0; }
            .checkbox-item { margin: 0 15px; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
            .signature-box { width: 45%; }
            .signature-line { border-bottom: 1px solid #000; margin-bottom: 5px; padding: 5px 0; }
            .stamp-area { width: 45%; text-align: center; border: 1px dashed #999; padding: 20px; height: 100px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .vat-positive { color: green; font-weight: bold; }
            .no-print { display: none; }
            .signature-field { display: inline-block; min-width: 200px; border-bottom: 1px solid #000; margin-left: 5px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              @page { 
                size: portrait; 
                margin: 0.5in;
              }
            }
          </style>
        </head>
        <body>
          <div class="ministry-header">
            <h1>Ministry of Revenue</h1>
            <h2>Export Announcement</h2>
          </div>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.document.title = filename;
    
    setTimeout(() => {
      printWindow.print();
      printWindow.addEventListener("afterprint", () => printWindow.close());
    }, 250);
  };

  if (vatItems.length === 0) {
    return null;
  }

  if (loading) return <div className="p-4">Loading VAT report data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  const currentDate = new Date();

  return (
    <div className="mt-6 border-t pt-4" style={{fontFamily: "Times New Roman, Times, serif", fontSize: "16px" }}>
      <div className="flex justify-end">
        <button
          onClick={handlePrint}
          className="no-print bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm text-right"
        >
          Print Form
        </button>
      </div>
      
      <div ref={printRef}>
        {/* Ministry Header */}
        <div className="mb-6">
          <div className="text-center mb-4 border-b-2 border-gray-300 pb-2">
            <h1 className="text-2xl font-bold text-blue-800 font-serif italic">Ministry of Revenue</h1>
            <h2 className="text-lg font-serif font-semibold text-gray-700 strong italic bold">VATable Import/Export Announcement</h2>
          </div>
          
          {/* Company Information */}
          <div className="flex justify-between mb-6">
            <div className="w-2/5">
              <div className="mb-2">
                <span className="font-semibold">TIN Number: </span>
                <span className="signature-field">  {companyTin}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Company: </span>
                {companyName}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Type of Work: </span>
              </div>
              <div>
                <span className="font-semibold">Date: </span>
                {currentDate.toLocaleDateString()}
              </div>
            </div>
            
            <div className="w-1/5 text-center">
              <div className="mb-2 font-semibold">Imp/Exp Type:</div>
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
                <span className="font-semibold"> Phone:_________ </span>
              </div>
              <div>
                <span className="font-semibold">Mobile:________ </span>
              </div>
            </div>
          </div>
        </div>

        {/* VAT Items Table */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. 
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller/Company Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller TIN 
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Unit Cost (ETB)
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total VAT (ETB)
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt Number 
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calendar Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Registration NO.(MRC)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
 {data && (
  <tr>
    <td>1</td>
    <td>{companyName}</td>
    <td>{companyTin || "N/A"}</td>
    <td>{data.totalcost110?.toLocaleString()} ETB</td>
    <td className="text-green-600 font-medium">
      {data.vatAmount115?.toLocaleString()} ETB
    </td>
    <td>{declarationNumber}-VAT-115</td>
    <td>{currentDate.toLocaleDateString()}</td>
    <td>Gregorian</td>
    <td>{(currentDate.getMonth() + 1).toString().padStart(2, '0')}/{currentDate.getFullYear().toString().slice(2)}</td>
  </tr>
)}
            </tbody>
          </table>
        </div>

        {/* Signature Section */}
        <div className="flex justify-between mt-10">
          <div className="w-2/5">
            <div className="font-semibold mb-2">Information Provider:</div>
            <div className="mb-2">
              Name:__________<span></span>
            </div>
            <div className="mb-2">
              Signature:________ <span></span>
            </div>
            <div>
              Date:_________ <span></span>
            </div>
          </div>
          
          <div className="w-1/5 text-center">
            <div className="font-semibold mb-2">Company Stamp</div>
            <div className="border border-dashed border-gray-400 h-24 flex items-center justify-center text-gray-500">
              Stamp Area
            </div>
          </div>
          
          <div className="w-2/5 text-right">
            <div className="font-semibold mb-2">Information Checker:</div>
            <div className="mb-2">
              Name:_____________<span></span>
            </div>
            <div className="mb-2">
              Signature:_______ <span></span>
            </div>
            <div>
              Date:________ <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}