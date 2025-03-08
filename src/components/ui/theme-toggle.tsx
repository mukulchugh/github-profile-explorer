import { cn } from "@/lib/utils";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { buttonVariants } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          onClick={toggleTheme}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-9 w-9",
            "dark:text-white dark:hover:text-white"
          )}
        >
          {theme === "dark" ? <IconSun className="h-6 w-6" /> : <IconMoon className="h-6 w-6" />}
          <span className="sr-only">Toggle theme</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-4">
        Toggle theme
      </TooltipContent>
    </Tooltip>
  );
}
