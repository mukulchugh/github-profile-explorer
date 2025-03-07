import { GitHubUser } from "@/services/github";
import React from "react";

import { cn } from "@/lib/utils";
import {
  IconGitFork,
  IconLink,
  IconMapPin,
  IconStar,
  IconUsers,
} from "@tabler/icons-react";

interface UserProfileProps {
  user: GitHubUser;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="animate-slide-up w-full max-w-3xl mx-auto">
      <div className="glass rounded-2xl p-8 flex flex-col md:flex-row gap-8">
        {/* User Avatar */}
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-white/50 shadow-lg">
            <img
              src={user.avatar_url}
              alt={`${user.login}'s avatar`}
              className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-semibold flex flex-col md:flex-row md:items-center gap-2">
              {user.name || user.login}
              {user.name && (
                <span className="text-base text-muted-foreground font-normal">
                  @{user.login}
                </span>
              )}
            </h2>
            {user.bio && (
              <p className="mt-2 text-muted-foreground leading-relaxed text-balance">
                {user.bio}
              </p>
            )}
          </div>

          {/* User Details */}
          <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm md:text-base">
            {user.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <IconMapPin className="h-4 w-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user.blog && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <IconLink className="h-4 w-4" />
                <a
                  href={
                    user.blog.startsWith("http")
                      ? user.blog
                      : `https://${user.blog}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {user.blog}
                </a>
              </div>
            )}
          </div>

          {/* User Stats */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5",
                "bg-secondary/80 rounded-full text-sm font-medium"
              )}
            >
              <IconUsers className="h-4 w-4" />
              <span>{user.followers} followers</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5",
                "bg-secondary/80 rounded-full text-sm font-medium"
              )}
            >
              <IconGitFork className="h-4 w-4" />
              <span>{user.public_repos} repositories</span>
            </div>
            {user.public_gists > 0 && (
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5",
                  "bg-secondary/80 rounded-full text-sm font-medium"
                )}
              >
                <IconStar className="h-4 w-4" />
                <span>{user.public_gists} gists</span>
              </div>
            )}
          </div>

          {/* GitHub Profile Link */}
          <div className="pt-2">
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 text-sm",
                "hover:text-primary transition-colors duration-200"
              )}
            >
              View profile on GitHub
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
