"use client";
import type { Company } from "@/lib/types";
export default function CompanyPage({ params }: { params: { id: string } }) {
  const company: Company = {
    id: params.id,
    name: "Acme Inc",
    tinNumber: "1234567890",
    status: "active",
    address: "123 Main St, Suite 400, New York, NY 10001",
    phone: "(555) 123-4567",

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),
  };

  // Format date for display

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{company.name}</h1>
          <div className="flex items-center mt-1">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                company.status === "active" ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span className="text-sm font-medium text-gray-600">
              {company.status.charAt(0).toUpperCase() + company.status.slice(1)}{" "}
              Company
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                TIN Number
              </h3>
              <p className="font-mono text-gray-800">{company.tinNumber}</p>
            </div>

            {company.phone && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Contact Phone
                </h3>
                <p className="text-gray-800">{company.phone}</p>
              </div>
            )}
          </div>

          {company.address && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Registered Address
              </h3>
              <p className="text-gray-800">{company.address}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="text-sm text-gray-500">
              <p>Created: {formatDate(company.createdAt)}</p>
            </div>
            <div className="text-sm text-gray-500">
              <p>Last updated: {formatDate(company.updatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <a
            href="/companies"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to List
          </a>
          <a
            href={`/companies/edit/${company.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Company
          </a>
        </div>
      </div>
    </div>
  );
}
