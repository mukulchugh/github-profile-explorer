import { useEffect, useState } from "react";

/**
 * A hook that detects if the current viewport is mobile size
 * @param breakpoint The width in pixels below which to consider as mobile (default: 768px)
 * @returns A boolean indicating if the viewport is mobile size
 */
export function useMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Initialize with current window size
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check initially
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [breakpoint]);

  return isMobile;
}
