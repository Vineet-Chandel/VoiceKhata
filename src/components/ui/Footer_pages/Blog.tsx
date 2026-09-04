import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { motion, type Variants } from "framer-motion"
import { BookOpen, Clock, ArrowRight } from "lucide-react"

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
}
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
}

const posts = [
    { title: "How to build a zero-based budget in 30 minutes", excerpt: "Zero-based budgeting means every rupee has a job. Here's how to set one up quickly and actually stick to it.", date: "Jan 15, 2025", readTime: "5 min read", category: "Budgeting", featured: true },
    { title: "SIP vs lump sum: which is better for beginners?", excerpt: "The age-old debate in mutual fund investing. We break down the math and psychology behind each approach.", date: "Jan 10, 2025", readTime: "7 min read", category: "Investing", featured: false },
    { title: "5 expense tracking habits that changed how I save money", excerpt: "Small changes in how you track spending can compound into major savings over time. Our top users share their habits.", date: "Jan 5, 2025", readTime: "4 min read", category: "Personal Finance", featured: false },
    { title: "Understanding credit card reward optimization", excerpt: "Most people leave thousands of rupees in rewards unclaimed every year. Here's how to maximize every swipe.", date: "Dec 28, 2024", readTime: "6 min read", category: "Credit", featured: false },
    { title: "The FinEase AI assistant: what it can (and can't) do", excerpt: "An honest look at what our AI financial assistant does well, its limitations, and how we're improving it.", date: "Dec 20, 2024", readTime: "5 min read", category: "Product", featured: false },
    { title: "Tax season prep: using FinEase export features", excerpt: "How to use FinEase's CSV and PDF exports to make your CA's job easier and ensure you don't miss any deductions.", date: "Dec 15, 2024", readTime: "4 min read", category: "Tax", featured: false },
]

const categories = ["All", "Budgeting", "Investing", "Personal Finance", "Credit", "Product", "Tax"]

export default function Blog() {
    const featured = posts[0]
    const rest = posts.slice(1)

    return (
        <div className="min-h-screen text-text-primary relative overflow-hidden" style={{ background: "#000", fontFamily: "'DM Sans', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white" style={{ width: i % 5 === 0 ? "2px" : "1px", height: i % 5 === 0 ? "2px" : "1px", top: `${(i * 37 + 11) % 100}%`, left: `${(i * 53 + 7) % 100}%`, opacity: i % 3 === 0 ? 0.18 : 0.07 }} />
                ))}
            </div>
            <div className="relative z-10 px-6 pt-20 pb-20">
                {/* Hero */}
                <motion.section className="text-center pb-14 max-w-3xl mx-auto" initial="hidden" animate="visible" variants={containerVariants}>
                    <motion.div variants={itemVariants}>
                        <Badge className="mb-6 px-4 py-1 text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}>
                            <BookOpen className="w-3 h-3 mr-1" /> Blog
                        </Badge>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="font-black mb-4 text-text-primary" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.02em" }}>
                        Money{" "}
                        <span style={{ background: "linear-gradient(135deg,#fff 30%,#444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>insights</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} style={{ color: "#555", lineHeight: 1.7 }}>
                        Practical personal finance tips, product updates, and deep dives from the FinEase team.
                    </motion.p>
                </motion.section>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 justify-center mb-12">
                    {categories.map(cat => (
                        <button key={cat} className="px-4 py-1.5 rounded-full text-sm transition-all" style={{ background: cat === "All" ? "rgba(255,255,255,0.1)" : "transparent", border: cat === "All" ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)", color: cat === "All" ? "#fff" : "#555" }}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Featured Post */}
                <motion.div className="max-w-5xl mx-auto mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                        <div className="rounded-2xl p-8 relative overflow-hidden cursor-pointer" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", transition: "border-color 0.2s" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"}>
                            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)" }} />
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#fff", color: "#000" }}>Featured</span>
                                <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}>{featured.category}</span>
                            </div>
                            <h2 className="text-xl font-black text-text-primary mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>{featured.title}</h2>
                            <p className="text-sm leading-relaxed mb-5" style={{ color: "#555" }}>{featured.excerpt}</p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#444" }}>
                                    <Clock className="w-3.5 h-3.5" /> {featured.readTime}
                                </div>
                                <span className="text-xs" style={{ color: "#333" }}>{featured.date}</span>
                                <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                                    Read more <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Post Grid */}
                <motion.div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    {rest.map((post, i) => (
                        <motion.div key={i} variants={itemVariants}>
                            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                                <div className="rounded-2xl p-6 h-full cursor-pointer" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", transition: "border-color 0.2s" }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)"}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"}>
                                    <span className="text-xs px-2 py-1 rounded-full mb-4 inline-block" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}>{post.category}</span>
                                    <h3 className="text-sm font-bold text-text-primary mb-2 leading-snug">{post.title}</h3>
                                    <p className="text-xs leading-relaxed mb-5" style={{ color: "#444" }}>{post.excerpt}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-xs" style={{ color: "#333" }}>
                                            <Clock className="w-3 h-3" /> {post.readTime}
                                        </div>
                                        <span className="text-xs" style={{ color: "#2a2a2a" }}>{post.date}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}