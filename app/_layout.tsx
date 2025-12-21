import React, { useEffect, ReactNode } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

export default function RootLayout() {
  useFrameworkReady();

  function AuthGate({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;

      if (!isAuthenticated) {
        // avoid unnecessary replace when already on /auth in web
        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "";
        if (!currentPath.startsWith("/auth")) {
          router.replace("/auth");
        }
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      // while auth is initializing, render nothing (could render a spinner)
      return null;
    }

    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </AuthGate>
    </AuthProvider>
  );
}
