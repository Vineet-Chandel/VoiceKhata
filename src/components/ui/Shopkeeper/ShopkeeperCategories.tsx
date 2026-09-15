// src/components/ui/Shopkeeper/ShopkeeperCategories.tsx
"use client"

import React from "react";
import { motion } from "framer-motion";
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
      icon: <Wrench className="size-5 text-blue-400" />,
      example: '"Verma plumber ₹4,500 ka samaan udhar"',
      badge: "Contractors"
    },
    {
      title: "Pharmacies & Chemists",
      desc: "Track patient monthly prescriptions, chronic medication credits, and distributor balances.",
      icon: <Pill className="size-5 text-blue-400" />,
      example: '"Anil ji dawaiyan ₹320 UPI se diye"',
      badge: "Healthcare"
    },
    {
      title: "Mobile & Electronics",
      desc: "Manage repair tokens, screen replacement advances, and accessory credits in real-time.",
      icon: <Smartphone className="size-5 text-blue-400" />,
      example: '"Sonu mobile repair advance ₹1,200 received"',
      badge: "Repairs"
    },
    {
      title: "Clothing & Garments",
      desc: "Record festive advances, tailoring adjustments, and customer balances with one voice command.",
      icon: <Shirt className="size-5 text-blue-400" />,
      example: '"Kapil suit final payment ₹2,500 cash"',
      badge: "Apparel"
    },
    {
      title: "Dairy & Sweet Shops",
      desc: "Automate daily milk delivery tallies, morning bread accounts, and catering orders.",
      icon: <Milk className="size-5 text-blue-400" />,
      example: '"Mishra ji monthly doodh bill ₹2,100 received"',
      badge: "Dairy"
    }
  ];

  return (
    <section id="businesses" className="py-20 sm:py-28 bg-[#0B0F19] border-b border-[#1E2D4A]/80 font-sans relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0.5, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400 bg-blue-600/15 border border-blue-500/30 px-3.5 py-1.5 rounded-full">
            WHO IT'S FOR
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">
            Tailored for Every Indian Retail Counter
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300">
            Whether you run a local kirana store or a multi-counter wholesale shop, VoiceKhata fits your workflow seamlessly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0.5, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              className="rounded-[24px] border border-[#1E2D4A] bg-[#0A0F1D] p-6 sm:p-7 hover:border-blue-500/50 hover:bg-[#0E1528] transition-all duration-300 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#060A12] border border-blue-500/30 text-blue-400 shadow-inner">
                  {cat.icon}
                </div>
                <span className="rounded-full bg-[#060A12] px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-blue-300 border border-blue-500/20">
                  {cat.badge}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#F8FAFC] mb-2">{cat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-5">{cat.desc}</p>

              <div className="rounded-xl border border-[#1E2D4A] bg-[#060A12] p-3 text-[11px] text-slate-300 font-mono">
                <span className="text-blue-400 font-semibold block mb-0.5">🎙️ Spoken:</span> 
                {cat.example}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperCategories;
