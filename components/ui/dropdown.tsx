import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Dropdown({ trigger, children, className = "" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative z-20 ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden z-50"
        >
          <div className="p-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  onClick: () => void;
  className?: string;
  children: ReactNode;
}

export function DropdownItem({ onClick, className = "", children }: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left px-3 py-2.5 sm:py-3 text-sm rounded-md cursor-pointer hover:bg-white/10 border transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
