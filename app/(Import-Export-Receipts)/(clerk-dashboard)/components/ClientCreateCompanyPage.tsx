"use client";
import CompanyForm from "./CompanyForm";
import type { CompanyFormData } from "@/lib/types";

export default function ClientCreateCompanyPage() {
  const handleSubmit = (data: CompanyFormData) => {
    console.log("Creating company:", data);
    window.location.href = "/companies";
  };

  return <CompanyForm onSubmit={handleSubmit} />;
}


