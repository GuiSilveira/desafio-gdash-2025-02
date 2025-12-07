import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Alternar tema"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <SwitchPrimitive.Root
      checked={isDark}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      aria-label="Alternar tema"
      className={cn(
        "relative inline-flex h-9 w-18 shrink-0 cursor-pointer items-center rounded-full p-1",
        "bg-slate-100 dark:bg-slate-800",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "transition-colors duration-300",
      )}
    >
      {/* Sun icon - left side */}
      <Sun
        className="absolute left-2.5 h-4 w-4 text-slate-400 dark:text-slate-500 transition-colors"
        strokeWidth={2}
      />
      {/* Moon icon - right side */}
      <Moon
        className="absolute right-2.5 h-4 w-4 text-slate-400 dark:text-slate-300 transition-colors"
        strokeWidth={2}
      />
      {/* Thumb */}
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-7 w-7 rounded-full bg-white shadow-lg ring-0",
          "transition-transform duration-300 ease-in-out",
          "data-[state=checked]:translate-x-[2.05rem] data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
