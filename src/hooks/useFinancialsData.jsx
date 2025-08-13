// src/hooks/useFinancialsData.jsx
import { useState, useEffect, useCallback } from "react";
import * as api from "@/services/api";
import { useNotification } from "@/hooks/useNotifications";

export const useFinancialsData = () => {
  const [stats, setStats] = useState({
    totalInventoryValue: 0,
    totalProfit: 0,
  });
  const [monthlyProfitData, setMonthlyProfitData] = useState([]);
  const [productProfitability, setProductProfitability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addNotification } = useNotification();

  const fetchFinancialsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all products to calculate inventory value
      const { data: products, error: productsError } = await api.getProducts();
      if (productsError) throw productsError;

      const totalInventoryValue = products.reduce(
        (acc, p) => acc + (p.cost_price || 0) * (p.quantity || 0),
        0
      );

      // Fetch all sale items to calculate profit
      const { data: saleItems, error: saleItemsError } =
        await api.getAllSaleItems();
      if (saleItemsError) throw saleItemsError;

      // Calculate total profit and group profit by month accurately
      const monthlyProfit = Array(12).fill(0);
      const totalProfit = saleItems.reduce((acc, item) => {
        if (!item.products) return acc;

        const cost = item.products.cost_price || 0;
        const revenue = item.price_at_sale;
        const profitPerItem = revenue - cost;
        const totalItemProfit = profitPerItem * item.quantity;

        // Add to monthly profit calculation using optional chaining
        if (item.sales?.created_at) {
          const month = new Date(item.sales.created_at).getMonth();
          monthlyProfit[month] += totalItemProfit;
        }

        return acc + totalItemProfit;
      }, 0);

      const generatedMonthlyProfit = Array.from({ length: 12 }, (_, i) => {
        const monthName = new Date(0, i).toLocaleString("default", {
          month: "short",
        });
        return {
          month: monthName,
          profit: monthlyProfit[i] || 0,
        };
      });
      setMonthlyProfitData(generatedMonthlyProfit);

      // Group sales by product name for profitability table
      const salesByProduct = saleItems.reduce((acc, item) => {
        if (!item.products) return acc;
        const name = item.products.name;
        if (!acc[name]) {
          acc[name] = {
            name: name,
            cost_price: item.products.cost_price || 0,
            totalSold: 0,
            totalRevenue: 0,
          };
        }
        acc[name].totalSold += item.quantity;
        acc[name].totalRevenue += item.price_at_sale * item.quantity;
        return acc;
      }, {});

      const profitability = Object.values(salesByProduct)
        .map((product) => {
          const totalCost = product.totalSold * product.cost_price;
          const profit = product.totalRevenue - totalCost;
          return {
            ...product,
            profit,
            margin:
              product.totalRevenue > 0
                ? (profit / product.totalRevenue) * 100
                : 0,
          };
        })
        .sort((a, b) => b.profit - a.profit);

      setProductProfitability(profitability);
      setStats({ totalInventoryValue, totalProfit });
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResetFinancials = async () => {
    const { error: resetError } = await api.resetFinancials();
    if (resetError) {
      addNotification(`Error: ${resetError.message}`, "error");
    } else {
      addNotification("Financial records have been reset.", "success");
      fetchFinancialsData(); // Refresh the data
    }
  };

  useEffect(() => {
    fetchFinancialsData();
  }, [fetchFinancialsData]);

  return {
    stats,
    monthlyProfitData,
    productProfitability,
    loading,
    error,
    fetchFinancialsData,
    handleResetFinancials,
  };
};
