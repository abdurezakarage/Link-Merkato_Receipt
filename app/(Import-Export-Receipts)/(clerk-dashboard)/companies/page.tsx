export default function CompaniesPage() {
  const companies = [
    {
      id: "1",
      name: "Acme Inc",
      tinNumber: "1234567890",
      status: "active",
      address: "123 Business Rd, New York",
      phone: "(555) 123-4567",
      createdAt: "2023-10-15T09:30:00Z",
      updatedAt: "2023-10-20T14:15:00Z",
    },
    {
      id: "2",
      name: "Globex Corp",
      tinNumber: "0987654321",
      status: "inactive",
      address: "456 Enterprise Ave, Chicago",
      phone: "(555) 987-6543",
      createdAt: "2023-09-01T11:20:00Z",
      updatedAt: "2023-10-10T16:45:00Z",
    },
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Company Directory</h1>
          <a
            href="/companies/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add New Company
          </a>
        </div>

        <div className="space-y-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h2 className="font-semibold text-lg">{company.name}</h2>
                  <p className="text-sm text-gray-600">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        company.status === "active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></span>
                    {company.status.charAt(0).toUpperCase() +
                      company.status.slice(1)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">TIN:</span>{" "}
                    {company.tinNumber}
                  </p>
                  {company.phone && (
                    <p className="text-gray-700">
                      <span className="font-medium">Phone:</span>{" "}
                      {company.phone}
                    </p>
                  )}
                </div>

                <div className="flex flex-col md:items-end">
                  <div className="flex space-x-4">
                    <a
                      href={`/companies/${company.id}`}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      View Details
                    </a>
                    <a
                      href={`/companies/edit/${company.id}`}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Last updated: {formatDate(company.updatedAt)}
                  </p>
                </div>
              </div>

              {company.address && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Address:</span>{" "}
                    {company.address}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
