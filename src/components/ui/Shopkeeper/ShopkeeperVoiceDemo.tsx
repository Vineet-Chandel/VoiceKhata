import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  Volume2, 
  CheckCircle2, 
  Send, 
  RefreshCw, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Share2,
  Clock,
  UserCheck
} from "lucide-react";

interface LedgerEntry {
  id: string;
  customerName: string;
  phone: string;
  amount: number;
  type: "udhar" | "jama"; // udhar = customer owes shopkeeper, jama = customer paid shopkeeper
  spokenPhrase: string;
  time: string;
  totalBalance: number;
}

const SAMPLE_COMMANDS = [
  {
    label: "🎙️ 'रमेश ₹200 उधार'",
    phrase: "रमेश 200 रुपये उधार लिखो",
    customer: "रमेश कुमार (Ramesh Kumar)",
    phone: "+91 98234 11200",
    amount: 200,
    type: "udhar" as const,
    balance: 1400
  },
  {
    label: "🎙️ 'सुनील ₹500 जमा'",
    phrase: "सुनील ने 500 रुपये जमा किए",
    customer: "सुनील वर्मा (Sunil Verma)",
    phone: "+91 94150 88500",
    amount: 500,
    type: "jama" as const,
    balance: 350
  },
  {
    label: "🎙️ 'गुप्ता किराना ₹1,250 उधार'",
    phrase: "गुप्ता किराना 1250 रुपये का सामान उधार ले गए",
    customer: "गुप्ता जी (Gupta Kirana)",
    phone: "+91 97110 33250",
    amount: 1250,
    type: "udhar" as const,
    balance: 2450
  },
  {
    label: "🎙️ 'वर्मा मेडिकल ₹800 जमा'",
    phrase: "वर्मा मेडिकल से 800 रुपये नकद मिले",
    customer: "डॉ. वर्मा (Verma Medical)",
    phone: "+91 99360 44800",
    amount: 800,
    type: "jama" as const,
    balance: 0
  }
];

