export default function DashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Owner Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h2 className="font-semibold text-lg mb-2">Quick Actions</h2>
          <p className="text-gray-600">Manage your documents and fees</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h2 className="font-semibold text-lg mb-2">Recent Activity</h2>
          <p className="text-gray-600">View your recent transactions</p>
        </div>
      </div>
    </>
  );
}
