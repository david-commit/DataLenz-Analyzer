import React, { useEffect, ReactNode, Component, ErrorInfo } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Error Boundary to catch JavaScript errors and show error screen instead of white screen
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Error Boundary caught error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Unexpected Error</Text>
            <Text style={styles.errorMessage}>
              Something went wrong. Please try again.
            </Text>

            <View style={styles.buttonRow}>
              <Pressable style={styles.retryButton} onPress={this.handleRetry}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>
              <Pressable
                style={styles.detailsButton}
                onPress={this.toggleDetails}
              >
                <Text style={styles.detailsButtonText}>
                  {this.state.showDetails ? "Hide Details" : "Show Details"}
                </Text>
              </Pressable>
            </View>

            {this.state.showDetails && (
              <ScrollView style={styles.detailsContainer}>
                <Text style={styles.detailsLabel}>Error:</Text>
                <Text style={styles.detailsText}>
                  {this.state.error?.message || "Unknown error"}
                </Text>
                <Text style={styles.detailsLabel}>Stack:</Text>
                <Text style={styles.detailsText}>
                  {this.state.error?.stack || "No stack trace"}
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingLogo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    borderRadius: 24,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
  },
  loadingSubtitle: {
    fontSize: 18,
    fontWeight: "400",
    color: "#4a90d9",
    marginBottom: 40,
    letterSpacing: 2,
  },
  loadingSpinnerContainer: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#888888",
  },
  errorOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    padding: 20,
  },
  errorCard: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: "#ff6b6b",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorMessage: {
    color: "#cccccc",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  retryButton: {
    backgroundColor: "#4a90d9",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  detailsButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#555",
  },
  detailsButtonText: {
    color: "#aaa",
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 20,
    maxHeight: 200,
    width: "100%",
    backgroundColor: "#0d0d1a",
    borderRadius: 8,
    padding: 12,
  },
  detailsLabel: {
    color: "#ff6b6b",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 8,
  },
  detailsText: {
    color: "#888",
    fontSize: 11,
    fontFamily: "monospace",
  },
});

export default function RootLayout() {
  useFrameworkReady();

  function AuthGate({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;

      // Hide splash screen once auth is determined
      SplashScreen.hideAsync();

      // If authenticated, allow current path (do nothing)
      if (isAuthenticated) return;

      // Not authenticated: redirect to auth
      router.replace("/auth");
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      // while auth is initializing, render a branded loading screen
      return (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <Image
              source={require("@/assets/images/datalens-logo-with-backdrop.png")}
              style={styles.loadingLogo}
              resizeMode="contain"
            />
            <Text style={styles.loadingTitle}>DataLens</Text>
            <Text style={styles.loadingSubtitle}>Analyzer</Text>
            <View style={styles.loadingSpinnerContainer}>
              <ActivityIndicator size="large" color="#4a90d9" />
            </View>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      );
    }

    return <>{children}</>;
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
