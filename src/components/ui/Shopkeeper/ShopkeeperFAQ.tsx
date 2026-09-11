import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function ShopkeeperFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "क्या VoiceKhata सच में 100% मुफ़्त है?",
      a: "हाँ, बुनियादी खाता, बोलकर एंट्री, अनलिमिटेड ग्राहक जोड़ना और ऑटोमैटिक बैकअप भारतीय व्यापारियों के लिए 100% मुफ़्त है। कोई छुपा हुआ चार्ज नहीं है।"
    },
    {
      q: "अगर मैं अपनी स्थानीय बोली या टूटी-फूटी हिंदी में बोलूँ तो क्या यह समझेगा?",
      a: "बिल्कुल! हमारा AI भारतीय दुकानदारों की बोलचाल (हिंदी, हिंग्लिश और क्षेत्रीय लहजे) को समझने के लिए ही तैयार किया गया है। आप चाहे 'रमेश ₹200 उधार' कहें या 'रमेश को 200 देना है' — यह अपने आप सही नाम और रकम पहचान लेता है।"
    },
    {
      q: "क्या दुकान में इंटरनेट बंद होने पर भी यह काम करेगा?",
      a: "जी हाँ, VoiceKhata में ऑफलाइन मोड है। इंटरनेट न होने पर भी आप बोलकर हिसाब दर्ज कर सकते हैं। जब भी आपका फोन इंटरनेट से जुड़ेगा, सारा डेटा अपने आप सुरक्षित क्लाउड पर सिंक हो जाएगा।"
    },
    {
      q: "अगर मेरा मोबाइल खो जाए या चोरी हो जाए तो क्या मेरा हिसाब चला जाएगा?",
      a: "कतई नहीं! आपका सारा हिसाब बैंक-ग्रेड 256-बिट सुरक्षित क्लाउड बैकअप में स्टोर रहता है। आप नए फोन में अपना मोबाइल नंबर और OTP डालेंगे, और 1 मिनट में आपका पूरा पुराना बही-खाता वापस आ जाएगा।"
    },
    {
      q: "WhatsApp पर पेमेंट रिमाइंडर भेजने से क्या फायदा होता है?",
      a: "ग्राहक को सीधे उसके WhatsApp पर विनम्र संदेश और सुरक्षित UPI (PhonePe, Google Pay, Paytm) लिंक जाता है। ग्राहक घर बैठे 1 क्लिक में पैसे भेज देता है, जिससे आपको तगादा करने की शर्मिंदगी नहीं होती और वसूली 3 गुना तेज़ होती है।"
    }
  ];

  return (
    <section id="faqs" className="py-14 sm:py-20 bg-neutral-950/60 border-t border-white/5">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            दुकानदारों के सामान्य प्रश्न
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-black text-white tracking-tight">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-neutral-900/70 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-bold text-white hover:text-emerald-400 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="size-4 text-emerald-400 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`size-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-2 ${
                      isOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-white/5 p-4 sm:p-5 text-xs sm:text-sm text-neutral-300 leading-relaxed bg-neutral-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperFAQ;
