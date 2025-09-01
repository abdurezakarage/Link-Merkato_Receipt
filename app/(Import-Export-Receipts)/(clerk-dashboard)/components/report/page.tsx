// app/report/[userId]/page.tsx
"use client";

import AllTaxFetcher from "../report/report"; // adjust path based on your project

export default function ReportPage({ params }: { params: { userId: string } }) {
  const { userId } = params;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Tax Report for Clerk: {userId}
      </h1>

      <AllTaxFetcher />
    </main>
  );
}
