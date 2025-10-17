import { useEffect, useState } from "react";
import { imageCacheManager } from "../utils/imageCache";

interface CachedImageProps {
	appId: string;
	imageUrl: string;
	alt: string;
	style?: React.CSSProperties;
	className?: string;
}

export const CachedImage = ({
	appId,
	imageUrl,
	alt,
	style,
	className,
}: CachedImageProps) => {
	const [imageSrc, setImageSrc] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const loadImage = async () => {
			try {
				setIsLoading(true);
				setError(false);

				const cachedPath = await imageCacheManager.getOrCacheImage(
					appId,
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
	}, [appId, imageUrl]);

	if (isLoading) {
		return (
			<div
				style={{
					...style,
					backgroundColor: "#e0e0e0",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
				className={className}
			>
				{/* Placeholder mientras carga */}
			</div>
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
				}
			}}
		/>
	);
};
