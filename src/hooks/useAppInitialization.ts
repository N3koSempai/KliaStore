import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

export function useAppInitialization() {
	const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const checkFirstLaunch = async () => {
			try {
				// Only check if it's first launch, don't initialize yet
				const firstLaunch = await invoke<boolean>("check_first_launch");
				setIsFirstLaunch(firstLaunch);
				setIsInitializing(false);
			} catch (err) {
				console.error("Failed to check first launch:", err);
				setError(err instanceof Error ? err.message : String(err));
				setIsInitializing(false);
			}
		};

		checkFirstLaunch();
	}, []);

	return { isFirstLaunch, isInitializing, error };
}
