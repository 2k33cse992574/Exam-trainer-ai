import { useState, useEffect } from "react";

export interface UserContext {
  exam: string;
  target: string; // e.g., "2025" or "6 months"
}

const STORAGE_KEY = "user-context";
const ONBOARDED_KEY = "user-onboarded";

export function useUserContext() {
  const [context, setContext] = useState<UserContext | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const onboarded = localStorage.getItem(ONBOARDED_KEY);

    if (saved) {
      try {
        setContext(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved context", e);
      }
    }

    setHasOnboarded(!!onboarded);
    setIsLoading(false);
  }, []);

  const saveContext = (newContext: UserContext) => {
    setContext(newContext);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newContext));
    localStorage.setItem(ONBOARDED_KEY, "true");
    setHasOnboarded(true);
  };

  const updateContext = (newContext: Partial<UserContext>) => {
    if (!context) return;
    const updated = { ...context, ...newContext };
    saveContext(updated);
  };

  const resetContext = () => {
    setContext(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ONBOARDED_KEY);
    setHasOnboarded(false);
  };

  return {
    context,
    hasOnboarded,
    isLoading,
    saveContext,
    updateContext,
    resetContext,
  };
}
