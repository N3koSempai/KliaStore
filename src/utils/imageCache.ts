import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";

interface ImageCacheIndex {
	[appId: string]: string;
}

export class ImageCacheManager {
	private static instance: ImageCacheManager;
	private cacheIndex: ImageCacheIndex | null = null;
	private cacheDir: string | null = null;
	private indexPath: string | null = null;

	private constructor() {}

	static getInstance(): ImageCacheManager {
		if (!ImageCacheManager.instance) {
			ImageCacheManager.instance = new ImageCacheManager();
		}
		return ImageCacheManager.instance;
	}

	async initialize(): Promise<void> {
		if (this.cacheDir) return;

		try {
			// Obtener la ruta de la carpeta cacheImage
			this.cacheDir = await invoke<string>("get_cache_image_dir");
			this.indexPath = await join(this.cacheDir, "index.json");

			// Cargar o crear el index.json
			await this.loadIndex();
		} catch (error) {
			console.error("Error initializing image cache:", error);
			throw error;
		}
	}

	private async loadIndex(): Promise<void> {
		try {
			const indexContent = await invoke<string>("read_cache_index");
			this.cacheIndex = JSON.parse(indexContent);
		} catch {
			// Si no existe el index.json, crearlo vacío
			this.cacheIndex = {};
			await this.saveIndex();
		}
	}

	private async saveIndex(): Promise<void> {
		if (!this.cacheIndex) return;

		try {
			await invoke("write_cache_index", {
				content: JSON.stringify(this.cacheIndex, null, 2),
			});
		} catch (error) {
			console.error("Error saving cache index:", error);
			throw error;
		}
	}

	async getCachedImagePath(appId: string): Promise<string | null> {
		await this.initialize();

		if (!this.cacheIndex || !this.cacheIndex[appId]) {
			return null;
		}

		const filename = this.cacheIndex[appId];
		const fullPath = await invoke<string>("get_cached_image_path", {
			filename,
		});
		return convertFileSrc(fullPath);
	}

	async cacheImage(appId: string, imageUrl: string): Promise<string> {
		await this.initialize();

		try {
			// Descargar y guardar la imagen
			const filename = await invoke<string>("download_and_cache_image", {
				appId,
				imageUrl,
			});

			// Actualizar el índice
			if (this.cacheIndex) {
				this.cacheIndex[appId] = filename;
				await this.saveIndex();
			}

			const fullPath = await invoke<string>("get_cached_image_path", {
				filename,
			});
			return convertFileSrc(fullPath);
		} catch (error) {
			console.error("Error caching image:", error);
			throw error;
		}
	}

	async getOrCacheImage(appId: string, imageUrl: string): Promise<string> {
		// Primero intentar obtener de caché
		const cachedPath = await this.getCachedImagePath(appId);

		if (cachedPath) {
			return cachedPath;
		}

		// Si no está en caché, descargar y cachear
		return await this.cacheImage(appId, imageUrl);
	}
}

export const imageCacheManager = ImageCacheManager.getInstance();
