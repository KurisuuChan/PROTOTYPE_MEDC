// src/hooks/useDashboardData.jsx
import { useMemo } from "react";
import { useProducts } from "@/hooks/useProducts.jsx";
import { useSales } from "@/hooks/useSales.js";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Pill,
  PackageX,
  TrendingUp,
} from "lucide-react";

// Helper function to determine inventory health
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
  const badPercentage = ((outOfStock + lowStock) / totalProducts) * 100;

  if (badPercentage > 50)
    return {
      level: "Bad",
      icon: <ShieldX className="text-rose-500" />,
      iconBg: "bg-rose-100",
    };
  if (badPercentage > 20)
    return {
      level: "Warning",
      icon: <ShieldAlert className="text-amber-500" />,
      iconBg: "bg-amber-100",
    };
  return {
    level: "Good",
    icon: <ShieldCheck className="text-green-500" />,
    iconBg: "bg-green-100",
  };
};

export const useDashboardData = () => {
  // Consume our centralized hooks
  const {
    products,
    isLoading: productsLoading,
    isError: productsError,
  } = useProducts();
  const {
    saleItems,
    sales,
    recentSales,
    isLoading: salesLoading,
    isError: salesError,
  } = useSales();

  // useMemo will re-calculate the dashboard data only when products or sales change.
  const dashboardData = useMemo(() => {
    if (!products || !saleItems || !sales) return null;

    // Product-based calculations
    const inventoryStatusInfo = getInventoryStatus(products);
    const medicineAvailable = products.filter(
      (p) => p.status === "Available" && p.quantity > 0
    ).length;
    const outOfStockCount = products.filter((p) => p.quantity === 0).length;
    const lowStockItems = products
      .filter((p) => p.quantity > 0 && p.quantity <= 10)
      .slice(0, 5);

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const expiringSoon = products
      .filter((p) => {
        const expiryDate = new Date(p.expireDate);
        return expiryDate > today && expiryDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.expireDate) - new Date(b.expireDate))
      .slice(0, 5);

    // Sales-based calculations
    const totalProfit = saleItems.reduce((acc, item) => {
      const cost = item.products?.cost_price || 0;
      const revenue = item.price_at_sale;
      const profitPerItem = revenue - cost;
      return acc + profitPerItem * item.quantity;
    }, 0);

    const monthlySales = sales.reduce((acc, sale) => {
      const month = new Date(sale.created_at).getMonth();
      acc[month] = (acc[month] || 0) + sale.total_amount;
      return acc;
    }, {});

    const monthlyProgressData = Array.from({ length: 12 }, (_, i) => {
      const monthName = new Date(0, i).toLocaleString("default", {
        month: "short",
      });
      return { month: monthName, sales: monthlySales[i] || 0 };
    });

    const categorySales = saleItems.reduce((acc, item) => {
      const category = item.products?.category || "Uncategorized";
      const saleValue = item.quantity * item.price_at_sale;
      acc[category] = (acc[category] || 0) + saleValue;
      return acc;
    }, {});
    const salesByCategory = Object.entries(categorySales).map(
      ([name, value]) => ({ name, value })
    );

    const productSales = saleItems.reduce((acc, item) => {
      const name = item.products?.name;
      if (name) {
        acc[name] = (acc[name] || 0) + item.quantity;
      }
      return acc;
    }, {});
    const bestSellers = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    const summaryCards = [
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
        value: outOfStockCount.toString(),
        icon: <PackageX className="text-rose-500" />,
        iconBg: "bg-rose-100",
      },
    ];

    return {
      summaryCards,
      monthlyProgressData,
      salesByCategory,
      expiringSoon,
      lowStockItems,
      bestSellers,
    };
  }, [products, saleItems, sales]);

  return {
    ...dashboardData,
    recentSales, // Pass recentSales directly
    loading: productsLoading || salesLoading,
    error: productsError || salesError,
  };
};
