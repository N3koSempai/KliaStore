import { useState } from "react";
import { AppDetails } from "./pages/appDetails/AppDetails";
import { Home } from "./pages/home/Home";
import { Welcome } from "./pages/welcome/Welcome";
import { useAppInitialization } from "./hooks/useAppInitialization";
import type { AppStream } from "./types";
import "./App.css";

function App() {
	const [selectedApp, setSelectedApp] = useState<AppStream | null>(null);
	const [showWelcome, setShowWelcome] = useState(true);
	const { isFirstLaunch, isInitializing, error } = useAppInitialization();

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
	return selectedApp ? (
		<AppDetails app={selectedApp} onBack={() => setSelectedApp(null)} />
	) : (
		<Home onAppSelect={setSelectedApp} />
	);
}

export default App;
