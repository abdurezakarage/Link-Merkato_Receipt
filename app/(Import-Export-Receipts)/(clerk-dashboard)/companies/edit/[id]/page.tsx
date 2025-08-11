"use client";
import CompanyForm from "../../../components/CompanyForm";
import type { CompanyFormData } from "@/lib/types"; // Adjust if path is different

export default function EditCompany({ params }: { params: { id: string } }) {
  // Full company object (could come from fetch in real app)
  const company = {
    id: params.id,
    name: "Acme Inc",
    tinNumber: "1234567890",
    address: "123 Main St",
    phone: "0911223344",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Extract only the fields relevant to the form
  const initialData: CompanyFormData = {
    name: company.name,
    tinNumber: company.tinNumber,
    address: company.address,
    phone: company.phone,
    status: company.status as "active" | "inactive",
  };

  const handleSubmit = (data: CompanyFormData) => {
    console.log("Updating company:", data);
    window.location.href = "/companies";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Edit Company</h1>
        <CompanyForm initialData={initialData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
