import { CompareResults } from "@/components/compare-results";
import { CompareSection } from "@/components/compare-section";
import { ErrorBoundary } from "@/components/error-boundary";
import { HistorySection } from "@/components/history-section";
import { Navigation } from "@/components/navigation";
import { ProfileDetails } from "@/components/profile-details";
import { SearchSection } from "@/components/search-section";
import { Card } from "@/components/ui/card";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WatchlistSection } from "@/components/watchlist-section";
import { useGitHubSearch } from "@/hooks/use-github-search";
import { useMobile } from "@/hooks/use-mobile";
import { useSearchHistory } from "@/hooks/use-search-history";
import { ViewControlProvider, useViewControl } from "@/hooks/use-view-control";
import { cn } from "@/lib/utils";
import {
  IconArrowLeft,
  IconBrandGithub,
  IconEye,
  IconGitCompare,
  IconHistory,
  IconSearch,
} from "@tabler/icons-react";
import * as React from "react";
import { toast } from "sonner";

const viewSizes = {
  first: { defaultSize: 5, minSize: 5, maxSize: 5 },
  second: { defaultSize: 30, minSize: 0, maxSize: 30 },
  third: { defaultSize: 75, minSize: 0 },
};

function HomeContent() {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const isMobile = useMobile();
  const { activeView, setActiveView, setCompareUsernames } = useViewControl();

  const [selectedUsername, setSelectedUsername] = React.useState<string | undefined>();

  const { addToHistory } = useSearchHistory();

  const { getUserDetails } = useGitHubSearch({
    username: selectedUsername,
    enabled: !!selectedUsername,
  });

  const handleNavLinkClick = (view: string) => {
    if (
      view !== "compare" &&
      view !== "mobileCompareResult" &&
      activeView !== view &&
      (activeView === "compare" || activeView === "mobileCompareResult")
    ) {
      setCompareUsernames([]);
    }

    if (view !== "profile" && view !== "mobileCompareResult") {
      setSelectedUsername(undefined);
    }

    setActiveView(
      view as "search" | "watchlist" | "history" | "compare" | "profile" | "mobileCompareResult"
    );
  };

  const handleSelectUser = (username: string) => {
    if (!username) return;
    setSelectedUsername(username);
    addToHistory(username);
    if (isMobile) {
      setActiveView("profile");
    }
  };

  const handleBackToSearch = () => {
    if (isMobile) {
      if (activeView === "mobileCompareResult") {
        setActiveView("compare");
      } else if (activeView === "profile") {
        setActiveView("search");
      }
    }
  };

  const handleCompare = () => {
    if (isMobile) {
      setActiveView("mobileCompareResult");
    } else {
      setActiveView("compare");
    }
  };

  const renderMiddleContent = () => {
    switch (activeView) {
      case "watchlist":
        return <WatchlistSection onSelectUser={handleSelectUser} />;
      case "history":
        return <HistorySection onSelectUser={handleSelectUser} />;
      case "compare":
        return <CompareSection onCompare={handleCompare} />;
      case "profile":
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center p-2 justify-between">
              <button
                onClick={handleBackToSearch}
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <IconArrowLeft className="mr-1 h-4 w-4" />
                Back
              </button>
              <h2 className="text-lg font-semibold">Profile</h2>
              <div className="w-10"></div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ProfileDetails
                username={selectedUsername}
                userDetails={getUserDetails.data}
                isLoading={getUserDetails.isLoading}
                onSelectUser={handleSelectUser}
              />
            </div>
          </div>
        );
      case "mobileCompareResult":
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center p-2 justify-between">
              <button
                onClick={handleBackToSearch}
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <IconArrowLeft className="mr-1 h-4 w-4" />
                Back
              </button>
              <h2 className="text-lg font-semibold">Comparison Results</h2>
              <div className="w-10"></div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CompareResults />
            </div>
          </div>
        );
      case "search":
      default:
        return <SearchSection onSelectUser={handleSelectUser} />;
    }
  };

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
        {isMobile ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-2 border-b">
              <span className="flex items-center gap-2 text-lg font-bold">
                <IconBrandGithub className="h-8 w-8" /> GitBook
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleNavLinkClick("search")}
                  className={`p-2 rounded-md ${
                    activeView === "search" || activeView === "profile"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <IconSearch className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleNavLinkClick("compare")}
                  className={`p-2 rounded-md ${
                    activeView === "compare" || activeView === "mobileCompareResult"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                  aria-label="Compare GitHub profiles"
                >
                  <IconGitCompare className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleNavLinkClick("watchlist")}
                  className={`p-2 rounded-md ${
                    activeView === "watchlist"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <IconEye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleNavLinkClick("history")}
                  className={`p-2 rounded-md ${
                    activeView === "history"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <IconHistory className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden px-4 py-4">{renderMiddleContent()}</div>
          </div>
        ) : (
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
                <IconBrandGithub className="h-12 w-12 p-2 mb-1 " />
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
            <ResizablePanel {...viewSizes.third} className="flex flex-col ">
              <div className="flex h-[52px] items-center justify-center">
                <h1 className="text-xl font-bold">
                  {activeView === "compare" ? "Comparison Results" : "Profile"}
                </h1>
              </div>
              <Separator />
              <div className={cn("flex-1 overflow-auto p-4", "dark:bg-zinc-950", "bg-zinc-50")}>
                {renderRightContent()}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
      <Footer />
    </TooltipProvider>
  );
}

const Footer = () => {
  return (
    <Card className="flex justify-between items-center px-6 py-4 bg-card rounded-none !border-t border-border border-b-0 border-l-0 border-r-0">
      <p>
        built with ❤️ by
        <a href="https://mukulchugh.com" className="text-primary ml-1 hover:underline">
          Mukul Chugh
        </a>
      </p>
      <p>
        <a
          href="https://github.com/mukulchugh/github-profile-explorer"
          className="text-primary ml-1 flex items-center gap-1 hover:underline "
        >
          <IconBrandGithub className="h-4 w-4 " />
          View Source Code
        </a>
      </p>
    </Card>
  );
};

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
