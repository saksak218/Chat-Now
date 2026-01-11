"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, ChevronDown } from "lucide-react";
import { MODELS, getStoredModel, setStoredModel } from "@/lib/utils/model";

export type AIModel = "gemini" | "deepseek" | "mistral";

interface ModelSelectorProps {
  onModelChange?: (model: AIModel) => void;
}

export default function ModelSelector({ onModelChange }: ModelSelectorProps) {
  const [currentModel, setCurrentModel] = useState<AIModel>("mistral");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCurrentModel(getStoredModel());
    
    // Listen for storage changes (in case model is changed elsewhere)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ai-model" && e.newValue) {
        setCurrentModel(e.newValue as AIModel);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Only close if clicking outside both dropdown and button
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleModelChange = (model: AIModel) => {
    console.log("ModelSelector: handleModelChange called with", model);
    setIsOpen(false);
    setStoredModel(model);
    setCurrentModel(model);
    console.log("ModelSelector: calling onModelChange callback with", model);
    onModelChange?.(model as any);
  };

  return (
    <div className="relative z-20">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Main button clicked, toggling dropdown");
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        title="Change AI Model"
      >
        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline text-xs">{MODELS[currentModel].name}</span>
        <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden z-50"
        >
          <div className="p-1">
            {(Object.keys(MODELS) as AIModel[]).map((model) => (
              <button
                key={model}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Button clicked for model:", model);
                  handleModelChange(model);
                }}
                className={`w-full text-left px-3 py-2.5 sm:py-3 text-sm rounded-md cursor-pointer hover:bg-white/10 border transition-colors ${
                  currentModel === model
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "text-slate-300 hover:text-white border-transparent"
                }`}
              >
                <div className="font-medium text-sm">{MODELS[model].name}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">{MODELS[model].model}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}