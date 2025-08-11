"use client";
import CompanyForm from "../../components/CompanyForm";
import type { CompanyFormData } from "@/lib/types"; // Adjust if path is different

export default function CreateCompany() {
  const handleSubmit = (data: CompanyFormData) => {
    console.log("Creating company:", data);
    window.location.href = "/companies";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Create New Company
        </h1>
        <CompanyForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
