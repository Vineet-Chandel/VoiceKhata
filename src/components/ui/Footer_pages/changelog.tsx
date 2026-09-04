import { Badge } from "@/components/ui/badge"
import { motion, type Variants } from "framer-motion"
import { GitCommit, Sparkles, Bug, Zap, ArrowUp } from "lucide-react"

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
}
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: "easeOut" } },
}

type ChangeType = "new" | "improved" | "fixed"

interface Change {
    type: ChangeType
    text: string
}

interface Release {
    version: string
    date: string
    title: string
    summary: string
    changes: Change[]
}

const releases: Release[] = [
    {
        version: "v2.4.0",
        date: "January 15, 2025",
        title: "AI Assistant Launch",
        summary: "Our most requested feature is here — meet your AI financial assistant.",
        changes: [
            { type: "new", text: "AI financial assistant with personalized saving suggestions" },
            { type: "new", text: "Predictive monthly expense forecasting based on your patterns" },
            { type: "new", text: "Smart category auto-tagging for new transactions" },
            { type: "improved", text: "Dashboard loading speed improved by 40%" },
            { type: "fixed", text: "Fixed an edge case where duplicate transactions appeared after reconnecting email" },
        ],
    },
    {
        version: "v2.3.0",
        date: "December 20, 2024",
        title: "SIP & Investment Tracking",
        summary: "Track all your investments alongside your spending in one place.",
        changes: [
            { type: "new", text: "SIP and mutual fund tracking with live NAV data" },
            { type: "new", text: "Portfolio health score and goal progress tracking" },
            { type: "new", text: "Zerodha and Groww import via CSV" },
            { type: "improved", text: "Export to PDF now includes investment summary" },
            { type: "fixed", text: "Budget reset on 1st of month now triggers at midnight IST correctly" },
        ],
    },
    {
        version: "v2.2.0",
        date: "November 30, 2024",
        title: "Email Auto-Detection",
        summary: "Let FinEase read your bank transaction emails so you don't have to.",
        changes: [
            { type: "new", text: "Gmail and Outlook integration for auto expense detection" },
            { type: "new", text: "Supports 12+ major Indian banks and payment apps" },
            { type: "improved", text: "Transaction categorization accuracy improved to 94%" },
            { type: "fixed", text: "Fixed date parsing issue for SBI and HDFC email formats" },
        ],
    },
    {
        version: "v2.1.0",
        date: "October 15, 2024",
        title: "Analytics Overhaul",
        summary: "Completely redesigned analytics with new chart types and filters.",
        changes: [
            { type: "new", text: "Year-over-year spending comparison charts" },
            { type: "new", text: "Category drill-down with merchant-level breakdown" },
            { type: "improved", text: "Charts now render 3x faster on mobile" },
            { type: "fixed", text: "Fixed incorrect totals when filtering by date range + category together" },
        ],
    },
]

const typeConfig: Record<ChangeType, { icon: typeof Sparkles; label: string; color: string }> = {
    new: { icon: Sparkles, label: "New", color: "rgba(255,255,255,0.55)" },
    improved: { icon: ArrowUp, label: "Improved", color: "rgba(255,255,255,0.38)" },
    fixed: { icon: Bug, label: "Fixed", color: "rgba(255,255,255,0.28)" },
}

export default function Changelog() {
    return (
        <div className="min-h-screen text-text-primary relative overflow-hidden" style={{ background: "#000", fontFamily: "'DM Sans', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(20)].map((_, i) => <div key={i} className="absolute rounded-full bg-white" style={{ width: "1px", height: "1px", top: `${(i * 47 + 13) % 100}%`, left: `${(i * 61 + 9) % 100}%`, opacity: 0.07 }} />)}
            </div>
            <div className="relative z-10 px-6 pt-20 pb-20">
                {/* Hero */}
                <motion.section className="text-center pb-16 max-w-2xl mx-auto" initial="hidden" animate="visible" variants={containerVariants}>
                    <motion.div variants={itemVariants}>
                        <Badge className="mb-5 px-4 py-1 text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}>
                            <GitCommit className="w-3 h-3 mr-1" /> Releases
                        </Badge>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="font-black mb-3 text-text-primary" style={{ fontSize: "clamp(2rem,5vw,3rem)", fontFamily: "'Syne',sans-serif" }}>Changelog</motion.h1>
                    <motion.p variants={itemVariants} style={{ color: "#555", lineHeight: 1.7 }}>Every update, improvement, and fix — in one place.</motion.p>
                </motion.section>

                {/* Releases */}
                <motion.div className="max-w-2xl mx-auto space-y-10" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    {releases.map((r, i) => (
                        <motion.div key={i} variants={itemVariants}>
                            <div className="flex gap-6">
                                {/* Timeline */}
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.15)" }}>
                                        <Zap className="w-3.5 h-3.5 text-text-primary opacity-60" />
                                    </div>
                                    {i < releases.length - 1 && <div className="flex-1 w-px mt-3" style={{ background: "rgba(255,255,255,0.06)" }} />}
                                </div>
                                {/* Content */}
                                <div className="flex-1 pb-6">
                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                        <span className="text-sm font-black text-text-primary" style={{ fontFamily: "'Syne',sans-serif" }}>{r.version}</span>
                                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>{r.title}</span>
                                        <span className="text-xs" style={{ color: "#333" }}>{r.date}</span>
                                    </div>
                                    <p className="text-sm mb-4" style={{ color: "#555" }}>{r.summary}</p>
                                    <div className="rounded-xl overflow-hidden" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)" }}>
                                        {r.changes.map((c, j) => {
                                            const { icon: Icon, label, color } = typeConfig[c.type]
                                            return (
                                                <div key={j} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: j < r.changes.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                                                    <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                                                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                                                        <span className="text-xs font-semibold w-14" style={{ color }}>{label}</span>
                                                    </div>
                                                    <p className="text-xs leading-relaxed" style={{ color: "#555" }}>{c.text}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}