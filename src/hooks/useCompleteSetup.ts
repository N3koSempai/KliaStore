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

		// Tabla para app destacada (app of the day)
		await db.execute(`
      CREATE TABLE IF NOT EXISTS destacados (
        app_id TEXT PRIMARY KEY,
        name TEXT,
        icon TEXT,
        summary TEXT,
        description TEXT,
        data TEXT NOT NULL,
        cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		// Tabla para apps de la semana
		await db.execute(`
      CREATE TABLE IF NOT EXISTS apps_of_the_week (
        app_id TEXT PRIMARY KEY,
        position INTEGER,
        name TEXT,
        icon TEXT,
        data TEXT NOT NULL,
        cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		// Tabla para metadata de caché (fechas de actualización)
		await db.execute(`
      CREATE TABLE IF NOT EXISTS cache_metadata (
        section_name TEXT PRIMARY KEY,
        last_update_date TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		console.log("Setup completed successfully");
	} catch (err) {
		console.error("Failed to complete setup:", err);
		throw err;
	}
}
