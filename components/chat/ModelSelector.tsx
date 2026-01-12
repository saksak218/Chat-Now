"use client";

import { useState, useEffect } from "react";
import { Settings, ChevronDown } from "lucide-react";
import { MODELS, getStoredModel, setStoredModel, type AIModel } from "@/lib/utils/model";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";

interface ModelSelectorProps {
  onModelChange?: (model: AIModel) => void;
}

export default function ModelSelector({ onModelChange }: ModelSelectorProps) {
  const [currentModel, setCurrentModel] = useState<AIModel>("mistral");

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

  const handleModelChange = (model: AIModel) => {
    console.log("ModelSelector: handleModelChange called with", model);
    setStoredModel(model);
    setCurrentModel(model);
    console.log("ModelSelector: calling onModelChange callback with", model);
    onModelChange?.(model as any);
  };

  const trigger = (
    <button
      type="button"
      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
      title="Change AI Model"
    >
      <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span className="hidden sm:inline text-xs">{MODELS[currentModel].name}</span>
      <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform" />
    </button>
  );

  return (
    <Dropdown trigger={trigger}>
      {(Object.keys(MODELS) as AIModel[]).map((model) => (
        <DropdownItem
          key={model}
          onClick={() => {
            console.log("Model selected:", model);
            handleModelChange(model);
          }}
          className={
            currentModel === model
              ? "bg-primary/20 text-primary border-primary/30"
              : "text-slate-300 hover:text-white border-transparent"
          }
        >
          <div className="font-medium text-sm">{MODELS[model].name}</div>
          <div className="text-xs text-slate-500 mt-0.5 truncate">{MODELS[model].model}</div>
        </DropdownItem>
      ))}
    </Dropdown>
  );
}