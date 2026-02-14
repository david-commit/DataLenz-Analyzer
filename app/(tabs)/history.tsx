import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from "react-native";
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

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColors = isDark ? colors.dark : colors.light;

  const [analyses, setAnalyses] = useState<AnalysisType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const user = await authService.getCurrentUser();
        const token = await authService.getValidToken();
        if (!user || !token) return;

        const payload = await getRecords();

        // expected payload: array of records with id, userId, imageUrl, aiResult.analysisJson, public, createdAt
        const mapped: AnalysisType[] = (payload || []).map((rec: any) => ({
          id: rec.id,
          userId: rec.userId,
          imageUrl: rec.imageUrl,
          summary: String(rec.aiResult?.summary || ""),
          analysisJson: rec.aiResult?.analysisJson || {},
          public: rec.public ?? false,
          date: rec.createdAt || rec.date || new Date().toISOString(),
        }));

        if (mounted) setAnalyses(mapped);
      } catch (error) {
        console.error("Failed loading records", error);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

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

  // Group analyses by date (today, yesterday, older)
  const groupedAnalyses = analyses.reduce(
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
                { backgroundColor: themeColors.primary },
              ]}
            >
              <Text style={styles.filterChipText}>All</Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterChip,
                { backgroundColor: themeColors.surfaceVariant },
              ]}
            >
              <Text
                style={[styles.filterChipText, { color: themeColors.text }]}
              >
                Bar Graphs
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterChip,
                { backgroundColor: themeColors.surfaceVariant },
              ]}
            >
              <Text
                style={[styles.filterChipText, { color: themeColors.text }]}
              >
                Line Charts
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterChip,
                { backgroundColor: themeColors.surfaceVariant },
              ]}
            >
              <Text
                style={[styles.filterChipText, { color: themeColors.text }]}
              >
                Pie Charts
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's analyses */}
        {groupedAnalyses.today.length > 0 && (
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
        {groupedAnalyses.yesterday.length > 0 && (
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
        {groupedAnalyses.older.length > 0 && (
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
        {analyses.length === 0 && (
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
            <Pressable style={styles.analyzeButton} onPress={() => {router.push('/camera')}}>
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
    height: 300
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
