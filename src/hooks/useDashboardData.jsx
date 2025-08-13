// src/hooks/useDashboardData.jsx
import { useState, useEffect, useCallback } from "react";
import * as api from "@/services/api";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Pill,
  PackageX,
  TrendingUp,
} from "lucide-react";

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

export const useDashboardData = () => {
  const [summaryCards, setSummaryCards] = useState([
    {
      title: "Inventory Status",
      value: "Calculating...",
      icon: <ShieldAlert className="text-gray-500" />,
      iconBg: "bg-gray-100",
    },
    {
      title: "Medicines Available",
      value: "0",
      icon: <Pill className="text-sky-500" />,
      iconBg: "bg-sky-100",
    },
    {
      title: "Total Profit",
      value: "₱0",
      icon: <TrendingUp className="text-green-500" />,
      iconBg: "bg-green-100",
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

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: products, error: productsError } = await api.getProducts();
      if (productsError) throw productsError;

      // Process product data
      const inventoryStatusInfo = getInventoryStatus(products);
      const medicineAvailable = products.filter(
        (p) => p.status === "Available" && p.quantity > 0
      ).length;
      const outOfStock = products.filter((p) => p.quantity === 0).length;

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

      // Process sales data
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

      const { data: saleItems, error: saleItemsError } =
        await api.getAllSaleItems();
      if (saleItemsError) throw saleItemsError;

      const totalProfit = saleItems.reduce((acc, item) => {
        const cost = item.products.cost_price || 0;
        const revenue = item.price_at_sale;
        const profitPerItem = revenue - cost;
        return acc + profitPerItem * item.quantity;
      }, 0);

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

      const { data: recentSalesData, error: recentSalesError } =
        await api.getRecentSaleItems();
      if (recentSalesError) throw recentSalesError;
      setRecentSales(recentSalesData);

      // Update summary cards
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
          title: "Total Profit",
          value: `₱${totalProfit.toFixed(2)}`,
          icon: <TrendingUp className="text-green-500" />,
          iconBg: "bg-green-100",
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

  return {
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
  };
};
