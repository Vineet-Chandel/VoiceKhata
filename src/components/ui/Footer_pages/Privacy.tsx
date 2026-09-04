// ============================================================
// privacy-policy.tsx
// ============================================================
import { Badge } from "@/components/ui/badge"
import { motion, type Variants } from "framer-motion"
import { Shield } from "lucide-react"

const itemV: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } }

const sections = [
    { title: "1. Information We Collect", body: "We collect information you provide directly (name, email, financial transactions), information from connected services (bank email parsing, UPI apps), and usage data (pages visited, features used). We never collect your banking passwords or credentials." },
    { title: "2. How We Use Your Information", body: "Your data is used to provide and improve the FinEase service, generate personalized financial insights, send relevant notifications and reports, and prevent fraud. We do not sell your personal data to any third party." },
    { title: "3. Data Storage & Security", body: "All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Your data is stored on ISO 27001-certified servers located in India. We conduct regular security audits and penetration tests." },
    { title: "4. Data Sharing", body: "We share data only with sub-processors necessary to deliver the service (e.g., cloud hosting, email providers), and only under strict data processing agreements. We disclose data to authorities only when legally required." },
    { title: "5. Your Rights", body: "You have the right to access, correct, or delete your personal data at any time via Settings. You can request a full export of your data in JSON or CSV format. Account deletion permanently removes all your data within 30 days." },
    { title: "6. Cookies", body: "We use essential cookies for authentication and preferences, and optional analytics cookies to understand how the product is used. You can disable optional cookies from your browser settings." },
    { title: "7. Changes to This Policy", body: "We'll notify you by email and in-app notification at least 14 days before any material changes to this privacy policy. Continued use after that date constitutes acceptance of the updated policy." },
    { title: "8. Contact", body: "For any privacy-related concerns, contact our Data Protection Officer at privacy@finease.app or write to: FinEase Technologies Pvt. Ltd., 123 Startup Hub, Bengaluru, Karnataka 560001." },
]

export function PrivacyPolicy() {
    return (
        <div className="min-h-screen text-text-primary relative overflow-hidden" style={{ background: "#000", fontFamily: "'DM Sans', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(20)].map((_, i) => <div key={i} className="absolute rounded-full bg-white" style={{ width: "1px", height: "1px", top: `${(i * 47 + 13) % 100}%`, left: `${(i * 61 + 9) % 100}%`, opacity: 0.08 }} />)}
            </div>
            <div className="relative z-10 px-6 pt-20 pb-20 max-w-3xl mx-auto">
                <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}>
                    <motion.div variants={itemV} className="mb-8">
                        <Badge className="mb-5 px-4 py-1 text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}>
                            <Shield className="w-3 h-3 mr-1" /> Legal
                        </Badge>
                        <h1 className="text-4xl font-black text-text-primary mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>Privacy Policy</h1>
                        <p className="text-sm" style={{ color: "#444" }}>Last updated: January 1, 2025 · Effective: January 15, 2025</p>
                    </motion.div>
                    <motion.p variants={itemV} className="text-sm leading-relaxed mb-10" style={{ color: "#555" }}>
                        At FinEase, your privacy is foundational — not an afterthought. This policy explains exactly what data we collect, why, and how we protect it.
                    </motion.p>
                    {sections.map((s, i) => (
                        <motion.div key={i} variants={itemV} className="mb-8">
                            <h2 className="text-base font-bold text-text-primary mb-2">{s.title}</h2>
                            <p className="text-sm leading-relaxed" style={{ color: "#555" }}>{s.body}</p>
                            {i < sections.length - 1 && <div className="mt-8" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }} />}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}