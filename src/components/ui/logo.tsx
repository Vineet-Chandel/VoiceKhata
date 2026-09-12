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
  const iconClasses = {
    sm: "size-5",
    md: "size-7",
    lg: "size-9",
  };

  const boxClasses = {
    sm: "size-7 p-1 rounded-[6px]",
    md: "size-9 p-1.5 rounded-[8px]",
    lg: "size-12 p-2 rounded-[10px]",
  };

  const textSizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`flex items-center justify-center bg-[#1E293B] border border-[#334155] shadow-xs ${boxClasses[size]}`}>
        <img
          src={logo}
          alt="VoiceKhata Logo"
          className={`${iconClasses[size]} object-contain invert brightness-125`}
        />
      </div>
      {showText && (
        <span
          className={`font-bold tracking-tight text-[#F8FAFC] font-sans ${textSizeClasses[size]}`}
        >
          Voice<span className="text-[#818CF8]">Khata</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
