import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import type { AppOfTheWeekWithDetails } from "../types";
import { dbCacheManager } from "../utils/dbCache";

export const useAppsOfTheWeek = () => {
	return useQuery({
		queryKey: ["appsOfTheWeek"],
		queryFn: async () => {
			// Verificar si necesitamos actualizar el caché
			const shouldUpdate =
				await dbCacheManager.shouldUpdateSection("appsOfTheWeek");

			// Si no necesitamos actualizar, devolver datos cacheados
			if (!shouldUpdate) {
				const cachedData = await dbCacheManager.getCachedAppsOfTheWeek();
				if (cachedData.length > 0) {
					console.log("Using cached apps of the week");
					return cachedData;
				}
			}

			// Necesitamos actualizar: llamar a la API
			console.log("Fetching fresh apps of the week from API");
			const response = await apiService.getAppsOfTheWeek();

			const appsWithDetails = await Promise.all(
				response.apps.map(async (app) => {
					try {
						const appStream = await apiService.getAppStream(app.app_id);
						return {
							...app,
							name: appStream.name,
							icon: appStream.icon || appStream.icons?.[0]?.url,
							summary: appStream.summary,
							appStream: appStream,
						} as AppOfTheWeekWithDetails;
					} catch (error) {
						console.error(`Error fetching appstream for ${app.app_id}:`, error);
						return {
							...app,
							name: app.app_id,
						} as AppOfTheWeekWithDetails;
					}
				}),
			);

			// Guardar en caché
			await dbCacheManager.cacheAppsOfTheWeek(appsWithDetails);

			return appsWithDetails;
		},
	});
};
