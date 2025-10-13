import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import type { Category } from "../types";

const API_BASE_URL = "https://flathub.org/api/v2";

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
};
