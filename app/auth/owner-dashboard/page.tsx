"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "../../Context/AuthContext";
import { useRouter } from "next/navigation";
import { CompanyData } from "../../(local-receipts)/local-data-forms/types";
import { useState } from "react";

export default function OwnerDashboard() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

 // Parse JWT token to get company information
 const parseJwt = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

// Get company data from token
const getCompanyFromToken = (): CompanyData | null => {
  if (!token) return null;
  
  const payload = parseJwt(token);
  if (!payload) return null;

  return {
    tin_number: payload.tin_number || '',
    company_name: payload.company_name || '',
    company_email: payload.email || '',
    company_address: (
      payload?.Region ||
      payload?.region ||
      payload?.address ||
      payload?.company?.Region ||
      payload?.company?.region ||
      payload?.company?.address ||
      payload?.company?.company_address ||
      ''
    ),
    created_by_username: payload.first_name || ''
  };
};

// Get company information from token
const companyFromToken = getCompanyFromToken();

const [profileData, setProfileData] = useState({
  username: user?.username || '',
  firstName: companyFromToken?.created_by_username || '',
  email: companyFromToken?.company_email || '',
  companyName: companyFromToken?.company_name || '',
  tinNumber: companyFromToken?.tin_number || '',
  address: companyFromToken?.company_address || ''
});
// Company Card Component
const CompanyCard: React.FC<{ company: CompanyData }> = ({ company }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-lg mb-1">{company.company_name}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p><span className="font-medium">TIN:</span> {company.tin_number}</p>
          <p><span className="font-medium">Email:</span> {company.company_email}</p>
          <p><span className="font-medium">Address:</span> {company.company_address}</p>
        </div>
      </div>
      <div className="ml-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-lg">🏢</span>
        </div>
      </div>
    </div>
  </div>
);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Owner Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back! Manage your business operations from here.
          </p>
        </div>

        {/* Navigation Buttons Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
             <Link href="/auth/usersRegister" className="block">
               <div className="p-6 text-center">
                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                   <svg
                     className="w-8 h-8 text-green-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                     />
                   </svg>
                 </div>
                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
                   Register Company Users
                 </h3>
                 <p className="text-gray-600">
                   Add new users and manage company access
                 </p>
               </div>
             </Link>
           </Card>
                     <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
             <Link href="/owner" className="block">
               <div className="p-6 text-center">
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                   <svg
                     className="w-8 h-8 text-blue-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                     />
                   </svg>
                 </div>
                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
                   Import/Export Documents
                 </h3>
                 <p className="text-gray-600">
                   Upload data and manage import/export documents
                 </p>
               </div>
             </Link>
           </Card>
           <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
             <Link href="/localDocumentUpload" className="block">
               <div className="p-6 text-center">
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                   <svg
                     className="w-8 h-8 text-blue-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                     />
                   </svg>
                 </div>
                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
                   Local Receipts
                 </h3>
                 <p className="text-gray-600">
                  Upload local receipts
                 </p>
               </div>
             </Link>
           </Card>

           {/* company information */}
           <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
                <button
                  onClick={() => router.push('/auth/owner-dashboard/companyUpdate')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Update Company
                </button>
              </div>

              {companyFromToken ? (
                <div className="space-y-4">
                  <CompanyCard company={companyFromToken} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <p className="text-gray-600 mb-4">No company information found in token</p>
                  <button
                    onClick={() => router.push('/auth/company_register')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Register Your Company
                  </button>
                </div>
              )}
            </div>
           </Card>

           {/* vat report    */}   
           <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
             <Link href="/monthly-Vat-Summary" className="block">
               <div className="p-6 text-center">
                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                   <svg
                     className="w-8 h-8 text-green-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                     />
                   </svg>
                 </div>
                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Monthly vat Report
                 </h3>
                 <p className="text-gray-600">
                 See monthly vat report summary here
                 </p>
               </div>
             </Link>
           </Card>
        </div>

                 {/* Theoretical Notes Section */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <Card>
             <div className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Import/Export Theory</p>
                   <p className="text-lg font-bold text-gray-900">Document Types</p>
                 </div>
                 <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                   <svg
                     className="w-6 h-6 text-green-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                     />
                   </svg>
                 </div>
               </div>
               <div className="mt-4">
                 <span className="text-sm text-green-600 font-medium">Key Concepts</span>
                 <span className="text-sm text-gray-600 ml-2">Commercial invoices, packing lists, certificates</span>
               </div>
             </div>
           </Card>

           <Card>
             <div className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Customs Procedures</p>
                   <p className="text-lg font-bold text-gray-900">Clearance Process</p>
                 </div>
                 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                   <svg
                     className="w-6 h-6 text-blue-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                     />
                   </svg>
                 </div>
               </div>
               <div className="mt-4">
                 <span className="text-sm text-blue-600 font-medium">Essential Steps</span>
                 <span className="text-sm text-gray-600 ml-2">Documentation, inspection, duty calculation</span>
               </div>
             </div>
           </Card>

           <Card>
             <div className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Trade Compliance</p>
                   <p className="text-lg font-bold text-gray-900">Regulations</p>
                 </div>
                 <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                   <svg
                     className="w-6 h-6 text-purple-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                     />
                   </svg>
                 </div>
               </div>
               <div className="mt-4">
                 <span className="text-sm text-purple-600 font-medium">Important Rules</span>
                 <span className="text-sm text-gray-600 ml-2">Tariff codes, origin rules, trade agreements</span>
               </div>
             </div>
           </Card>
         </div>

                 {/* Quick Actions Section */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card>
             <div className="p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">
                 Quick Actions
               </h3>
               <div className="space-y-3">
                 <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                   <div className="flex items-center">
                     <svg
                       className="w-5 h-5 text-gray-600 mr-3"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth={2}
                         d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                       />
                     </svg>
                     <span className="text-gray-700">Upload Documents</span>
                   </div>
                 </button>
                 <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                   <div className="flex items-center">
                     <svg
                       className="w-5 h-5 text-gray-600 mr-3"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth={2}
                         d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                       />
                     </svg>
                     <span className="text-gray-700">Generate Customs Report</span>
                   </div>
                 </button>
                 <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                   <div className="flex items-center">
                     <svg
                       className="w-5 h-5 text-gray-600 mr-3"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth={2}
                         d="M15 17h5l-5 5v-5z"
                       />
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth={2}
                         d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                       />
                     </svg>
                     <span className="text-gray-700">Check Compliance</span>
                   </div>
                 </button>
               </div>
             </div>
           </Card>

           {/* <Card>
             <div className="p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">
                 Recent Activity
               </h3>
               <div className="space-y-4">
                 <div className="flex items-start space-x-3">
                   <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                   <div className="flex-1">
                     <p className="text-sm text-gray-900">Customs declaration submitted</p>
                     <p className="text-xs text-gray-500">2 minutes ago</p>
                   </div>
                 </div>
                 <div className="flex items-start space-x-3">
                   <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                   <div className="flex-1">
                     <p className="text-sm text-gray-900">Document verification completed</p>
                     <p className="text-xs text-gray-500">15 minutes ago</p>
                   </div>
                 </div>
                 <div className="flex items-start space-x-3">
                   <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                   <div className="flex-1">
                     <p className="text-sm text-gray-900">Import permit approved</p>
                     <p className="text-xs text-gray-500">1 hour ago</p>
                   </div>
                 </div>
               </div>
             </div>
           </Card> */}
        </div>
      </div>
    </div>
  );
}
