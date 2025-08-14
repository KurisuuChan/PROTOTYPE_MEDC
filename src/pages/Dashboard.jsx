// src/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Clock,
  Star,
  Activity,
  BarChart as BarChartIcon,
  WifiOff,
  RefreshCw,
  PackageX,
  Loader2,
} from "lucide-react";
import MonthlySalesChart from "@/components/charts/MonthlySalesChart";
import SalesByCategoryChart from "@/components/charts/SalesByCategoryChart";
import { useDashboardData } from "@/hooks/useDashboardData.jsx";

const Dashboard = () => {
  const {
    summaryCards,
    monthlyProgressData,
    salesByCategory,
    expiringSoon,
    lowStockItems,
    bestSellers,
    recentSales,
    loading,
    error,
    fetchDashboardData,
  } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <WifiOff size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Connection Error
        </h2>
        <p className="text-gray-600 mb-6">
          There was a problem fetching the dashboard data.
        </p>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => {
          const cardContent = (
            <div
              key={card.title}
              className="bg-white p-5 rounded-xl shadow-md flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 h-full"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${card.iconBg}`}>
                  {card.icon}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          );

          if (card.title === "Total Profit") {
            return (
              <Link to="/financials" key={card.title}>
                {cardContent}
              </Link>
            );
          }
          return cardContent;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Monthly Sales
            </h2>
            <button className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-md text-sm hover:bg-gray-200">
              This Year <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
          <MonthlySalesChart data={monthlyProgressData} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChartIcon className="text-purple-500" />
            Sales by Category
          </h2>
          <SalesByCategoryChart data={salesByCategory} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="text-yellow-400" />
            Best Sellers
          </h2>
          <ul className="space-y-3">
            {bestSellers.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                  {item.quantity} sold
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="text-red-500" />
            Expiring Soon
          </h2>
          <ul className="space-y-3">
            {expiringSoon.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="font-bold text-red-600">
                  {new Date(item.expireDate).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PackageX className="text-orange-500" />
            Low Stock Items
          </h2>
          <ul className="space-y-3">
            {lowStockItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="font-bold text-orange-600">
                  {item.quantity} left
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="text-green-500" />
          Recent Sales
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">
                  Product
                </th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-500">
                  Quantity
                </th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-500">
                  Price
                </th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-500">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentSales.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-800 font-medium">
                    {item.products.name}
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-green-600 font-semibold">
                    ₱{(item.price_at_sale * item.quantity).toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-gray-500">
                    {new Date(item.sales.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
