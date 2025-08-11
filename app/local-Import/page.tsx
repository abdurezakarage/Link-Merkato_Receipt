'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ReceiptManagementHome() {
  const [isHoveredLocal, setIsHoveredLocal] = useState(false);
  const [isHoveredImport, setIsHoveredImport] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Receipt Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to our comprehensive receipt management solution. Choose your preferred method 
            to manage and organize your receipts efficiently.
          </p>
        </div>

       

        {/* Navigation Buttons */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Local Receipts Button */}
          <Link href="/userinfo" className="block">
            <div
              className={`relative bg-white rounded-2xl shadow-lg p-8 text-center transition-all duration-300 transform ${
                isHoveredLocal ? 'scale-105 shadow-2xl' : 'hover:scale-105'
              }`}
              onMouseEnter={() => setIsHoveredLocal(true)}
              onMouseLeave={() => setIsHoveredLocal(false)}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Local Receipts</h3>
              <p className="text-gray-600 mb-6">
                Manage receipts locally with full control over your data
              </p>
              <div className="inline-flex items-center text-blue-600 font-medium">
                Get Started
                <svg className="w-5 h-5 ml-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Import Export Receipts Button */}
          <Link href="/declaration " className="block">
            <div
              className={`relative bg-white rounded-2xl shadow-lg p-8 text-center transition-all duration-300 transform ${
                isHoveredImport ? 'scale-105 shadow-2xl' : 'hover:scale-105'
              }`}
              onMouseEnter={() => setIsHoveredImport(true)}
              onMouseLeave={() => setIsHoveredImport(false)}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Import/Export Receipts</h3>
              <p className="text-gray-600 mb-6">
                Manage your import/export receipts with ease
              </p>
              <div className="inline-flex items-center text-blue-600 font-medium">
                Get Started
                <svg className="w-5 h-5 ml-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Choose the option that best fits your needs. You can switch between modes at any time.
          </p>
        </div>

         {/* Introduction Section
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            About Receipt Management
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Local Receipt Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Store and manage your receipts locally on your device. Perfect for personal use, 
                small businesses, or when you prefer to keep your data offline. Features include 
                receipt scanning, categorization, and detailed reporting.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Offline data storage</li>
                <li>• Receipt scanning and OCR</li>
                <li>• Local reporting and analytics</li>
                <li>• Data privacy and security</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Import/Export Receipt Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Cloud-based receipt management with import/export capabilities. Ideal for teams, 
                accountants, and businesses that need to share data across multiple users and devices.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cloud storage and synchronization</li>
                <li>• Multi-user collaboration</li>
                <li>• Import/export functionality</li>
                <li>• Advanced analytics and reporting</li>
              </ul>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
