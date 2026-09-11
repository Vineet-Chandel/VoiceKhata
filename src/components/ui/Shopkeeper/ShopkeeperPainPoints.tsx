import React from "react";
import { 
  XCircle, 
  CheckCircle2, 
  Zap, 
  Globe2, 
  MessageSquare, 
  WifiOff, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";

export function ShopkeeperPainPoints() {
  const comparisonItems = [
    {
      pain: "दुकान पर ग्राहकों की भीड़ में डायरी में लिखने का समय नहीं मिलता — हिसाब छूट जाता है।",
      solution: "केवल 3 सेकंड में बोलें — 'रमेश ₹200 उधार'। ग्राहक के सामने ही बिना पेन छुए एंट्री हो जाएगी।",
      icon: <Clock className="size-5 text-emerald-400" />,
      tag: "भीड़ में सुपरफ़ास्ट"
    },
    {
      pain: "मोबाइल ऐप्स में नाम ढूँढना और कीबोर्ड से टाइप करना बहुत धीमा और झंझट भरा है।",
      solution: "Zero Typing! बस ग्राहक का नाम और रुपये बोलें। AI अपने आप सही खाते में दर्ज कर देता है।",
      icon: <Zap className="size-5 text-emerald-400" />,
      tag: "शून्य टाइपिंग"
    },
    {
      pain: "उधार के पैसे माँगने में संकोच और शर्म आती है — रिश्ते खराब होने का डर रहता है।",
      solution: "ऑटोमैटिक और विनम्र WhatsApp पेमेंट रिमाइंडर, सीधा UPI लिंक के साथ। 3x तेज़ वसूली!",
      icon: <MessageSquare className="size-5 text-emerald-400" />,
      tag: "WhatsApp तगादा"
    },
    {
      pain: "कागज़ की लाल बही-खाता डायरी फटने, पानी गिरने या खो जाने पर भारी नुक़सान।",
      solution: "100% सुरक्षित ऑटोमैटिक क्लाउड बैकअप। मोबाइल बदलें या खो जाए, हिसाब 1 मिनट में वापस।",
      icon: <ShieldCheck className="size-5 text-emerald-400" />,
      tag: "100% सुरक्षित"
    },
    {
      pain: "दुकान में कम नेटवर्क या इंटरनेट बंद होने पर ऑनलाइन ऐप्स बंद हो जाते हैं।",
      solution: "ऑफलाइन मोड — बिना इंटरनेट के भी बोलकर हिसाब लिखें। नेटवर्क आने पर अपने आप सिंक होगा।",
      icon: <WifiOff className="size-5 text-emerald-400" />,
      tag: "बिना इंटरनेट भी चालू"
    },
    {
      pain: "अंग्रेज़ी ऐप्स समझना मुश्किल — स्थानीय भाषा और लहजे में टाइपिंग नहीं हो पाती।",
      solution: "हिंदी, हिंग्लिश और अपनी स्थानीय बोली में स्वाभाविक रूप से बोलें — जैसा आप बोलते हैं, वैसा समझेगा।",
      icon: <Globe2 className="size-5 text-emerald-400" />,
      tag: "अपनी भाषा"
    }
  ];

  return (
    <section id="comparison" className="py-14 sm:py-20 bg-[#070709]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            पुरानी परेशानियाँ vs नया आसान तरीका
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-black text-white tracking-tight">
            कागज़ी डायरी और धीमी टाइपिंग को कहें अलविदा
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            जानें क्यों हज़ारों दुकानदार पुरानी लाल डायरी और जटिल ऐप्स छोड़कर VoiceKhata अपना रहे हैं।
          </p>
        </div>

        {/* Comparison Table / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Old Way Column (Red Alert Style) */}
          <div className="rounded-3xl border border-rose-900/30 bg-rose-950/10 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-rose-900/30 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                <XCircle className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-rose-300">पुराना तरीका: लाल डायरी या टाइपिंग ऐप्स</h3>
                <p className="text-xs text-rose-400/80">समय की बर्बादी और हिसाब छूटने का जोखिम</p>
              </div>
            </div>

            <div className="space-y-4">
              {comparisonItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300">
                  <span className="text-rose-500 text-base font-bold shrink-0 mt-0.5">✕</span>
                  <p className="leading-relaxed text-neutral-400">{item.pain}</p>
                </div>
              ))}
            </div>
          </div>

          {/* New Way Column (Emerald Khatabook Green Style) */}
          <div className="relative rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/25 to-neutral-950 p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Recommended pill */}
            <div className="absolute -top-3 right-6 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-md">
              आधुनिक व्यापारियों की पसंद
            </div>

            <div className="flex items-center gap-3 border-b border-emerald-800/30 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-300">नया तरीका: VoiceKhata (बोलकर हिसाब)</h3>
                <p className="text-xs text-emerald-400/80">3 सेकंड में एंट्री, 0% गलती, 3x तेज़ वसूली</p>
              </div>
            </div>

            <div className="space-y-4">
              {comparisonItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                  <div className="mt-0.5 shrink-0">{item.icon}</div>
                  <div>
                    <span className="inline-block rounded bg-emerald-500/15 text-emerald-300 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider mb-1">
                      {item.tag}
                    </span>
                    <p className="leading-relaxed text-white font-medium">{item.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default ShopkeeperPainPoints;
