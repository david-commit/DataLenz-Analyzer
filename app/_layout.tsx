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

      if (!isAuthenticated) {
        // avoid unnecessary replace when already on /auth in web
        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "";
        if (!currentPath.startsWith("/auth")) {
          router.replace("/auth");
        }
      } else {
        // if not authenticated, redirect to home (which will handle login)
        router.replace("/");
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
