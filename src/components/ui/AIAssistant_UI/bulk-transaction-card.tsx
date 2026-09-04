"use client"

import * as React from "react"
import { CheckCircle2, ChevronRight, Check, AlertCircle, AlertTriangle, Pause, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { useChatStore } from "@/components/hooks/use-chat-store"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Props {
  onSend: (msg: string) => void
  onConfirmAll: () => void
  onCancel: () => void
}

export function BulkTransactionCard({ onSend, onConfirmAll, onCancel }: Props) {
  const { multiState, setMultiState } = useChatStore()
  const [page, setPage] = React.useState(0)
  const [showAttention, setShowAttention] = React.useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  
  const step = multiState?.step
  const drafts = multiState?.drafts || []
  
  const ITEMS_PER_PAGE = 25
  const totalPages = Math.ceil(drafts.length / ITEMS_PER_PAGE)
  const visibleDrafts = drafts.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const totalAmount = drafts.reduce((acc, d) => acc + (typeof d.amount === 'number' ? d.amount : 0), 0)
  const totalCredit = drafts.filter(d => d.type === "Credit").reduce((acc, d) => acc + (typeof d.amount === 'number' ? d.amount : 0), 0)
  const totalDebit = drafts.filter(d => d.type === "Debit").reduce((acc, d) => acc + (typeof d.amount === 'number' ? d.amount : 0), 0)
  
  const completedCount = drafts.filter(d => d.status === "completed" || d.status === "skipped").length
  const pendingCount = drafts.filter(d => d.status === "pending").length
  const attentionCount = drafts.filter(d => d.status === "needs-attention" || d.status === "duplicate" || d.status === "error").length
  
  const nextPendingIndex = drafts.findIndex(d => d.status === "pending" || d.status === "needs-attention")
  const currentDraft = nextPendingIndex !== -1 ? drafts[nextPendingIndex] : null

  // 1. Auto-transition logic
  React.useEffect(() => {
    if (step === "queue") {
      const allTerminal = drafts.every(d => 
        d.status === "completed" || 
        d.status === "skipped" || 
        d.status === "failed" || 
        d.status === "error"
      )
      
      if (allTerminal && drafts.length > 0) {
        setMultiState(prev => prev ? { ...prev, step: "review" } : null)
      }
    }
  }, [step, drafts, setMultiState])

  // 2. Ensure current page follows pending item
  React.useEffect(() => {
    if (nextPendingIndex !== -1) {
      const expectedPage = Math.floor(nextPendingIndex / ITEMS_PER_PAGE)
      if (expectedPage !== page) setPage(expectedPage)
    }
  }, [nextPendingIndex, page])
  
  if (!multiState) return null

  const { needsNameCount, needsTypeCount, skipNames } = multiState

  const renderTransactionList = (items: typeof drafts, showPagination = false) => (
    <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      {items.map((d, localIndex) => {
        const globalIndex = showPagination ? page * ITEMS_PER_PAGE + localIndex : drafts.findIndex(x => x.id === d.id)
        const isCurrent = globalIndex === nextPendingIndex
        
        return (
          <div 
            key={d.id} 
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
              isCurrent ? "bg-surface-secondary border border-white/[0.1]" : "hover:bg-surface-secondary"
            } ${d.status === 'duplicate' ? 'border border-yellow-500/20 bg-yellow-500/5' : ''}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="w-5 shrink-0 text-text-muted font-mono text-[10px]">{globalIndex + 1}.</span>
              <span className={`font-medium shrink-0 ${d.status === 'pending' || isCurrent ? 'text-text-primary' : 'text-text-secondary'}`}>₹{d.amount.toLocaleString('en-IN')}</span>
              <span className="text-text-secondary truncate max-w-[120px]">{d.transaction || '—'}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-text-muted text-[10px] uppercase tracking-wider">{d.type || ''}</span>
              {d.status === 'completed' && <CheckCircle2 size={12} className="text-green-400/70" />}
              {d.status === 'duplicate' && <AlertTriangle size={12} className="text-yellow-400/70" title="Possible Duplicate" />}
              {d.status === 'error' && <AlertCircle size={12} className="text-red-400/70" />}
              {isCurrent && <span className="size-1.5 rounded-full bg-white animate-pulse" />}
            </div>
          </div>
        )
      })}
      {showPagination && totalPages > 1 && (
         <div className="flex justify-between items-center mt-2 px-2 pb-2">
           <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="text-[10px] text-text-muted hover:text-text-primary disabled:opacity-30">Previous</button>
           <span className="text-[10px] text-text-muted">Page {page + 1} of {totalPages}</span>
           <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} className="text-[10px] text-text-muted hover:text-text-primary disabled:opacity-30">Next</button>
         </div>
      )}
    </div>
  )

  const renderDrawer = () => (
    <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-between px-4 py-3 bg-surface-secondary hover:bg-white/[0.1] text-text-primary text-xs font-medium rounded-xl transition-colors">
          View all transactions
          <ExternalLink size={14} className="text-text-muted" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-surface border border-border text-text-primary sm:max-w-[425px] w-[95vw] h-[80vh] flex flex-col p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
          <DialogTitle className="text-sm font-medium">All Transactions ({drafts.length})</DialogTitle>
        </DialogHeader>
        <div className="p-3 flex-1 overflow-y-auto">
          {renderTransactionList(visibleDrafts, true)}
        </div>
      </DialogContent>
    </Dialog>
  )

  // 1. Setup Phase
  if (step === "setup") {
    const attentionDrafts = drafts.filter(d => !d.type || !d.transaction)
    
    return (
      <div className="w-full flex justify-end">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[85%] w-[320px] rounded-2xl bg-surface border border-border overflow-hidden flex flex-col mt-4 mb-2 shadow-2xl"
        >
          
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-text-primary text-sm font-medium">{drafts.length} transactions detected</h3>
            <div className="flex gap-2 text-[11px] font-medium mt-1.5 items-center">
              <span className="text-text-secondary">{drafts.length - attentionCount} ready</span>
              <span className="text-text-muted">·</span>
              <span className="text-yellow-400/80">{attentionCount} need information</span>
            </div>
            <p className="text-text-secondary text-[11px] mt-3">Total value: <span className="font-medium text-text-primary">₹{totalAmount.toLocaleString('en-IN')}</span></p>
          </div>
          
          {attentionCount > 0 && (
            <div className="px-3 pt-3">
              <button 
                onClick={() => setShowAttention(!showAttention)} 
                className="w-full flex justify-between items-center text-[11px] font-medium text-yellow-400/90 hover:text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/15 px-3 py-2 rounded-xl transition-colors"
              >
                {attentionCount} transactions need attention
                <motion.div animate={{ rotate: showAttention ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {showAttention && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-1 mt-2 px-1">
                      {attentionDrafts.slice(0, 5).map(d => (
                        <div key={d.id} className="flex justify-between items-center text-[10px] text-text-secondary py-1">
                          <span className="truncate max-w-[140px]">₹{d.amount.toLocaleString('en-IN')} {d.transaction ? `— ${d.transaction}` : ''}</span>
                          <span className="text-yellow-400/60 shrink-0">— {!d.type ? 'Type missing' : 'Name missing'}</span>
                        </div>
                      ))}
                      {attentionDrafts.length > 5 && (
                        <span className="text-[10px] text-text-muted italic pt-1 text-center">+ {attentionDrafts.length - 5} more</span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="p-3 flex flex-col gap-2 mt-1">
            {needsTypeCount > 0 && (
              <>
                <button onClick={() => onSend("Credit All")} className="w-full px-4 py-2.5 bg-surface-secondary hover:bg-surface-secondary text-text-primary text-xs font-medium rounded-xl text-left transition-colors flex justify-between items-center group">
                  Credit all {needsTypeCount}
                  <ChevronRight size={14} className="text-text-muted group-hover:text-text-secondary transition-transform group-hover:translate-x-0.5" />
                </button>
                <button onClick={() => onSend("Debit All")} className="w-full px-4 py-2.5 bg-surface-secondary hover:bg-surface-secondary text-text-primary text-xs font-medium rounded-xl text-left transition-colors flex justify-between items-center group">
                  Debit all {needsTypeCount}
                  <ChevronRight size={14} className="text-text-muted group-hover:text-text-secondary transition-transform group-hover:translate-x-0.5" />
                </button>
              </>
            )}
            <button onClick={() => onSend("Set Individually")} className="w-full px-4 py-2.5 bg-surface-secondary hover:bg-surface-secondary text-text-primary text-xs font-medium rounded-xl text-left transition-colors flex justify-between items-center group border border-transparent hover:border-border">
              Review individually
              <ChevronRight size={14} className="text-text-muted group-hover:text-text-secondary transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {needsNameCount > 0 && !skipNames && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-3 mb-3 p-3 rounded-xl bg-surface-secondary border border-border">
              <p className="text-[11px] text-text-secondary mb-2.5 leading-relaxed">{needsNameCount} transactions don't have a name.<br/>Names are optional.</p>
              <div className="flex gap-2">
                <button onClick={() => onSend("Skip names")} className="flex-1 py-1.5 bg-surface-secondary hover:bg-surface-elevated text-text-primary text-[10px] font-medium rounded-lg transition-colors border border-border">Skip all names</button>
                <button onClick={() => onSend("Set Individually")} className="flex-1 py-1.5 bg-transparent hover:bg-surface-secondary text-text-secondary hover:text-text-primary text-[10px] font-medium rounded-lg transition-colors border border-white/[0.1]">Add names</button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    )
  }

  // 2. Queue Phase
  if (step === "queue") {
    const progress = Math.round((completedCount / drafts.length) * 100)
    
    return (
      <div className="w-full flex justify-end">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-[90%] w-full rounded-2xl bg-surface border border-border overflow-hidden flex flex-col mt-4 mb-2 shadow-2xl"
        >
          
          <div className="px-5 py-4 border-b border-border flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-text-primary text-xs font-medium uppercase tracking-wider">Processing transactions</h3>
              <button onClick={() => onSend("pause")} className="p-1 hover:bg-surface-secondary rounded-md transition-colors" title="Pause">
                <Pause size={12} className="text-text-secondary" />
              </button>
            </div>
            
            <div className="w-full h-1 bg-surface-secondary rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-medium">
              <span className="text-text-secondary">{completedCount} / {drafts.length} completed</span>
              {attentionCount > 0 && <span className="text-yellow-400/80 bg-yellow-400/10 px-2 py-0.5 rounded-full">{attentionCount} issues</span>}
            </div>
          </div>

          <div className="p-3">
            {drafts.length <= 10 ? (
               renderTransactionList(drafts, false)
            ) : (
               renderDrawer()
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {currentDraft && (
              <motion.div 
                key={currentDraft.id}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="px-5 py-4 bg-surface-secondary border-t border-border"
              >
                {!currentDraft.transaction && !skipNames ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-text-primary text-sm font-medium">What was ₹{currentDraft.amount.toLocaleString('en-IN')} for?</p>
                    <div className="flex justify-between items-center mt-1">
                       <button onClick={() => onSend("Skip Name")} className="px-4 py-2 bg-surface-secondary hover:bg-surface-elevated border border-border text-text-primary text-xs font-medium rounded-xl transition-colors">Skip Name</button>
                       <button onClick={() => setMultiState(prev => prev ? { ...prev, skipNames: true } : null)} className="px-3 py-1.5 text-text-muted hover:text-text-primary text-[10px] font-medium transition-colors">Skip names for remaining</button>
                    </div>
                  </div>
                ) : !currentDraft.type ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-text-primary text-sm font-medium">Is ₹{currentDraft.amount.toLocaleString('en-IN')} {currentDraft.transaction ? `for ${currentDraft.transaction}` : ''} a Debit or Credit?</p>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => onSend("Debit")} className="flex-1 py-2.5 bg-surface-secondary hover:bg-surface-elevated border border-border text-text-primary text-xs font-medium rounded-xl transition-colors">Debit</button>
                      <button onClick={() => onSend("Credit")} className="flex-1 py-2.5 bg-surface-secondary hover:bg-surface-elevated border border-border text-text-primary text-xs font-medium rounded-xl transition-colors">Credit</button>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    )
  }

  // 3. Paused Phase
  if (step === "paused") {
    return (
      <div className="w-full flex justify-end">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-[85%] rounded-2xl bg-surface border border-border overflow-hidden flex flex-col mt-4 mb-2 p-5 shadow-2xl"
        >
           <h3 className="text-text-primary text-sm font-medium flex items-center gap-2"><Pause size={14} className="text-text-secondary" /> Processing Paused</h3>
           <p className="text-text-secondary text-xs mt-2">{completedCount} of {drafts.length} transactions completed.</p>
           <div className="flex gap-2 mt-5">
             <button onClick={() => onSend("resume")} className="px-5 py-2.5 bg-white text-black hover:bg-white/90 text-xs font-medium rounded-xl transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]">Resume</button>
             <button onClick={() => onSend("cancel bulk")} className="px-4 py-2.5 bg-surface-secondary hover:bg-white/[0.1] text-text-primary text-xs font-medium rounded-xl transition-colors border border-border">Cancel Remaining</button>
           </div>
        </motion.div>
      </div>
    )
  }

  // 4. Review Phase
  if (step === "review") {
    return (
      <div className="w-full flex justify-end">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-[85%] rounded-2xl bg-surface border border-border overflow-hidden flex flex-col mt-4 mb-2 shadow-2xl"
        >
          
          <div className="px-5 py-5 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <div className="size-5 rounded-full bg-green-400/10 flex items-center justify-center">
                <Check size={12} className="text-green-400" />
              </div>
              <h3 className="text-text-primary text-sm font-medium">All {drafts.length} transactions are ready</h3>
            </div>
            <p className="text-text-secondary text-xs mt-3">Total · <span className="font-medium text-text-primary">₹{totalAmount.toLocaleString('en-IN')}</span></p>
          </div>
          
          <div className="px-5 py-4 flex flex-col gap-3 text-[11px]">
            <div className="flex items-center gap-3">
              <span className="text-green-400/90 font-medium bg-green-400/5 px-2 py-1 rounded-md">Credit ₹{totalCredit.toLocaleString('en-IN')}</span>
              <span className="text-red-400/90 font-medium bg-red-400/5 px-2 py-1 rounded-md">Debit ₹{totalDebit.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="h-px w-full bg-surface-secondary my-1" />
            
            <div className="flex items-center gap-2 font-medium">
              <span className="text-text-primary">{drafts.length - attentionCount} ready</span>
              <span className="text-text-muted">·</span>
              <span className={attentionCount > 0 ? "text-yellow-400" : "text-text-muted"}>{attentionCount} requiring attention</span>
            </div>
          </div>
          
          <div className="p-3 bg-surface-secondary border-t border-border flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                 <button className="flex-1 py-2.5 bg-surface-secondary hover:bg-white/[0.1] text-text-primary hover:text-text-primary text-xs font-medium rounded-xl transition-colors border border-border">
                   Review
                 </button>
              </DialogTrigger>
              <DialogContent className="bg-surface border border-border text-text-primary sm:max-w-[425px] w-[95vw] h-[80vh] flex flex-col p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
                  <DialogTitle className="text-sm font-medium">Review Transactions</DialogTitle>
                </DialogHeader>
                <div className="p-3 flex-1 overflow-y-auto">
                  {renderTransactionList(visibleDrafts, true)}
                </div>
              </DialogContent>
            </Dialog>
            <button onClick={onConfirmAll} className="flex-[1.5] py-2.5 bg-white hover:bg-white/90 text-black text-xs font-medium rounded-xl transition-colors shadow-[0_0_15px_rgba(255,255,255,0.15)] flex justify-center items-center gap-2">
              Confirm & Save
              <Check size={14} className="text-black/70" />
            </button>
          </div>

        </motion.div>
      </div>
    )
  }

  return null
}
