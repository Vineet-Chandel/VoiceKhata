// src/components/Pages/KhataPage.tsx
"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, Search, Filter, Plus, ArrowUpRight, ArrowDownRight, 
  ChevronRight, ArrowLeft, Phone, Calendar, MessageSquare, 
  Check, Mic, Clock, FileText, AlertTriangle, ShieldCheck,
  Sparkles
} from "lucide-react"
import { useTransactions, type Transaction } from "@/components/hooks/use-transactions"
import { useAuth } from "@/components/hooks/use-auth"
import { VoiceActionBanner } from "@/components/ui/Dashboard_UI/voice-action-banner"
import type { TransactionInput } from "@/types/finance"
import { useLanguage } from "@/context/LanguageContext"

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
  const { t } = useLanguage()
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
    <div className="@container/main flex flex-1 flex-col gap-6 py-4 px-4 lg:px-8 bg-background text-foreground transition-colors">
      {/* ── DETAIL VIEW ────────────────────────────────────────────────────────── */}
      {selectedCustomer ? (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Back button & Customer Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedCustomerId(null)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>{t("khata.backToKhata")}</span>
            </button>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/91${selectedCustomer.phone.replace(/\s+/g, "")}?text=Namaste%20${encodeURIComponent(selectedCustomer.name)},%20aapka%20VoiceKhata%20par%20balance%20Rs.%20${Math.abs(selectedCustomer.balance)}%20hai.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-full hover:bg-emerald-500/20 transition-all shadow-2xs"
              >
                <MessageSquare size={14} />
                <span>{t("khata.whatsappReminder")}</span>
              </a>
            </div>
          </div>

          {/* Customer Balance Banner */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B0F15] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{selectedCustomer.name}</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    selectedCustomer.type === "customer" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {selectedCustomer.type === "customer" ? t("khata.customer") : t("khata.supplier")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <Phone size={12} />
                  <span>+91 {selectedCustomer.phone}</span>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  {selectedCustomer.balance >= 0 ? t("khata.youWillReceive") : t("khata.youWillPay")}
                </p>
                <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                  {selectedCustomer.balance >= 0 ? (
                    <ArrowDownRight size={26} className="text-emerald-500" />
                  ) : (
                    <ArrowUpRight size={26} className="text-rose-500" />
                  )}
                  <p className={`text-3xl sm:text-4xl font-black tabular-nums ${
                    selectedCustomer.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}>
                    ₹{Math.abs(selectedCustomer.balance).toLocaleString("en-IN")}
                  </p>
                </div>
                {selectedCustomer.overdue && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full mt-1">
                    <AlertTriangle size={12} />
                    <span>{t("khata.overdueNotice")}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Trays */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => {
                  setEntryType("Credit")
                  setShowAddEntry(true)
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs transition-all cursor-pointer"
              >
                <Check size={14} />
                <span>+ ₹ {t("khata.recordPayment")} (Got Money)</span>
              </button>
              <button
                onClick={() => {
                  setEntryType("Debit")
                  setShowAddEntry(true)
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-bold text-xs transition-all cursor-pointer"
              >
                <ArrowUpRight size={14} />
                <span>- ₹ {t("khata.giveCredit")} (Gave Udhaar)</span>
              </button>
            </div>
          </div>

          {/* Customer Ledger History */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B0F15] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t("khata.ledger")}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("khata.ledgerDesc")}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {selectedCustomer.transactions.length} entries
              </span>
            </div>

            {selectedCustomer.transactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
                <FileText size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("khata.noTx")}</p>
                <p className="max-w-xs mx-auto text-xs">
                  {t("khata.noTxDesc")}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {selectedCustomer.transactions.map((tx) => (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center size-9 rounded-xl ${
                        tx.type === "Credit" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}>
                        {tx.type === "Credit" ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {tx.type === "Credit" ? t("khata.receivedPayment") : t("khata.gaveCredit")}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{tx.date || t("khata.today")}</span>
                          <span>•</span>
                          <span>{tx.method || "UPI"}</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t("khata.completed")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm font-black tabular-nums ${
                        tx.type === "Credit" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}>
                        {tx.type === "Credit" ? "+" : "-"}₹{Number(tx.amount || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {tx.type === "Credit" ? t("khata.moneyReceived") : t("khata.moneyGiven")}
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
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#D2F832]" />
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t("khata.title")}</h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t("khata.subtitle")}
              </p>
            </div>

            <button
              onClick={() => setShowAddCustomer(true)}
              className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[#0B0F15] dark:bg-white hover:bg-black dark:hover:bg-slate-100 active:scale-[0.98] text-white dark:text-[#0B0F15] text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>{t("khata.addParty")}</span>
            </button>
          </div>

          {/* Top Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-white dark:bg-[#0B0F15] p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{t("khata.totalToReceive")}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <ArrowDownRight size={22} className="text-emerald-500" />
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ₹{totalToReceive.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                {customerList.filter((c) => c.balance > 0).length} {t("khata.fromCustomers")}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-white dark:bg-[#0B0F15] p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">{t("khata.totalToPay")}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <ArrowUpRight size={22} className="text-rose-500" />
                <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
                  ₹{totalToPay.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                {t("khata.toSuppliers")}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-white dark:bg-[#0B0F15] p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">{t("khata.overdue")}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <AlertTriangle size={20} className="text-amber-500" />
                <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                  ₹{overdueAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                {t("khata.followUp")}
              </p>
            </div>
          </div>

          {/* Controls: Search + Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B0F15] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("khata.searchPlaceholder")}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1320] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === "all"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                {t("khata.all")} ({customerList.length})
              </button>
              <button
                onClick={() => setFilterType("customer")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === "customer"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                {t("khata.customers")}
              </button>
              <button
                onClick={() => setFilterType("supplier")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === "supplier"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                {t("khata.suppliers")}
              </button>
            </div>
          </div>

          {/* Swipe Toast Feedback */}
          <AnimatePresence>
            {swipeToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between shadow-lg"
              >
                <span>{swipeToast}</span>
                <button onClick={() => setSwipeToast(null)} className="text-emerald-700 dark:text-emerald-300 hover:opacity-80 cursor-pointer">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Customer Rows List */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B0F15] divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-2xs">
            {filteredCustomers.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <Users size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t("khata.noCustomersFound")}</p>
                <p>{t("khata.trySearchingAgain")}</p>
              </div>
            ) : (
              filteredCustomers.map((cust) => (
                <div key={cust.id} className="relative overflow-hidden group">
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
                    className="relative z-10 p-4 bg-white dark:bg-[#0B0F15] hover:bg-slate-50/80 dark:hover:bg-[#0E1320] transition-colors flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex items-center justify-center size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-sm shrink-0">
                        {cust.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{cust.name}</h3>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            cust.type === "customer" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}>
                            {cust.type === "customer" ? t("khata.customer") : t("khata.supplier")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {cust.phone} • {t("khata.lastActivity")}: {cust.lastActivity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 font-bold text-sm tabular-nums">
                          {cust.balance >= 0 ? (
                            <>
                              <span className="text-emerald-500">↑</span>
                              <span className="text-emerald-600 dark:text-emerald-400">₹{Math.abs(cust.balance).toLocaleString("en-IN")}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-rose-500">↓</span>
                              <span className="text-rose-600 dark:text-rose-400">₹{Math.abs(cust.balance).toLocaleString("en-IN")}</span>
                            </>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {cust.balance >= 0 ? t("khata.youWillReceive") : t("khata.youWillPay")}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0B0F15] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t("khata.addCustomerOrSupplier")}</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("khata.fullName")}</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1320] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("khata.phone")}</label>
                <input
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1320] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("khata.partyType")}</label>
                  <select
                    value={newCustType}
                    onChange={(e) => setNewCustType(e.target.value as any)}
                    className="w-full h-10 px-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1320] text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="customer">{t("khata.customer")}</option>
                    <option value="supplier">{t("khata.supplier")}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("khata.openingBalance")}</label>
                  <input
                    type="number"
                    value={newCustBalance}
                    onChange={(e) => setNewCustBalance(e.target.value)}
                    placeholder="0"
                    className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1320] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-xl bg-[#0B0F15] dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-[#0B0F15] text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {t("khata.saveCustomer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: MANUAL ENTRY FOR CUSTOMER ───────────────────────────────────── */}
      {showAddEntry && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0B0F15] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedCustomer.name} {t("khata.addEntryFor")}
            </h3>
            <form onSubmit={handleAddCustomerEntry} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("khata.txType")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntryType("Credit")}
                    className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      entryType === "Credit"
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1320] text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <ArrowDownRight size={14} />
                    <span>{t("khata.moneyReceived")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType("Debit")}
                    className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      entryType === "Debit"
                        ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1320] text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <ArrowUpRight size={14} />
                    <span>{t("khata.gaveCredit")}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("voice.amount")}</label>
                <input
                  type="number"
                  required
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  placeholder="e.g. 1200"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1320] text-slate-900 dark:text-white placeholder:text-slate-400 font-bold focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("voice.paymentMethod")}</label>
                <select
                  value={entryMethod}
                  onChange={(e) => setEntryMethod(e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1320] text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit">Khata Credit</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddEntry(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-xl bg-[#0B0F15] dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-[#0B0F15] text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {t("khata.saveToKhata")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
