import logo from "@/assets/logo.svg";
import { Navigation } from "@/components/navigation";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { TooltipProvider } from "@/components/ui/tooltip";
import { CompareResults } from "@/components/view-sections/compare-results";
import { CompareSection } from "@/components/view-sections/compare-section";
import { HistorySection } from "@/components/view-sections/history-section";
import { ProfileDetails } from "@/components/view-sections/profile-details";
import { SearchSection } from "@/components/view-sections/search-section";
import { WatchlistSection } from "@/components/view-sections/watchlist-section";
import { useGitHubSearch } from "@/hooks/use-github-search";
import { ViewControlProvider, useViewControl } from "@/hooks/use-view-control";
import { IconEye, IconGitCompare, IconHistory, IconSearch } from "@tabler/icons-react";
import * as React from "react";

function HomeContent() {
  // Configuration for the resizable panels
  const defaultLayout = [15, 35, 50];
  const navCollapsedSize = 5;

  // Always start with collapsed sidebar
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  // View control state
  const { activeView, setActiveView } = useViewControl();

  // Add state for selected username and search query
  const [selectedUsername, setSelectedUsername] = React.useState<string | undefined>();
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Use GitHub search hook for user details
  const { getUserDetails, addToHistory } = useGitHubSearch({
    username: selectedUsername,
    enabled: !!selectedUsername,
  });

  // Handle navigation link click
  const handleNavLinkClick = (view: string) => {
    setActiveView(view as any);
  };

  // Handle search submission (from SearchSection)
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // If we're not already in search view, switch to it
    if (activeView !== "search") {
      setActiveView("search");
    }
  };

  // Handle user selection
  const handleSelectUser = (username: string) => {
    if (!username) return;

    setSelectedUsername(username);
    addToHistory(username);
  };

  // Handle comparison submission
  const handleCompare = (usernames: string[]) => {
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
        return <SearchSection initialQuery={searchQuery} onSelectUser={handleSelectUser} />;
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

  // Keep the navigation column collapsed
  React.useEffect(() => {
    if (!isCollapsed) {
      // If it's not collapsed, force it to be collapsed
      setIsCollapsed(true);
    }
  }, [isCollapsed]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(sizes)}`;
          }}
          className="h-full w-full flex-1"
        >
          <ResizablePanel
            defaultSize={navCollapsedSize}
            collapsedSize={navCollapsedSize}
            collapsible={true}
            minSize={navCollapsedSize}
            maxSize={navCollapsedSize}
            defaultCollapsed={true}
            onCollapse={() => {
              setIsCollapsed(true);
            }}
            onExpand={() => {
              // Force it back to collapsed state
              setTimeout(() => setIsCollapsed(true), 0);
            }}
            className={cn("flex flex-col min-w-[50px] transition-all duration-300 ease-in-out")}
          >
            <img src={logo} alt="Logo" className="h-8 w-8" />

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
          <ResizablePanel defaultSize={40} minSize={30} className="flex flex-col">
            <Tabs defaultValue="all" className="flex flex-col h-full">
              <div className="flex h-[44px] items-center justify-center">
                <h1 className="text-xl font-bold">
                  {activeView === "watchlist"
                    ? "Watch List"
                    : activeView === "history"
                      ? "Search History"
                      : activeView === "compare"
                        ? "Compare Profiles"
                        : "Search Profile"}
                </h1>
              </div>
              <Separator />
              <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-1 overflow-auto">
                {renderMiddleContent()}
              </div>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={55} minSize={30} className="flex flex-col">
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
  return (
    <ViewControlProvider>
      <HomeContent />
    </ViewControlProvider>
  );
}
