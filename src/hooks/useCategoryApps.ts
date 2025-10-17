import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";

export const useCategoryApps = (categoryId: string) => {
	return useQuery({
		queryKey: ["categoryApps", categoryId],
		queryFn: () => apiService.getCategoryApps(categoryId),
		enabled: !!categoryId,
	});
};
