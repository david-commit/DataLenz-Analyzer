import { useEffect } from "react";
import { Platform } from "react-native";

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // window.frameworkReady is only available on web
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.frameworkReady?.();
    }
  }, []);
}
