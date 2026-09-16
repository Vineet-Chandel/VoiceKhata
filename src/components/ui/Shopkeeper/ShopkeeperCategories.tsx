// src/components/ui/Shopkeeper/ShopkeeperCategories.tsx
import React from "react";
import { 
  ShoppingCart, 
  Wrench, 
  Pill, 
  Smartphone, 
  Shirt, 
  Milk,
  Mic
} from "lucide-react";

export function ShopkeeperCategories() {
  const categories = [
    {
      title: "Kirana & Grocery Stores",
      desc: "Record daily essentials, provisions, and loose groceries on credit without picking up a pen.",
      icon: <ShoppingCart className="size-5 text-[#0B0F15] dark:text-[#D2F832]" />,
      example: '"Sharma ji ne 5kg atta liya ₹210 udhar"',
      badge: "Kirana"
    },
    {
      title: "Hardware & Electricals",
      desc: "Manage contractor credits, pipes, sanitary supplies, and wholesale dues effortlessly.",
      icon: <Wrench className="size-5 text-[#0B0F15] dark:text-[#D2F832]" />,
      example: '"Verma plumber ₹4,500 ka samaan udhar"',
      badge: "Contractors"
    },
    {
      title: "Pharmacies & Chemists",
      desc: "Track patient monthly prescriptions, chronic medication credits, and distributor balances.",
      icon: <Pill className="size-5 text-[#0B0F15] dark:text-[#D2F832]" />,
      example: '"Anil ji dawaiyan ₹320 UPI se diye"',
      badge: "Healthcare"
    },
    {
      title: "Mobile & Electronics",
      desc: "Manage repair tokens, screen replacement advances, and accessory credits in real-time.",
      icon: <Smartphone className="size-5 text-[#0B0F15] dark:text-[#D2F832]" />,
      example: '"Sonu mobile repair advance ₹1,200 received"',
      badge: "Repairs"
    },
    {
      title: "Clothing & Garments",
      desc: "Record festive advances, tailoring adjustments, and customer balances with one voice command.",
      icon: <Shirt className="size-5 text-[#0B0F15] dark:text-[#D2F832]" />,
      example: '"Kapil suit final payment ₹2,500 cash"',
      badge: "Apparel"
    },
    {
      title: "Dairy & Sweet Shops",
      desc: "Automate daily milk delivery tallies, morning bread accounts, and catering orders.",
      icon: <Milk className="size-5 text-[#0B0F15] dark:text-[#D2F832]" />,
      example: '"Mishra ji monthly doodh bill ₹2,100 received"',
      badge: "Dairy"
    }
  ];

  return (
    <section id="businesses" className="py-16 sm:py-24 bg-white dark:bg-[#070A11] transition-colors border-t border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Who It's For
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B0F15] dark:text-white tracking-tight leading-[1.1]">
            Tailored for Every Indian Retail Counter
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Whether you run a local kirana store or a multi-counter wholesale shop, VoiceKhata fits your workflow seamlessly.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="group rounded-[24px] border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0E1320] p-6 sm:p-7 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-[#111827] transition-all shadow-xs hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-white dark:bg-[#0B0F15] border border-slate-200 dark:border-slate-800 shadow-2xs group-hover:scale-105 transition-transform">
                    {cat.icon}
                  </div>
                  <span className="rounded-full bg-white dark:bg-[#0B0F15] px-3 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-2xs">
                    {cat.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0B0F15] dark:text-white mb-2">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                  {cat.desc}
                </p>
              </div>

              {/* Spoken voice pill */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070A11] p-3 text-[11px] text-slate-800 dark:text-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-[#0B0F15] dark:text-[#D2F832] mb-0.5">
                  <Mic className="size-3 text-[#D2F832]" />
                  <span>Spoken Voice Command:</span>
                </div>
                <p className="italic text-slate-600 dark:text-slate-300 font-medium">
                  {cat.example}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperCategories;
