import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import type { AppOfTheWeekWithDetails } from "../types";

export const useAppsOfTheWeek = () => {
	return useQuery({
		queryKey: ["appsOfTheWeek"],
		queryFn: async () => {
			const response = await apiService.getAppsOfTheWeek();

			const appsWithDetails = await Promise.all(
				response.apps.map(async (app) => {
					try {
						const appStream = await apiService.getAppStream(app.app_id);
						return {
							...app,
							name: appStream.name,
							icon: appStream.icon || appStream.icons?.[0]?.url,
							appStream: appStream, // Guardamos todo el appStream
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

			return appsWithDetails;
		},
	});
};
