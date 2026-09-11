import React from "react";
import { Star, Quote, CheckCircle2 } from "lucide-react";

export function ShopkeeperTestimonials() {
  const reviews = [
    {
      name: "राकेश गुप्ता",
      shop: "गुप्ता किराना & प्रोविजन स्टोर",
      city: "कानपुर, उत्तर प्रदेश",
      quote:
        "शाम को जब दुकान पर 10 ग्राहक एक साथ खड़े होते हैं, तो डायरी में पेन से लिखना नामुमकिन होता था। अब मैं सीधे बोल देता हूँ — 'बबलू 2 किलो चीनी 90 उधार'। शाम को एक भी रुपये का हिसाब नहीं छूटता!",
      savings: "हर महीने ₹8,000+ का हिसाब नुकसान बचा",
      rating: 5
    },
    {
      name: "संजय पटेल",
      shop: "पटेल हार्डवेयर & सैनिटरी वेयर",
      city: "अहमदाबाद, गुजरात",
      quote:
        "मिस्त्री और ठेकेदारों को बार-बार फोन करके उधार माँगने में बहुत शर्म आती थी। VoiceKhata से एक क्लिक में WhatsApp पर पेमेंट लिंक चला जाता है। अब 3 दिन के अंदर पैसे खाते में आ जाते हैं!",
      savings: "3 गुना तेज़ उधार वसूली",
      rating: 5
    },
    {
      name: "डॉ. अनीश अहमद",
      shop: "न्यू लाइफ मेडिकल & केमिस्ट",
      city: "लखनऊ, उत्तर प्रदेश",
      quote:
        "दवा देते वक्त हाथ में अक्सर सैनिटाइज़र या दवा की पत्ती होती है, मोबाइल स्क्रीन पर टाइप करना बहुत मुश्किल था। बोलकर खाता लिखना सबसे आसान क्रांति है। 100% सटीक काम करता है।",
      savings: "रोज़ाना 45 मिनट का कीमती समय बचा",
      rating: 5
    }
  ];

  return (
    <section id="reviews" className="py-14 sm:py-20 bg-[#070709]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            सच्चे व्यापारियों के अनुभव
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-black text-white tracking-tight">
            दुकानदारों ने बदली अपनी दुकान की किस्मत
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            देखें भारत के व्यापारी VoiceKhata के बारे में क्या कह रहे हैं।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-neutral-900/50 p-6 sm:p-8 hover:border-emerald-500/40 transition-colors"
            >
              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic mb-6">
                  "{rev.quote}"
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {rev.name}
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                    </h4>
                    <p className="text-xs text-neutral-400">{rev.shop}</p>
                    <p className="text-[11px] text-emerald-400/90 font-medium">{rev.city}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-emerald-950/40 border border-emerald-800/30 p-2 text-center text-[11px] font-bold text-emerald-300">
                  ✨ {rev.savings}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperTestimonials;
