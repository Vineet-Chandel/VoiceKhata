import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Search, ChevronDown, HelpCircle, ArrowRight, MessageCircle } from "lucide-react"

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
}
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
}

const categories = ["All", "Getting Started", "Security", "Billing", "Features", "Account"]

const faqs = [
    { q: "What is VoiceKhata?", a: "VoiceKhata is an AI-powered personal finance dashboard that helps students and professionals track expenses, manage budgets, and get intelligent saving suggestions — all in one place.", cat: "Getting Started" },
    { q: "How do I get started with VoiceKhata?", a: "Simply sign up for a free account, connect your preferred payment methods or manually add transactions, and VoiceKhata will start building your financial picture immediately.", cat: "Getting Started" },
    { q: "Is my financial data secure?", a: "Absolutely. We use bank-grade AES-256 encryption for all stored data, TLS 1.3 for data in transit, and never sell or share your personal information with third parties.", cat: "Security" },
    { q: "Does VoiceKhata store my bank credentials?", a: "No. VoiceKhata uses read-only API connections and email parsing — we never store your banking passwords. Your credentials never touch our servers.", cat: "Security" },
    { q: "Is VoiceKhata free to use?", a: "VoiceKhata offers a generous free tier with core expense tracking and budgeting. Pro features like AI insights, email auto-detection, and fund tracking are available on our premium plan.", cat: "Billing" },
    { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel at any time from your account settings. You'll retain access to Pro features until the end of your billing period with no hidden fees.", cat: "Billing" },
    { q: "How does Auto Expense Detection work?", a: "VoiceKhata reads transaction confirmation emails from your connected email account using a secure, read-only scope. It parses the amount, merchant, and date — then logs it automatically.", cat: "Features" },
    { q: "Can I track my SIPs and mutual funds?", a: "Yes! VoiceKhata's investment tracker supports SIPs, mutual funds, and ETFs. It fetches live NAV data daily and shows your portfolio health, gains/losses, and goal progress.", cat: "Features" },
    { q: "How accurate are the AI suggestions?", a: "Our AI is trained on anonymized spending patterns and improves over time as it learns your habits. Most users see relevant saving suggestions within the first 2 weeks.", cat: "Features" },
    { q: "Can I export my financial data?", a: "Yes. You can export all your transaction history, budgets, and reports as CSV or PDF at any time from the Reports section — no restrictions even on the free plan.", cat: "Account" },
    { q: "How do I change my email or password?", a: "Visit Settings → Profile to update your email address or password. Changes require email verification for security.", cat: "Account" },
    { q: "What currencies does VoiceKhata support?", a: "VoiceKhata primarily supports INR (₹) for Indian users, with USD, EUR, GBP, and other major currencies available in the Pro plan.", cat: "Account" },
]

export default function FAQs() {
    const [open, setOpen] = useState<number | null>(null)
    const [search, setSearch] = useState("")
    const [activeCategory, setActiveCategory] = useState("All")

    const filtered = faqs.filter(f => {
        const matchCat = activeCategory === "All" || f.cat === activeCategory
        const matchSearch = f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    return (
        <div className="min-h-screen text-text-primary relative overflow-hidden" style={{ background: "#000", fontFamily: "'DM Sans', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white" style={{ width: i % 5 === 0 ? "2px" : "1px", height: i % 5 === 0 ? "2px" : "1px", top: `${(i * 37 + 11) % 100}%`, left: `${(i * 53 + 7) % 100}%`, opacity: i % 3 === 0 ? 0.18 : 0.07 }} />
                ))}
            </div>
            <div className="relative z-10 px-6 pt-20 pb-16">
                {/* Hero */}
                <motion.section className="text-center pb-12 max-w-3xl mx-auto" initial="hidden" animate="visible" variants={containerVariants}>
                    <motion.div variants={itemVariants}>
                        <Badge className="mb-6 px-4 py-1 text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}>
                            <HelpCircle className="w-3 h-3 mr-1" /> Support
                        </Badge>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="font-black mb-4 text-text-primary" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.02em" }}>
                        Frequently Asked{" "}
                        <span style={{ background: "linear-gradient(135deg,#fff 30%,#444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Questions</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="mb-8" style={{ color: "#555", lineHeight: 1.7 }}>
                        Everything you need to know about VoiceKhata. Can't find the answer? Reach out to our support team.
                    </motion.p>
                    {/* Search */}
                    <motion.div variants={itemVariants} className="relative max-w-lg mx-auto">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#444" }} />
                        <Input
                            placeholder="Search questions…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-11 text-sm"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "10px" }}
                        />
                    </motion.div>
                </motion.section>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 justify-center mb-10">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                            style={{
                                background: activeCategory === cat ? "rgba(255,255,255,0.1)" : "transparent",
                                border: activeCategory === cat ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.08)",
                                color: activeCategory === cat ? "#fff" : "#555",
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <motion.div className="max-w-2xl mx-auto space-y-3 pb-20" variants={containerVariants} initial="hidden" animate="visible">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16" style={{ color: "#444" }}>
                            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p>No questions match your search.</p>
                        </div>
                    ) : (
                        filtered.map((faq, i) => (
                            <motion.div key={i} variants={itemVariants}>
                                <div
                                    className="rounded-xl overflow-hidden"
                                    style={{
                                        background: open === i ? "rgba(255,255,255,0.04)" : "#0a0a0a",
                                        border: open === i ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.07)",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <button
                                        className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
                                        onClick={() => setOpen(open === i ? null : i)}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className="text-sm font-semibold text-text-primary">{faq.q}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}>{faq.cat}</span>
                                            <ChevronDown
                                                className="w-4 h-4 transition-transform duration-300"
                                                style={{ color: "rgba(255,255,255,0.4)", transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
                                            />
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {open === i && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.28, ease: "easeOut" }}
                                                style={{ overflow: "hidden" }}
                                            >
                                                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "#666", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>

                {/* CTA */}
                <motion.section className="max-w-2xl mx-auto pb-8" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <div className="rounded-2xl px-8 py-10 text-center relative overflow-hidden" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.04) 0%,transparent 65%)" }} />
                        <MessageCircle className="w-8 h-8 mx-auto mb-3 relative z-10" style={{ color: "rgba(255,255,255,0.35)" }} />
                        <h2 className="text-xl font-black mb-2 text-text-primary relative z-10" style={{ fontFamily: "'Syne',sans-serif" }}>Still have questions?</h2>
                        <p className="mb-6 text-sm relative z-10" style={{ color: "#444" }}>Our support team usually responds within 2 hours.</p>
                        <div className="flex justify-center gap-3 relative z-10 flex-wrap">
                            <a href="mailto:support@voicekhata.app"><Button className="font-bold gap-2" style={{ background: "#fff", color: "#000" }}>Email Support <ArrowRight className="w-4 h-4" /></Button></a>
                            <Link to="/features"><Button variant="ghost" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>View Features</Button></Link>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    )
}