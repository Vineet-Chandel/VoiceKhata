import { Badge } from "@/components/ui/badge"
import { motion, type Variants } from "framer-motion"
import { FileText } from "lucide-react"

const itemV: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } }

const sections = [
    { title: "1. Acceptance of Terms", body: "By accessing or using FinEase, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the service." },
    { title: "2. Description of Service", body: "FinEase is a personal finance management platform that provides expense tracking, budgeting tools, financial analytics, and AI-powered insights. The service is provided 'as is' and may be updated at any time." },
    { title: "3. User Accounts", body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must be at least 18 years of age to create an account." },
    { title: "4. Acceptable Use", body: "You agree not to misuse the service, attempt to access other users' data, reverse engineer the application, or use FinEase for any illegal financial activity. Violations may result in immediate account termination." },
    { title: "5. Financial Information Disclaimer", body: "FinEase provides financial tools and AI insights for informational purposes only. Nothing in the service constitutes professional financial advice. Always consult a qualified financial advisor before making significant financial decisions." },
    { title: "6. Data & Privacy", body: "Your use of the service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. We take the security of your financial data extremely seriously." },
    { title: "7. Payments & Billing", body: "Paid subscriptions are billed monthly or annually as chosen. All payments are processed securely via Razorpay. Refunds are available within 7 days of any charge under our refund guarantee." },
    { title: "8. Termination", body: "You may cancel your account at any time. We reserve the right to suspend or terminate accounts that violate these terms, with or without notice, depending on the severity of the violation." },
    { title: "9. Limitation of Liability", body: "FinEase Technologies Pvt. Ltd. shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the amount paid in the past 12 months." },
    { title: "10. Governing Law", body: "These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka." },
]

export default function TermsAndServices() {
    return (
        <div className="min-h-screen text-text-primary relative overflow-hidden" style={{ background: "#000", fontFamily: "'DM Sans', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(20)].map((_, i) => <div key={i} className="absolute rounded-full bg-white" style={{ width: "1px", height: "1px", top: `${(i * 47 + 13) % 100}%`, left: `${(i * 61 + 9) % 100}%`, opacity: 0.08 }} />)}
            </div>
            <div className="relative z-10 px-6 pt-20 pb-20 max-w-3xl mx-auto">
                <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}>
                    <motion.div variants={itemV} className="mb-8">
                        <Badge className="mb-5 px-4 py-1 text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}>
                            <FileText className="w-3 h-3 mr-1" /> Legal
                        </Badge>
                        <h1 className="text-4xl font-black text-text-primary mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>Terms of Service</h1>
                        <p className="text-sm" style={{ color: "#444" }}>Last updated: January 1, 2025 · Effective: January 15, 2025</p>
                    </motion.div>
                    <motion.p variants={itemV} className="text-sm leading-relaxed mb-10" style={{ color: "#555" }}>
                        Please read these terms carefully before using FinEase. By using the service, you agree to these terms.
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