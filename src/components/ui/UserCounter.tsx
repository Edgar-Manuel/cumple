import { useUserCount } from "@/hooks/useUserCount";
import { cn } from "@/lib/utils";

interface UserCounterProps {
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Componente que muestra el número actual de usuarios activos
 */
export function UserCounter({ prefix = "", suffix = "usuarios activos", className }: UserCounterProps) {
  const count = useUserCount();
  
  return (
    <span className={cn("whitespace-nowrap", className)}>
      {prefix}
      <span className="font-semibold">{count.toLocaleString()}</span>
      {suffix && ` ${suffix}`}
    </span>
  );
} 