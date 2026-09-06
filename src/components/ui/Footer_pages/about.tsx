import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { motion, type Variants } from "framer-motion"
import { Heart, Target, Lightbulb, ArrowRight, Users } from "lucide-react"

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09 } },
}
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: "easeOut" } },
}

const team = [
    { name: "Aarav Patel", role: "Founder & CEO", desc: "Ex-Razorpay. Passionate about democratizing financial literacy for young India.", initials: "AP" },
    { name: "Nisha Kumar", role: "CTO", desc: "Full-stack engineer with a background in fintech and machine learning at Flipkart.", initials: "NK" },
    { name: "Rohan Mehta", role: "Head of Design", desc: "Previously at Zomato. Believes great design is the bridge between complex data and human understanding.", initials: "RM" },
    { name: "Prachi Joshi", role: "Head of AI", desc: "ML researcher turned builder. Leads our AI financial assistant and predictive models.", initials: "PJ" },
]

const values = [
    { icon: Heart, title: "User-first, always", desc: "Every decision starts with one question: does this make the user's financial life simpler?" },
    { icon: Target, title: "Radical transparency", desc: "We're upfront about how we use your data, how we make money, and what we can and can't do." },
    { icon: Lightbulb, title: "Simplify complexity", desc: "Personal finance is complicated. VoiceKhata's job is to hide that complexity and surface only what matters." },
]

export default function AboutUs() {
    return (
        <div className="min-h-screen text-text-primary relative overflow-hidden" style={{ background: "#000", fontFamily: "'DM Sans', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white" style={{ width: i % 5 === 0 ? "2px" : "1px", height: i % 5 === 0 ? "2px" : "1px", top: `${(i * 37 + 11) % 100}%`, left: `${(i * 53 + 7) % 100}%`, opacity: i % 3 === 0 ? 0.18 : 0.07 }} />
                ))}
            </div>
            <div className="relative z-10 px-6 pt-20 pb-20">
                {/* Hero */}
                <motion.section className="text-center pb-20 max-w-3xl mx-auto" initial="hidden" animate="visible" variants={containerVariants}>
                    <motion.div variants={itemVariants}>
                        <Badge className="mb-6 px-4 py-1 text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}>
                            <Users className="w-3 h-3 mr-1" /> Our Story
                        </Badge>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="font-black mb-6 text-text-primary" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.02em" }}>
                        Built by people who{" "}
                        <span style={{ background: "linear-gradient(135deg,#fff 30%,#444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>hated spreadsheets</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-base leading-relaxed" style={{ color: "#555" }}>
                        VoiceKhata started in 2023 when our founder Aarav realized he'd spent 3 hours in Excel trying to understand why he'd run out of money 10 days before his next paycheck. There had to be a better way.
                        <br /><br />
                        Today, VoiceKhata is used by over 50,000 students and professionals across India to track expenses, automate budgets, and make smarter financial decisions — without the complexity.
                    </motion.p>
                </motion.section>

                {/* Values */}
                <motion.div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-5 mb-24" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    {values.map((v, i) => {
                        const Icon = v.icon
                        return (
                            <motion.div key={i} variants={itemVariants}>
                                <div className="rounded-2xl p-7" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)" }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                        <Icon className="w-5 h-5 text-text-primary" />
                                    </div>
                                    <h3 className="text-base font-bold text-text-primary mb-2">{v.title}</h3>
                                    <p className="text-sm leading-relaxed" style={{ color: "#444" }}>{v.desc}</p>
                                </div>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* Team */}
                <div className="max-w-5xl mx-auto mb-24">
                    <h2 className="text-center text-2xl font-black mb-10 text-text-primary" style={{ fontFamily: "'Syne',sans-serif" }}>The team</h2>
                    <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        {team.map((m, i) => (
                            <motion.div key={i} variants={itemVariants}>
                                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                                    <div className="rounded-2xl p-6 text-center" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", transition: "border-color 0.2s" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"}>
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                            {m.initials}
                                        </div>
                                        <h3 className="text-sm font-bold text-text-primary mb-0.5">{m.name}</h3>
                                        <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>{m.role}</div>
                                        <p className="text-xs leading-relaxed" style={{ color: "#444" }}>{m.desc}</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Join CTA */}
                <motion.div className="max-w-2xl mx-auto rounded-2xl px-8 py-12 text-center" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)" }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.04) 0%,transparent 65%)" }} />
                    <h2 className="text-2xl font-black mb-3 text-text-primary" style={{ fontFamily: "'Syne',sans-serif" }}>We're hiring</h2>
                    <p className="text-sm mb-6" style={{ color: "#444" }}>Building the future of personal finance in India. If that excites you, we want to hear from you.</p>
                    <Link to="/contact">
                        <Button className="font-semibold gap-2" style={{ background: "#fff", color: "#000" }}>See open roles <ArrowRight className="w-4 h-4" /></Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}