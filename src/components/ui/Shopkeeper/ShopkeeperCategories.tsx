import React from "react";
import { 
  ShoppingCart, 
  Wrench, 
  Pill, 
  Smartphone, 
  Shirt, 
  Milk,
  ArrowRight
} from "lucide-react";

export function ShopkeeperCategories() {
  const categories = [
    {
      title: "किराना & जनरल स्टोर (Kirana)",
      desc: "दाल, चावल, तेल, मसाले और रोज़मर्रा के सामान का उधार-जमा हिसाब बिना पेन छुए लिखें।",
      icon: <ShoppingCart className="size-6 text-emerald-400" />,
      example: '"शर्मा जी को 5 किलो आटा उधार दिया"',
      badge: "सर्वाधिक लोकप्रिय"
    },
    {
      title: "हार्डवेयर & सेनेटरी (Hardware)",
      desc: "पाइप, सीमेंट, पेंट और टूल्स का बड़ा हिसाब। ठेकेदारों और मिस्त्रियों का अलग खाता।",
      icon: <Wrench className="size-6 text-cyan-400" />,
      example: '"वर्मा प्लंबर ₹4,500 का सामान ले गए"',
      badge: "बड़ा उधार"
    },
    {
      title: "मेडिकल & केमिस्ट (Chemist)",
      desc: "मरीजों और नियमित ग्राहकों की दवाओं का बिल और पेंडिंग पेमेंट ट्रैक करें।",
      icon: <Pill className="size-6 text-rose-400" />,
      example: '"अनिल जी शुगर की दवा ₹320 उधार"',
      badge: "दवा खाता"
    },
    {
      title: "मोबाइल & इलेक्ट्रॉनिक्स (Mobile)",
      desc: "रिचार्ज, एक्सेसरीज़ और मोबाइल रिपेयरिंग के ग्राहकों का टोकन और बकाया बैलेंस।",
      icon: <Smartphone className="size-6 text-amber-400" />,
      example: '"सोनू मोबाइल डिस्प्ले रिपेयर ₹1,200 जमा"',
      badge: "रिपेयरिंग"
    },
    {
      title: "कपड़ा & रेडीमेड गारमेंट्स (Clothing)",
      desc: "सूट, साड़ी, शादी की खरीदारी और टेलरिंग का एडवांस व बकाया हिसाब।",
      icon: <Shirt className="size-6 text-purple-400" />,
      example: '"दुल्हन लहंगा एडवांस ₹5,000 जमा"',
      badge: "फेस्टिव सीजन"
    },
    {
      title: "डेयरी, बेकरी & स्वीट्स (Dairy)",
      desc: "मासिक दूध का बिल, पनीर और नाश्ते का दैनिक हिसाब सीधे ग्राहक के नाम पर।",
      icon: <Milk className="size-6 text-blue-400" />,
      example: '"मिश्रा जी का 30 दिन का दूध ₹2,100 जमा"',
      badge: "मासिक बिल"
    }
  ];

  return (
    <section id="dukandar" className="py-14 sm:py-20 bg-neutral-950/60 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            हर दुकान के लिए उपयुक्त
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-black text-white tracking-tight">
            आपकी दुकान चाहे जो भी हो, VoiceKhata है सबसे मुफ़ीद
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            भारत के 100+ शहरों में विभिन्न व्यापारी अपने दैनिक हिसाब के लिए VoiceKhata पर भरोसा करते हैं।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="relative rounded-3xl border border-white/10 bg-neutral-900/60 p-6 sm:p-7 hover:border-emerald-500/40 hover:bg-neutral-900/90 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-neutral-300 border border-white/10">
                  {cat.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{cat.title}</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">{cat.desc}</p>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-2.5 text-[11px] text-emerald-300 font-mono">
                <span className="text-emerald-400 font-bold">🎙️ उदाहरण:</span> {cat.example}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperCategories;
