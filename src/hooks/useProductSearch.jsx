import { useMemo, useState } from "react";

export const useProductSearch = (products) => {
  const [searchTerm, setSearchTerm] = useState("");

  const searchedProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    return products.filter((product) =>
      Object.values(product).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [products, searchTerm]);

  return { searchTerm, setSearchTerm, searchedProducts };
};