import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import type { AppOfTheDayWithDetails } from "../types";

export const useAppOfTheDay = () => {
	return useQuery({
		queryKey: ["appOfTheDay"],
		queryFn: async () => {
			const response = await apiService.getAppOfTheDay();

			try {
				const appStream = await apiService.getAppStream(response.app_id);
				return {
					...response,
					name: appStream.name,
					icon: appStream.icon || appStream.icons?.[0]?.url,
					appStream: appStream,
				} as AppOfTheDayWithDetails;
			} catch (error) {
				console.error(`Error fetching appstream for ${response.app_id}:`, error);
				return {
					...response,
					name: response.app_id,
				} as AppOfTheDayWithDetails;
			}
		},
	});
};
