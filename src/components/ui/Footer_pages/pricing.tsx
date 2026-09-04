import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, type Variants } from "framer-motion"
import { CheckCircle2, Zap, ArrowRight, Sparkles } from "lucide-react"

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
}
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const plans = [
    {
        name: "Free",
        price: "₹0",
        period: "forever",
        desc: "Perfect for getting started with personal finance tracking.",
        features: ["Expense tracking (up to 50/mo)", "Basic budgeting", "Manual transaction entry", "Monthly summary report", "Mobile-friendly dashboard"],
        cta: "Get Started Free",
        highlighted: false,
    },
    {
        name: "Pro",
        price: "₹199",
        period: "per month",
        desc: "For serious users who want AI-powered insights and automation.",
        features: ["Unlimited expense tracking", "AI financial assistant", "Auto expense detection (email)", "SIP & fund tracking", "Advanced analytics & charts", "Export to CSV & PDF", "Priority support"],
        cta: "Start Pro Trial",
        highlighted: true,
    },
    {
        name: "Team",
        price: "₹499",
        period: "per month",
        desc: "For households or small teams managing shared finances.",
        features: ["Everything in Pro", "Up to 5 members", "Shared budgets & goals", "Collaborative dashboards", "Admin controls", "Dedicated account manager"],
        cta: "Contact Sales",
        highlighted: false,
    },
]

const faqs = [
    { q: "Can I upgrade or downgrade anytime?", a: "Yes — changes take effect immediately. Downgrades apply at the next billing cycle." },
    { q: "Is there a student discount?", a: "Yes! Students get 50% off Pro with a valid .edu or institutional email. Contact support to apply." },
    { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee on all paid plans, no questions asked." },
]

export default function Pricing() {
    return (
        <div className="min-h-screen text-text-primary relative overflow-hidden" style={{ background: "#000", fontFamily: "'DM Sans', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white" style={{ width: i % 5 === 0 ? "2px" : "1px", height: i % 5 === 0 ? "2px" : "1px", top: `${(i * 37 + 11) % 100}%`, left: `${(i * 53 + 7) % 100}%`, opacity: i % 3 === 0 ? 0.18 : 0.07 }} />
                ))}
            </div>
            <div className="relative z-10 px-6 pt-20 pb-20">
                {/* Hero */}
                <motion.section className="text-center pb-16 max-w-3xl mx-auto" initial="hidden" animate="visible" variants={containerVariants}>
                    <motion.div variants={itemVariants}>
                        <Badge className="mb-6 px-4 py-1 text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}>
                            <Zap className="w-3 h-3 mr-1" /> Simple Pricing
                        </Badge>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="font-black mb-4 text-text-primary" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.02em" }}>
                        Plans that{" "}
                        <span style={{ background: "linear-gradient(135deg,#fff 30%,#444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>scale with you</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} style={{ color: "#555", lineHeight: 1.7 }}>
                        Start free forever. Upgrade when you're ready for AI superpowers.
                    </motion.p>
                </motion.section>

                {/* Plans */}
                <motion.div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5 mb-20" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    {plans.map((plan) => (
                        <motion.div key={plan.name} variants={itemVariants}>
                            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                                <div
                                    className="rounded-2xl p-7 h-full flex flex-col relative overflow-hidden"
                                    style={{
                                        background: plan.highlighted ? "rgba(255,255,255,0.06)" : "#0a0a0a",
                                        border: plan.highlighted ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
                                    }}
                                >
                                    {plan.highlighted && (
                                        <>
                                            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% -10%,rgba(255,255,255,0.05) 0%,transparent 60%)" }} />
                                            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)" }} />
                                            <div className="absolute top-4 right-4">
                                                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#fff", color: "#000" }}>Popular</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Sparkles className="w-4 h-4" style={{ color: plan.highlighted ? "#fff" : "rgba(255,255,255,0.3)" }} />
                                            <span className="text-sm font-semibold" style={{ color: plan.highlighted ? "#fff" : "rgba(255,255,255,0.6)" }}>{plan.name}</span>
                                        </div>
                                        <div className="mb-1">
                                            <span className="text-4xl font-black text-text-primary" style={{ fontFamily: "'Syne',sans-serif" }}>{plan.price}</span>
                                            <span className="text-sm ml-1" style={{ color: "#555" }}>/{plan.period}</span>
                                        </div>
                                        <p className="text-sm mb-6 leading-relaxed" style={{ color: "#444" }}>{plan.desc}</p>
                                        <Link to={plan.name === "Team" ? "/contact" : "/signup"}>
                                            <Button className="w-full mb-7 font-semibold gap-2" style={{ background: plan.highlighted ? "#fff" : "rgba(255,255,255,0.07)", color: plan.highlighted ? "#000" : "rgba(255,255,255,0.7)", border: plan.highlighted ? "none" : "1px solid rgba(255,255,255,0.1)" }}>
                                                {plan.cta} <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <div className="space-y-2.5">
                                            {plan.features.map(f => (
                                                <div key={f} className="flex items-start gap-2.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: plan.highlighted ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }} />
                                                    <span className="text-xs leading-relaxed" style={{ color: plan.highlighted ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.35)" }}>{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Mini FAQ */}
                <div className="max-w-2xl mx-auto space-y-4">
                    <h3 className="text-center text-lg font-bold text-text-primary mb-6" style={{ fontFamily: "'Syne',sans-serif" }}>Quick answers</h3>
                    {faqs.map((f, i) => (
                        <div key={i} className="rounded-xl px-5 py-4" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <p className="text-sm font-semibold text-text-primary mb-1.5">{f.q}</p>
                            <p className="text-xs leading-relaxed" style={{ color: "#4a4a60" }}>{f.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}