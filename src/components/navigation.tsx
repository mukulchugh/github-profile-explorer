import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TablerIcon } from "@tabler/icons-react";
import { buttonVariants } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: TablerIcon;
    variant: "default" | "ghost";
    onClick?: () => void;
  }[];
}

export function Navigation({ links, isCollapsed }: NavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => (
          <Tooltip key={index} delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={link.onClick}
                className={cn(
                  buttonVariants({ variant: link.variant, size: "icon" }),
                  "h-9 w-9",
                  link.variant === "default" &&
                    "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                )}
              >
                <link.icon className="h-6 w-6" />
                <span className="sr-only">{link.title}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-4">
              {link.title}
              {link.label && <span className="ml-auto text-muted-foreground">{link.label}</span>}
            </TooltipContent>
          </Tooltip>
        ))}
        <div className="mx-auto">
          <Separator className="mb-2" />
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
