"use client";
import CompanyForm from "./CompanyForm";
import type { CompanyFormData } from "@/lib/types";

export default function ClientEditCompanyPage({
  initialData,
}: {
  initialData: CompanyFormData;
}) {
  const handleSubmit = (data: CompanyFormData) => {
    console.log("Updating company:", data);
    window.location.href = "/companies";
  };

  return <CompanyForm initialData={initialData} onSubmit={handleSubmit} />;
}


