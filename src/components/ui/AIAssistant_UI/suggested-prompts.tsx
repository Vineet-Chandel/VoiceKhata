// src/components/ui/AIAssistant_UI/suggested-prompts.tsx
"use client"

import {
  TrendingUp, AlertTriangle, PiggyBank,
  Lightbulb, BarChart2, ArrowLeftRight,
} from "lucide-react"

const PROMPTS = [
  { text: "What did I spend the most on this month?",      Icon: TrendingUp,      color: "text-violet-400",  bg: "bg-violet-500/10"  },
  { text: "Am I over budget in any category?",             Icon: AlertTriangle,   color: "text-red-400",     bg: "bg-red-500/10"     },
  { text: "How much did I save this month?",               Icon: PiggyBank,       color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { text: "Give me tips to reduce my expenses",            Icon: Lightbulb,       color: "text-amber-400",   bg: "bg-amber-500/10"   },
  { text: "What's my biggest expense category?",           Icon: BarChart2,       color: "text-teal-400",    bg: "bg-teal-500/10"    },
  { text: "How does my spending compare to last month?",   Icon: ArrowLeftRight,  color: "text-blue-400",    bg: "bg-blue-500/10"    },
]

export function SuggestedPrompts({ onSelect }: { onSelect: (p: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-[440px]">
      {PROMPTS.map(({ text, Icon, color, bg }) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-left transition-colors hover:bg-surface-secondary hover:border-border-secondary"
        >
          <div className={`mt-0.5 size-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={14} className={color} />
          </div>
          <span className="text-xs text-text-secondary leading-[1.45] pt-0.5">{text}</span>
        </button>
      ))}
    </div>
  )
}