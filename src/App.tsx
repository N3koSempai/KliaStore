import { useState } from "react";
import { useAppInitialization } from "./hooks/useAppInitialization";
import { useInstalledApps } from "./hooks/useInstalledApps";
import { AppDetails } from "./pages/appDetails/AppDetails";
import { CategoryApps } from "./pages/categoryApps/CategoryApps";
import { Home } from "./pages/home/Home";
import { MyApps } from "./pages/myApps/MyApps";
import { Welcome } from "./pages/welcome/Welcome";
import type { AppStream } from "./types";
import "./App.css";

function App() {
	const [selectedApp, setSelectedApp] = useState<AppStream | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [showMyApps, setShowMyApps] = useState(false);
	const [showWelcome, setShowWelcome] = useState(true);
	const { isFirstLaunch, isInitializing, error } = useAppInitialization();

	// Load installed apps on startup (non-blocking)
	// This also loads available updates after installed apps are loaded
	useInstalledApps();

	const handleWelcomeComplete = () => {
		setShowWelcome(false);
	};

	// Show loading state while initializing
	if (isInitializing) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				<p>Initializing Klia Store...</p>
			</div>
		);
	}

	// Show error if initialization failed
	if (error) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					flexDirection: "column",
				}}
			>
				<p>Error initializing app:</p>
				<p>{error}</p>
			</div>
		);
	}

	// Show welcome screen on first launch
	if (isFirstLaunch && showWelcome) {
		return <Welcome onComplete={handleWelcomeComplete} />;
	}

	// Show main app
	if (selectedApp) {
		return (
			<AppDetails
				app={selectedApp}
				onBack={() => {
					setSelectedApp(null);
				}}
			/>
		);
	}

	if (selectedCategory) {
		return (
			<CategoryApps
				categoryId={selectedCategory}
				onBack={() => setSelectedCategory(null)}
				onAppSelect={setSelectedApp}
			/>
		);
	}

	if (showMyApps) {
		return <MyApps onBack={() => setShowMyApps(false)} />;
	}

	return (
		<Home
			onAppSelect={setSelectedApp}
			onCategorySelect={setSelectedCategory}
			onMyAppsClick={() => setShowMyApps(true)}
		/>
	);
}

export default App;
