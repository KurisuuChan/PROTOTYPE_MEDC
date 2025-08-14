// src/hooks/useFinancialsData.jsx
import { useMemo } from "react";
import { useProducts } from "@/hooks/useProducts.jsx";
import { useSales } from "@/hooks/useSales.js";

export const useFinancialsData = () => {
  // Consume the centralized data hooks
  const { products, isLoading: productsLoading } = useProducts();
  const { saleItems, isLoading: salesLoading } = useSales();

  // useMemo ensures these complex calculations only run when the underlying data changes
  const financials = useMemo(() => {
    if (!products || !saleItems) {
      return {
        stats: { totalInventoryValue: 0, totalProfit: 0 },
        monthlyProfitData: [],
        productProfitability: [],
      };
    }

    // 1. Calculate Inventory Value
    const totalInventoryValue = products.reduce(
      (acc, p) => acc + (p.cost_price || 0) * (p.quantity || 0),
      0
    );

    // 2. Calculate Total and Monthly Profit
    const monthlyProfit = Array(12).fill(0);
    const totalProfit = saleItems.reduce((acc, item) => {
      if (!item.products) return acc;
      const cost = item.products.cost_price || 0;
      const revenue = item.price_at_sale;
      const profitPerItem = revenue - cost;
      const totalItemProfit = profitPerItem * item.quantity;

      if (item.sales?.created_at) {
        const month = new Date(item.sales.created_at).getMonth();
        monthlyProfit[month] += totalItemProfit;
      }
      return acc + totalItemProfit;
    }, 0);

    const monthlyProfitData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("default", { month: "short" }),
      profit: monthlyProfit[i] || 0,
    }));

    // 3. Calculate Profitability by Product
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

    const productProfitability = Object.values(salesByProduct)
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

    return {
      stats: { totalInventoryValue, totalProfit },
      monthlyProfitData,
      productProfitability,
    };
  }, [products, saleItems]);

  return {
    ...financials,
    loading: productsLoading || salesLoading,
    error: null, // Error handling can be enhanced here if needed
  };
};
