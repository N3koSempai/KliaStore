import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";

interface ImageCacheIndex {
	[appId: string]: string;
}

export class ImageCacheManager {
	private static instance: ImageCacheManager;
	private cacheIndex: ImageCacheIndex | null = null;
	private cacheDir: string | null = null;
	private indexPath: string | null = null;
	private initPromise: Promise<void> | null = null;

	private constructor() {}

	static getInstance(): ImageCacheManager {
		if (!ImageCacheManager.instance) {
			ImageCacheManager.instance = new ImageCacheManager();
		}
		return ImageCacheManager.instance;
	}

	async initialize(): Promise<void> {
		// Si ya hay una inicialización en curso, esperar a que termine
		if (this.initPromise) {
			console.log("[ImageCache] Waiting for initialization to complete...");
			return this.initPromise;
		}

		// Si ya está inicializado, retornar inmediatamente
		if (this.cacheDir) {
			console.log("[ImageCache] Already initialized, skipping");
			return;
		}

		// Crear la promesa de inicialización
		this.initPromise = (async () => {
			try {
				// Obtener la ruta de la carpeta cacheImage
				this.cacheDir = await invoke<string>("get_cache_image_dir");
				this.indexPath = await join(this.cacheDir, "index.json");

				console.log(`[ImageCache] Initializing cache at: ${this.cacheDir}`);
				console.log(`[ImageCache] Index path: ${this.indexPath}`);

				// Cargar o crear el index.json
				await this.loadIndex();
				console.log("[ImageCache] Initialization complete");
			} catch (error) {
				console.error("[ImageCache] Error initializing image cache:", error);
				this.initPromise = null; // Resetear para permitir reintento
				throw error;
			}
		})();

		return this.initPromise;
	}

	private async loadIndex(): Promise<void> {
		try {
			const indexContent = await invoke<string>("read_cache_index");
			this.cacheIndex = JSON.parse(indexContent);
			const entriesCount = Object.keys(this.cacheIndex || {}).length;
			console.log(
				`[ImageCache] Loaded index with ${entriesCount} entries`,
			);
			console.log(`[ImageCache] Index content:`, this.cacheIndex);
		} catch (error) {
			// Si no existe el index.json, crearlo vacío
			console.warn(
				`[ImageCache] Could not load index, creating new one:`,
				error,
			);
			this.cacheIndex = {};
			await this.saveIndex();
		}
	}

	private async saveIndex(): Promise<void> {
		if (!this.cacheIndex) return;

		try {
			const content = JSON.stringify(this.cacheIndex, null, 2);
			console.log(`[ImageCache] Saving index with content:`, content);
			await invoke("write_cache_index", {
				content,
			});
			console.log(`[ImageCache] Index saved successfully`);
		} catch (error) {
			console.error("[ImageCache] Error saving cache index:", error);
			throw error;
		}
	}

	async getCachedImagePath(appId: string): Promise<string | null> {
		await this.initialize();

		if (!this.cacheIndex || !this.cacheIndex[appId]) {
			console.log(`[ImageCache] No cache entry found for appId: ${appId}`);
			return null;
		}

		try {
			const filename = this.cacheIndex[appId];
			const fullPath = await invoke<string>("get_cached_image_path", {
				filename,
			});

			console.log(
				`[ImageCache] Checking cached image for ${appId}: ${fullPath}`,
			);

			// Verificar que el archivo existe
			const exists = await invoke<boolean>("check_file_exists", {
				path: fullPath,
			});

			console.log(`[ImageCache] File exists: ${exists} for ${fullPath}`);

			if (!exists) {
				console.warn(
					`[ImageCache] Cached image not found, removing from index: ${fullPath}`,
				);
				// Eliminar del índice si no existe
				delete this.cacheIndex[appId];
				await this.saveIndex();
				return null;
			}

			console.log(`[ImageCache] Full path before conversion: ${fullPath}`);

			// convertFileSrc en Tauri v2 genera asset://localhost/{path}
			// pero con el path doblemente encoded
			let convertedPath = convertFileSrc(fullPath);
			console.log(
				`[ImageCache] Converted path for ${appId}: ${convertedPath}`,
			);

			// Si detectamos doble encoding (%2F), decodificar una vez
			if (convertedPath.includes("%2F")) {
				console.warn(
					`[ImageCache] Detected double encoding, decoding once`,
				);
				// Decodificar el path en la URL
				// asset://localhost/%2Fhome... -> asset://localhost/home...
				const url = new URL(convertedPath);
				const decodedPathname = decodeURIComponent(url.pathname);
				convertedPath = `${url.protocol}//${url.host}${decodedPathname}`;
				console.log(`[ImageCache] Decoded URL: ${convertedPath}`);
			}

			return convertedPath;
		} catch (error) {
			console.error(`[ImageCache] Error getting cached image for ${appId}:`, error);
			return null;
		}
	}

	async cacheImage(appId: string, imageUrl: string): Promise<string> {
		await this.initialize();

		console.log(`[ImageCache] Downloading and caching image for ${appId}: ${imageUrl}`);

		try {
			// Descargar y guardar la imagen
			const filename = await invoke<string>("download_and_cache_image", {
				appId,
				imageUrl,
			});

			console.log(`[ImageCache] Image downloaded successfully: ${filename}`);

			// Actualizar el índice
			if (this.cacheIndex) {
				this.cacheIndex[appId] = filename;
				await this.saveIndex();
				console.log(`[ImageCache] Index updated for ${appId}`);
			}

			const fullPath = await invoke<string>("get_cached_image_path", {
				filename,
			});
			let convertedPath = convertFileSrc(fullPath);

			// Si detectamos doble encoding, decodificar una vez
			if (convertedPath.includes("%2F")) {
				console.warn(
					`[ImageCache] Detected double encoding in new cache, decoding once`,
				);
				const url = new URL(convertedPath);
				const decodedPathname = decodeURIComponent(url.pathname);
				convertedPath = `${url.protocol}//${url.host}${decodedPathname}`;
				console.log(`[ImageCache] New cached image path: ${convertedPath}`);
				return convertedPath;
			}

			console.log(`[ImageCache] New cached image path: ${convertedPath}`);
			return convertedPath;
		} catch (error) {
			console.error(`[ImageCache] Error caching image for ${appId}:`, error);
			throw error;
		}
	}

	async getOrCacheImage(appId: string, imageUrl: string): Promise<string> {
		console.log(`[ImageCache] getOrCacheImage called for ${appId}`);

		// Primero intentar obtener de caché
		const cachedPath = await this.getCachedImagePath(appId);

		if (cachedPath) {
			console.log(`[ImageCache] Using cached image for ${appId}`);
			return cachedPath;
		}

		console.log(`[ImageCache] No cache found, downloading for ${appId}`);
		// Si no está en caché, descargar y cachear
		return await this.cacheImage(appId, imageUrl);
	}
}

export const imageCacheManager = ImageCacheManager.getInstance();
