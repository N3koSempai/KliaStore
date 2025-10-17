import { useEffect, useState } from "react";
import { apiService } from "../services/api";
import type { AppStream } from "../types";
import { imageCacheManager } from "../utils/imageCache";

interface UseAppScreenshotsReturn {
	screenshots: AppStream["screenshots"];
	isLoading: boolean;
	error: Error | null;
}

export const useAppScreenshots = (app: AppStream): UseAppScreenshotsReturn => {
	const [screenshots, setScreenshots] = useState<AppStream["screenshots"]>(
		app.screenshots,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadScreenshots = async () => {
			// Si ya tenemos screenshots, no necesitamos hacer nada
			if (app.screenshots && app.screenshots.length > 0) {
				return;
			}

			try {
				setIsLoading(true);
				setError(null);

				// Intentar encontrar screenshots en caché
				let foundInCache = false;
				const cachedScreenshots: AppStream["screenshots"] = [];

				// Buscar screenshots en caché usando el formato appId:::1, appId:::2, etc.
				for (let i = 1; i <= 10; i++) {
					// Buscar hasta 10 screenshots
					const cacheKey = `${app.id}:::${i}`;
					const cachedPath =
						await imageCacheManager.getCachedImagePath(cacheKey);

					if (cachedPath) {
						foundInCache = true;
						// Si encontramos en caché, agregarlo a la lista
						cachedScreenshots.push({
							sizes: [
								{
									width: "1920",
									height: "1080",
									scale: "1",
									src: cachedPath,
								},
							],
						});
					} else {
						// Si no encontramos uno, asumimos que no hay más
						break;
					}
				}

				if (foundInCache && isMounted) {
					setScreenshots(cachedScreenshots);
					setIsLoading(false);
					return;
				}

				// Si no encontramos en caché, buscar en la API
				const appStreamData = await apiService.getAppStream(app.id);

				if (isMounted) {
					setScreenshots(appStreamData.screenshots);
					setIsLoading(false);
				}
			} catch (err) {
				console.error("Error loading screenshots:", err);
				if (isMounted) {
					setError(
						err instanceof Error ? err : new Error("Error loading screenshots"),
					);
					setIsLoading(false);
				}
			}
		};

		loadScreenshots();

		return () => {
			isMounted = false;
		};
	}, [app.id, app.screenshots]);

	return { screenshots, isLoading, error };
};
