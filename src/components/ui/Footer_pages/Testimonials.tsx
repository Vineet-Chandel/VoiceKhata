import { Badge } from "@/components/ui/badge"
import { motion, type Variants } from "framer-motion"
import { Star, Quote, Users } from "lucide-react"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Page_Not_Found/empty";
import { Button } from "@/components/ui/button";
import { HomeIcon, LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { auth } from "@/firebase/firebase";



const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
}
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: "easeOut" } },
}

const testimonials = [
    { name: "Arjun Sharma", role: "Software Engineer, Bengaluru", avatar: "AS", rating: 5, text: "FinEase completely changed how I manage money. The AI suggestions actually helped me save ₹8,000 extra last month. It's like having a financial advisor in my pocket." },
    { name: "Priya Mehta", role: "MBA Student, Delhi", avatar: "PM", rating: 5, text: "As a student on a tight budget, the budget alerts are a lifesaver. I get notified before I overspend, not after. Game changer." },
    { name: "Rahul Nair", role: "Freelance Designer, Mumbai", avatar: "RN", rating: 5, text: "The auto expense detection from emails is pure magic. I never have to enter transactions manually anymore. It just works." },
    { name: "Sneha Iyer", role: "Product Manager, Hyderabad", avatar: "SI", rating: 5, text: "I've tried every budgeting app out there. FinEase is the only one that actually sticks because the UX is beautiful and the insights are genuinely useful." },
    { name: "Karthik Rajan", role: "Data Scientist, Chennai", avatar: "KR", rating: 5, text: "The SIP tracking feature alone is worth it. Being able to see all my investments, savings, and spending in one dashboard is incredibly powerful." },
    { name: "Ananya Gupta", role: "CA, Pune", avatar: "AG", rating: 5, text: "I recommend FinEase to all my clients who want to get serious about their finances. The export features and reports are excellent for tax season too." },
    { name: "Vikram Singh", role: "Startup Founder, Gurgaon", avatar: "VS", rating: 4, text: "Running a startup means chaotic cashflow. FinEase helps me separate personal and business expenses clearly. The analytics are top-notch." },
    { name: "Divya Krishnan", role: "Doctor, Coimbatore", avatar: "DK", rating: 5, text: "Finally an app that respects your privacy and still delivers amazing features. The security-first approach gives me confidence to link my accounts." },
    { name: "Mohit Joshi", role: "Teacher, Jaipur", avatar: "MJ", rating: 5, text: "The free plan alone is better than most paid apps I've used. The UI is clean, fast, and doesn't feel overwhelming. Perfect for everyday use." },
]

const stats = [
    { value: "4.9", label: "Average Rating" },
    { value: "50K+", label: "Happy Users" },
    { value: "98%", label: "Would Recommend" },
    { value: "₹12Cr+", label: "Saved by Users" },
]

export default function Testimonials() {
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
                            <Users className="w-3 h-3 mr-1" /> User Stories
                        </Badge>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="font-black mb-4 text-text-primary" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.02em" }}>
                        Loved by{" "}
                        <span style={{ background: "linear-gradient(135deg,#fff 30%,#444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>thousands</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} style={{ color: "#555", lineHeight: 1.7 }}>
                        Real people. Real results. See how FinEase is transforming the way India manages money.
                    </motion.p>
                </motion.section>

                {/* Stats */}
                <motion.div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                    {stats.map(s => (
                        <div key={s.label} className="text-center rounded-xl py-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="text-2xl font-black text-text-primary" style={{ fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
                            <div className="text-xs mt-1" style={{ color: "#444" }}>{s.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Testimonials Grid */}
                <motion.div className="max-w-6xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    {testimonials.map((t, i) => (
                        <motion.div key={i} variants={itemVariants} className="break-inside-avoid mb-5">
                            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                                <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)" }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.16)"}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"}>
                                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)" }} />
                                    <Quote className="w-5 h-5 mb-3 opacity-20 text-text-primary" />
                                    <p className="text-sm leading-relaxed mb-5" style={{ color: "#666" }}>{t.text}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                            {t.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-text-primary truncate">{t.name}</div>
                                            <div className="text-xs truncate" style={{ color: "#444" }}>{t.role}</div>
                                        </div>
                                        <div className="flex gap-0.5 flex-shrink-0">
                                            {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-3 h-3 fill-white text-text-primary opacity-70" />)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
            <EmptyContent>
                <div className="flex gap-3">

                    {/* Home */}
                    <Button asChild>
                        <Link to="/">
                            <HomeIcon className="size-4 mr-2" />
                            Go Home
                        </Link>
                    </Button>
                </div>
            </EmptyContent>
        </div>
    )
}