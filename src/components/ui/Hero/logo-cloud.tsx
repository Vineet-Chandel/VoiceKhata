// https://motion-primitives.com/docs/infinite-slider
import { InfiniteSlider } from "@/components/ui/Hero/infinite-slider";

export function Logo_Cloud() {
	return (
		<div className="mask-[linear-gradient(to_right,transparent,black,transparent)] overflow-hidden py-4">
			<InfiniteSlider gap={42} reverse speed={80} speedOnHover={25}>
				{logos.map((logo) => (
					<img
						alt={logo.alt}
						className="pointer-events-none h-4 select-none md:h-5 dark:brightness-0 dark:invert"
						height="auto"
						key={`logo-${logo.alt}`}
						loading="lazy"
						src={logo.src}
						width="auto"
					/>
				))}
			</InfiniteSlider>
		</div>
	);
}

const logos = [
	{
		src: "https://storage.efferd.com/logo/nvidia-wordmark.svg",
		alt: "Nvidia Logo",
	},
	{
		src: "https://storage.efferd.com/logo/supabase-wordmark.svg",
		alt: "Supabase Logo",
	},
	{
		src: "https://storage.efferd.com/logo/openai-wordmark.svg",
		alt: "OpenAI Logo",
	},
	{
		src: "https://storage.efferd.com/logo/turso-wordmark.svg",
		alt: "Turso Logo",
	},
	{
		src: "https://storage.efferd.com/logo/vercel-wordmark.svg",
		alt: "Vercel Logo",
	},
	{
		src: "https://storage.efferd.com/logo/github-wordmark.svg",
		alt: "GitHub Logo",
	},
	{
		src: "https://storage.efferd.com/logo/claude-wordmark.svg",
		alt: "Claude AI Logo",
	},
	{
		src: "https://storage.efferd.com/logo/clerk-wordmark.svg",
		alt: "Clerk Logo",
	},
];
