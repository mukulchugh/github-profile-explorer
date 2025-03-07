import { cn } from "@/lib/utils";
import React from "react";

const LoadingState: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="glass rounded-2xl p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-secondary animate-pulse-soft"></div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-secondary rounded-lg w-1/3 animate-pulse-soft"></div>
            <div className="h-4 bg-secondary rounded-lg w-2/3 animate-pulse-soft"></div>
          </div>

          <div className="space-y-2">
            <div className="h-4 bg-secondary rounded-lg w-1/4 animate-pulse-soft"></div>
            <div className="h-4 bg-secondary rounded-lg w-1/3 animate-pulse-soft"></div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="h-8 bg-secondary rounded-full w-24 animate-pulse-soft"></div>
            <div className="h-8 bg-secondary rounded-full w-28 animate-pulse-soft"></div>
            <div className="h-8 bg-secondary rounded-full w-20 animate-pulse-soft"></div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="h-8 bg-secondary rounded-lg w-40 animate-pulse-soft mb-4"></div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn("glass rounded-xl p-5", "animate-pulse-soft")}
            >
              <div className="space-y-4">
                <div className="h-5 bg-secondary rounded-lg w-1/3"></div>
                <div className="h-4 bg-secondary rounded-lg w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-4 bg-secondary rounded-lg w-16"></div>
                  <div className="h-4 bg-secondary rounded-lg w-20"></div>
                  <div className="h-4 bg-secondary rounded-lg w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
