"use client";

import { useEffect, useState } from "react";

export default function DeclarationList() {
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeclarations = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://customreceiptmanagement.onrender.com/api/v1/clerk/declarationInfo/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch declarations");
        }

        const data = await res.json();
        setDeclarations(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeclarations();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading declarations...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  if (!declarations.length) return <p className="text-center mt-10">No declarations found.</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 mt-10">
      <h2 className="text-2xl font-semibold text-center mb-6">All Submitted Declarations</h2>
      {declarations.map((decl, i) => (
        <div key={i} className="mb-8 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
          <h3 className="text-lg font-bold mb-2">Declaration #{i + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <Detail label="Custom Branch Name" value={decl.custombranchname} />
            <Detail label="Declaration Number" value={decl.declarationnumber} />
            <Detail label="Declaration Dispense Date" value={decl.declarationdispensedate} />
            <Detail label="FOB Amount" value={decl.fobamount} />
            <Detail label="Exchange Rate" value={decl.exchangerate} />
            <Detail label="External Freight" value={decl.externalfreight} />
            <Detail label="Insurance Cost" value={decl.insuranceCost} />
            <Detail label="Inland Freight 1" value={decl.inlandfreight1} />
            <Detail label="Djibouti Cost" value={decl.djibouticost} />
            <Detail label="Other Cost 1" value={decl.othercost1} />
          </div>

          <h4 className="font-semibold mb-2">Items:</h4>
          <div className="overflow-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Description</th>
                  <th className="border px-2 py-1">Unit of Measure</th>
                  <th className="border px-2 py-1">Units</th>
                  <th className="border px-2 py-1">Quantity</th>
                  <th className="border px-2 py-1">Unit Cost</th>
                  <th className="border px-2 py-1">DPV</th>
                  <th className="border px-2 py-1">Tax Types</th>
                </tr>
              </thead>
              <tbody>
                {decl.items.map((item: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    <td className="border px-2 py-1">{item.itemDescription}</td>
                    <td className="border px-2 py-1">{item.unitOfMeasurement}</td>
                    <td className="border px-2 py-1">{item.units}</td>
                    <td className="border px-2 py-1">{item.quantity}</td>
                    <td className="border px-2 py-1">{item.unitCost}</td>
                    <td className="border px-2 py-1">{item.dpvAmount}</td>
                    <td className="border px-2 py-1">
                      {item.taxType?.join(", ") || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-medium">{label}:</span> {value || "N/A"}
    </div>
  );
}
