"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-blue-300" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-blue-500",
  titleClassName = "text-blue-500",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[min(22rem,55vw)] -skew-y-[8deg] select-none flex-col justify-between",
        "rounded-xl border-2 bg-muted/70 backdrop-blur-sm px-4 py-3 transition-all duration-700",
        "after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem]",
        "after:bg-gradient-to-l after:from-background after:to-transparent after:content-['']",
        // FIX: added active: variants alongside hover: so tap works on mobile
        "hover:border-border-secondary hover:bg-muted active:border-border-secondary active:bg-muted",
        "[&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
    >
      <div>
        <span className="relative inline-block rounded-full bg-blue-800 p-1">
          {icon}
        </span>
        <p className={cn("text-lg font-medium", titleClassName)}>{title}</p>
      </div>
      {/* FIX: removed whitespace-nowrap (caused overflow) and text-lg → text-sm
          on mobile so description fits within the card width at 55vw          */}
      <p className="text-sm sm:text-lg line-clamp-2">{description}</p>
      <p className="text-muted-foreground text-xs sm:text-sm">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      // FIX: added active:-translate-y-10 for mobile tap lift effect
      className:
        "[grid-area:stack] hover:-translate-y-10 active:-translate-y-10" +
        " before:absolute before:w-[100%] before:outline-1 before:rounded-xl" +
        " before:outline-border before:h-[100%] before:content-['']" +
        " before:bg-blend-overlay before:bg-background/50" +
        " grayscale-[100%] hover:before:opacity-0 active:before:opacity-0" +
        " before:transition-opacity before:duration-700" +
        " hover:grayscale-0 active:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-16 translate-y-10" +
        " hover:-translate-y-1 active:-translate-y-1" +
        " before:absolute before:w-[100%] before:outline-1 before:rounded-xl" +
        " before:outline-border before:h-[100%] before:content-['']" +
        " before:bg-blend-overlay before:bg-background/50" +
        " grayscale-[100%] hover:before:opacity-0 active:before:opacity-0" +
        " before:transition-opacity before:duration-700" +
        " hover:grayscale-0 active:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-32 translate-y-20" +
        " hover:translate-y-10 active:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 -translate-x-8 sm:translate-x-0">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}