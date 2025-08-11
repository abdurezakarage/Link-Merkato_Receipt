// File: app/dashboard/page.tsx

"use client";

import LocalReceipt from "./localReceipt"; 
// Note: You have this commented out. To show the taxes, you'll need to uncomment it.

export default function DashboardPage() {
  return (
    // Add the 'bg-black' and 'text-white' classes to the main container.
    // 'text-white' ensures your text remains visible on the dark background.
    <div className="bg-white text-black min-h-screen container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Accountant Dashboard</h1>
      <p className="mb-4">
        This page displays all local tax .
      </p>

      <LocalReceipt />
    </div>
  );
}