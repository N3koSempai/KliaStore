import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: apiService.getCategories,
  });
};
