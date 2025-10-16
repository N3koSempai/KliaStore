import { useState } from "react";
import { AppDetails } from "./pages/appDetails/AppDetails";
import { Home } from "./pages/home/Home";
import type { AppStream } from "./types";
import "./App.css";

function App() {
	const [selectedApp, setSelectedApp] = useState<AppStream | null>(null);

	return selectedApp ? (
		<AppDetails app={selectedApp} onBack={() => setSelectedApp(null)} />
	) : (
		<Home onAppSelect={setSelectedApp} />
	);
}

export default App;
