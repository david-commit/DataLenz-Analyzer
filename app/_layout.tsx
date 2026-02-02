import React, { useEffect, ReactNode } from "react";
import { Stack, useRouter, usePathname } from "expo-router";
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
    const pathname = usePathname();

    useEffect(() => {
      if (isLoading) return;

      // If authenticated, allow current path (do nothing)
      if (isAuthenticated) return;

      // Not authenticated: avoid unnecessary replace when already on /auth
      if (!pathname.startsWith("/auth")) {
        router.replace("/auth");
      }
    }, [isAuthenticated, isLoading, router, pathname]);

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
