import { Link } from "react-router-dom";

export default function GetStarted() {
    return (
        <section className="w-full py-2 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="relative overflow-hidden rounded-3xl border border-border bg-[#0F0F0F] px-8 py-16 text-center">

                    {/* 🔥 Top Center Glow */}
                    <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-surface-secondary/20 blur-3xl  pointer-events-none " />

                    {/* Heading */}
                    <h2 className="text-4xl md:text-5xl font-semibold text-text-primary mb-6">
                        Ready to transform your financial life?
                    </h2>

                    {/* Subtext */}
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-10">
                        Join VoiceKhata today and start your journey towards financial freedom.
                        No credit card required for the free tier.
                    </p>

                    {/* Button */}
                    <Link
                        to="/signup"
                        className="group relative inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-medium text-black bg-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                    >
                        Get Started Now
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                            →
                        </span>
                    </Link>

                </div>
            </div>
        </section>
    );
}