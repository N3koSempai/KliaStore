import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import type { AppOfTheDayWithDetails, AppOfTheWeekWithDetails } from "../types";

export class DBCacheManager {
	private static instance: DBCacheManager;
	private db: Database | null = null;

	private constructor() {}

	static getInstance(): DBCacheManager {
		if (!DBCacheManager.instance) {
			DBCacheManager.instance = new DBCacheManager();
		}
		return DBCacheManager.instance;
	}

	async initialize(): Promise<void> {
		if (this.db) return;

		try {
			const dbPath = await invoke<string>("get_app_data_path", {
				subpath: "kliastore.db",
			});
			this.db = await Database.load(`sqlite:${dbPath}`);
		} catch (error) {
			console.error("Error initializing database:", error);
			throw error;
		}
	}

	private getCurrentDate(): string {
		const now = new Date();
		return now.toISOString().split("T")[0]; // YYYY-MM-DD
	}

	async shouldUpdateSection(sectionName: string): Promise<boolean> {
		await this.initialize();
		if (!this.db) throw new Error("Database not initialized");

		const currentDate = this.getCurrentDate();

		const result = await this.db.select<Array<{ last_update_date: string }>>(
			"SELECT last_update_date FROM cache_metadata WHERE section_name = $1",
			[sectionName],
		);

		if (result.length === 0) {
			return true; // No hay caché, necesita actualizar
		}

		return result[0].last_update_date !== currentDate;
	}

	async updateSectionDate(sectionName: string): Promise<void> {
		await this.initialize();
		if (!this.db) throw new Error("Database not initialized");

		const currentDate = this.getCurrentDate();

		await this.db.execute(
			`INSERT OR REPLACE INTO cache_metadata (section_name, last_update_date, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)`,
			[sectionName, currentDate],
		);
	}

	// App of the Day
	async getCachedAppOfTheDay(): Promise<AppOfTheDayWithDetails | null> {
		await this.initialize();
		if (!this.db) throw new Error("Database not initialized");

		const result = await this.db.select<
			Array<{
				app_id: string;
				name: string | null;
				icon: string | null;
				data: string;
			}>
		>("SELECT app_id, name, icon, data FROM destacados LIMIT 1");

		if (result.length === 0) return null;

		const row = result[0];
		const parsedData = JSON.parse(row.data);

		return {
			app_id: row.app_id,
			name: row.name || undefined,
			icon: row.icon || undefined,
			day: parsedData.day,
			appStream: parsedData.appStream,
		};
	}

	async cacheAppOfTheDay(app: AppOfTheDayWithDetails): Promise<void> {
		await this.initialize();
		if (!this.db) throw new Error("Database not initialized");

		// Limpiar tabla primero (solo debe haber 1 app destacada)
		await this.db.execute("DELETE FROM destacados");

		const dataStr = JSON.stringify({
			day: app.day,
			appStream: app.appStream,
		});

		await this.db.execute(
			`INSERT INTO destacados (app_id, name, icon, data)
       VALUES ($1, $2, $3, $4)`,
			[app.app_id, app.name || null, app.icon || null, dataStr],
		);

		await this.updateSectionDate("appOfTheDay");
	}

	// Apps of the Week
	async getCachedAppsOfTheWeek(): Promise<AppOfTheWeekWithDetails[]> {
		await this.initialize();
		if (!this.db) throw new Error("Database not initialized");

		const result = await this.db.select<
			Array<{
				app_id: string;
				position: number;
				name: string | null;
				icon: string | null;
				data: string;
			}>
		>(
			"SELECT app_id, position, name, icon, data FROM apps_of_the_week ORDER BY position",
		);

		return result.map((row) => {
			const parsedData = JSON.parse(row.data);
			return {
				app_id: row.app_id,
				position: row.position,
				isFullscreen: parsedData.isFullscreen,
				name: row.name || undefined,
				icon: row.icon || undefined,
				summary: parsedData.summary,
				appStream: parsedData.appStream,
			};
		});
	}

	async cacheAppsOfTheWeek(apps: AppOfTheWeekWithDetails[]): Promise<void> {
		await this.initialize();
		if (!this.db) throw new Error("Database not initialized");

		// Limpiar tabla primero
		await this.db.execute("DELETE FROM apps_of_the_week");

		for (const app of apps) {
			const dataStr = JSON.stringify({
				isFullscreen: app.isFullscreen,
				summary: app.summary,
				appStream: app.appStream,
			});

			await this.db.execute(
				`INSERT INTO apps_of_the_week (app_id, position, name, icon, data)
         VALUES ($1, $2, $3, $4, $5)`,
				[app.app_id, app.position, app.name || null, app.icon || null, dataStr],
			);
		}

		await this.updateSectionDate("appsOfTheWeek");
	}
}

export const dbCacheManager = DBCacheManager.getInstance();
