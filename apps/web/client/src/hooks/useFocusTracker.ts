import { useEffect, useRef } from "react";
import { useFocusStore } from "../store/useFocusStore";

export const useFocusTracker = (isActive: boolean) => {
  const { decreaseScore } = useFocusStore();
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const IDLE_THRESHOLD = 45000; // 45 seconds

  const resetIdleTimer = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      console.log("[Focus Tracker] User has been idle for 45s");
      decreaseScore(20);
    }, IDLE_THRESHOLD);
  };

  useEffect(() => {
    if (!isActive) {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      return;
    }

    console.log("[Focus Tracker] Tracking active...");

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        console.log("[Focus Tracker] Tab Hidden");
        decreaseScore(15);
      }
    };

    const handleBlur = () => {
      console.log("[Focus Tracker] Window Blurred");
      decreaseScore(10);
    };

    const handleActivity = () => {
      resetIdleTimer();
    };

    // Listeners
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    resetIdleTimer();

    return () => {
      console.log("[Focus Tracker] Cleaning up listeners");
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isActive, decreaseScore]);
};