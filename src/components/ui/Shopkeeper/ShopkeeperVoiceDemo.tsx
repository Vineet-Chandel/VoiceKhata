import React, { useState, useRef } from "react";
import { 
  Mic, 
  Volume2, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Share2,
  Clock
} from "lucide-react";

interface LedgerEntry {
  id: string;
  customerName: string;
  phone: string;
  amount: number;
  type: "udhar" | "jama"; // udhar = customer owes you (debit/red), jama = customer paid you (credit/cyan)
  spokenPhrase: string;
  time: string;
  totalBalance: number;
}

const SAMPLE_COMMANDS = [
  {
    label: "🎙️ 'Ramesh ₹200 Udhar'",
    phrase: "Record 200 rupees udhar for Ramesh",
    customer: "Ramesh Kumar",
    phone: "+91 98234 11200",
    amount: 200,
    type: "udhar" as const,
    balance: 1400
  },
  {
    label: "🎙️ 'Sunil ₹500 Paid'",
    phrase: "Sunil paid 500 rupees cash",
    customer: "Sunil Verma",
    phone: "+91 94150 88500",
    amount: 500,
    type: "jama" as const,
    balance: 350
  },
  {
    label: "🎙️ 'Gupta Kirana ₹1,250 Udhar'",
    phrase: "Gupta Kirana bought goods worth 1250 on credit",
    customer: "Gupta General Store",
    phone: "+91 97110 33250",
    amount: 1250,
    type: "udhar" as const,
    balance: 2450
  },
  {
    label: "🎙️ 'Verma Medical ₹800 Paid'",
    phrase: "Received 800 rupees from Verma Medical",
    customer: "Dr. Verma Medical",
    phone: "+91 99360 44800",
    amount: 800,
    type: "jama" as const,
    balance: 0
  }
];

