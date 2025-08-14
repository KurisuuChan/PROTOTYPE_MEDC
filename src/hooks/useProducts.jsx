import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import { addSystemNotification } from "@/utils/notificationStorage";

export const useProducts = (addNotification) => {
  const queryClient = useQueryClient();

  // Query to fetch all non-archived products
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await api.getProducts();
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Mutation for archiving products
  const archiveProductsMutation = useMutation({
    mutationFn: (productIds) => api.archiveProducts(productIds),
    onSuccess: (data, productIds) => {
      // When the mutation is successful, invalidate the 'products' query
      // This will trigger a re-fetch and update the UI automatically
      queryClient.invalidateQueries({ queryKey: ["products"] });
      addNotification(
        `${productIds.length} product(s) successfully archived.`,
        "success"
      );
      addSystemNotification({
        id: `archive-${Date.now()}`,
        iconType: "archive",
        iconBg: "bg-purple-100",
        title: "Products Archived",
        category: "System",
        description: `${productIds.length} product(s) were archived.`,
        createdAt: new Date().toISOString(),
        path: "/archived",
      });
    },
    onError: (error) => {
      addNotification(`Error: ${error.message}`, "error");
    },
  });

  return {
    products,
    isLoading,
    isError,
    archiveProducts: archiveProductsMutation.mutate,
  };
};
