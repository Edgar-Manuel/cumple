
import { cn } from "@/lib/utils";

export type AnimationVariant = 
  | "fade-in" 
  | "slide-up" 
  | "slide-down"
  | "float"
  | "pulse-subtle";

export type AnimationDelay = "none" | "short" | "medium" | "long";

export interface AnimationProps {
  variant?: AnimationVariant;
  delay?: AnimationDelay;
  className?: string;
}

export const getAnimationClasses = ({ 
  variant = "fade-in", 
  delay = "none", 
  className = "" 
}: AnimationProps) => {
  const baseClass = `animate-${variant}`;
  
  const delayClass = delay === "none" 
    ? "" 
    : delay === "short" 
      ? "animation-delay-100" 
      : delay === "medium" 
        ? "animation-delay-300" 
        : "animation-delay-500";
  
  return cn(
    baseClass,
    delayClass,
    className
  );
};

export const delayClassNames = {
  "item-1": "animation-delay-0",
  "item-2": "animation-delay-100",
  "item-3": "animation-delay-200",
  "item-4": "animation-delay-300",
  "item-5": "animation-delay-400",
  "item-6": "animation-delay-500",
  "item-7": "animation-delay-600",
  "item-8": "animation-delay-700",
  "item-9": "animation-delay-800",
  "item-10": "animation-delay-900",
};

// Add to global CSS
document.documentElement.style.setProperty('--animation-delay-100', '100ms');
document.documentElement.style.setProperty('--animation-delay-200', '200ms');
document.documentElement.style.setProperty('--animation-delay-300', '300ms');
document.documentElement.style.setProperty('--animation-delay-400', '400ms');
document.documentElement.style.setProperty('--animation-delay-500', '500ms');
document.documentElement.style.setProperty('--animation-delay-600', '600ms');
document.documentElement.style.setProperty('--animation-delay-700', '700ms');
document.documentElement.style.setProperty('--animation-delay-800', '800ms');
document.documentElement.style.setProperty('--animation-delay-900', '900ms');