export function ShopkeeperVoiceDemo() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([
    {
      id: "e1",
      customerName: "Ramesh Kumar",
      phone: "+91 98234 11200",
      amount: 200,
      type: "udhar",
      spokenPhrase: "Record 200 rupees udhar for Ramesh",
      time: "Just now",
      totalBalance: 1400
    },
    {
      id: "e2",
      customerName: "Sunil Verma",
      phone: "+91 94150 88500",
      amount: 500,
      type: "jama",
      spokenPhrase: "Sunil paid 500 rupees cash",
      time: "10 mins ago",
      totalBalance: 350
    }
  ]);
  const [whatsappSentId, setWhatsappSentId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Web Speech API initialization
  const startRealSpeech = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        simulateVoice(SAMPLE_COMMANDS[Math.floor(Math.random() * SAMPLE_COMMANDS.length)]);
        return;
      }

      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognitionClass();
        recognitionRef.current = recognition;
        recognition.lang = "en-IN"; // Indian English
        recognition.interimResults = true;

        setIsListening(true);
        setTranscript("Listening... Speak now (e.g. 'Ramesh 200 udhar')");

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(`"${text}"`);

          if (event.results[current].isFinal) {
            handleParsedText(text);
            setIsListening(false);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          setTranscript("Could not capture speech. Try clicking a sample phrase below!");
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        setIsListening(false);
        simulateVoice(SAMPLE_COMMANDS[0]);
      }
    }
  };

  const handleParsedText = (text: string) => {
    const isJama = text.toLowerCase().includes("jama") || text.toLowerCase().includes("paid") || text.toLowerCase().includes("received") || text.toLowerCase().includes("credit");
    const numMatches = text.match(/\d+/);
    const amount = numMatches ? parseInt(numMatches[0], 10) : 350;

    const newEntry: LedgerEntry = {
      id: "entry-" + Date.now(),
      customerName: "Customer Entry",
      phone: "+91 98765 00000",
      amount: amount,
      type: isJama ? "jama" : "udhar",
      spokenPhrase: text,
      time: "Just now",
      totalBalance: isJama ? 850 - amount : 1100 + amount
    };

    setLedgerEntries((prev) => [newEntry, ...prev.slice(0, 4)]);
  };

  const simulateVoice = (cmd: typeof SAMPLE_COMMANDS[0]) => {
    setIsListening(true);
    setTranscript(`Simulating voice: "${cmd.phrase}"...`);

    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(cmd.phrase);
        u.rate = 1.05;
        window.speechSynthesis.speak(u);
      } catch (e) {
        // ignore
      }
    }

    setTimeout(() => {
      setIsListening(false);
      setTranscript(`AI Extracted: "${cmd.phrase}"`);

      const newEntry: LedgerEntry = {
        id: "entry-" + Date.now(),
        customerName: cmd.customer,
        phone: cmd.phone,
        amount: cmd.amount,
        type: cmd.type,
        spokenPhrase: cmd.phrase,
        time: "Just now",
        totalBalance: cmd.balance
      };

      setLedgerEntries((prev) => [newEntry, ...prev.slice(0, 4)]);
    }, 1100);
  };

  const sendWhatsAppReminder = (entry: LedgerEntry) => {
    setWhatsappSentId(entry.id);
    setTimeout(() => setWhatsappSentId(null), 3500);
  };

  return (
    <section id="demo" className="py-12 sm:py-16 bg-neutral-950/80 border-y border-indigo-950/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/50 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-3">
            <Sparkles className="size-3.5 text-cyan-400" />
            <span>Interactive Live Voice Playground</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#F8FAFC]">
            Tap the Mic or Click Any Sample Command
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
            See how your speech is parsed in 1 second into an itemized credit (Debit) or received (Credit) ledger entry.
          </p>
        </div>

        {/* Demo Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Microphone & Commands (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6 rounded-3xl border border-slate-700/40 bg-[#131B2E] p-6 sm:p-8 shadow-2xl">
            
            {/* Big Mic Button */}
            <div className="flex flex-col items-center justify-center text-center pt-2 pb-4">
              <button
                onClick={startRealSpeech}
                className={`relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full transition-all duration-300 ${
                  isListening
                    ? "bg-rose-600 scale-110 shadow-[0_0_40px_rgba(225,29,72,0.6)]"
                    : "bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 hover:scale-105 shadow-[0_0_35px_rgba(99,102,241,0.4)]"
                }`}
                title="Click to speak"
              >
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping" />
                    <span className="absolute -inset-3 rounded-full border border-rose-400/50 animate-pulse" />
                  </>
                )}
                <Mic className="size-10 sm:size-12 text-white" />
              </button>

              <p className="mt-4 text-sm font-bold text-[#F8FAFC]">
                {isListening ? (
                  <span className="text-rose-400 animate-pulse">🔴 Listening... Speak now!</span>
                ) : (
                  <span>Tap to Speak (or Click Below)</span>
                )}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Speaks English, Hinglish, or local retail phrasing
              </p>
            </div>

            {/* Transcript Feedback */}
            <div className="rounded-2xl border border-white/10 bg-neutral-950 p-3.5 text-center min-h-[50px] flex items-center justify-center">
              <p className="text-xs font-mono text-cyan-300">
                {transcript || '💡 Click the microphone above or test a sample phrase:'}
              </p>
            </div>

            {/* Clickable Sample Commands */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Common Counter Phrases:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_COMMANDS.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => simulateVoice(cmd)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 px-3 text-left text-xs text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 active:scale-95 transition-all"
                  >
                    <span className="font-semibold">{cmd.label}</span>
                    <Volume2 className="size-3.5 text-cyan-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Live Digital Ledger View (lg:col-span-7) */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-700/40 bg-[#131B2E] p-6 sm:p-8 shadow-2xl">
            
            {/* Ledger Header */}
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Live Customer Register</span>
                <h3 className="text-lg font-bold text-[#F8FAFC]">Digital Store Ledger</h3>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/40">
                  <span className="size-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Auto-Synced
                </span>
              </div>
            </div>

            {/* Two Summary Columns: You Will Give vs You Will Get */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl border border-rose-900/30 bg-rose-950/20 p-3.5 text-center">
                <p className="text-[11px] font-semibold text-rose-300">You Will Give (Payable)</p>
                <p className="text-xl sm:text-2xl font-black text-rose-400 mt-1">₹850</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">Supplier Dues</p>
              </div>
              <div className="rounded-2xl border border-cyan-900/30 bg-cyan-950/20 p-3.5 text-center">
                <p className="text-[11px] font-semibold text-cyan-300">You Will Get (Receivable)</p>
                <p className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">₹4,200</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">Customer Credit Balance</p>
              </div>
            </div>

            {/* List of Entries */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#94A3B8]">Recent Voice Transactions:</p>

              {ledgerEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                    entry.type === "udhar"
                      ? "border-rose-500/30 bg-rose-950/10 hover:border-rose-500/60"
                      : "border-cyan-500/30 bg-cyan-950/10 hover:border-cyan-500/60"
                  }`}
                >
                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-base shrink-0 ${
                        entry.type === "udhar" ? "bg-rose-500/20 text-rose-300" : "bg-cyan-500/20 text-cyan-300"
                      }`}
                    >
                      {entry.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#F8FAFC] leading-tight">{entry.customerName}</p>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            entry.type === "udhar"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          }`}
                        >
                          {entry.type === "udhar" ? "You Gave (Debit)" : "You Got (Credit)"}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="size-3 text-neutral-500" />
                        <span>{entry.time}</span>
                        <span>•</span>
                        <span className="italic text-neutral-400">"{entry.spokenPhrase}"</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Amount & WhatsApp Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p
                        className={`text-lg sm:text-xl font-black font-mono leading-none ${
                          entry.type === "udhar" ? "text-rose-400" : "text-cyan-400"
                        }`}
                      >
                        {entry.type === "udhar" ? `- ₹${entry.amount}` : `+ ₹${entry.amount}`}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Balance: ₹{entry.totalBalance}
                      </p>
                    </div>

                    {/* WhatsApp Reminder Button */}
                    <button
                      onClick={() => sendWhatsAppReminder(entry)}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                        whatsappSentId === entry.id
                          ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
                          : "border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                      }`}
                      title="Send WhatsApp Reminder"
                    >
                      {whatsappSentId === entry.id ? (
                        <>
                          <CheckCircle2 className="size-3.5 text-black" />
                          <span className="text-black font-bold">Sent!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="size-3" />
                          <span className="hidden sm:inline">WhatsApp Due</span>
                          <span className="sm:hidden">Remind</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp Reminder Preview Toast */}
            {whatsappSentId && (
              <div className="mt-4 p-3 rounded-xl border border-cyan-500/40 bg-cyan-950/60 text-xs text-cyan-200 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                <CheckCircle2 className="size-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>WhatsApp Message Generated:</strong> "Dear customer, your pending balance at the store is ₹{ledgerEntries.find(e => e.id === whatsappSentId)?.totalBalance}. Please pay securely via this UPI link."
                </span>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}

export default ShopkeeperVoiceDemo;
