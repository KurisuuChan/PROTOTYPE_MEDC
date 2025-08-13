// src/pages/Financials.jsx
import React from "react";
import { useFinancialsData } from "@/hooks/useFinancialsData";
import {
  DollarSign,
  Archive,
  TrendingUp,
  WifiOff,
  RefreshCw,
  BarChart,
} from "lucide-react";
import MonthlySalesChart from "@/components/charts/MonthlySalesChart"; // Re-using this for profit

const Financials = () => {
  const {
    stats,
    monthlyProfitData,
    productProfitability,
    loading,
    error,
    fetchFinancialsData,
  } = useFinancialsData();

  if (loading) {
    return <div className="text-center p-8">Loading financial data...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <WifiOff size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold">Connection Error</h2>
        <p className="text-gray-600 mb-6">Could not fetch financial data.</p>
        <button
          onClick={fetchFinancialsData}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-blue-100">
          <BarChart size={32} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Financial Overview
          </h1>
          <p className="text-gray-500 mt-1">
            An analysis of your inventory value and profitability.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6">
          <div className="p-4 bg-orange-100 rounded-full">
            <Archive className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">
              Total Inventory Value (at Cost)
            </p>
            <p className="text-3xl font-bold text-gray-800">
              ₱{stats.totalInventoryValue.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6">
          <div className="p-4 bg-green-100 rounded-full">
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Lifetime Profit</p>
            <p className="text-3xl font-bold text-gray-800">
              ₱{stats.totalProfit.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-indigo-500" />
          Monthly Profit Trend (Estimated)
        </h2>
        <MonthlySalesChart
          data={monthlyProfitData.map((d) => ({
            month: d.month,
            sales: d.profit,
          }))}
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Profitability by Product
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">
                  Product
                </th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-500">
                  Units Sold
                </th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-500">
                  Total Revenue
                </th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-500">
                  Total Profit
                </th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-500">
                  Profit Margin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productProfitability.map((item) => (
                <tr key={item.name} className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-800 font-medium">
                    {item.name}
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">
                    {item.totalSold}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-gray-600">
                    ₱{item.totalRevenue.toFixed(2)}
                  </td>
                  <td
                    className={`py-4 px-4 text-right text-sm font-bold ${
                      item.profit > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₱{item.profit.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-blue-600 font-semibold">
                    {item.margin.toFixed(1)}%
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

export default Financials;
