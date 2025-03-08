import logo from "@/assets/logo.svg";
import { ErrorBoundary } from "@/components/error-boundary";
import { Navigation } from "@/components/navigation";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { CompareResults } from "@/components/compare-results";
import { CompareSection } from "@/components/compare-section";
import { HistorySection } from "@/components/history-section";
import { ProfileDetails } from "@/components/profile-details";
import { SearchSection } from "@/components/search-section";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WatchlistSection } from "@/components/watchlist-section";
import { useGitHubSearch } from "@/hooks/use-github-search";
import { useSearchHistory } from "@/hooks/use-search-history";
import { ViewControlProvider, useViewControl } from "@/hooks/use-view-control";
import { IconEye, IconGitCompare, IconHistory, IconSearch } from "@tabler/icons-react";
import * as React from "react";
import { toast } from "sonner";

const viewSizes = {
  first: { defaultSize: 5, minSize: 5, maxSize: 5 },
  second: { defaultSize: 30, minSize: 0, maxSize: 30 },
  third: { defaultSize: 75, minSize: 0 },
};

function HomeContent() {
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  // View control state
  const { activeView, setActiveView } = useViewControl();

  // Add state for selected username and search query
  const [selectedUsername, setSelectedUsername] = React.useState<string | undefined>();

  // Use search history hook directly
  const { addToHistory } = useSearchHistory();

  // Use GitHub search hook for user details
  const { getUserDetails } = useGitHubSearch({
    username: selectedUsername,
    enabled: !!selectedUsername,
  });

  // Handle navigation link click
  const handleNavLinkClick = (view: string) => {
    setActiveView(view as "search" | "watchlist" | "history" | "compare");
  };

  // Handle user selection
  const handleSelectUser = (username: string) => {
    if (!username) return;
    setSelectedUsername(username);
    addToHistory(username);
  };

  // Handle comparison submission
  const handleCompare = () => {
    setActiveView("compare");
  };

  // Render the middle content based on the active view
  const renderMiddleContent = () => {
    switch (activeView) {
      case "watchlist":
        return <WatchlistSection onSelectUser={handleSelectUser} />;
      case "history":
        return <HistorySection onSelectUser={handleSelectUser} />;
      case "compare":
        return <CompareSection onCompare={handleCompare} />;
      case "search":
      default:
        return <SearchSection onSelectUser={handleSelectUser} />;
    }
  };

  // Render the right content based on the active view
  const renderRightContent = () => {
    if (activeView === "compare") {
      return <CompareResults />;
    }
    return (
      <ProfileDetails
        username={selectedUsername}
        userDetails={getUserDetails.data}
        isLoading={getUserDetails.isLoading}
        onSelectUser={handleSelectUser}
      />
    );
  };

  React.useEffect(() => {
    if (!isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isCollapsed]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes) => {
            document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(sizes)}`;
          }}
          className="h-full w-full flex-1"
        >
          <ResizablePanel
            {...viewSizes.first}
            collapsible={false}
            className={cn(
              "flex flex-col min-w-[50px] transition-all duration-300 ease-in-out",
              isCollapsed ? "min-w-[50px]" : "min-w-[70px]"
            )}
          >
            <div className="flex items-center justify-center  w-full h-auto">
              <img src={logo} alt="Logo" className="h-12 w-12 p-2 mb-1" />
            </div>

            <Separator />
            <div className="flex-1 overflow-y-auto">
              <Navigation
                isCollapsed={true}
                links={[
                  {
                    title: "Search",
                    icon: IconSearch,
                    variant: activeView === "search" ? "default" : "ghost",
                    onClick: () => handleNavLinkClick("search"),
                  },
                  {
                    title: "Compare",
                    icon: IconGitCompare,
                    variant: activeView === "compare" ? "default" : "ghost",
                    onClick: () => handleNavLinkClick("compare"),
                  },
                  {
                    title: "Watch List",
                    icon: IconEye,
                    variant: activeView === "watchlist" ? "default" : "ghost",
                    onClick: () => handleNavLinkClick("watchlist"),
                  },
                  {
                    title: "Search History",
                    icon: IconHistory,
                    variant: activeView === "history" ? "default" : "ghost",
                    onClick: () => handleNavLinkClick("history"),
                  },
                ]}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel {...viewSizes.second} collapsible={true} className="flex flex-col">
            <Tabs defaultValue="all" className="flex flex-col h-full">
              <div className="flex h-auto w-full items-center justify-center">
                <h1 className="text-xl font-bold mt-3 mb-1">
                  {activeView === "watchlist"
                    ? "Watch List"
                    : activeView === "history"
                      ? "Search History"
                      : activeView === "compare"
                        ? "Compare Profiles"
                        : "GitHub Profile Explorer"}
                </h1>
              </div>
              <Separator />
              <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-1 overflow-auto">
                {renderMiddleContent()}
              </div>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel {...viewSizes.third} className="flex flex-col">
            <div className="flex h-[52px] items-center justify-center">
              <h1 className="text-xl font-bold">
                {activeView === "compare" ? "Comparison Results" : "Profile Details"}
              </h1>
            </div>
            <Separator />
            <div className="flex-1 overflow-auto p-4">{renderRightContent()}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
}

export function Home() {
  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error("Home component error:", error, errorInfo);
    toast.error("Application Error", {
      description:
        "Something went wrong. Please try again or contact support if the issue persists.",
    });
  }, []);

  return (
    <ErrorBoundary onError={handleError}>
      <ViewControlProvider>
        <HomeContent />
      </ViewControlProvider>
    </ErrorBoundary>
  );
}
