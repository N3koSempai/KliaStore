import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { dbCacheManager } from "../utils/dbCache";

export const useCategories = () => {
	return useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			// Check if cache should be updated (weekly cache = 7 days)
			const shouldUpdate = await dbCacheManager.shouldUpdateSection("categories", 7);

			if (!shouldUpdate) {
				// Load from cache (less than 7 days old)
				const cachedCategories = await dbCacheManager.getCachedCategories();
				if (cachedCategories.length > 0) {
					return cachedCategories;
				}
			}

			// Fetch from API and update cache
			const categories = await apiService.getCategories();
			await dbCacheManager.cacheCategories(categories);
			return categories;
		},
	});
};
