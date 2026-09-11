import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  Mic, 
  Sparkles, 
  RefreshCw, 
  Compass, 
  Volume2, 
  Receipt, 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Store,
  CheckCircle2,
  Plus
} from "lucide-react";

export interface VoiceBadgeData {
  id: string;
  type: "udhar" | "jama";
  spokenPhrase: string;
  title: string;
  amount?: string;
  tag: string;
  colorClass: string;
  borderClass: string;
  glowClass: string;
  icon: string;
}

const INITIAL_BADGES: VoiceBadgeData[] = [
  {
    id: "badge-1",
    type: "udhar",
    spokenPhrase: '"Ramesh 200 rupees udhar"',
    title: "Ramesh (Given Credit)",
    amount: "₹200",
    tag: "Customer Udhar",
    colorClass: "bg-rose-500/10 text-rose-300",
    borderClass: "border-rose-500/30",
    glowClass: "shadow-rose-500/10",
    icon: "udhar"
  },
  {
    id: "badge-2",
    type: "jama",
    spokenPhrase: '"Sunil paid 500 rupees cash"',
    title: "Sunil (Payment Received)",
    amount: "+₹500",
    tag: "Customer Jama",
    colorClass: "bg-cyan-500/10 text-cyan-300",
    borderClass: "border-cyan-500/30",
    glowClass: "shadow-cyan-500/10",
    icon: "jama"
  },
  {
    id: "badge-3",
    type: "udhar",
    spokenPhrase: '"Sharmaji 1200 rupees udhar"',
    title: "Sharmaji Kirana (Credit)",
    amount: "₹1,200",
    tag: "Customer Udhar",
    colorClass: "bg-rose-500/10 text-rose-300",
    borderClass: "border-rose-500/30",
    glowClass: "shadow-rose-500/10",
    icon: "udhar"
  },
  {
    id: "badge-4",
    type: "jama",
    spokenPhrase: '"Priya paid 850 rupees online"',
    title: "Priya Medical (Received)",
    amount: "+₹850",
    tag: "Customer Jama",
    colorClass: "bg-cyan-500/10 text-cyan-300",
    borderClass: "border-cyan-500/30",
    glowClass: "shadow-cyan-500/10",
    icon: "jama"
  },
  {
    id: "badge-5",
    type: "udhar",
    spokenPhrase: '"Vermaji 780 rupees udhar"',
    title: "Vermaji Hardware (Udhar)",
    amount: "₹780",
    tag: "Customer Udhar",
    colorClass: "bg-rose-500/10 text-rose-300",
    borderClass: "border-rose-500/30",
    glowClass: "shadow-rose-500/10",
    icon: "udhar"
  },
  {
    id: "badge-6",
    type: "jama",
    spokenPhrase: '"Gupta paid 1500 rupees cash"',
    title: "Gupta Traders (Received)",
    amount: "+₹1,500",
    tag: "Customer Jama",
    colorClass: "bg-cyan-500/10 text-cyan-300",
    borderClass: "border-cyan-500/30",
    glowClass: "shadow-cyan-500/10",
    icon: "jama"
  },
  {
    id: "badge-7",
    type: "udhar",
    spokenPhrase: '"Mohan 420 rupees udhar"',
    title: "Mohan Lal (Udhar)",
    amount: "₹420",
    tag: "Customer Udhar",
    colorClass: "bg-rose-500/10 text-rose-300",
    borderClass: "border-rose-500/30",
    glowClass: "shadow-rose-500/10",
    icon: "udhar"
  },
  {
    id: "badge-8",
    type: "jama",
    spokenPhrase: '"Anita paid 350 rupees GPay"',
    title: "Anita Dairy (Settled)",
    amount: "+₹350",
    tag: "Customer Jama",
    colorClass: "bg-cyan-500/10 text-cyan-300",
    borderClass: "border-cyan-500/30",
    glowClass: "shadow-cyan-500/10",
    icon: "jama"
  }
];

// Helper to dynamically load Matter.js from local or ESM CDN
async function loadMatterJS(): Promise<any> {
  if (typeof window !== "undefined" && (window as any).Matter) {
    return (window as any).Matter;
  }
  try {
    // Attempt local import first
    const mod = await import("matter-js");
    return mod.default || mod;
  } catch (err) {
    // Fallback dynamically from CDN
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return reject("SSR");
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).Matter) resolve((window as any).Matter);
        else reject("Failed to initialize Matter.js");
      };
      script.onerror = () => reject("Failed to load Matter.js from CDN");
      document.head.appendChild(script);
    });
  }
}

