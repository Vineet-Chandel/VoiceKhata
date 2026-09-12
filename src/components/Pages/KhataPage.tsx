// src/components/Pages/KhataPage.tsx
"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, Search, Filter, Plus, ArrowUpRight, ArrowDownRight, 
  ChevronRight, ArrowLeft, Phone, Calendar, MessageSquare, 
  Check, Mic, Clock, FileText, AlertTriangle, ShieldCheck,
  MoveHorizontal, Sparkles
} from "lucide-react"
import { useTransactions, type Transaction } from "@/components/hooks/use-transactions"
import { useAuth } from "@/components/hooks/use-auth"
import { VoiceActionBanner } from "@/components/ui/Dashboard_UI/voice-action-banner"
import type { TransactionInput } from "@/types/finance"

interface CustomerLedgerSummary {
  id: string
  name: string
  phone: string
  type: "customer" | "supplier"
  balance: number // positive = you will receive, negative = you will pay
  lastActivity: string
  lastPaymentDate?: string
  overdue: boolean
  transactions: Transaction[]
}

export default function KhataPage() {
  const { transactions, loading, addTransaction, deleteTransaction } = useTransactions()
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "customer" | "supplier">("all")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  
  // Add customer modal state
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newCustName, setNewCustName] = useState("")
  const [newCustPhone, setNewCustPhone] = useState("")
  const [newCustType, setNewCustType] = useState<"customer" | "supplier">("customer")
  const [newCustBalance, setNewCustBalance] = useState("")
  const [newCustDirection, setNewCustDirection] = useState<"receive" | "pay">("receive")

  // Quick manual entry modal inside customer detail
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [entryAmount, setEntryAmount] = useState("")
  const [entryType, setEntryType] = useState<"Credit" | "Debit">("Credit")
  const [entryMethod, setEntryMethod] = useState("UPI")
  const [entryDescription, setEntryDescription] = useState("")

  // Voice banner toggle inside customer detail
  const [showVoiceInCustomer, setShowVoiceInCustomer] = useState(false)
  const [swipeToast, setSwipeToast] = useState<string | null>(null)

  // ── Compute Customer Summaries from Live Transactions & Defaults ────────────
  const customerList: CustomerLedgerSummary[] = useMemo(() => {
    const customerMap = new Map<string, CustomerLedgerSummary>()

    // Pre-populate with realistic starter shopkeeper counter-parties if empty, or derive from transactions
    const defaultParties = [
      { name: "Ramesh Kumar", phone: "98765 43210", type: "customer" as const, initialBal: 2450 },
      { name: "Gupta Traders", phone: "98123 76540", type: "supplier" as const, initialBal: -6850 },
      { name: "Suresh Sharma", phone: "98980 12345", type: "customer" as const, initialBal: 1200 },
      { name: "Verma Kirana Supplier", phone: "97112 34567", type: "supplier" as const, initialBal: -3200 },
      { name: "Pooja Patel", phone: "99001 22334", type: "customer" as const, initialBal: 850 },
    ]

    defaultParties.forEach((p) => {
      customerMap.set(p.name.toLowerCase(), {
        id: p.name.toLowerCase().replace(/\s+/g, "-"),
        name: p.name,
        phone: p.phone,
        type: p.type,
        balance: p.initialBal,
        lastActivity: "Today",
        overdue: p.initialBal > 2000,
        transactions: [],
      })
    })

    // Process all live transactions
    transactions.forEach((tx) => {
      const partyName = tx.transaction.trim() || "Cash Customer"
      const key = partyName.toLowerCase()

      let entry = customerMap.get(key)
      if (!entry) {
        entry = {
          id: key.replace(/\s+/g, "-"),
          name: partyName,
          phone: "98" + Math.floor(10000000 + Math.random() * 90000000),
          type: tx.type === "Debit" && tx.amount > 5000 ? "supplier" : "customer",
          balance: 0,
          lastActivity: tx.date || "Today",
          overdue: false,
          transactions: [],
        }
        customerMap.set(key, entry)
      }

      entry.transactions.push(tx)
      // If Money Received (Credit), customer gave money -> balance owed decreases
      // If Money Given (Debit), shopkeeper gave credit -> balance owed increases
      if (tx.type === "Credit") {
        entry.balance -= Number(tx.amount || 0)
      } else {
        entry.balance += Number(tx.amount || 0)
      }
      entry.lastActivity = tx.date || "Today"
      entry.lastPaymentDate = tx.date
    })

    return Array.from(customerMap.values())
  }, [transactions])

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customerList.filter((c) => {
      if (filterType !== "all" && c.type !== filterType) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return c.name.toLowerCase().includes(q) || c.phone.includes(q)
      }
      return true
    })
  }, [customerList, filterType, searchQuery])

  // Aggregate stats
  const { totalToReceive, totalToPay, overdueAmount } = useMemo(() => {
    let toReceive = 0
    let toPay = 0
    let overdue = 0

    customerList.forEach((c) => {
      if (c.balance > 0) {
        toReceive += c.balance
        if (c.overdue) overdue += c.balance
      } else if (c.balance < 0) {
        toPay += Math.abs(c.balance)
      }
    })

    return { totalToReceive: toReceive, totalToPay: toPay, overdueAmount: overdue }
  }, [customerList])

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null
    return customerList.find((c) => c.id === selectedCustomerId) || null
  }, [customerList, selectedCustomerId])

  // Handle adding a new customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustName.trim()) return

    const initialAmount = Number(newCustBalance) || 0
    if (initialAmount > 0) {
      addTransaction({
        transaction: newCustName.trim(),
        amount: initialAmount,
        type: newCustDirection === "receive" ? "Debit" : "Credit",
        method: "Credit",
        category: newCustDirection === "receive" ? "Shopping" : "Income",
        date: new Date().toISOString().slice(0, 10),
        status: "Completed",
      })
    }

    setShowAddCustomer(false)
    setNewCustName("")
    setNewCustPhone("")
    setNewCustBalance("")
  }

  // Handle adding an entry inside customer detail
  const handleAddCustomerEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer || !entryAmount || Number(entryAmount) <= 0) return

    await addTransaction({
      transaction: selectedCustomer.name,
      amount: Number(entryAmount),
      type: entryType,
      method: entryMethod,
      category: entryType === "Credit" ? "Income" : "Shopping",
      date: new Date().toISOString().slice(0, 10),
      status: "Completed",
    })

    setShowAddEntry(false)
    setEntryAmount("")
    setEntryDescription("")
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 py-6 px-4 lg:px-8 bg-[#0B0F19] text-[#F8FAFC]">
      {/* ── DETAIL VIEW ────────────────────────────────────────────────────────── */}
      {selectedCustomer ? (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Back button & Customer Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedCustomerId(null)}
              className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] bg-[#131B2E] border border-slate-700/40 px-3.5 py-2 rounded-[8px] transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Khata</span>
            </button>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/91${selectedCustomer.phone.replace(/\s+/g, "")}?text=Namaste%20${encodeURIComponent(selectedCustomer.name)},%20aapka%20VoiceKhata%20par%20balance%20Rs.%20${Math.abs(selectedCustomer.balance)}%20hai.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#10B981] bg-[#064E3B]/30 border border-[#10B981]/30 px-3 py-2 rounded-[8px] hover:bg-[#064E3B]/50 transition-all"
              >
                <MessageSquare size={14} />
                <span>WhatsApp Reminder</span>
              </a>
            </div>
          </div>

          {/* Customer Balance Banner */}
          <div className="rounded-[12px] border border-slate-700/40 bg-[#131B2E] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-[#F8FAFC]">{selectedCustomer.name}</h2>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    selectedCustomer.type === "customer" ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "bg-[#0E1322] text-[#94A3B8]"
                  }`}>
                    {selectedCustomer.type}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1 flex items-center gap-1.5">
                  <Phone size={12} />
                  <span>+91 {selectedCustomer.phone}</span>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#64748B]">
                  {selectedCustomer.balance >= 0 ? "You will receive" : "You will pay"}
                </p>
                <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                  {selectedCustomer.balance >= 0 ? (
                    <ArrowDownRight size={26} className="text-[#10B981]" />
                  ) : (
                    <ArrowUpRight size={26} className="text-[#EF4444]" />
                  )}
                  <p className={`text-3xl font-extrabold tabular-nums ${
                    selectedCustomer.balance >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
                  }`}>
                    ₹{Math.abs(selectedCustomer.balance).toLocaleString("en-IN")}
                  </p>
                </div>
                {selectedCustomer.overdue && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F59E0B] bg-[#451A03]/30 border border-[#F59E0B]/30 px-2 py-0.5 rounded-full mt-1">
                    <AlertTriangle size={11} /> Overdue
                  </span>
                )}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-5 mt-5 border-t border-slate-700/40">
              <button
                onClick={() => setShowVoiceInCustomer(!showVoiceInCustomer)}
                className="flex items-center gap-2 h-9 px-4 rounded-[8px] bg-[#2563EB] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Mic size={14} />
                <span>Record by voice</span>
              </button>
              <button
                onClick={() => setShowAddEntry(true)}
                className="flex items-center gap-1.5 h-9 px-4 rounded-[8px] border border-slate-700/40 bg-[#0E1322] hover:bg-[#131B2E] text-xs font-semibold text-[#F8FAFC] shadow-xs transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Entry Manually</span>
              </button>
            </div>

            {/* In-ledger Voice Action Banner */}
            {showVoiceInCustomer && (
              <div className="mt-4 pt-4 border-t border-slate-700/40">
                <VoiceActionBanner
                  onAddTransaction={addTransaction}
                  onDeleteTransaction={deleteTransaction}
                />
              </div>
            )}
          </div>

          {/* Chronological Ledger */}
          <div className="rounded-[12px] border border-slate-700/40 bg-[#131B2E] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#F8FAFC]">Chronological Ledger</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Complete history of money received and credit given
                </p>
              </div>
              <span className="text-xs font-medium text-[#94A3B8]">
                {selectedCustomer.transactions.length} entries
              </span>
            </div>

            {selectedCustomer.transactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7C889A] space-y-3">
                <FileText size={32} className="mx-auto text-[#7C889A]/40" />
                <p className="text-sm font-medium text-[#526078]">No transactions recorded yet</p>
                <p className="max-w-xs mx-auto text-xs">
                  Record your first transaction by voice or click "Add Entry Manually" to update this customer's khata.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E1E6ED]">
                {selectedCustomer.transactions.map((tx) => (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center size-9 rounded-[8px] ${
                        tx.type === "Credit" ? "bg-[#E8F6F1] text-[#16856A]" : "bg-[#FDECEE] text-[#C2414B]"
                      }`}>
                        {tx.type === "Credit" ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#172033]">
                          {tx.type === "Credit" ? "Received payment" : "Gave credit / expense"}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-[#7C889A] mt-0.5">
                          <span>{tx.date || "Today"}</span>
                          <span>•</span>
                          <span>{tx.method || "UPI"}</span>
                          <span>•</span>
                          <span className="text-[#16856A] font-medium">Completed</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm font-bold tabular-nums ${
                        tx.type === "Credit" ? "text-[#16856A]" : "text-[#C2414B]"
                      }`}>
                        {tx.type === "Credit" ? "+" : "-"}₹{Number(tx.amount || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-[#7C889A]">
                        {tx.type === "Credit" ? "Money Received" : "Money Given"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── PRIMARY KHATA LIST VIEW ─────────────────────────────────────────── */
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">Khata</h1>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
                Customers, suppliers, and balances in one place.
              </p>
            </div>

            <button
              onClick={() => setShowAddCustomer(true)}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-[8px] bg-[#2563EB] hover:bg-[#4F5B93] active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>Add Customer / Supplier</span>
            </button>
          </div>

          {/* Top Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-[10px] border border-slate-700/40 bg-[#131B2E] p-5 shadow-xs">
              <p className="text-xs font-medium text-[#94A3B8]">Total to receive</p>
              <div className="flex items-center gap-1.5 mt-1">
                <ArrowDownRight size={22} className="text-[#34D399]" />
                <p className="text-2xl font-bold text-[#34D399] tabular-nums">
                  ₹{totalToReceive.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1.5">
                From {customerList.filter((c) => c.balance > 0).length} customers
              </p>
            </div>

            <div className="rounded-[10px] border border-slate-700/40 bg-[#131B2E] p-5 shadow-xs">
              <p className="text-xs font-medium text-[#94A3B8]">Total to pay</p>
              <div className="flex items-center gap-1.5 mt-1">
                <ArrowUpRight size={22} className="text-[#F87171]" />
                <p className="text-2xl font-bold text-[#F87171] tabular-nums">
                  ₹{totalToPay.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1.5">
                To suppliers & wholesalers
              </p>
            </div>

            <div className="rounded-[10px] border border-slate-700/40 bg-[#131B2E] p-5 shadow-xs">
              <p className="text-xs font-medium text-[#94A3B8]">Overdue</p>
              <div className="flex items-center gap-1.5 mt-1">
                <AlertTriangle size={20} className="text-[#FBBF24]" />
                <p className="text-2xl font-bold text-[#FBBF24] tabular-nums">
                  ₹{overdueAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1.5">
                Requires payment follow-up
              </p>
            </div>
          </div>

          {/* Controls: Search + Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#131B2E] p-3 rounded-[10px] border border-slate-700/40">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer by name or phone..."
                className="w-full h-9 pl-9 pr-3 text-xs rounded-[8px] border border-slate-700/40 bg-[#0B0F19] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                  filterType === "all"
                    ? "bg-[#2563EB] text-white"
                    : "text-[#94A3B8] hover:bg-[#0E1322]"
                }`}
              >
                All ({customerList.length})
              </button>
              <button
                onClick={() => setFilterType("customer")}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                  filterType === "customer"
                    ? "bg-[#2563EB] text-white"
                    : "text-[#94A3B8] hover:bg-[#0E1322]"
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => setFilterType("supplier")}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                  filterType === "supplier"
                    ? "bg-[#2563EB] text-white"
                    : "text-[#94A3B8] hover:bg-[#0E1322]"
                }`}
              >
                Suppliers
              </button>
            </div>
          </div>

          {/* Gesture Guidance Banner */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-[8px] bg-[#0E1322] border border-blue-500/30 text-xs text-[#60A5FA]">
            <div className="flex items-center gap-2">
              <MoveHorizontal size={14} className="animate-pulse text-[#60A5FA]" />
              <span>
                <strong>Interactive Gestures:</strong> Swipe customer row <strong>Right 👉</strong> to quickly record payment, or <strong>Left 👈</strong> for instant WhatsApp reminder.
              </span>
            </div>
            <span className="text-[10px] text-[#94A3B8] hidden sm:inline">Drag with mouse or touchscreen</span>
          </div>

          {/* Swipe Toast Feedback */}
          <AnimatePresence>
            {swipeToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-[8px] bg-[#064E3B] border border-[#10B981] text-xs font-semibold text-[#34D399] flex items-center justify-between shadow-lg"
              >
                <span>{swipeToast}</span>
                <button onClick={() => setSwipeToast(null)} className="text-[#34D399] hover:text-white cursor-pointer">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Customer Rows List with Tactile Swipe Gestures */}
          <div className="rounded-[10px] border border-slate-700/40 bg-[#131B2E] divide-y divide-slate-700/40 overflow-hidden shadow-xs">
            {filteredCustomers.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#64748B] space-y-2">
                <Users size={32} className="mx-auto text-[#64748B]/40" />
                <p className="text-sm font-semibold text-[#F8FAFC]">No customers found</p>
                <p>Try searching with another name or add a new customer.</p>
              </div>
            ) : (
              filteredCustomers.map((cust) => (
                <div key={cust.id} className="relative overflow-hidden group">
                  {/* Background Action Trays (revealed upon horizontal drag) */}
                  <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none select-none z-0">
                    {/* Left Action (Swipe Right) */}
                    <div className="flex items-center gap-2 text-xs font-bold text-[#34D399] bg-[#064E3B] px-3 py-1.5 rounded-full border border-[#10B981]">
                      <Check size={14} />
                      <span>Record Payment (+)</span>
                    </div>

                    {/* Right Action (Swipe Left) */}
                    <div className="flex items-center gap-2 text-xs font-bold text-[#60A5FA] bg-[#0E1322] px-3 py-1.5 rounded-full border border-blue-500">
                      <span>WhatsApp Reminder</span>
                      <MessageSquare size={14} />
                    </div>
                  </div>

                  {/* Foreground Draggable Row */}
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.4}
                    whileTap={{ cursor: "grabbing" }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 80) {
                        setSelectedCustomerId(cust.id)
                        setShowAddEntry(true)
                        setEntryType("Credit")
                        setEntryAmount(String(Math.abs(cust.balance) || 500))
                        setSwipeToast(`Opened quick payment entry for ${cust.name}`)
                      } else if (info.offset.x < -80) {
                        const url = `https://wa.me/91${cust.phone.replace(/\s+/g, "")}?text=Namaste%20${encodeURIComponent(cust.name)},%20aapka%20VoiceKhata%20par%20balance%20Rs.%20${Math.abs(cust.balance)}%20hai.`
                        window.open(url, "_blank")
                        setSwipeToast(`Sent WhatsApp reminder to ${cust.name}`)
                      }
                    }}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className="relative z-10 p-4 bg-[#131B2E] hover:bg-[#0E1322] transition-colors flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex items-center justify-center size-10 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold text-sm shrink-0">
                        {cust.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#F8FAFC] truncate">{cust.name}</h3>
                          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                            cust.type === "customer" ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "bg-[#0E1322] text-[#94A3B8]"
                          }`}>
                            {cust.type}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {cust.phone} • Last activity: {cust.lastActivity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 font-bold text-sm tabular-nums">
                          {cust.balance >= 0 ? (
                            <>
                              <span className="text-[#34D399]">↑</span>
                              <span className="text-[#34D399]">₹{Math.abs(cust.balance).toLocaleString("en-IN")}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[#F87171]">↓</span>
                              <span className="text-[#F87171]">₹{Math.abs(cust.balance).toLocaleString("en-IN")}</span>
                            </>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          {cust.balance >= 0 ? "You will receive" : "You will pay"}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-[#64748B]" />
                    </div>
                  </motion.div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ── MODAL: ADD CUSTOMER ────────────────────────────────────────────────── */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#131B2E] rounded-[12px] border border-slate-700/40 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#F8FAFC]">Add Customer or Supplier</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-[#94A3B8] block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full h-9 px-3 text-xs rounded-[8px] border border-slate-700/40 bg-[#0B0F19] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#94A3B8] block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full h-9 px-3 text-xs rounded-[8px] border border-slate-700/40 bg-[#0B0F19] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#94A3B8] block mb-1">Party Type</label>
                  <select
                    value={newCustType}
                    onChange={(e) => setNewCustType(e.target.value as any)}
                    className="w-full h-9 px-2 text-xs rounded-[8px] border border-slate-700/40 bg-[#0B0F19] text-[#F8FAFC] focus:outline-none focus:border-blue-500"
                  >
                    <option value="customer" className="bg-[#131B2E] text-[#F8FAFC]">Customer</option>
                    <option value="supplier" className="bg-[#131B2E] text-[#F8FAFC]">Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#94A3B8] block mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    value={newCustBalance}
                    onChange={(e) => setNewCustBalance(e.target.value)}
                    placeholder="0"
                    className="w-full h-9 px-3 text-xs rounded-[8px] border border-slate-700/40 bg-[#0B0F19] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/40">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="h-9 px-4 rounded-[8px] border border-slate-700/40 text-xs font-medium text-[#94A3B8] hover:bg-[#0E1322] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-[8px] bg-[#2563EB] hover:bg-[#4F5B93] text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: MANUAL ENTRY FOR CUSTOMER ───────────────────────────────────── */}
      {showAddEntry && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#131B2E] rounded-[12px] border border-slate-700/40 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#F8FAFC]">
              Add Entry for {selectedCustomer.name}
            </h3>
            <form onSubmit={handleAddCustomerEntry} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-[#94A3B8] block mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntryType("Credit")}
                    className={`h-9 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      entryType === "Credit"
                        ? "bg-[#064E3B]/40 border-[#10B981] text-[#34D399]"
                        : "border-slate-700/40 bg-[#0B0F19] text-[#94A3B8] hover:bg-[#0E1322]"
                    }`}
                  >
                    <ArrowDownRight size={14} />
                    <span>Money Received</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType("Debit")}
                    className={`h-9 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      entryType === "Debit"
                        ? "bg-[#7F1D1D]/40 border-[#EF4444] text-[#F87171]"
                        : "border-slate-700/40 bg-[#0B0F19] text-[#94A3B8] hover:bg-[#0E1322]"
                    }`}
                  >
                    <ArrowUpRight size={14} />
                    <span>Gave Credit / Paid</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#94A3B8] block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  placeholder="e.g. 1200"
                  className="w-full h-9 px-3 text-xs rounded-[8px] border border-slate-700/40 bg-[#0B0F19] text-[#F8FAFC] placeholder-[#64748B] font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#94A3B8] block mb-1">Payment Method</label>
                <select
                  value={entryMethod}
                  onChange={(e) => setEntryMethod(e.target.value)}
                  className="w-full h-9 px-2 text-xs rounded-[8px] border border-slate-700/40 bg-[#0B0F19] text-[#F8FAFC] focus:outline-none focus:border-blue-500"
                >
                  <option value="UPI" className="bg-[#131B2E] text-[#F8FAFC]">UPI</option>
                  <option value="Cash" className="bg-[#131B2E] text-[#F8FAFC]">Cash</option>
                  <option value="Bank Transfer" className="bg-[#131B2E] text-[#F8FAFC]">Bank Transfer</option>
                  <option value="Credit" className="bg-[#131B2E] text-[#F8FAFC]">Khata Credit</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/40">
                <button
                  type="button"
                  onClick={() => setShowAddEntry(false)}
                  className="h-9 px-4 rounded-[8px] border border-slate-700/40 text-xs font-medium text-[#94A3B8] hover:bg-[#0E1322] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-[8px] bg-[#2563EB] hover:bg-[#4F5B93] text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Save to Khata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