export function ShopkeeperVoiceDemo() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [activeCommand, setActiveCommand] = useState(SAMPLE_COMMANDS[0]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([
    {
      id: "e1",
      customerName: "रमेश कुमार (Ramesh Kumar)",
      phone: "+91 98234 11200",
      amount: 200,
      type: "udhar",
      spokenPhrase: "रमेश 200 रुपये उधार लिखो",
      time: "अभी-अभी (Just now)",
      totalBalance: 1400
    },
    {
      id: "e2",
      customerName: "सुनील वर्मा (Sunil Verma)",
      phone: "+91 94150 88500",
      amount: 500,
      type: "jama",
      spokenPhrase: "सुनील ने 500 रुपये जमा किए",
      time: "10 मिनट पहले",
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
        // Fallback simulate
        simulateVoice(SAMPLE_COMMANDS[Math.floor(Math.random() * SAMPLE_COMMANDS.length)]);
        return;
      }

      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognitionClass();
        recognitionRef.current = recognition;
        recognition.lang = "hi-IN"; // Hindi / Indian English
        recognition.interimResults = true;

        setIsListening(true);
        setTranscript("सुन रहा हूँ... बोलिए (Listening...)");

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
          setTranscript("आवाज़ नहीं मिली, नीचे दिए बटन पर क्लिक करें!");
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
    const isJama = text.toLowerCase().includes("jama") || text.includes("जमा") || text.includes("mila") || text.includes("received");
    const numMatches = text.match(/\d+/);
    const amount = numMatches ? parseInt(numMatches[0], 10) : 350;

    const newEntry: LedgerEntry = {
      id: "entry-" + Date.now(),
      customerName: "ग्राहक (Customer Entry)",
      phone: "+91 98765 00000",
      amount: amount,
      type: isJama ? "jama" : "udhar",
      spokenPhrase: text,
      time: "अभी-अभी (Just now)",
      totalBalance: isJama ? 850 - amount : 1100 + amount
    };

    setLedgerEntries((prev) => [newEntry, ...prev.slice(0, 4)]);
  };

  const simulateVoice = (cmd: typeof SAMPLE_COMMANDS[0]) => {
    setActiveCommand(cmd);
    setIsListening(true);
    setTranscript(`सुन रहे हैं: "${cmd.phrase}"...`);

    // Voice synthesis playback
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(cmd.phrase);
        u.rate = 1.0;
        window.speechSynthesis.speak(u);
      } catch (e) {
        // ignore
      }
    }

    setTimeout(() => {
      setIsListening(false);
      setTranscript(`AI द्वारा पहचाना गया: "${cmd.phrase}"`);

      const newEntry: LedgerEntry = {
        id: "entry-" + Date.now(),
        customerName: cmd.customer,
        phone: cmd.phone,
        amount: cmd.amount,
        type: cmd.type,
        spokenPhrase: cmd.phrase,
        time: "अभी-अभी (Just now)",
        totalBalance: cmd.balance
      };

      setLedgerEntries((prev) => [newEntry, ...prev.slice(0, 4)]);
    }, 1200);
  };

  const sendWhatsAppReminder = (entry: LedgerEntry) => {
    setWhatsappSentId(entry.id);
    setTimeout(() => setWhatsappSentId(null), 3000);
  };

  return (
    <section id="demo" className="py-12 sm:py-16 bg-neutral-950/80 border-y border-emerald-950/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-3">
            <Sparkles className="size-3.5" />
            <span>खुद बोलकर आज़माएँ (Interactive Live Demo)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            माइक दबाएँ या नीचे किसी भी आवाज़ पर क्लिक करें
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400">
            देखें कैसे आपकी आवाज़ 1 सेकंड के अंदर ग्राहक के खाते में उधार (लाल) या जमा (हरा) दर्ज कर देती है।
          </p>
        </div>

        {/* Interactive Demo Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Microphone & Commands (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 sm:p-8 shadow-2xl">
            
            {/* Big Mic Button */}
            <div className="flex flex-col items-center justify-center text-center pt-2 pb-4">
              <button
                onClick={startRealSpeech}
                className={`relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full transition-all duration-300 ${
                  isListening
                    ? "bg-rose-600 scale-110 shadow-[0_0_40px_rgba(225,29,72,0.6)]"
                    : "bg-gradient-to-tr from-emerald-600 to-emerald-400 hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                }`}
                title="बोलने के लिए क्लिक करें"
              >
                {/* Ripples when listening */}
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping" />
                    <span className="absolute -inset-3 rounded-full border border-rose-400/50 animate-pulse" />
                  </>
                )}
                <Mic className="size-10 sm:size-12 text-black" />
              </button>

              <p className="mt-4 text-sm font-bold text-white">
                {isListening ? (
                  <span className="text-rose-400 animate-pulse">🔴 आवाज़ सुन रहा हूँ... बोलिए!</span>
                ) : (
                  <span>माइक दबाकर बोलें (Tap to Speak)</span>
                )}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                हिंदी, हिंग्लिश या अपनी स्थानीय बोली में बोलें
              </p>
            </div>

            {/* Live Transcript Feedback Box */}
            <div className="rounded-2xl border border-white/10 bg-neutral-950 p-3.5 text-center min-h-[50px] flex items-center justify-center">
              <p className="text-xs font-mono text-emerald-300">
                {transcript || '💡 ऊपर माइक दबाएँ या नीचे दिए गए उदाहरणों पर क्लिक करें:'}
              </p>
            </div>

            {/* Sample Clickable Phrases */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                दुकान पर सबसे ज़्यादा बोले जाने वाले वाक्य:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_COMMANDS.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => simulateVoice(cmd)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 px-3 text-left text-xs text-white hover:border-emerald-500/40 hover:bg-emerald-500/10 active:scale-95 transition-all"
                  >
                    <span className="font-semibold">{cmd.label}</span>
                    <Volume2 className="size-3.5 text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Live Khatabook-Style Ledger View (lg:col-span-7) */}
          <div className="lg:col-span-7 rounded-3xl border border-white/15 bg-[#0e0e12] p-6 sm:p-8 shadow-2xl">
            
            {/* Ledger Top Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">लाइव बही-खाता (Digital Ledger)</span>
                <h3 className="text-lg font-bold text-white">दुकान का लेन-देन रजिस्टर</h3>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ऑटो-अपडेट
                </span>
              </div>
            </div>

            {/* Khatabook Two Columns Summary */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl border border-rose-900/30 bg-rose-950/20 p-3.5 text-center">
                <p className="text-[11px] font-semibold text-rose-300">आप देंगे (You Will Give)</p>
                <p className="text-xl sm:text-2xl font-black text-rose-400 mt-1">₹850</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">सप्लायर / सामान का</p>
              </div>
              <div className="rounded-2xl border border-emerald-900/30 bg-emerald-950/20 p-3.5 text-center">
                <p className="text-[11px] font-semibold text-emerald-300">आपको मिलेगा (You Will Get)</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">₹4,200</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">ग्राहकों का कुल उधार</p>
              </div>
            </div>

            {/* List of Recent Ledger Entries */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-neutral-400">हालिया बोलकर लिखे गए हिसाब:</p>

              {ledgerEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                    entry.type === "udhar"
                      ? "border-rose-500/30 bg-rose-950/10 hover:border-rose-500/60"
                      : "border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/60"
                  }`}
                >
                  {/* Left Customer Info */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-base shrink-0 ${
                        entry.type === "udhar" ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {entry.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white leading-tight">{entry.customerName}</p>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            entry.type === "udhar"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {entry.type === "udhar" ? "उधार दिया" : "जमा मिला"}
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

                  {/* Right Amount & WhatsApp Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p
                        className={`text-lg sm:text-xl font-black font-mono leading-none ${
                          entry.type === "udhar" ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {entry.type === "udhar" ? `- ₹${entry.amount}` : `+ ₹${entry.amount}`}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        बकाया: ₹{entry.totalBalance}
                      </p>
                    </div>

                    {/* WhatsApp Reminder Button */}
                    <button
                      onClick={() => sendWhatsAppReminder(entry)}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                        whatsappSentId === entry.id
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                          : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      }`}
                      title="WhatsApp पर तगादा भेजें"
                    >
                      {whatsappSentId === entry.id ? (
                        <>
                          <CheckCircle2 className="size-3.5" />
                          <span>भेज दिया!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="size-3" />
                          <span className="hidden sm:inline">तगादा भेजें</span>
                          <span className="sm:hidden">WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp Reminder Preview Toast */}
            {whatsappSentId && (
              <div className="mt-4 p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/60 text-xs text-emerald-200 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>WhatsApp संदेश तैयार:</strong> "नमस्ते जी, आपकी दुकान का ₹{ledgerEntries.find(e => e.id === whatsappSentId)?.totalBalance} का बकाया है। कृपया UPI लिंक से भुगतान करें।"
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
