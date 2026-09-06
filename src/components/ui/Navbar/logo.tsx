import logo from "@/assets/logo.png";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({
  className = "",
  showText = true,
  size = "md",
}: LogoProps) => {
  const sizeClasses = {
    sm: "h-5",
    md: "h-8",   // FIX: was h-10, now h-8 (~2px smaller feel)
    lg: "h-14",
  };

  const textSizeClasses = {
    sm: "text-base",
    md: "text-xl",  // FIX: was text-2xl, matches smaller icon
    lg: "text-3xl",
  };

  return (
    // FIX: className is now applied to the wrapper so it can override sizing
    <div className={`flex items-center gap-1.5 ${className}`}>
      <img
        src={logo}
        alt="VoiceKhata Logo"
        className={`${sizeClasses[size]} w-auto object-contain dark:invert`}
      />
      {showText && (
        <span
          className={`font-bold tracking-[-0.03em] text-black dark:text-text-primary ${textSizeClasses[size]}`}
        >
          Fin<span className="font-semibold opacity-60">Ease</span>
        </span>
      )}
    </div>
  );
};

export default Logo;