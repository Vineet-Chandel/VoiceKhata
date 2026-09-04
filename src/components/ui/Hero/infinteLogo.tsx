
export default function LogoCloud() {
	return (
		<div className="min-h-screen w-full place-content-center">
			<section className="relative mx-auto max-w-3xl">
				<h2 className="mb-5 text-center font-medium text-foreground text-xl tracking-tight md:text-3xl">
					<span className="text-muted-foreground">Trusted by experts.</span>
					<br />
					<span className="font-semibold">Used by the leaders.</span>
				</h2>
				<div className="mask-[linear-gradient(to_right,transparent,black,transparent)] mx-auto my-5 h-px max-w-sm bg-border" />
				<LogoCloud />
				<div className="mask-[linear-gradient(to_right,transparent,black,transparent)] mt-5 h-px bg-border" />
			</section>
		</div>
	);
}
