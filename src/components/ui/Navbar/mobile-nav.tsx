import { cn } from "@/lib/utils";
import React from "react";
import { Portal, PortalBackdrop } from "@/components/ui/Navbar/portal";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/components/ui/Navbar/header";
import { XIcon, MenuIcon, User } from "lucide-react";
import { Link } from "react-router-dom";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  function handleLinkClick() {
    setOpen(false);
  }

  // NAV_HEIGHT must match the nav's h-* in header.tsx (h-12 = 48px)
  const NAV_HEIGHT = 48;

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        {open ? (
          <XIcon className="size-4.5" />
        ) : (
          <MenuIcon className="size-4.5" />
        )}
      </Button>

      {open && (
        // FIX: Portal accepts className for positioning. The Portal component
        // renders: <div className={cn("fixed inset-0 ...", className)} />
        // So we override `top` via an inline style on a wrapping div inside,
        // since className="top-12" may be purged. Instead we pass a style prop
        // directly to the inner content div to push it down by NAV_HEIGHT px.
        <Portal id="mobile-menu" className="top-0">
          <PortalBackdrop onClick={handleLinkClick} />
          <div
            style={{ marginTop: NAV_HEIGHT }}
            className={cn(
              "data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
              "w-full p-4"
            )}
            data-slot={open ? "open" : "closed"}
          >
            <div className="grid gap-y-1">
              {navLinks.map((link) => (
                <Button
                  asChild
                  className="justify-start text-base"
                  key={link.label}
                  variant="ghost"
                  onClick={handleLinkClick}
                >
                  <a href={link.href}>{link.label}</a>
                </Button>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild className="w-full" variant="outline">
                <Link to="/login" onClick={handleLinkClick} className="flex items-center gap-2">
                  <User size={16} />
                  Sign In
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/signup" onClick={handleLinkClick}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}