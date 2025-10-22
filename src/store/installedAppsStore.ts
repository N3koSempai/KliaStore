import { create } from "zustand";

interface InstalledAppsStore {
	installedApps: Record<string, boolean>;
	setInstalledApp: (appId: string, isInstalled: boolean) => void;
	setInstalledApps: (apps: Record<string, boolean>) => void;
	isAppInstalled: (appId: string) => boolean;
}

export const useInstalledAppsStore = create<InstalledAppsStore>((set, get) => ({
	installedApps: {},

	setInstalledApp: (appId: string, isInstalled: boolean) =>
		set((state) => ({
			installedApps: {
				...state.installedApps,
				[appId]: isInstalled,
			},
		})),

	setInstalledApps: (apps: Record<string, boolean>) =>
		set({ installedApps: apps }),

	isAppInstalled: (appId: string) => {
		const state = get();
		return state.installedApps[appId] ?? false;
	},
}));
