import { Navigation } from "@/components/navigation";
import { Input } from "@/components/ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { IconEye, IconGitCompare, IconHistory, IconSearch } from "@tabler/icons-react";
import * as React from "react";

export function Home() {
  const defaultLayout = [10, 35, 55];
  const defaultCollapsed = false;
  const navCollapsedSize = 5;
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

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
            defaultSize={defaultLayout[0]}
            collapsedSize={navCollapsedSize}
            collapsible={true}
            minSize={15}
            maxSize={20}
            onCollapse={() => {
              setIsCollapsed(true);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
            }}
            onResize={() => {
              setIsCollapsed(false);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
            }}
            className={cn("flex flex-col", isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out")}
          >
            <div className="flex h-[52px] items-center justify-center px-2">
              <h1 className="text-xl font-bold">{isCollapsed ? "GB" : "GitBook"}</h1>
            </div>
            <Separator />
            <div className="flex-1 overflow-y-auto">
              <Navigation
                isCollapsed={isCollapsed}
                links={[
                  {
                    title: "Watch List",
                    icon: IconEye,
                    variant: "default",
                  },
                  {
                    title: "Search History",
                    icon: IconHistory,
                    variant: "ghost",
                  },
                  {
                    title: "Compare",
                    icon: IconGitCompare,
                    variant: "ghost",
                  },
                ]}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={defaultLayout[1]} minSize={30} className="flex flex-col">
            <Tabs defaultValue="all" className="flex flex-col h-full">
              <div className="flex h-[52px] items-center justify-center">
                <h1 className="text-xl font-bold">Search Profile</h1>
              </div>
              <Separator />
              <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-1 overflow-auto">
                {/* Search form + Found Profiles + Recent Searches + AutoComplete of Search  + use Command component ui for the search bar */}
                <form>
                  <div className="relative">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-8" />
                  </div>
                </form>
              </div>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={defaultLayout[2]} minSize={30} className="flex flex-col">
            {/* Profile Tabs Section */}
            <div className="flex h-[52px] items-center justify-center">
              {/* Toolbar which will have profile menu and actions */}
            </div>
            <Separator />
            <div className="flex-1 overflow-auto p-4">
              <div className="rounded-lg border border-dashed h-full flex items-center justify-center">
                <p className="text-muted-foreground">Select a profile to view details</p>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
}
