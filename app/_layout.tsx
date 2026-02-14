import React, { useEffect, ReactNode } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { LoaderCircle } from "lucide-react-native";

export default function RootLayout() {
  useFrameworkReady();

  function AuthGate({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;

      // If authenticated, allow current path (do nothing)
      if (isAuthenticated) return;

      // Not authenticated: avoid unnecessary replace when already on /auth in web
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      if (!currentPath.startsWith("/auth")) {
        router.replace("/auth");
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      // while auth is initializing, render spinner
      return <LoaderCircle />;
    }

    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <AppProvider>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </AuthGate>
      </AppProvider>
    </AuthProvider>
  );
}
