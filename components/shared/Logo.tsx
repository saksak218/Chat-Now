import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-12 h-12 md:w-14 md:h-14",
  md: "w-16 h-16 md:w-20 md:h-20",
  lg: "w-24 h-24 md:w-32 md:h-32",
};

export default function Logo({ className = "", size = "md" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <div className={`logo-container ${sizeClasses[size]}`}>
        <Image
          src="/images/chat-now-logo.png"
          alt="Chat Now Logo"
          width={120}
          height={120}
          className="logo-image"
          priority
        />
      </div>
    </Link>
  );
}

