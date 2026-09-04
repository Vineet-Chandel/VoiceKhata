import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { motion, type Variants } from "framer-motion"
import {
    Wallet, PieChart, Bell, Brain, Mail,
    ArrowLeft, ArrowRight, CheckCircle2, CandlestickChart, Layers, Sparkles,
} from "lucide-react"

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09 } },
}
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const features = [
    { icon: Wallet, title: "Smart Expense Tracking", desc: "Automatically track income and expenses in a centralized dashboard for complete financial visibility across all your accounts.", highlights: ["Multi-account sync", "Category tagging", "Real-time updates"] },
    { icon: Bell, title: "Real-Time Budget Monitoring", desc: "Set budgets for different spending categories and receive intelligent alerts before you reach your limits.", highlights: ["Custom categories", "Threshold alerts", "Weekly summaries"] },
    { icon: PieChart, title: "Advanced Financial Analytics", desc: "Visualize your spending patterns with interactive charts, monthly comparisons, and data-driven insights.", highlights: ["Interactive charts", "Year-over-year", "Export reports"] },
    { icon: Mail, title: "Auto Expense Detection", desc: "Automatically fetch transaction details from your bank emails to eliminate manual data entry and reduce errors.", highlights: ["Email parsing", "Bank integration", "Zero manual entry"] },
    { icon: Brain, title: "AI Financial Assistant", desc: "Get personalized saving suggestions, spending forecasts, and predictive expense insights powered by AI.", highlights: ["Smart suggestions", "Savings goals", "Predictive analysis"] },
    { icon: CandlestickChart, title: "SIP & Fund Tracking", desc: "Monitor your SIPs, mutual funds, and investments in one place with live NAV updates and portfolio health scores.", highlights: ["Live NAV", "Portfolio score", "Goal mapping"] },
]

const stats = [
    { value: "50K+", label: "Active Users" },
    { value: "₹2Cr+", label: "Tracked Monthly" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9★", label: "User Rating" },
]

export default function Features() {
    return (
        <div className="min-h-screen text-text-primary relative overflow-hidden" style={{ background: "#000", fontFamily: "'DM Sans', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white" style={{ width: i % 5 === 0 ? "2px" : "1px", height: i % 5 === 0 ? "2px" : "1px", top: `${(i * 37 + 11) % 100}%`, left: `${(i * 53 + 7) % 100}%`, opacity: i % 3 === 0 ? 0.18 : 0.07 }} />
                ))}
            </div>
            <div className="relative z-10 px-6 pt-20 pb-10">
                <motion.section className="text-center pb-16 max-w-4xl mx-auto" initial="hidden" animate="visible" variants={containerVariants}>
                    <motion.div variants={itemVariants}>
                        <Badge className="mb-6 px-4 py-1 text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}>
                            <Sparkles className="w-3 h-3 mr-1" /> Everything You Need
                        </Badge>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="font-black mb-5 leading-tight text-text-primary" style={{ fontSize: "clamp(2.4rem,5vw,3.75rem)", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.02em" }}>
                        Features Built for{" "}
                        <span style={{ background: "linear-gradient(135deg,#fff 30%,#444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            Financial Freedom
                        </span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-lg max-w-2xl mx-auto mb-10" style={{ color: "#555", lineHeight: 1.7 }}>
                        From tracking every rupee to predicting your financial future — FinEase gives students and professionals a complete money management workspace.
                    </motion.p>
                    <motion.div variants={itemVariants} className="flex justify-center gap-4 flex-wrap">
                        <Link to="/signup"><Button className="font-semibold px-6 gap-2" style={{ background: "#fff", color: "#000" }}>Start for free <ArrowRight className="w-4 h-4" /></Button></Link>
                        <Link to="/"><Button variant="ghost" className="gap-2" style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)" }}><ArrowLeft className="w-4 h-4" /> Back to Home</Button></Link>
                    </motion.div>
                </motion.section>

                <motion.section className="max-w-5xl mx-auto mb-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
                    <div className="rounded-2xl px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {stats.map((s) => (
                            <div key={s.label} className="text-center">
                                <div className="text-2xl font-black text-text-primary" style={{ fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
                                <div className="text-xs mt-1" style={{ color: "#444" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                <motion.section className="max-w-6xl mx-auto pb-24" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feature, i) => {
                            const Icon = feature.icon
                            return (
                                <motion.div key={i} variants={itemVariants}>
                                    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                                        <Card className="h-full" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden", transition: "border-color 0.2s" }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)"}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"}>
                                            <div className="h-px w-full" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)" }} />
                                            <CardHeader className="pb-3 pt-6 px-6">
                                                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                    <Icon className="w-5 h-5 text-text-primary" />
                                                </div>
                                                <h3 className="text-base font-bold text-text-primary leading-tight">{feature.title}</h3>
                                            </CardHeader>
                                            <CardContent className="px-6 pb-6">
                                                <p className="text-sm mb-5 leading-relaxed" style={{ color: "#4a4a60" }}>{feature.desc}</p>
                                                <Separator style={{ background: "rgba(255,255,255,0.05)", marginBottom: "1rem" }} />
                                                <div className="flex flex-col gap-2">
                                                    {feature.highlights.map(h => (
                                                        <div key={h} className="flex items-center gap-2">
                                                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
                                                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>{h}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.section>

                <motion.section className="max-w-5xl mx-auto pb-24" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <div className="rounded-2xl px-10 py-14 text-center relative overflow-hidden" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.04) 0%,transparent 65%)" }} />
                        <Layers className="w-10 h-10 mx-auto mb-4 relative z-10" style={{ color: "rgba(255,255,255,0.4)" }} />
                        <h2 className="text-3xl font-black mb-3 text-text-primary relative z-10" style={{ fontFamily: "'Syne',sans-serif" }}>Ready to master your money?</h2>
                        <p className="mb-8 relative z-10" style={{ color: "#444" }}>Join thousands of users already using FinEase to make smarter financial decisions.</p>
                        <div className="flex justify-center gap-4 relative z-10 flex-wrap">
                            <Link to="/signup"><Button className="font-bold px-8 gap-2" style={{ background: "#fff", color: "#000" }}>Get Started Free <ArrowRight className="w-4 h-4" /></Button></Link>
                            <Link to="/faqs"><Button variant="ghost" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>Read FAQs</Button></Link>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    )
}