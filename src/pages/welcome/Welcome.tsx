import { useEffect, useState } from "react";
import { completeSetup } from "../../hooks/useCompleteSetup";
import "./Welcome.css";

interface WelcomeSlide {
	id: number;
	title: string;
	description: string;
}

const slides: WelcomeSlide[] = [
	{
		id: 1,
		title: "Welcome to Klia Store",
		description: "Your gateway to discover and install amazing applications",
	},
	{
		id: 2,
		title: "Did you know...",
		description:
			"Klia Store uses smart caching to avoid unnecessary bandwidth usage",
	},
	{
		id: 3,
		title: "Did you know...",
		description:
			"NekoSempai created this store to provide more opportunities for open source developers to receive donations through cryptocurrency payments",
	},
	{
		id: 4,
		title: "Easy Installation",
		description:
			"Install apps with just one click and keep them updated automatically",
	},
	{
		id: 5,
		title: "Ready to Start",
		description: "Let's explore the world of open source applications together!",
	},
];

interface WelcomeProps {
	onComplete: () => void;
}

export function Welcome({ onComplete }: WelcomeProps) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isCompleting, setIsCompleting] = useState(false);

	useEffect(() => {
		const timer = setTimeout(
			() => {
				if (currentSlide < slides.length - 1) {
					setCurrentSlide(currentSlide + 1);
				}
			},
			5000,
		); // 5 seconds per slide

		return () => clearTimeout(timer);
	}, [currentSlide]);

	const handleComplete = async () => {
		setIsCompleting(true);
		try {
			await completeSetup();
			onComplete();
		} catch (err) {
			console.error("Failed to complete setup:", err);
			setIsCompleting(false);
		}
	};

	const handleSkip = () => {
		if (currentSlide < slides.length - 1) {
			setCurrentSlide(currentSlide + 1);
		}
	};

	const handleAccept = async () => {
		await handleComplete();
	};

	const handleIndicatorClick = (index: number) => {
		setCurrentSlide(index);
	};

	const renderDescription = (description: string, slideId: number) => {
		if (slideId === 2) {
			return (
				<p className="slide-description">
					{description} <span className="highlight-localfirst">#localfirst</span>
				</p>
			);
		}
		if (slideId === 3) {
			const parts = description.split("NekoSempai");
			return (
				<p className="slide-description">
					{parts[0]}
					<a
						href="https://github.com/N3koSempai"
						className="github-link"
						onClick={(e) => {
							e.preventDefault();
							window.open("https://github.com/N3koSempai", "_blank");
						}}
					>
						@NekoSempai
					</a>
					{parts[1]}
				</p>
			);
		}
		return <p className="slide-description">{description}</p>;
	};

	return (
		<div className="welcome-container">
			<div className="welcome-content">
				<div className="slide-content">
					<h1 className="slide-title">{slides[currentSlide].title}</h1>
					{renderDescription(
						slides[currentSlide].description,
						slides[currentSlide].id,
					)}
				</div>

				<div className="slide-indicators">
					{slides.map((slide, index) => (
						<button
							key={slide.id}
							type="button"
							onClick={() => handleIndicatorClick(index)}
							className={`indicator ${index === currentSlide ? "active" : ""}`}
							aria-label={`Go to slide ${index + 1}`}
						/>
					))}
				</div>

				<div className="welcome-actions">
					{currentSlide < slides.length - 1 && (
						<button
							type="button"
							onClick={handleSkip}
							className="btn-skip"
							disabled={isCompleting}
						>
							Skip
						</button>
					)}
					<button
						type="button"
						onClick={handleAccept}
						className="btn-accept"
						disabled={isCompleting}
					>
						{isCompleting ? "Setting up..." : "Get Started"}
					</button>
				</div>
			</div>
		</div>
	);
}
