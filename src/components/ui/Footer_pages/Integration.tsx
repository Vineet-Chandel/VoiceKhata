import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { motion, type Variants } from "framer-motion"
import { Plug, ArrowRight, CheckCircle2, Mail, Smartphone, BarChart3, Shield, RefreshCw, Zap } from "lucide-react"

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
}
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: "easeOut" } },
}

const integrations = [
    { icon: Mail, name: "Gmail / Outlook", desc: "Auto-parse bank transaction emails and receipts. Zero manual entry.", tag: "Email", status: "Live" },
    { icon: Smartphone, name: "UPI Apps", desc: "Connect GPay, PhonePe, Paytm for automatic transaction sync.", tag: "Payments", status: "Live" },
    { icon: BarChart3, name: "Zerodha / Groww", desc: "Import your SIPs, stocks, and mutual fund portfolio for unified tracking.", tag: "Investments", status: "Live" },
    { icon: Shield, name: "DigiLocker", desc: "Fetch your financial documents and statements securely via DigiLocker.", tag: "Documents", status: "Beta" },
    { icon: RefreshCw, name: "Account Aggregator", desc: "RBI-regulated AA framework for consent-based bank data access.", tag: "Banking", status: "Coming Soon" },
    { icon: Zap, name: "Zapier / n8n", desc: "Automate workflows between FinEase and 1000+ apps with no code.", tag: "Automation", status: "Coming Soon" },
]

const statusColors: Record<string, { bg: string; color: string }> = {
    "Live": { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" },
    "Beta": { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" },
    "Coming Soon": { bg: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.22)" },
}

export default function Integration() {
    return (
        <div className="min-h-screen text-text-primary relative overflow-hidden" style={{ background: "#000", fontFamily: "'DM Sans', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white" style={{ width: i % 5 === 0 ? "2px" : "1px", height: i % 5 === 0 ? "2px" : "1px", top: `${(i * 37 + 11) % 100}%`, left: `${(i * 53 + 7) % 100}%`, opacity: i % 3 === 0 ? 0.18 : 0.07 }} />
                ))}
            </div>
            <div className="relative z-10 px-6 pt-20 pb-20">
                <motion.section className="text-center pb-16 max-w-3xl mx-auto" initial="hidden" animate="visible" variants={containerVariants}>
                    <motion.div variants={itemVariants}>
                        <Badge className="mb-6 px-4 py-1 text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}>
                            <Plug className="w-3 h-3 mr-1" /> Integrations
                        </Badge>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="font-black mb-4 text-text-primary" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.02em" }}>
                        Connect your{" "}
                        <span style={{ background: "linear-gradient(135deg,#fff 30%,#444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>financial world</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} style={{ color: "#555", lineHeight: 1.7 }}>
                        FinEase plugs into the apps and services you already use. No complex setup. Just connect and go.
                    </motion.p>
                </motion.section>

                <motion.div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    {integrations.map((intg, i) => {
                        const Icon = intg.icon
                        const sc = statusColors[intg.status]
                        return (
                            <motion.div key={i} variants={itemVariants}>
                                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                                    <div className="rounded-2xl p-6 h-full" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", transition: "border-color 0.2s" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                <Icon className="w-5 h-5 text-text-primary" />
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: sc.bg, color: sc.color, border: "1px solid rgba(255,255,255,0.06)" }}>
                                                {intg.status}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-text-primary mb-1.5">{intg.name}</h3>
                                        <p className="text-xs leading-relaxed mb-4" style={{ color: "#444" }}>{intg.desc}</p>
                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.28)", border: "1px solid rgba(255,255,255,0.06)" }}>{intg.tag}</span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* How it works */}
                <div className="max-w-4xl mx-auto mb-20">
                    <h2 className="text-center text-2xl font-black mb-10 text-text-primary" style={{ fontFamily: "'Syne',sans-serif" }}>How integrations work</h2>
                    <div className="grid md:grid-cols-3 gap-5">
                        {[
                            { step: "01", title: "Connect", desc: "Authorize FinEase with read-only access to your accounts and email." },
                            { step: "02", title: "Sync", desc: "Transactions and data are fetched automatically in the background." },
                            { step: "03", title: "Insights", desc: "AI processes your data and surfaces actionable financial insights." },
                        ].map(s => (
                            <div key={s.step} className="rounded-2xl p-6 text-center" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="text-3xl font-black mb-3" style={{ fontFamily: "'Syne',sans-serif", color: "rgba(255,255,255,0.1)" }}>{s.step}</div>
                                <h3 className="text-base font-bold text-text-primary mb-2">{s.title}</h3>
                                <p className="text-sm" style={{ color: "#444" }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security note */}
                <div className="max-w-2xl mx-auto rounded-2xl p-8 text-center" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5" style={{ color: "rgba(255,255,255,0.4)" }} />
                        <span className="font-semibold text-text-primary text-sm">Bank-grade security on all integrations</span>
                    </div>
                    <p className="text-sm mb-6" style={{ color: "#444" }}>All connections use read-only OAuth 2.0. Your credentials are never stored. Disconnect anytime from Settings.</p>
                    <Link to="/signup"><Button className="font-semibold gap-2" style={{ background: "#fff", color: "#000" }}>Connect your accounts <ArrowRight className="w-4 h-4" /></Button></Link>
                </div>
            </div>
        </div>
    )
}