import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import type { InstalledAppInfo } from "../store/installedAppsStore";
import { useInstalledAppsStore } from "../store/installedAppsStore";

interface InstalledAppRust {
	app_id: string;
	name: string;
	version: string;
}

export const useInstalledApps = () => {
	const { setInstalledAppsInfo } = useInstalledAppsStore();

	useEffect(() => {
		const loadInstalledApps = async () => {
			try {
				const apps = await invoke<InstalledAppRust[]>("get_installed_flatpaks");

				// Convert from Rust format to TypeScript format
				const installedAppsInfo: InstalledAppInfo[] = apps.map((app) => ({
					appId: app.app_id,
					name: app.name,
					version: app.version,
				}));

				setInstalledAppsInfo(installedAppsInfo);
			} catch (error) {
				// If loading fails, don't block the app
				console.error("Error loading installed apps:", error);
			}
		};

		// Execute asynchronously without blocking
		loadInstalledApps();
	}, [setInstalledAppsInfo]);
};
