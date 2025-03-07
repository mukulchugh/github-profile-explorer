import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import RepoList from "@/components/RepoList";
import SearchBar from "@/components/SearchBar";
import UserProfile from "@/components/UserProfile";
import { useGitHubUser } from "@/hooks/useGitHubUser";
import { IconBrandGithub } from "@tabler/icons-react";

const Index = () => {
  const {
    user,
    repos,
    isLoading,
    error,
    hasMore,
    searchPerformed,
    searchUser,
    loadMoreRepos,
    resetSearch,
  } = useGitHubUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
          {/* Left - Search Section */}
          <div className="lg:col-span-4 p-6 border-r border-border lg:h-screen lg:sticky lg:top-0 flex flex-col">
            <div className="flex flex-col h-full max-w-sm mx-auto w-full">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <IconBrandGithub className="h-8 w-8" />
                  <h1 className="text-3xl font-bold font-sans">GitBook</h1>
                </div>
                <p className="text-muted-foreground text-balance">
                  Search for GitHub users and explore their profiles and
                  repositories in a beautiful interface.
                </p>
              </div>

              {/* Search Bar */}
              <SearchBar onSearch={searchUser} isLoading={isLoading} />

              {/* Search instructions || Empty State */}
              {!searchPerformed && (
                <div className="mt-auto flex flex-col items-center text-center p-4">
                  <IconBrandGithub className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-muted-foreground">
                    Enter a GitHub username above to view their profile and
                    repositories.
                  </p>
                </div>
              )}

              {/* Footer */}
              <footer className="mt-auto pt-6 text-center text-sm text-muted-foreground">
                <p>
                  Curated with ❤️ by{" "}
                  <a
                    href="https://mukulchugh.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Mukul Chugh
                  </a>
                </p>
              </footer>
            </div>
          </div>

          {/* Right Column - Results Section */}
          <div className="lg:col-span-8 lg:overflow-y-auto lg:h-screen">
            <div className="p-6 max-w-4xl mx-auto">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );

  function renderContent() {
    if (isLoading && !user) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} onReset={resetSearch} />;
    }

    if (user) {
      return (
        <>
          <div className="mb-8">
            <UserProfile user={user} />
          </div>
          <RepoList
            repos={repos}
            isLoading={isLoading}
            onLoadMore={loadMoreRepos}
            hasMore={hasMore}
          />
        </>
      );
    }

    if (searchPerformed) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No results found. Try a different username.
          </p>
        </div>
      );
    }

    return (
      <div className="hidden lg:flex items-center justify-center h-full">
        <p className="text-muted-foreground text-xl">
          Results will appear here
        </p>
      </div>
    );
  }
};

export default Index;
