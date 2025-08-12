import React, { useState, useEffect, useCallback } from "react";
import {
  Archive,
  Pill,
  TrendingUp,
  PackageX,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  Star,
  Activity,
  BarChart as BarChartIcon,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import MonthlySalesChart from "@/components/charts/MonthlySalesChart";
import SalesByCategoryChart from "@/components/charts/SalesByCategoryChart";
import * as api from "@/services/api";

const Dashboard = () => {
  const [summaryCards, setSummaryCards] = useState([
    {
      title: "Inventory Status",
      value: "Calculating...",
      icon: <Archive className="text-indigo-500" />,
      iconBg: "bg-indigo-100",
    },
    {
      title: "Medicines Available",
      value: "0",
      icon: <Pill className="text-sky-500" />,
      iconBg: "bg-sky-100",
    },
    {
      title: "Total Inventory Value",
      value: "₱0",
      icon: <TrendingUp className="text-amber-500" />,
      iconBg: "bg-amber-100",
    },
    {
      title: "Out of Stock",
      value: "0",
      icon: <PackageX className="text-rose-500" />,
      iconBg: "bg-rose-100",
    },
  ]);

  const [monthlyProgressData, setMonthlyProgressData] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getInventoryStatus = (products) => {
    const totalProducts = products.length;
    if (totalProducts === 0) {
      return {
        level: "N/A",
        icon: <ShieldAlert className="text-gray-500" />,
        iconBg: "bg-gray-100",
      };
    }
    const outOfStock = products.filter((p) => p.quantity === 0).length;
    const lowStock = products.filter(
      (p) => p.quantity > 0 && p.quantity <= 10
    ).length;

    const badProducts = outOfStock + lowStock;
    const badPercentage = (badProducts / totalProducts) * 100;

    if (badPercentage > 50) {
      return {
        level: "Bad",
        icon: <ShieldX className="text-rose-500" />,
        iconBg: "bg-rose-100",
      };
    }
    if (badPercentage > 20) {
      return {
        level: "Warning",
        icon: <ShieldAlert className="text-amber-500" />,
        iconBg: "bg-amber-100",
      };
    }
    return {
      level: "Good",
      icon: <ShieldCheck className="text-green-500" />,
      iconBg: "bg-green-100",
    };
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: products, error: productsError } = await api.getProducts();

      if (productsError) throw productsError;

      const inventoryStatusInfo = getInventoryStatus(products);
      const medicineAvailable = products.filter(
        (p) => p.status === "Available" && p.quantity > 0
      ).length;
      const outOfStock = products.filter((p) => p.quantity === 0).length;
      const totalValue = products.reduce(
        (acc, p) => acc + (p.price || 0) * (p.quantity || 0),
        0
      );

      setLowStockItems(
        products.filter((p) => p.quantity > 0 && p.quantity <= 10).slice(0, 5)
      );

      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const expiringProducts = products
        .filter((p) => {
          const expiryDate = new Date(p.expireDate);
          return expiryDate > today && expiryDate <= thirtyDaysFromNow;
        })
        .sort((a, b) => new Date(a.expireDate) - new Date(b.expireDate));
      setExpiringSoon(expiringProducts.slice(0, 5));

      const { data: sales, error: salesError } = await api.getSales();

      if (salesError) throw salesError;

      const monthlySales = sales.reduce((acc, sale) => {
        const month = new Date(sale.created_at).getMonth();
        acc[month] = (acc[month] || 0) + sale.total_amount;
        return acc;
      }, {});

      const generatedMonthlyProgress = Array.from({ length: 12 }, (_, i) => {
        const monthName = new Date(0, i).toLocaleString("default", {
          month: "short",
        });
        return {
          month: monthName,
          sales: monthlySales[i] || 0,
        };
      });
      setMonthlyProgressData(generatedMonthlyProgress);

      const { data: saleItems, error: saleItemsError } = await api.getAllSaleItems();

      if (saleItemsError) throw saleItemsError;

      const categorySales = saleItems.reduce((acc, item) => {
        const category = item.products.category || "Uncategorized";
        const saleValue = item.quantity * item.price_at_sale;
        acc[category] = (acc[category] || 0) + saleValue;
        return acc;
      }, {});

      const salesByCategoryData = Object.entries(categorySales).map(
        ([name, value]) => ({ name, value })
      );
      setSalesByCategory(salesByCategoryData);

      const productSales = saleItems.reduce((acc, item) => {
        const name = item.products.name;
        acc[name] = (acc[name] || 0) + item.quantity;
        return acc;
      }, {});

      const sortedBestSellers = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, quantity]) => ({ name, quantity }));
      setBestSellers(sortedBestSellers);

      const { data: recentSalesData, error: recentSalesError } = await api.getRecentSaleItems();

      if (recentSalesError) throw recentSalesError;
      setRecentSales(recentSalesData);

      setSummaryCards([
        {
          title: "Inventory Status",
          value: inventoryStatusInfo.level,
          icon: inventoryStatusInfo.icon,
          iconBg: inventoryStatusInfo.iconBg,
        },
        {
          title: "Medicines Available",
          value: medicineAvailable.toString(),
          icon: <Pill className="text-sky-500" />,
          iconBg: "bg-sky-100",
        },
        {
          title: "Total Inventory Value",
          value: `₱${totalValue.toFixed(2)}`,
          icon: <TrendingUp className="text-amber-500" />,
          iconBg: "bg-amber-100",
        },
        {
          title: "Out of Stock",
          value: outOfStock.toString(),
          icon: <PackageX className="text-rose-500" />,
          iconBg: "bg-rose-100",
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading dashboard...</p>
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
          There was a problem fetching the dashboard data. Please check your
          internet connection.
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
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="bg-white p-5 rounded-xl shadow-md flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${card.iconBg}`}>{card.icon}</div>
            </div>
            <div className="mt-2">
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
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
