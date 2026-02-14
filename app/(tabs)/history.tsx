import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FileSliders as Sliders, Search, Camera } from "lucide-react-native";
import HistoryListItem from "@/components/HistoryListItem";
import { mockRecentAnalyses } from "@/utils/mockData";
import { AnalysisType } from "@/types";
import { authService } from "@/services/auth";
import { getRecords } from "@/api/analysisRecords";
import {
  on as onNavigation,
  off as offNavigation,
} from "@/utils/navigationStore";
import colors from "@/constants/colors";
import { router } from "expo-router";

const HISTORY_CACHE_KEY = "history_cache";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

type FilterType = "all" | "bar" | "line" | "pie";

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColors = isDark ? colors.dark : colors.light;

  const [analyses, setAnalyses] = useState<AnalysisType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const mapRecords = useCallback((payload: any[]): AnalysisType[] => {
    return (payload || []).map((rec: any) => ({
      id: rec.id,
      userId: rec.userId,
      imageUrl: rec.imageUrl,
      summary: String(rec.aiResult?.summary || ""),
      analysisJson: rec.aiResult?.analysisJson || {},
      public: rec.public ?? false,
      date: rec.createdAt || rec.date || new Date().toISOString(),
    }));
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // Try to load from cache first
        const cached = await AsyncStorage.getItem(HISTORY_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > CACHE_EXPIRY_MS;
          if (!isExpired && mounted) {
            setAnalyses(data);
            setIsLoading(false);
            // Still fetch in background to update cache
          } else if (mounted) {
            setAnalyses(data); // Show stale data while fetching
          }
        }

        const user = await authService.getCurrentUser();
        const token = await authService.getValidToken();
        if (!user || !token) {
          if (mounted) setIsLoading(false);
          return;
        }

        const payload = await getRecords();
        const mapped = mapRecords(payload);

        // Update cache
        await AsyncStorage.setItem(
          HISTORY_CACHE_KEY,
          JSON.stringify({ data: mapped, timestamp: Date.now() })
        );

        if (mounted) {
          setAnalyses(mapped);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed loading records", error);
        if (mounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [mapRecords]);

  useEffect(() => {
    // listen for analysis updates from Results screen
    const handler = (payload: any) => {
      if (!payload || !payload.id) return;
      setAnalyses((prev) => {
        const exists = prev.findIndex((a) => a.id === payload.id);
        const mapped = {
          id: payload.id,
          userId: payload.userId,
          imageUrl: payload.imageUrl,
          summary: String(payload.summary || ""),
          analysisJson: payload.analysisJson || {},
          public: payload.public ?? false,
          date: payload.createdAt || payload.date || new Date().toISOString(),
        } as AnalysisType;

        if (exists === -1) {
          return [mapped, ...prev];
        }
        const copy = [...prev];
        copy[exists] = mapped;
        return copy;
      });
    };

    onNavigation("analysis:updated", handler);

    return () => {
      offNavigation("analysis:updated", handler);
    };
  }, []);

  // Filter analyses based on active filter
  const filteredAnalyses = analyses.filter((analysis) => {
    if (activeFilter === "all") return true;

    const chartType =
      analysis.analysisJson?.chartType?.toLowerCase() ||
      analysis.analysisJson?.chart_type?.toLowerCase() ||
      analysis.summary?.toLowerCase() ||
      "";

    switch (activeFilter) {
      case "bar":
        return chartType.includes("bar");
      case "line":
        return chartType.includes("line");
      case "pie":
        return chartType.includes("pie") || chartType.includes("donut");
      default:
        return true;
    }
  });

  // Group analyses by date (today, yesterday, older)
  const groupedAnalyses = filteredAnalyses.reduce(
    (groups, analysis) => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const analysisDate = new Date(analysis.date);

      if (analysisDate.toDateString() === today.toDateString()) {
        groups.today.push(analysis);
      } else if (analysisDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(analysis);
      } else {
        groups.older.push(analysis);
      }

      return groups;
    },
    {
      today: [] as AnalysisType[],
      yesterday: [] as AnalysisType[],
      older: [] as AnalysisType[],
    }
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Analysis History
        </Text>

        <View style={styles.headerActions}>
          <Pressable
            style={[
              styles.iconButton,
              { backgroundColor: themeColors.cardBackground },
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Sliders size={20} color={themeColors.text} />
          </Pressable>

          <Pressable
            style={[
              styles.iconButton,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <Search size={20} color={themeColors.text} />
          </Pressable>
        </View>
      </View>

      {/* Filters area that can be toggled */}
      {showFilters && (
        <View
          style={[
            styles.filtersContainer,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Text style={[styles.filterTitle, { color: themeColors.text }]}>
            Filters
          </Text>

          <View style={styles.filterChips}>
            <Pressable
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === "all"
                      ? themeColors.primary
                      : themeColors.surfaceVariant,
                },
              ]}
              onPress={() => setActiveFilter("all")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter !== "all" && { color: themeColors.text },
                ]}
              >
                All
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === "bar"
                      ? themeColors.primary
                      : themeColors.surfaceVariant,
                },
              ]}
              onPress={() => setActiveFilter("bar")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter !== "bar" && { color: themeColors.text },
                ]}
              >
                Bar Graphs
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === "line"
                      ? themeColors.primary
                      : themeColors.surfaceVariant,
                },
              ]}
              onPress={() => setActiveFilter("line")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter !== "line" && { color: themeColors.text },
                ]}
              >
                Line Charts
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === "pie"
                      ? themeColors.primary
                      : themeColors.surfaceVariant,
                },
              ]}
              onPress={() => setActiveFilter("pie")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter !== "pie" && { color: themeColors.text },
                ]}
              >
                Pie Charts
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Loading state */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text
              style={[styles.loadingText, { color: themeColors.textSecondary }]}
            >
              Loading history...
            </Text>
          </View>
        )}

        {/* Today's analyses */}
        {!isLoading && groupedAnalyses.today.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Today
            </Text>
            {groupedAnalyses.today.map((analysis) => (
              <HistoryListItem
                key={analysis.id}
                analysis={analysis}
                isDark={isDark}
              />
            ))}
          </View>
        )}

        {/* Yesterday's analyses */}
        {!isLoading && groupedAnalyses.yesterday.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Yesterday
            </Text>
            {groupedAnalyses.yesterday.map((analysis) => (
              <HistoryListItem
                key={analysis.id}
                analysis={analysis}
                isDark={isDark}
              />
            ))}
          </View>
        )}

        {/* Older analyses */}
        {!isLoading && groupedAnalyses.older.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Older
            </Text>
            {groupedAnalyses.older.map((analysis) => (
              <HistoryListItem
                key={analysis.id}
                analysis={analysis}
                isDark={isDark}
              />
            ))}
          </View>
        )}

        {/* Empty state */}
        {!isLoading && filteredAnalyses.length === 0 && (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <View>
              <Text
                style={[styles.emptyStateText, { color: themeColors.text }]}
              >
                No analysis history found
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtext,
                  { color: themeColors.textSecondary },
                ]}
              >
                Capture and analyze graphs to build your history
              </Text>
            </View>
            <Pressable
              style={styles.analyzeButton}
              onPress={() => {
                router.push("/camera");
              }}
            >
              <Camera size={24} color="#FFFFFF" />
              <Text style={styles.analyzeButtonText}>Analyze New Graph</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  filtersContainer: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    height: 300,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    textAlign: "center",
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E88E5",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginHorizontal: 16,
    marginTop: 48,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
