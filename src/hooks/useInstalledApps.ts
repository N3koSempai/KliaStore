import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { useInstalledAppsStore } from "../store/installedAppsStore";

export const useInstalledApps = () => {
	const { setInstalledApps } = useInstalledAppsStore();

	useEffect(() => {
		const loadInstalledApps = async () => {
			try {
				const appIds = await invoke<string[]>("get_installed_flatpaks");

				// Convert array of appIds to Record<string, boolean>
				const installedAppsMap: Record<string, boolean> = {};
				for (const appId of appIds) {
					installedAppsMap[appId] = true;
				}

				setInstalledApps(installedAppsMap);
			} catch (error) {
				// If loading fails, don't block the app
				console.error("Error loading installed apps:", error);
			}
		};

		// Execute asynchronously without blocking
		loadInstalledApps();
	}, [setInstalledApps]);
};
