"use client";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome, Admin 👋</h1>

      <p className="text-gray-600">
        Use the sidebar to manage products, orders, and users.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-gray-500 text-sm">View, edit, or add new products.</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Orders</h2>
          <p className="text-gray-500 text-sm">Track and manage customer orders.</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-gray-500 text-sm">View customer accounts.</p>
        </div>
      </div>
    </div>
  );
}
