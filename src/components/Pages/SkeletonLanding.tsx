import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Mic, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Receipt, 
  BookOpen, 
  BarChart3, 
  Bot, 
  CheckCircle2, 
  ChevronRight,
  Globe,
  Zap,
  Smartphone
} from "lucide-react";
import FloatingVoiceBadgesPhysics from "@/components/ui/Hero/FloatingVoiceBadgesPhysics";
import Logo from "@/components/ui/Navbar/logo";

export function SkeletonLanding() {
  const [activeTab, setActiveTab] = useState<"voice" | "udhar" | "receipt" | "ai">("voice");

  return (
    <div className="relative min-h-screen w-full bg-[#070709] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[500px] w-[90vw] max-w-[1000px] rounded-full bg-emerald-600/10 blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] h-[400px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[600px] rounded-full bg-teal-600/10 blur-[160px]" />
      </div>

      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070709]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Mic className="size-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Voice<span className="text-emerald-400">Khata</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
            <a href="#playground" className="transition-colors hover:text-emerald-400">Interactive Physics</a>
            <a href="#features" className="transition-colors hover:text-emerald-400">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-emerald-400">How It Works</a>
            <a href="#testimonials" className="transition-colors hover:text-emerald-400">Reviews</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-neutral-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-neutral-200 hover:shadow-lg hover:shadow-white/10 active:scale-95"
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* 2. Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8 lg:pt-16">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md">
              <Sparkles className="size-3.5" />
              <span>Next-Gen Voice-First Finance & Udhar Ledger</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.1]">
              Speak It. Track It. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Master Your Money.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base text-neutral-400 sm:text-lg md:text-xl max-w-2xl mx-auto">
              Record daily expenses and customer Udhar/Jama in natural <strong>Hindi & English</strong>. 
              Zero manual spreadsheet typing — powered by in-browser speech AI and Matter.js interactive physics.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95"
              >
                Start Free Workspace
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#playground"
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10"
              >
                <Mic className="size-4 text-emerald-400" />
                Explore Live Physics Demo
              </a>
            </div>

            {/* Micro proof tags */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                Hindi & English Native NLP
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                Udhar / Jama Auto-Ledger
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                Vision AI Bill Scanner
              </span>
            </div>
          </div>

          {/* 3. Physics Interactive Voice Playground */}
          <div id="playground" className="mt-12 sm:mt-16">
            <FloatingVoiceBadgesPhysics />
          </div>
        </section>

        {/* 4. Live Stats Bar */}
        <section className="border-y border-white/10 bg-neutral-950/40 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
              <div>
                <p className="text-3xl font-extrabold text-white">99.2%</p>
                <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Speech Accuracy (Hinglish)</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-emerald-400">&lt; 1.5s</p>
                <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">AI Transaction Parsing</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">₹12Cr+</p>
                <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Transactions Processed</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-cyan-400">100%</p>
                <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Private & Encrypted</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Feature Highlights (Bento Grid) */}
        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Engineered for Speed</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to run your personal and business finances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Voice Khata */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-8 hover:border-emerald-500/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-6">
                <Mic className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Voice Khata & Udhar Ledger</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Record customer credit, partial settlements, and daily sales by simply speaking. Supports mixed Hindi/English commands like <em>"Rahul ko 500 udhar diye"</em>.
              </p>
            </div>

            {/* Bento Card 2: Receipt Scanner */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-8 hover:border-cyan-500/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 mb-6">
                <Receipt className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Vision AI Receipt Scanner</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Snap photos of restaurant bills, grocery invoices, or tax receipts. Our OCR engine extracts line items, taxes, and vendor names automatically.
              </p>
            </div>

            {/* Bento Card 3: AI Financial Copilot */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-8 hover:border-purple-500/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 mb-6">
                <Bot className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">24/7 AI Khata Assistant</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Ask questions about your finances anytime: <em>"How much does Ramesh owe me?"</em> or <em>"Did I overspend on food this week?"</em>.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Interactive Tab Showcase */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/80 to-black p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Interactive Preview</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">See VoiceKhata in Action</h3>
              </div>

              {/* Tab selector */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "voice", label: "🎙️ Voice Logging" },
                  { id: "udhar", label: "📗 Udhar/Jama Ledger" },
                  { id: "receipt", label: "🧾 Receipt OCR" },
                  { id: "ai", label: "🤖 AI Assistant" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-emerald-500 text-black font-semibold shadow-md"
                        : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab contents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                {activeTab === "voice" && (
                  <>
                    <h4 className="text-2xl font-bold text-white">Speak naturally in your local dialect</h4>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      VoiceKhata uses high-accuracy Web Speech API with our localized financial vocabulary parser. It instantly recognizes amounts, categories, and payment modes with no keyboard needed.
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4 font-mono text-xs text-neutral-300">
                      <div className="flex items-center justify-between text-neutral-500 mb-2">
                        <span>AUDIO STREAM</span>
                        <span className="text-emerald-400">LIVE</span>
                      </div>
                      <p className="text-emerald-300">🎙️ "Kal sham ko Rohit ko 1200 cash diya"</p>
                      <div className="mt-3 border-t border-white/10 pt-2 text-neutral-400 space-y-1">
                        <p>➜ Amount: <span className="text-white">₹1,200</span></p>
                        <p>➜ Contact: <span className="text-white">Rohit</span></p>
                        <p>➜ Type: <span className="text-rose-400">Debit / Udhar</span></p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "udhar" && (
                  <>
                    <h4 className="text-2xl font-bold text-white">Zero lost payments with automated Khata balances</h4>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      Track customer balances in real-time. Know exactly who owes what, send gentle payment reminders via WhatsApp, and settle ledgers with one tap.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-neutral-950 text-xs">
                        <span className="font-semibold text-white">Amit Electronics</span>
                        <span className="text-rose-400 font-mono font-bold">You will get: ₹3,500</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-neutral-950 text-xs">
                        <span className="font-semibold text-white">Sharma Kirana</span>
                        <span className="text-emerald-400 font-mono font-bold">You will give: ₹850</span>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "receipt" && (
                  <>
                    <h4 className="text-2xl font-bold text-white">Turn paper bills into structured financial data</h4>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      Upload any printed or handwritten receipt. Our computer vision AI extracts item names, subtotals, GST, and totals within two seconds.
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4 text-xs font-mono text-neutral-300">
                      <p className="text-cyan-400">📄 Receipt OCR Breakdown:</p>
                      <p className="mt-1 text-neutral-400">• Cafe Coffee Day - ₹462.00</p>
                      <p className="text-neutral-400">• CGST 2.5% + SGST 2.5%</p>
                      <p className="mt-1 text-emerald-400 font-bold">Total ₹462.00 auto-logged under 'Food & Dining'</p>
                    </div>
                  </>
                )}

                {activeTab === "ai" && (
                  <>
                    <h4 className="text-2xl font-bold text-white">Your personal AI CFO that never sleeps</h4>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      Analyze weekly spending, predict cash flow shortages, and get intelligent recommendations on reducing unnecessary recurring subscriptions.
                    </p>
                    <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 text-xs text-purple-200">
                      <p className="font-semibold text-white mb-1">💡 Smart Financial Recommendation</p>
                      <p>
                        "You spent 24% less on food delivery this week compared to last month. If you maintain this, you will save ₹4,200 extra by month end!"
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Visual preview box */}
              <div className="relative rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
                  <div className="size-3 rounded-full bg-rose-500/80" />
                  <div className="size-3 rounded-full bg-amber-500/80" />
                  <div className="size-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-neutral-500 ml-2 font-mono">voicekhata.app/dashboard</span>
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
                  <div className="h-20 w-full rounded-xl bg-white/5 p-3 flex flex-col justify-between">
                    <div className="h-3 w-1/3 rounded bg-emerald-400/30" />
                    <div className="h-3 w-1/2 rounded bg-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 rounded-xl bg-white/5 p-3 flex flex-col justify-between">
                      <div className="h-2 w-1/2 rounded bg-neutral-600" />
                      <div className="h-4 w-3/4 rounded bg-emerald-400/40" />
                    </div>
                    <div className="h-16 rounded-xl bg-white/5 p-3 flex flex-col justify-between">
                      <div className="h-2 w-1/2 rounded bg-neutral-600" />
                      <div className="h-4 w-3/4 rounded bg-rose-400/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Call To Action (Bottom Banner) */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-neutral-900 to-black p-10 md:p-16 text-center">
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Ready to automate your ledger with voice?
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto mb-8 text-base sm:text-lg">
              Join thousands of students, freelancers, and merchants mastering their finances with VoiceKhata. Free forever for basic use.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-black shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95"
            >
              Get Started Now — It's Free
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="border-t border-white/10 bg-black py-10 text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">VoiceKhata</span>
            <span>• Your Ledger, Your Voice</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/features" className="hover:text-neutral-300">Features</Link>
            <Link to="/pricing" className="hover:text-neutral-300">Pricing</Link>
            <Link to="/faqs" className="hover:text-neutral-300">FAQs</Link>
            <Link to="/privacy" className="hover:text-neutral-300">Privacy</Link>
            <Link to="/terms" className="hover:text-neutral-300">Terms</Link>
          </div>
          <p>© {new Date().getFullYear()} VoiceKhata. Built by Fin Fusion.</p>
        </div>
      </footer>
    </div>
  );
}

export default SkeletonLanding;
