import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui/spinner";

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
          <span className="flex items-center gap-2">
            <Spinner size="small" />
            Loading...
          </span>
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
}
