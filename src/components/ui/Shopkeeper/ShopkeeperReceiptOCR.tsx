// src/components/ui/Shopkeeper/ShopkeeperReceiptOCR.tsx
"use client"

import React, { useState } from "react";
import { 
  motion, 
  AnimatePresence,
  useMotionValue,
  useTransform
} from "framer-motion";
import { 
  Camera, 
  Receipt, 
  Scan, 
  Check, 
  AlertTriangle,
  ArrowRight, 
  FileText,
  Sparkles,
  MoveVertical
} from "lucide-react";
import receiptScannerImg from "@/assets/receipt_optical_scanner.jpg";

export function ShopkeeperReceiptOCR() {
  const [isScanning, setIsScanning] = useState(false);
  const [showConfidenceWarning, setShowConfidenceWarning] = useState(false);
  const [scannedSaved, setScannedSaved] = useState(false);
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);

  const extractedItems = [
    { name: "Atta 25kg Bag (x2)", qty: "2 Bags", price: 1800, confidence: 99.6 },
    { name: "Refined Oil 15L Tin", qty: "1 Tin", price: 1950, confidence: 98.9 },
    { name: "Sugar 50kg Bag", qty: "1 Bag", price: 2100, confidence: 99.4 },
  ];

  const simulateScan = () => {
    setIsScanning(true);
    setScannedSaved(false);
    setTimeout(() => {
      setIsScanning(false);
      setShowConfidenceWarning(false);
    }, 1200);
  };

  return (
    <section id="receipt-ai" className="py-16 sm:py-20 bg-[#07090E] border-b border-[#1E2638] font-sans relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Copy & Value Proposition */}
          <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5C6BC0]/30 bg-[#1E2337] px-3.5 py-1 text-xs font-semibold text-[#818CF8]">
              <Camera className="size-3.5 text-[#818CF8]" />
              <span>Smart Optical Bill & Receipt Scanner</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F1F5F9] tracking-tight leading-tight">
              Snap Any Paper Bill. <br />
              <span className="text-[#818CF8]">Verified Before Saving.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-xl mx-auto lg:mx-0">
              No need to manually type long supplier invoices, wholesale slips, and handwritten bills. VoiceKhata extracts the vendor name, date, items, and total amount — showing you an instant verification card with interactive laser inspection so you verify before anything is saved.
            </p>

            <div className="space-y-2.5 pt-1 text-left max-w-md mx-auto lg:mx-0">
              <div className="flex items-start gap-2.5 text-xs text-[#94A3B8]">
                <Check className="size-4 text-[#34D399] shrink-0 mt-0.5" />
                <span>Extracts vendor name, item list, date, and grand total.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#94A3B8]">
                <Check className="size-4 text-[#34D399] shrink-0 mt-0.5" />
                <span>Review-before-save workflow ensures zero accounting errors.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#94A3B8]">
                <Check className="size-4 text-[#34D399] shrink-0 mt-0.5" />
                <span>Works on handwritten counter slips, wholesale invoices, and thermal receipts.</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={simulateScan}
                className="inline-flex items-center gap-2 rounded-[8px] bg-[#5C6BC0] hover:bg-[#4F5B93] active:scale-[0.98] px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all cursor-pointer"
              >
                <Scan className="size-4" />
                <span>{isScanning ? "Scanning Optical Bill..." : "Simulate Optical Scan"}</span>
              </motion.button>
              
              <div className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                <MoveVertical size={13} className="text-[#818CF8]" />
                <span>Try dragging the green laser bar on the receipt!</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive Scanner Visual Simulation with Dynamic Image */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 items-stretch">
            
            {/* Image Box with Interactive Draggable Laser Sweep */}
            <div className="relative w-full md:w-1/2 rounded-[14px] border border-[#1E2638] bg-[#0F131C] overflow-hidden p-2 flex flex-col justify-between shadow-2xl">
              <div className="relative rounded-[10px] overflow-hidden group">
                <img 
                  src={receiptScannerImg} 
                  alt="Real Indian Retail Paper Bill OCR" 
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F131C]/80 via-transparent to-transparent pointer-events-none" />

                {/* Interactive / Animated Laser Line */}
                {isScanning ? (
                  <motion.div
                    initial={{ top: "0%" }}
                    animate={{ top: "95%" }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#34D399] to-transparent shadow-[0_0_15px_#34D399] pointer-events-none"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#064E3B] text-[#34D399] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#10B981]">
                      SCANNING OCR
                    </div>
                  </motion.div>
                ) : (
                  /* Draggable Laser Gesture Bar */
                  <motion.div
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 240 }}
                    dragElastic={0.1}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#34D399] to-transparent shadow-[0_0_14px_#34D399] cursor-grab active:cursor-grabbing z-20"
                    style={{ top: "45%" }}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F131C] text-[#34D399] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#10B981] flex items-center gap-1 shadow-lg cursor-grab">
                      <MoveVertical size={10} />
                      <span>Drag to Inspect</span>
                    </div>
                  </motion.div>
                )}

                {/* Bounding box highlight overlays */}
                <div className="absolute top-1/4 left-1/4 right-1/4 h-8 border border-[#34D399]/60 rounded-xs bg-[#10B981]/10 pointer-events-none animate-pulse flex items-center justify-end pr-1">
                  <span className="text-[8px] font-mono text-[#34D399] bg-black/60 px-1 rounded-xs">99.4%</span>
                </div>
              </div>

              <div className="pt-2 px-1 flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span className="flex items-center gap-1 font-semibold text-[#F1F5F9]">
                  <Receipt size={13} className="text-[#818CF8]" />
                  <span>Raj Store • Wholesale</span>
                </span>
                <span className="text-[#34D399] font-mono text-[10px]">Optical Accuracy 99.4%</span>
              </div>
            </div>

            {/* Extracted Details Verification Card */}
            <div className="w-full md:w-1/2 rounded-[14px] border border-[#1E2638] bg-[#0F131C] p-5 shadow-2xl flex flex-col justify-between">
              <div>
                {/* Receipt Header */}
                <div className="flex items-center justify-between border-b border-[#1E2638] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-[8px] bg-[#1E2337] text-[#818CF8]">
                      <Receipt className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#F1F5F9]">Raj Store & Traders</h4>
                      <p className="text-[10px] text-[#64748B]">GSTIN: 27AABCT9876C1ZX</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#064E3B]/30 border border-[#10B981]/30 px-2 py-0.5 text-[10px] font-semibold text-[#34D399]">
                    {isScanning ? "Analyzing..." : "High Confidence"}
                  </span>
                </div>

                {/* Extracted Details Box */}
                <div className="rounded-[8px] border border-[#1E2638] bg-[#07090E] p-3.5 space-y-2.5">
                  <p className="text-[11px] font-semibold text-[#F1F5F9] border-b border-[#1E2638] pb-1.5 flex items-center justify-between">
                    <span>Detected Line Items:</span>
                    <span className="text-[10px] text-[#818CF8]">3 items</span>
                  </p>

                  <div className="space-y-2">
                    {extractedItems.map((item, idx) => (
                      <motion.div
                        key={idx}
                        onMouseEnter={() => setHoveredItemIndex(idx)}
                        onMouseLeave={() => setHoveredItemIndex(null)}
                        whileHover={{ x: 2 }}
                        className={`flex items-center justify-between text-xs p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                          hoveredItemIndex === idx ? "bg-[#1E2337] border border-[#5C6BC0]/40" : "bg-transparent"
                        }`}
                      >
                        <div>
                          <p className="text-[#F1F5F9] font-medium">{item.name}</p>
                          <span className="text-[10px] text-[#64748B]">{item.qty} • {item.confidence}% Match</span>
                        </div>
                        <span className="text-[#34D399] font-semibold tabular-nums">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-[#1E2638] pt-2 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#64748B]">Grand Total</p>
                      <p className="text-base font-bold text-[#34D399]">₹5,850</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#64748B]">Date & Status</p>
                      <p className="text-xs font-medium text-[#F1F5F9]">Today • Paid (नकद)</p>
                    </div>
                  </div>
                </div>

                {/* Confidence Warning Toggle */}
                {showConfidenceWarning && (
                  <div className="mt-3 flex items-center gap-2 p-2.5 rounded-[8px] bg-[#78350F]/30 border border-[#F59E0B]/30 text-xs text-[#FBBF24]">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>Please check the total. The receipt image was slightly tilted.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-[#1E2638]">
                <button
                  onClick={() => setShowConfidenceWarning(!showConfidenceWarning)}
                  className="h-8 px-2.5 rounded-[6px] border border-[#1E2638] bg-[#07090E] text-[11px] font-medium text-[#94A3B8] hover:text-[#F1F5F9] cursor-pointer"
                >
                  {showConfidenceWarning ? "Hide Warning" : "Test Warning"}
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setScannedSaved(true)}
                  className="flex items-center gap-1.5 h-8 px-3.5 rounded-[6px] bg-[#5C6BC0] hover:bg-[#4F5B93] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Check size={14} />
                  <span>{scannedSaved ? "Saved to Ledger!" : "Save to Khata"}</span>
                </motion.button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default ShopkeeperReceiptOCR;
