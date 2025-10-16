import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import type {
	AppStream,
	AppSummary,
	AppsOfTheWeekResponse,
	Category,
} from "../types";

const API_BASE_URL = "https://flathub.org/api/v2";

const getTodayDate = (): string => {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const apiService = {
	async getCategories(): Promise<Category[]> {
		const response = await tauriFetch(`${API_BASE_URL}/collection/category`, {
			method: "GET",
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data as Category[];
	},

	async getAppsOfTheWeek(): Promise<AppsOfTheWeekResponse> {
		const today = getTodayDate();
		const response = await tauriFetch(
			`${API_BASE_URL}/app-picks/apps-of-the-week/${today}`,
			{
				method: "GET",
				headers: {
					accept: "application/json",
				},
			},
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data as AppsOfTheWeekResponse;
	},

	async getAppSummary(
		appId: string,
		branch: string = "main",
	): Promise<AppSummary> {
		const response = await tauriFetch(
			`${API_BASE_URL}/summary/${appId}?branch=${branch}`,
			{
				method: "GET",
				headers: {
					accept: "application/json",
				},
			},
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data as AppSummary;
	},

	async getAppStream(appId: string): Promise<AppStream> {
		const response = await tauriFetch(`${API_BASE_URL}/appstream/${appId}`, {
			method: "GET",
			headers: {
				accept: "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data as AppStream;
	},
};
