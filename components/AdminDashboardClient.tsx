"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { useReactToPrint } from "react-to-print";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

/* ================= TYPES ================= */

type Product = {
  _id?: string;
  title: string;
  actualCost?: number;
  stock?: number;
};

type OrderItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
};

type Order = {
  _id?: string;
  items: OrderItem[];
  status?: string;
  createdAt?: string;
  payment?: { method?: string };
  paymentMethod?: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

/* ================= COMPONENT ================= */

export default function AdminDashboardClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const dashboardRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/products`).then((r) => r.json()),
      fetch(`${API}/api/orders`).then((r) => r.json()),
    ])
      .then(([p, o]) => {
        setProducts(Array.isArray(p) ? p : []);
        setOrders(Array.isArray(o) ? o : []);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- HELPERS ---------------- */

  const validOrders = useMemo(
    () => orders.filter((o) => o.status !== "Cancelled"),
    [orders]
  );

  const productMap = useMemo(() => {
    const map: Record<string, Product> = {};
    products.forEach((p) => {
      if (p._id) map[p._id] = p;
    });
    return map;
  }, [products]);

  /* ================= KPI CALCULATIONS ================= */

  const totalProfit = useMemo(() => {
    let profit = 0;
    validOrders.forEach((o) =>
      o.items.forEach((i) => {
        const p = productMap[i.productId];
        if (p?.actualCost) {
          profit += (i.price - p.actualCost) * i.qty;
        }
      })
    );
    return profit;
  }, [validOrders, productMap]);

  const inventoryExpense = useMemo(() => {
    return products.reduce((sum, p) => {
      if (!p.actualCost || !p.stock) return sum;
      return sum + p.actualCost * p.stock;
    }, 0);
  }, [products]);

  const salesVsExpense = useMemo(() => {
    let sales = 0;
    let expense = 0;

    validOrders.forEach((o) =>
      o.items.forEach((i) => {
        sales += i.price * i.qty;
        const p = productMap[i.productId];
        if (p?.actualCost) expense += p.actualCost * i.qty;
      })
    );

    return { sales, expense };
  }, [validOrders, productMap]);

  const profitPercentage =
    salesVsExpense.sales > 0
      ? (totalProfit / salesVsExpense.sales) * 100
      : 0;

  /* ================= CHART DATA ================= */

  const revenueByMonth = useMemo(() => {
    const months = Array(12).fill(0);
    validOrders.forEach((o) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      o.items.forEach((i) => {
        months[d.getMonth()] += i.price * i.qty;
      });
    });
    return months;
  }, [validOrders]);

  const projection = useMemo(() => {
    const now = new Date();
    const last3: number[] = [];

    for (let i = 2; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      let sum = 0;

      validOrders.forEach((o) => {
        if (!o.createdAt) return;
        const d = new Date(o.createdAt);
        if (
          d.getMonth() === m.getMonth() &&
          d.getFullYear() === m.getFullYear()
        ) {
          o.items.forEach((i) => (sum += i.price * i.qty));
        }
      });

      last3.push(sum);
    }

    const nonZero = last3.filter((v) => v > 0);
    if (nonZero.length <= 1) return Array(6).fill(nonZero[0] || 0);

    let growth = 0;
    for (let i = 1; i < last3.length; i++) {
      if (last3[i - 1] > 0) {
        growth += (last3[i] - last3[i - 1]) / last3[i - 1];
      }
    }
    growth /= last3.length - 1;
    growth = Math.min(Math.max(growth, -0.3), 0.3);

    let base = last3[last3.length - 1];
    return Array.from({ length: 6 }, () => {
      base = base * (1 + growth);
      return Math.round(base);
    });
  }, [validOrders]);

  const mostSoldProducts = useMemo(() => {
    const map: Record<
      string,
      { title: string; qty: number; revenue: number }
    > = {};

    validOrders.forEach((o) =>
      o.items.forEach((i) => {
        if (!map[i.productId]) {
          map[i.productId] = {
            title: i.title,
            qty: 0,
            revenue: 0,
          };
        }
        map[i.productId].qty += i.qty;
        map[i.productId].revenue += i.qty * i.price;
      })
    );

    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [validOrders]);

  const ordersByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const s = o.status || "Pending";
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [orders]);

  const paymentModes = useMemo(() => {
    const map: Record<string, number> = { UPI: 0, "QR Code": 0 };
    validOrders.forEach((o) => {
      const mode =
        o.payment?.method || o.paymentMethod || "Unknown";
      map[mode] = (map[mode] || 0) + 1;
    });
    return map;
  }, [validOrders]);

  /* ================= PRINT ================= */

  const handlePrint = useReactToPrint({
  contentRef: dashboardRef,
  documentTitle: "Admin Dashboard",
  pageStyle: `
    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
  `,
});


  /* ================= OPTIONS ================= */

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "55%",
    plugins: {
      legend: { position: "bottom" as const },
    },
  };

  if (loading) return <div className="p-6">Loading dashboard…</div>;

  return (
    <>
      {/* Header + DOWNLOAD BUTTON */}
      <div className="flex justify-between mb-4 no-print">
        <h1 className="text-2xl font-bold ">Admin Dashboard</h1>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-black text-white rounded-md text-sm"
        >
          ⬇ Download PDF
        </button>
      </div>

      {/* DASHBOARD */}
      <div
        ref={dashboardRef}
        className="space-y-10 p-6 bg-[#222831] rounded-lg text-white"
      >
        {/* BUSINESS OVERVIEW */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Business Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPI title="Total Profit">
              <div className="text-3xl font-bold text-green-500">
                ₹{totalProfit.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-gray-400">
                {profitPercentage.toFixed(2)}% margin
              </div>
            </KPI>

            <KPI title="Inventory Expense">
              <div className="text-3xl font-bold text-red-500">
                ₹{inventoryExpense.toLocaleString("en-IN")}
              </div>
            </KPI>

            <KPI title="Current Month Profit">
              <div className="text-3xl font-bold text-green-500">
                ₹{totalProfit.toLocaleString("en-IN")}
              </div>
            </KPI>
          </div>
        </section>

        {/* SALES TRENDS */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Sales Trends
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Revenue (Jan – Dec)">
              <div className="h-64">
                <Bar
                  data={{
                    labels: [
                      "Jan","Feb","Mar","Apr","May","Jun",
                      "Jul","Aug","Sep","Oct","Nov","Dec",
                    ],
                    datasets: [
                      {
                        label: "Revenue",
                        data: revenueByMonth,
                        backgroundColor: "#2563eb",
                      },
                    ],
                  }}
                />
              </div>
            </Card>

            <Card title="Sales vs Expense">
              <div className="h-52">
                <Pie
                  data={{
                    labels: ["Sales", "Expense"],
                    datasets: [
                      {
                        data: [salesVsExpense.sales, salesVsExpense.expense],
                        backgroundColor: ["#16a34a", "#dc2626"],
                      },
                    ],
                  }}
                  options={donutOptions}
                />
              </div>
            </Card>

            <Card title="Sales Projection (Next 6 Months)">
              <div className="h-60">
                <Line
                  data={{
                    labels: ["M+1","M+2","M+3","M+4","M+5","M+6"],
                    datasets: [
                      {
                        label: "Projected Sales",
                        data: projection,
                        borderColor: "#16a34a",
                        tension: 0.3,
                      },
                    ],
                  }}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* OPERATIONS */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Operational Insights
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Most Sold Products">
              <div className="space-y-3">
                {mostSoldProducts.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between border-b border-gray-600 pb-2 last:border-none"
                  >
                    <div>
                      <div className="font-medium text-sm">{p.title}</div>
                      <div className="text-xs text-gray-400">
                        Qty: {p.qty}
                      </div>
                    </div>
                    <div className="font-semibold">
                      ₹{p.revenue.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Orders by Status">
              <div className="h-52">
                <Pie
                  data={{
                    labels: Object.keys(ordersByStatus),
                    datasets: [
                      {
                        data: Object.values(ordersByStatus),
                        backgroundColor: [
                          "#2563eb",
                          "#16a34a",
                          "#f59e0b",
                          "#dc2626",
                          "#6b7280",
                        ],
                      },
                    ],
                  }}
                  options={donutOptions}
                />
              </div>
            </Card>

            <Card title="Payment Modes">
              <div className="space-y-2">
                {Object.entries(paymentModes).map(([m, c]) => (
                  <div
                    key={m}
                    className="flex justify-between px-3 py-2 bg-[#31363F] rounded-lg text-sm"
                  >
                    <span>{m}</span>
                    <span className="font-semibold">{c}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}

/* ================= UI HELPERS ================= */

function KPI({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 bg-[#31363F] rounded-xl shadow-sm border border-gray-700">
      <div className="text-sm text-gray-300 mb-1">{title}</div>
      {children}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 bg-[#31363F] rounded-xl shadow-sm border border-gray-700">
      <div className="text-sm font-medium text-gray-300 mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}
