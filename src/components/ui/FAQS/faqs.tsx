"use client";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/FAQS/accordion";
import { Button } from "@/components/ui/button";
import {
  PowerIcon,
  FeatherIcon,
  CreditCardIcon,
  LifeBuoyIcon,
} from "lucide-react";

const categories = [
  { icon: <PowerIcon      className="size-4" />, id: "getting-started", label: "Getting Started" },
  { icon: <FeatherIcon    className="size-4" />, id: "features",        label: "Features"        },
  { icon: <CreditCardIcon className="size-4" />, id: "security",        label: "Security"        },
  { icon: <LifeBuoyIcon   className="size-4" />, id: "support",         label: "Support"         },
];

const faqs = [
  { id: 1, category: "getting-started", title: "How do I start using Finease?",           content: "Simply create a free account and connect your bank or upload transactions manually. Within minutes, you'll get a clear overview of your income, expenses, and spending trends." },
  { id: 2, category: "getting-started", title: "Is Finease free to use?",                 content: "Yes! Finease offers a free tier with essential budgeting and tracking features. Premium features like advanced analytics and AI insights are available in paid plans." },
  { id: 3, category: "features",        title: "How does smart budgeting work?",           content: "Finease automatically categorizes your expenses and tracks them against your set budgets. You'll receive alerts when you're close to overspending." },
  { id: 4, category: "features",        title: "Can Finease detect expenses from emails?", content: "Yes. Finease can securely scan transaction emails (like bank alerts) to automatically detect and log expenses in real time." },
  { id: 5, category: "features",        title: "What are AI-powered financial insights?",  content: "Our AI analyzes your spending habits and provides suggestions to help you save more, reduce unnecessary expenses, and improve financial health." },
  { id: 6, category: "security",        title: "Is my financial data secure?",             content: "Absolutely. Finease uses encrypted connections and secure authentication methods to ensure your data is safe and private at all times." },
  { id: 7, category: "security",        title: "Do you store my bank credentials?",        content: "No. Finease never stores your bank passwords. We use secure APIs and encrypted systems to access only the necessary transaction data." },
  { id: 8, category: "support",         title: "How can I contact support?",               content: "You can reach our support team via email or through the in-app help section. We typically respond within 24 hours." },
  { id: 9, category: "support",         title: "Do you offer onboarding guidance?",        content: "Yes! We provide tutorials and walkthroughs to help you understand budgeting, expense tracking, and AI insights effectively." },
];

export function FaqsSection() {
  // Default to first category instead of "all" since All Topics is removed
  const [activeCategory, setActiveCategory] = React.useState("getting-started");

  const filtered = faqs.filter((faq) => faq.category === activeCategory);

  return (
    <section className="mx-2">
      <div className="flex justify-center">
        <div className="mb-4 mt-10 inline-flex items-center gap-2 rounded-full bg-surface-secondary border border-border px-4 py-1 text-sm text-text-primary">
          <Globe className="size-4 text-text-primary" />
          <span className="text-text-primary">FAQs</span>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl rounded-3xl border border-border bg-gradient-to-br from-[#0A0A0A] to-[#151515] px-4 sm:px-6 pt-4 pb-8 overflow-hidden">
        <div className="absolute -top-45 right-200 h-100 w-100 rounded-full bg-surface-secondary/20 blur-3xl" />

        <div className="flex flex-col items-center justify-center gap-4 px-4 py-6">
          <h2 className="text-balance text-center font-black font-mono text-2xl sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-muted-foreground text-sm sm:text-base">
            Everything you need to know about Finease and how it helps you take control of your finances.
          </p>
        </div>

        <div className="relative grid min-h-full grid-cols-1 md:grid-cols-3">
          <div className="border-b pb-3 md:border-b-0 md:pb-0">
            <div className="flex flex-row gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-x-visible md:items-start md:justify-center md:h-full scrollbar-none">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  variant="ghost"
                  className={cn(
                    "border border-transparent justify-start gap-2 shrink-0 transition-colors",
                    activeCategory === cat.id
                      ? "bg-surface-secondary border-border-secondary text-text-primary font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                  )}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="col-span-2 space-y-5 px-4 py-5">
            <Accordion className="space-y-2" collapsible defaultValue="1" type="single">
              {filtered.map((item) => (
                <AccordionItem className="border-b-0" key={item.id} value={item.id.toString()}>
                  <AccordionTrigger className="border bg-card px-4 shadow hover:no-underline">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-4">
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}