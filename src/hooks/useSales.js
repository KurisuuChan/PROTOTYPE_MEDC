import { useQuery } from "@tanstack/react-query";
import * as api from "@/services/api";

// A dedicated hook for fetching all sales-related data
export const useSales = () => {
  // Query for all individual sale items
  const { data: saleItems = [], isLoading: isLoadingSaleItems } = useQuery({
    queryKey: ["saleItems"],
    queryFn: async () => {
      const { data, error } = await api.getAllSaleItems();
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Query for the main sales entries (transactions)
  const { data: sales = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await api.getSales();
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Query for recent sale items for the dashboard widget
  const { data: recentSales = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ["recentSales"],
    queryFn: async () => {
      const { data, error } = await api.getRecentSaleItems();
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  return {
    saleItems,
    sales,
    recentSales,
    isLoading: isLoadingSaleItems || isLoadingSales || isLoadingRecent,
  };
};
