import { cn } from "@/lib/utils";
import React from "react";
import { createPortal } from "react-dom";

function Portal({ className, ...props }: React.ComponentProps<"div">) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    const originalOverflow = window.getComputedStyle(document.body).overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;
    const originalTop = document.body.style.top;
    const scrollY = window.scrollY;

    // FIX: Standard overflow:hidden alone doesn't prevent scroll on iOS Safari.
    // position:fixed + top:-scrollY is the universal cross-browser scroll lock.
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;

    return () => {
      // Restore all styles and scroll position on unmount
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      document.body.style.top = originalTop;
      window.scrollTo(0, scrollY);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn("fixed inset-0 isolate z-40 flex flex-col", className)}
      {...props}
    />,
    document.body
  );
}

function PortalBackdrop({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 bg-background/95 backdrop-blur-sm duration-500",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=open]:animate-in",
        "supports-backdrop-filter:bg-background/60",
        className
      )}
      {...props}
    />
  );
}

export { Portal, PortalBackdrop };