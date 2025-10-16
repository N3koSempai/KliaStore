import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";

export async function completeSetup() {
	try {
		// Initialize app (creates directories and config)
		await invoke("initialize_app");

		// Get database path
		const dbPath = await invoke<string>("get_app_data_path", {
			subpath: "kliastore.db",
		});

		// Initialize database with tables
		const db = await Database.load(`sqlite:${dbPath}`);

		// Create tables for the app
		await db.execute(`
      CREATE TABLE IF NOT EXISTS installed_apps (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        installed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await db.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        app_id TEXT PRIMARY KEY,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await db.execute(`
      CREATE TABLE IF NOT EXISTS app_cache (
        app_id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		console.log("Setup completed successfully");
	} catch (err) {
		console.error("Failed to complete setup:", err);
		throw err;
	}
}
