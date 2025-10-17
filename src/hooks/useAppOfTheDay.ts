import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import type { AppOfTheDayWithDetails } from "../types";
import { dbCacheManager } from "../utils/dbCache";

export const useAppOfTheDay = () => {
	return useQuery({
		queryKey: ["appOfTheDay"],
		queryFn: async () => {
			// Verificar si necesitamos actualizar el caché
			const shouldUpdate =
				await dbCacheManager.shouldUpdateSection("appOfTheDay");

			// Si no necesitamos actualizar, devolver datos cacheados
			if (!shouldUpdate) {
				const cachedData = await dbCacheManager.getCachedAppOfTheDay();
				if (cachedData) {
					console.log("Using cached app of the day");
					return cachedData;
				}
			}

			// Necesitamos actualizar: llamar a la API
			console.log("Fetching fresh app of the day from API");
			const response = await apiService.getAppOfTheDay();

			try {
				const appStream = await apiService.getAppStream(response.app_id);
				const appData = {
					...response,
					name: appStream.name,
					icon: appStream.icon || appStream.icons?.[0]?.url,
					appStream: appStream,
				} as AppOfTheDayWithDetails;

				// Guardar en caché
				await dbCacheManager.cacheAppOfTheDay(appData);

				return appData;
			} catch (error) {
				console.error(
					`Error fetching appstream for ${response.app_id}:`,
					error,
				);
				const fallbackData = {
					...response,
					name: response.app_id,
				} as AppOfTheDayWithDetails;

				// Guardar en caché incluso si falla appStream
				await dbCacheManager.cacheAppOfTheDay(fallbackData);

				return fallbackData;
			}
		},
	});
};
