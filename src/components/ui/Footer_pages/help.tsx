import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, type Variants } from "framer-motion"
import { Palette, Download, Copy, Check } from "lucide-react"
import { useState } from "react"

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
}
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
}

const colors = [
    { name: "Black", hex: "#000000", bg: "#000000", border: "rgba(255,255,255,0.15)" },
    { name: "White", hex: "#FFFFFF", bg: "#FFFFFF", border: "rgba(255,255,255,0.15)" },
    { name: "Surface", hex: "#0A0A0A", bg: "#0A0A0A", border: "rgba(255,255,255,0.1)" },
    { name: "Muted", hex: "#444444", bg: "#444444", border: "rgba(255,255,255,0.08)" },
    { name: "Border", hex: "rgba(255,255,255,0.08)", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.08)" },
]

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <button
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
            className="p-1.5 rounded-md transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
            {copied ? <Check className="w-3 h-3" style={{ color: "rgba(255,255,255,0.6)" }} /> : <Copy className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />}
        </button>
    )
}

export default function Brand() {
    return (
        <div className="min-h-screen text-text-primary relative overflow-hidden" style={{ background: "#000", fontFamily: "'DM Sans', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(20)].map((_, i) => <div key={i} className="absolute rounded-full bg-white" style={{ width: "1px", height: "1px", top: `${(i * 47 + 13) % 100}%`, left: `${(i * 61 + 9) % 100}%`, opacity: 0.07 }} />)}
            </div>
            <div className="relative z-10 px-6 pt-20 pb-20">
                {/* Hero */}
                <motion.section className="text-center pb-16 max-w-3xl mx-auto" initial="hidden" animate="visible" variants={containerVariants}>
                    <motion.div variants={itemVariants}>
                        <Badge className="mb-5 px-4 py-1 text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}>
                            <Palette className="w-3 h-3 mr-1" /> Brand
                        </Badge>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="font-black mb-4 text-text-primary" style={{ fontSize: "clamp(2rem,5vw,3rem)", fontFamily: "'Syne',sans-serif" }}>Brand Assets</motion.h1>
                    <motion.p variants={itemVariants} style={{ color: "#555", lineHeight: 1.7 }}>
                        Official logos, colors, and guidelines for using the VoiceKhata brand. Please read our usage guidelines before using these assets.
                    </motion.p>
                </motion.section>

                <div className="max-w-5xl mx-auto space-y-14">
                    {/* Logo section */}
                    <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <motion.h2 variants={itemVariants} className="text-base font-bold text-text-primary mb-6">Logo</motion.h2>
                        <div className="grid md:grid-cols-3 gap-5">
                            {[
                                { label: "Dark background", bg: "#000", fg: "#fff", border: "rgba(255,255,255,0.1)" },
                                { label: "Light background", bg: "#fff", fg: "#000", border: "rgba(0,0,0,0.1)" },
                                { label: "Monochrome", bg: "#0a0a0a", fg: "rgba(255,255,255,0.5)", border: "rgba(255,255,255,0.07)" },
                            ].map((v, i) => (
                                <motion.div key={i} variants={itemVariants}>
                                    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${v.border}` }}>
                                        <div className="h-36 flex items-center justify-center" style={{ background: v.bg }}>
                                            <div className="flex items-center gap-2">
                                                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                                                    <path d="M8 24 C8 16 16 8 24 8" stroke={v.fg} strokeWidth="3" strokeLinecap="round" />
                                                    <path d="M8 18 C10 14 14 10 20 10" stroke={v.fg} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                                                </svg>
                                                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", color: v.fg, fontWeight: 800 }}>VoiceKhata</span>
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                            <span className="text-xs" style={{ color: "#444" }}>{v.label}</span>
                                            <Button variant="ghost" className="h-7 px-3 text-xs gap-1.5" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
                                                <Download className="w-3 h-3" /> SVG
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Colors */}
                    <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <motion.h2 variants={itemVariants} className="text-base font-bold text-text-primary mb-6">Brand Colors</motion.h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {colors.map((c, i) => (
                                <motion.div key={i} variants={itemVariants}>
                                    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
                                        <div className="h-20 w-full" style={{ background: c.bg }} />
                                        <div className="p-3" style={{ background: "#0a0a0a" }}>
                                            <div className="text-xs font-semibold text-text-primary mb-1">{c.name}</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs" style={{ color: "#444" }}>{c.hex}</span>
                                                <CopyButton text={c.hex} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Typography */}
                    <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <motion.h2 variants={itemVariants} className="text-base font-bold text-text-primary mb-6">Typography</motion.h2>
                        <div className="grid md:grid-cols-2 gap-5">
                            {[
                                { family: "Syne", usage: "Display & headings", sample: "Master your money.", weight: "700, 800" },
                                { family: "DM Sans", usage: "Body & UI text", sample: "Track every rupee with ease.", weight: "300, 400, 500, 600" },
                            ].map((t, i) => (
                                <motion.div key={i} variants={itemVariants}>
                                    <div className="rounded-2xl p-7" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)" }}>
                                        <div className="flex items-center justify-between mb-5">
                                            <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>{t.usage}</span>
                                            <span className="text-xs" style={{ color: "#333" }}>Weights: {t.weight}</span>
                                        </div>
                                        <p className="text-3xl text-text-primary mb-2" style={{ fontFamily: `'${t.family}',sans-serif`, fontWeight: 800 }}>{t.sample}</p>
                                        <p className="text-sm" style={{ color: "#444" }}>{t.family}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Usage guidelines */}
                    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
                        <div className="rounded-2xl p-8" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <h2 className="text-base font-bold text-text-primary mb-5">Usage Guidelines</h2>
                            <div className="grid md:grid-cols-2 gap-x-10 gap-y-3">
                                {[
                                    ["✓ Do", "Use the logo with sufficient clear space"],
                                    ["✓ Do", "Use on approved background colors only"],
                                    ["✓ Do", "Maintain aspect ratio when resizing"],
                                    ["✗ Don't", "Modify, recolor, or distort the logo"],
                                    ["✗ Don't", "Use VoiceKhata branding to imply partnership without permission"],
                                    ["✗ Don't", "Place the logo on busy backgrounds"],
                                ].map(([tag, text], i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <span className="text-xs font-bold flex-shrink-0" style={{ color: tag.startsWith("✓") ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}>{tag}</span>
                                        <span className="text-xs" style={{ color: "#444" }}>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}