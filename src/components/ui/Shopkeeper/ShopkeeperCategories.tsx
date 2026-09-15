// src/components/ui/Shopkeeper/ShopkeeperCategories.tsx
import React from "react";
import { 
  ShoppingCart, 
  Wrench, 
  Pill, 
  Smartphone, 
  Shirt, 
  Milk 
} from "lucide-react";

export function ShopkeeperCategories() {
  const categories = [
    {
      title: "Kirana & Grocery Stores",
      desc: "Record daily essentials, provisions, and loose groceries on credit without picking up a pen.",
      icon: <ShoppingCart className="size-5 text-blue-400" />,
      example: '"Sharma ji ne 5kg atta liya ₹210 udhar"',
      badge: "Kirana"
    },
    {
      title: "Hardware & Electricals",
      desc: "Manage contractor credits, pipes, sanitary supplies, and wholesale dues effortlessly.",
      icon: <Wrench className="size-5 text-[3B82F6]" />,
      example: '"Verma plumber ₹4,500 ka samaan udhar"',
      badge: "Contractors"
    },
    {
      title: "Pharmacies & Chemists",
      desc: "Track patient monthly prescriptions, chronic medication credits, and distributor balances.",
      icon: <Pill className="size-5 text-[3B82F6]" />,
      example: '"Anil ji dawaiyan ₹320 UPI se diye"',
      badge: "Healthcare"
    },
    {
      title: "Mobile & Electronics",
      desc: "Manage repair tokens, screen replacement advances, and accessory credits in real-time.",
      icon: <Smartphone className="size-5 text-[3B82F6]" />,
      example: '"Sonu mobile repair advance ₹1,200 received"',
      badge: "Repairs"
    },
    {
      title: "Clothing & Garments",
      desc: "Record festive advances, tailoring adjustments, and customer balances with one voice command.",
      icon: <Shirt className="size-5 text-[3B82F6]" />,
      example: '"Kapil suit final payment ₹2,500 cash"',
      badge: "Apparel"
    },
    {
      title: "Dairy & Sweet Shops",
      desc: "Automate daily milk delivery tallies, morning bread accounts, and catering orders.",
      icon: <Milk className="size-5 text-[3B82F6]" />,
      example: '"Mishra ji monthly doodh bill ₹2,100 received"',
      badge: "Dairy"
    }
  ];

  return (
    <section id="businesses" className="py-16 sm:py-20 bg-[#0B0F19] border-b border-slate-700/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded-full">
            Who It's For
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
            Tailored for Every Indian Retail Counter
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
            Whether you run a local kirana store or a multi-counter wholesale shop, VoiceKhata fits your workflow seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="rounded-[14px] border border-slate-700/40 bg-[#131B2E] p-6 hover:border-blue-500/40 hover:bg-[#0E1322] transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-black/40"
            >
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex size-10 items-center justify-center rounded-[10px] bg-[#0B0F19] border border-slate-800 text-blue-400">
                  {cat.icon}
                </div>
                <span className="rounded-full bg-[#0B0F19] px-2.5 py-0.5 text-[11px] font-semibold text-slate-300 border border-slate-800">
                  {cat.badge}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#F8FAFC] mb-1.5">{cat.title}</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">{cat.desc}</p>

              <div className="rounded-[8px] border border-slate-800 bg-[#0B0F19] p-2.5 text-[11px] text-[#F8FAFC]">
                <span className="text-blue-400 font-semibold">🎙️ Spoken:</span> {cat.example}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperCategories;
