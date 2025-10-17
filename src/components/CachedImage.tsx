import { Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { imageCacheManager } from "../utils/imageCache";

interface CachedImageProps {
	appId: string;
	imageUrl: string;
	alt: string;
	style?: React.CSSProperties;
	className?: string;
	cacheKey?: string; // Si se proporciona, se usa en lugar de appId para el caché
	variant?: "rectangular" | "circular" | "rounded";
}

export const CachedImage = ({
	appId,
	imageUrl,
	alt,
	style,
	className,
	cacheKey,
	variant = "rectangular",
}: CachedImageProps) => {
	const [imageSrc, setImageSrc] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const loadImage = async () => {
			try {
				setIsLoading(true);
				setImageLoaded(false);
				setError(false);

				// Usar cacheKey si se proporciona, sino usar appId
				const keyToUse = cacheKey || appId;
				const cachedPath = await imageCacheManager.getOrCacheImage(
					keyToUse,
					imageUrl,
				);

				if (isMounted) {
					setImageSrc(cachedPath);
					setIsLoading(false);
				}
			} catch (err) {
				console.error("Error loading cached image:", err);
				if (isMounted) {
					// Si falla el caché, usar la URL original
					setImageSrc(imageUrl);
					setError(true);
					setIsLoading(false);
				}
			}
		};

		if (imageUrl) {
			loadImage();
		}

		return () => {
			isMounted = false;
		};
	}, [appId, imageUrl, cacheKey]);

	// Mostrar skeleton mientras se obtiene la ruta O mientras la imagen se carga en el navegador
	if (isLoading || !imageLoaded) {
		return (
			<>
				<Skeleton
					variant={variant}
					sx={{
						width: "100%",
						height: "100%",
						...style,
						display: imageLoaded ? "none" : "block",
					}}
					className={className}
					animation="wave"
				/>
				{imageSrc && (
					<img
						src={imageSrc}
						alt={alt}
						style={{
							...style,
							display: imageLoaded ? "block" : "none",
						}}
						className={className}
						onLoad={() => setImageLoaded(true)}
						onError={() => {
							// Fallback a la URL original si falla cargar la imagen cacheada
							if (!error) {
								setImageSrc(imageUrl);
								setError(true);
							}
						}}
					/>
				)}
			</>
		);
	}

	return (
		<img
			src={imageSrc}
			alt={alt}
			style={style}
			className={className}
			onError={() => {
				// Fallback a la URL original si falla cargar la imagen cacheada
				if (!error) {
					setImageSrc(imageUrl);
					setError(true);
					setImageLoaded(false);
				}
			}}
		/>
	);
};
