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

			// Ensure all required tables exist
			await this.ensureTables();
		} catch (error) {
			console.error("Error initializing database:", error);
			throw error;
		}
	}

	private async ensureTables(): Promise<void> {
		if (!this.db) return;

		try {
			// Create cache_metadata table if not exists
			await this.db.execute(`
				CREATE TABLE IF NOT EXISTS cache_metadata (
					section_name TEXT PRIMARY KEY,
					last_update_date TEXT NOT NULL,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
				)
			`);

			// Create destacados table if not exists
			await this.db.execute(`
				CREATE TABLE IF NOT EXISTS destacados (
					app_id TEXT PRIMARY KEY,
					name TEXT,
					icon TEXT,
					data TEXT NOT NULL,
					cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
				)
			`);

			// Create apps_of_the_week table if not exists
			await this.db.execute(`
				CREATE TABLE IF NOT EXISTS apps_of_the_week (
					app_id TEXT PRIMARY KEY,
					position INTEGER,
					name TEXT,
					icon TEXT,
					data TEXT NOT NULL,
					cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
				)
			`);

			// Create categories table if not exists
			await this.db.execute(`
				CREATE TABLE IF NOT EXISTS categories (
					category_name TEXT PRIMARY KEY,
					cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
				)
			`);

			console.log("All cache tables verified/created");
		} catch (error) {
			console.error("Error ensuring tables exist:", error);
			// Don't throw - let the app continue and handle errors per operation
		}
	}

	private getCurrentDate(): string {
		const now = new Date();
		return now.toISOString().split("T")[0]; // YYYY-MM-DD
	}

	private getDateDaysAgo(daysAgo: number): string {
		const date = new Date();
		date.setDate(date.getDate() - daysAgo);
		return date.toISOString().split("T")[0]; // YYYY-MM-DD
	}

	async shouldUpdateSection(sectionName: string, maxDaysOld = 0): Promise<boolean> {
		await this.initialize();
		if (!this.db) throw new Error("Database not initialized");

		const currentDate = this.getCurrentDate();

		const result = await this.db.select<Array<{ last_update_date: string }>>(
			"SELECT last_update_date FROM cache_metadata WHERE section_name = $1",
			[sectionName],
		);

		if (result.length === 0) {
			return true; // No cache exists, needs update
		}

		// If maxDaysOld is 0, compare with current date (daily behavior)
		if (maxDaysOld === 0) {
			return result[0].last_update_date !== currentDate;
		}

		// If maxDaysOld > 0, check if last update is older than maxDaysOld days
		const oldestAllowedDate = this.getDateDaysAgo(maxDaysOld);
		return result[0].last_update_date < oldestAllowedDate;
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

		try {
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
		} catch (error) {
			console.error("Error reading app of the day cache:", error);
			// Return null if table doesn't exist or query fails
			return null;
		}
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

		try {
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
		} catch (error) {
			console.error("Error reading apps of the week cache:", error);
			// Return empty array if table doesn't exist or query fails
			return [];
		}
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

	// Categories (weekly cache)
	async getCachedCategories(): Promise<string[]> {
		await this.initialize();
		if (!this.db) throw new Error("Database not initialized");

		try {
			const result = await this.db.select<
				Array<{
					category_name: string;
				}>
			>("SELECT category_name FROM categories ORDER BY category_name");

			return result.map((row) => row.category_name);
		} catch (error) {
			console.error("Error reading categories cache:", error);
			// Return empty array if table doesn't exist or query fails
			return [];
		}
	}

	async cacheCategories(categories: string[]): Promise<void> {
		await this.initialize();
		if (!this.db) throw new Error("Database not initialized");

		// Clear table first
		await this.db.execute("DELETE FROM categories");

		for (const category of categories) {
			await this.db.execute(
				"INSERT INTO categories (category_name) VALUES ($1)",
				[category],
			);
		}

		await this.updateSectionDate("categories");
	}
}

export const dbCacheManager = DBCacheManager.getInstance();