export function FloatingVoiceBadgesPhysics() {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const bodiesRef = useRef<Map<string, any>>(new Map());
  const engineRef = useRef<any>(null);
  const runnerRef = useRef<any>(null);
  const matterRef = useRef<any>(null);
  const cleanupPhysicsRef = useRef<(() => void) | null>(null);

  const [badges, setBadges] = useState<VoiceBadgeData[]>(INITIAL_BADGES);
  const [selectedBadge, setSelectedBadge] = useState<VoiceBadgeData | null>(null);
  const [isZeroGravity, setIsZeroGravity] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [customPhrase, setCustomPhrase] = useState("");
  const [physicsReady, setPhysicsReady] = useState(false);

  // Sound effect simulation on badge click
  const playBadgeSound = (badge: VoiceBadgeData) => {
    setSelectedBadge(badge);
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(badge.spokenPhrase.replace(/"/g, ""));
        utter.rate = 1.05;
        utter.pitch = 1.1;
        window.speechSynthesis.speak(utter);
      } catch (e) {
        // speech synthesis fallback
      }
    }
  };

  // Add a new badge interactively (Customer transaction only)
  const addNewBadge = (phrase?: string) => {
    const text = phrase || customPhrase || "Ramesh 200 rupees udhar";
    const isJama = text.toLowerCase().includes("jama") || text.toLowerCase().includes("paid") || text.toLowerCase().includes("received");
    const newBadge: VoiceBadgeData = {
      id: "badge-" + Date.now(),
      type: isJama ? "jama" : "udhar",
      spokenPhrase: `"${text}"`,
      title: text.length > 22 ? text.substring(0, 20) + "..." : text,
      amount: (isJama ? "+₹" : "₹") + (Math.floor(Math.random() * 90) * 10 + 50),
      tag: isJama ? "Customer Jama" : "Customer Udhar",
      colorClass: isJama ? "bg-cyan-500/20 text-cyan-200" : "bg-rose-500/20 text-rose-200",
      borderClass: isJama ? "border-cyan-400/50" : "border-rose-400/50",
      glowClass: isJama ? "shadow-cyan-500/20" : "shadow-rose-500/20",
      icon: isJama ? "jama" : "udhar"
    };

    setBadges((prev) => [...prev, newBadge]);
    setCustomPhrase("");

    // Impulse new badge if physics is running
    setTimeout(() => {
      const Matter = matterRef.current;
      const engine = engineRef.current;
      if (!Matter || !engine || !containerRef.current) return;

      const badgeElem = badgeElementsRef.current.get(newBadge.id);
      if (!badgeElem) return;

      const rect = badgeElem.getBoundingClientRect();
      const contRect = containerRef.current.getBoundingClientRect();
      const width = rect.width || 170;
      const height = rect.height || 44;

      const startX = Math.random() * (contRect.width - 200) + 100;
      const startY = 30;

      const body = Matter.Bodies.rectangle(startX, startY, width, height, {
        chamfer: { radius: 20 },
        restitution: 0.85,
        friction: 0.08,
        frictionAir: 0.03,
        density: 0.001
      });

      Matter.Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * 0.03,
        y: 0.02
      });

      Matter.Composite.add(engine.world, body);
      bodiesRef.current.set(newBadge.id, body);
    }, 100);
  };

  // Trigger explosive shake
  const shakeBadges = () => {
    const Matter = matterRef.current;
    if (!Matter) return;
    bodiesRef.current.forEach((body) => {
      Matter.Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * 0.08,
        y: -0.06 - Math.random() * 0.05
      });
    });
  };

  // Toggle Gravity
  const toggleGravity = () => {
    if (!engineRef.current) return;
    const next = !isZeroGravity;
    setIsZeroGravity(next);
    engineRef.current.gravity.y = next ? -0.05 : 0.45;
  };

  // Initialize Matter.js physics
  useEffect(() => {
    let isCancelled = false;

    loadMatterJS().then((Matter) => {
      if (isCancelled || !containerRef.current) return;
      matterRef.current = Matter;

      const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Body } = Matter;

      const container = containerRef.current;
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 480;

      // 1. Create Engine
      const engine = Engine.create({
        gravity: { x: 0, y: 0.45, scale: 0.001 }
      });
      engineRef.current = engine;

      // 2. Add static boundary walls
      const wallThickness = 100;
      const ground = Bodies.rectangle(width / 2, height + wallThickness / 2 - 10, width * 2, wallThickness, { isStatic: true });
      const ceiling = Bodies.rectangle(width / 2, -wallThickness / 2 + 5, width * 2, wallThickness, { isStatic: true });
      const leftWall = Bodies.rectangle(-wallThickness / 2 + 5, height / 2, wallThickness, height * 2, { isStatic: true });
      const rightWall = Bodies.rectangle(width + wallThickness / 2 - 5, height / 2, wallThickness, height * 2, { isStatic: true });

      Composite.add(engine.world, [ground, ceiling, leftWall, rightWall]);

      // 3. Create bodies for each initial badge
      badges.forEach((b, idx) => {
        const badgeElem = badgeElementsRef.current.get(b.id);
        const w = badgeElem?.offsetWidth || 180;
        const h = badgeElem?.offsetHeight || 46;

        // Position staggered across the top area
        const cols = 4;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const posX = 70 + col * ((width - 140) / Math.max(cols - 1, 1)) + (Math.random() - 0.5) * 40;
        const posY = 50 + row * 80 + (Math.random() - 0.5) * 30;

        const body = Bodies.rectangle(posX, posY, w, h, {
          chamfer: { radius: 22 },
          restitution: 0.8,
          friction: 0.05,
          frictionAir: 0.02,
          density: 0.0015
        });

        // Slight initial rotational spin
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

        Composite.add(engine.world, body);
        bodiesRef.current.set(b.id, body);
      });

      // 4. Mouse and Touch Interaction
      const mouse = Mouse.create(container);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: { visible: false }
        }
      });
      Composite.add(engine.world, mouseConstraint);

      // Keep mouse in sync with scrolling/container bounds
      try {
        if (mouse && mouse.element && mouse.mousewheel) {
          mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
          mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
        }
      } catch (e) {
        // ignore
      }

      // 5. Update DOM badge positions on physics tick
      Events.on(engine, "afterUpdate", () => {
        bodiesRef.current.forEach((body, id) => {
          const elem = badgeElementsRef.current.get(id);
          if (!elem) return;

          const w = elem.offsetWidth;
          const h = elem.offsetHeight;
          const x = body.position.x - w / 2;
          const y = body.position.y - h / 2;
          const angle = body.angle;

          elem.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0px) rotate(${angle.toFixed(3)}rad)`;
        });
      });

      // 6. Start Runner
      const runner = Runner.create();
      runnerRef.current = runner;
      Runner.run(runner, engine);
      setPhysicsReady(true);

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current) return;
        const newW = containerRef.current.clientWidth;
        const newH = containerRef.current.clientHeight;
        Body.setPosition(ground, { x: newW / 2, y: newH + wallThickness / 2 - 10 });
        Body.setPosition(ceiling, { x: newW / 2, y: -wallThickness / 2 + 5 });
        Body.setPosition(rightWall, { x: newW + wallThickness / 2 - 5, y: newH / 2 });
      };
      window.addEventListener("resize", handleResize);

      cleanupPhysicsRef.current = () => {
        window.removeEventListener("resize", handleResize);
        try {
          Runner.stop(runner);
          Engine.clear(engine);
        } catch (e) {
          // ignore cleanup errors
        }
      };
    }).catch(console.error);

    return () => {
      isCancelled = true;
      if (cleanupPhysicsRef.current) {
        cleanupPhysicsRef.current();
        cleanupPhysicsRef.current = null;
      }
    };
  }, []);

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "coffee": return <Volume2 className="size-3.5 text-amber-400" />;
      case "udhar": return <ArrowDownLeft className="size-3.5 text-rose-400" />;
      case "jama": return <ArrowUpRight className="size-3.5 text-cyan-400" />;
      case "receipt": return <Receipt className="size-3.5 text-cyan-400" />;
      case "income": return <TrendingUp className="size-3.5 text-sky-400" />;
      case "fuel": return <Sparkles className="size-3.5 text-blue-400" />;
      case "store": return <Store className="size-3.5 text-orange-400" />;
      default: return <Sparkles className="size-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-full max-w-2xl rounded-full bg-rose-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 right-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-[100px]" />

      {/* Header bar */}
      <div className="relative z-20 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-0.5 text-xs font-medium text-rose-400 border border-rose-500/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
              </span>
              Matter.js Interactive Physics
            </span>
            <span className="text-xs text-neutral-400">Grab, throw & collide badges!</span>
          </div>
          <h3 className="mt-1 text-lg font-semibold text-white tracking-tight">
            🎙️ Voice & Khata Live Physics Playground
          </h3>
        </div>

        {/* Physics controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={shakeBadges}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-200 transition-all hover:bg-white/10 hover:text-white"
            title="Explosive impulse"
          >
            <RefreshCw className="size-3" />
            Shake All
          </button>
          <button
            onClick={toggleGravity}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              isZeroGravity 
                ? "border-purple-500/40 bg-purple-500/20 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]" 
                : "border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10"
            }`}
          >
            <Compass className="size-3" />
            {isZeroGravity ? "Floating Mode" : "Normal Gravity"}
          </button>
        </div>
      </div>

      {/* Main Physics Arena */}
      <div 
        ref={containerRef}
        className="relative h-[380px] sm:h-[420px] w-full select-none overflow-hidden rounded-2xl border border-white/5 bg-neutral-950/60 p-2 shadow-inner"
        style={{ touchAction: "none" }}
      >
        {/* Subtle grid pattern background */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Center prompt watermark */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center opacity-25">
          <Mic className="size-16 text-white mb-2 animate-pulse" />
          <p className="text-sm font-medium text-white tracking-wider uppercase">
            Speak • Drag • Toss Any Voice Badge
          </p>
          <p className="text-xs text-neutral-400">Physics powered by Matter.js rigid-body collision</p>
        </div>

        {/* Badges rendered as DOM elements driven by Matter.js coordinates */}
        {badges.map((b) => (
          <div
            key={b.id}
            ref={(el) => {
              if (el) badgeElementsRef.current.set(b.id, el);
              else badgeElementsRef.current.delete(b.id);
            }}
            onClick={() => playBadgeSound(b)}
            className={`absolute top-0 left-0 cursor-grab active:cursor-grabbing will-change-transform z-10 
              flex items-center gap-2.5 rounded-full border px-3.5 py-2 text-xs font-medium 
              backdrop-blur-md shadow-lg transition-colors duration-200 select-none
              ${b.colorClass} ${b.borderClass} ${b.glowClass} hover:brightness-125`}
            style={{
              transform: physicsReady ? undefined : `translate3d(${(badges.indexOf(b) % 4) * 190 + 20}px, ${Math.floor(badges.indexOf(b) / 4) * 75 + 20}px, 0)`
            }}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/40 border border-white/10 shrink-0">
              {renderBadgeIcon(b.icon)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-semibold text-white tracking-tight">{b.title}</span>
                {b.amount && (
                  <span className="rounded bg-black/30 px-1 py-0.5 text-[11px] font-mono font-bold text-cyan-400">
                    {b.amount}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-neutral-400 leading-tight mt-0.5 flex items-center gap-1">
                {b.tag}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive voice prompt bar & Selected Badge Inspector */}
      <div className="relative z-20 mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {/* Quick Voice Entry Input */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-neutral-900/90 p-1.5 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
            <Mic className="size-4 animate-pulse" />
          </div>
          <input
            type="text"
            value={customPhrase}
            onChange={(e) => setCustomPhrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNewBadge()}
            placeholder="Type or simulate speech: e.g., 'Groceries 350'"
            className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
          <button
            onClick={() => addNewBadge()}
            className="flex items-center gap-1 shrink-0 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-rose-500 active:scale-95 shadow-md"
          >
            <Plus className="size-3" />
            Drop In
          </button>
        </div>

        {/* Selected Badge Audio / NLP Preview */}
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-neutral-900/90 p-2 px-4 text-xs">
          {selectedBadge ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <CheckCircle2 className="size-4 text-cyan-400 shrink-0" />
              <div className="truncate">
                <p className="font-medium text-white truncate">
                  AI Parsed: <span className="text-cyan-300">{selectedBadge.spokenPhrase}</span>
                </p>
                <p className="text-[11px] text-neutral-400">
                  {selectedBadge.tag} • Recorded to VoiceKhata Ledger
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-neutral-400">
              <Volume2 className="size-4 text-neutral-500" />
              <span>Click any badge to hear audio & preview AI NLP parsing</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FloatingVoiceBadgesPhysics;
