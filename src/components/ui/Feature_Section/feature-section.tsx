"use client";

import DisplayCards from "@/components/ui/Feature_Section/display-cards";
import { Sparkles } from "lucide-react";

const defaultCards = [
    {
        icon: <Sparkles className="size-4 text-blue-300" />,
        title: "Real-time Tracking",
        description: "Connect your accounts & see transactions",
        date: "Just now",
        iconClassName: "text-blue-500",
        titleClassName: "text-blue-500",
        className:
            "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
        icon: <Sparkles className="size-4 text-blue-300" />,
        title: "Budgeting",
        description: "Create and track budgets",
        date: "2 days ago",
        iconClassName: "text-blue-500",
        titleClassName: "text-blue-500",
        className:
            "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
        icon: <Sparkles className="size-4 text-blue-300" />,
        title: "AI Assistant",
        description: "Get personalized financial advice",
        date: "Today",
        iconClassName: "text-blue-500",
        titleClassName: "text-blue-500",
        className:
            "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
    },
];

function DisplayCardsDemo() {
    return (
        <section className="mt-10">
            <h2 className=" text-center font-medium text-foreground text-xl tracking-tight md:text-3xl">
                <span className="text-muted-foreground">Everything you need to</span>
                <br />
                <span className="font-semibold">manage your wealth.</span>
            </h2>
            <div className="mt-10 flex w-full items-center justify-center pt-10 pb-16 mb-20">
                <div className="w-full max-w-3xl">
                    <DisplayCards cards={defaultCards} />
                </div>
            </div>
        </section>
    );
}

export { DisplayCardsDemo };
