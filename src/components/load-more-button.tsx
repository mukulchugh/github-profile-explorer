import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconLoader2 } from "@tabler/icons-react";

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasMore: boolean;
  className?: string;
}

export function LoadMoreButton({ onClick, isLoading, hasMore, className }: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className={cn("flex justify-center py-4", className)}>
      <Button variant="outline" onClick={onClick} disabled={isLoading} className="min-w-[120px]">
        {isLoading ? (
          <>
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
}
