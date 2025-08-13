// src/hooks/useFinancialsData.jsx
import { useState, useEffect, useCallback } from "react";
import * as api from "@/services/api";

export const useFinancialsData = () => {
  const [stats, setStats] = useState({
    totalInventoryValue: 0,
    totalProfit: 0,
  });
  const [monthlyProfitData, setMonthlyProfitData] = useState([]);
  const [productProfitability, setProductProfitability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      const totalProfit = saleItems.reduce((acc, item) => {
        // Safely access product data
        if (!item.products) return acc;
        const cost = item.products.cost_price || 0;
        const revenue = item.price_at_sale;
        const profitPerItem = revenue - cost;
        return acc + profitPerItem * item.quantity;
      }, 0);

      const profitability = products
        .map((product) => {
          // Safely filter sale items
          const sales = saleItems.filter(
            (item) => item.products && item.products.name === product.name
          );
          const totalSold = sales.reduce((acc, item) => acc + item.quantity, 0);
          const totalRevenue = sales.reduce(
            (acc, item) => acc + item.price_at_sale * item.quantity,
            0
          );
          const totalCost = totalSold * (product.cost_price || 0);
          const profit = totalRevenue - totalCost;
          return {
            name: product.name,
            totalSold,
            totalRevenue,
            profit,
            margin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
          };
        })
        .sort((a, b) => b.profit - a.profit);

      setProductProfitability(profitability);

      // Fetch sales for monthly profit chart
      const { data: sales, error: salesError } = await api.getSales();
      if (salesError) throw salesError;

      const monthlyProfit = sales.reduce((acc, sale) => {
        const month = new Date(sale.created_at).getMonth();
        // This is an approximation of profit per sale.
        // A more accurate calculation would sum profit from sale_items for each sale.
        // For now, we assume a flat 40% margin for the chart for simplicity.
        const estimatedProfit = sale.total_amount * 0.4;
        acc[month] = (acc[month] || 0) + estimatedProfit;
        return acc;
      }, {});

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
      setStats({ totalInventoryValue, totalProfit });
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

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
  };
};
