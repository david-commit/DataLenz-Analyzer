import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Image,
  ActivityIndicator,
  Share,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Dot,
  Trash2,
  RefreshCcw,
  Share2,
} from "lucide-react-native";
import colors from "@/constants/colors";
import InsightCard from "@/components/InsightCard";
import TrendCard from "@/components/TrendCard";
import {
  getNavigationData,
  deleteNavigationData,
  saveNavigationData,
} from "@/utils/navigationStore";
import Button from "@/components/Button";
import { analyzeRecord } from "@/api/analyze";
import { nanoid } from "nanoid/non-secure";
import { deleteRecord as deleteRecordApi } from "@/api/analysisRecords";

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    imageUri: string;
    graphTitle: string;
    graphType: string;
    dataContext: string;
  }>();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColors = isDark ? colors.dark : colors.light;

  const [expanded, setExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    summary: true,
    insights: true,
    trends: true,
    anomalies: true,
    forecast: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleReAnalyze = async () => {
    if (!analysis?.id) return;
    try {
      setIsLoading(true);

      const reAnalysis = await analyzeRecord(analysis);

      if (!reAnalysis) {
        throw new Error("Re-analysis failed");
      }
      // Normalize shape: prefer aiResult.analysisJson and aiResult.summary when present
      const normalized = {
        ...analysis,
        ...reAnalysis,
        analysisJson:
          reAnalysis?.aiResult?.analysisJson ??
          reAnalysis?.analysisJson ??
          analysis?.analysisJson ??
          null,
        summary:
          reAnalysis?.aiResult?.summary ??
          reAnalysis?.summary ??
          analysis?.summary ??
          null,
      } as any;

      // Update local state with normalized object
      setAnalysis(normalized);

      // Update transient navigation store: overwrite existing key if present, else create a snapshot key
      const dataKey = (params as any).dataKey as string | undefined;
      if (dataKey) {
        saveNavigationData(dataKey, normalized);
      } else {
        const key = `analysis:${nanoid()}`;
        saveNavigationData(key, normalized);
      }
      return;
    } catch (err) {
      console.error("Re-analyze error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If a dataKey param was passed, read the transient analysis object
    const dataKey = (params as any).dataKey as string | undefined;

    if (dataKey) {
      const obj = getNavigationData(dataKey);
      if (obj) {
        setAnalysis(obj);
        // optionally delete to free memory
        deleteNavigationData(dataKey);
        setIsLoading(false);
        return;
      }
    }
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDeletePress = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!analysis?.id) return;
    try {
      setDeleting(true);
      await deleteRecordApi(analysis.id);
      // when deleting an analysis and you stored it under dataKey
      const dataKey = (params as any).dataKey as string | undefined;
      if (dataKey) {
        deleteNavigationData(dataKey);
      }
      // then navigate away
      router.replace("/history");
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => setShowDeleteConfirm(false);

  const handleShare = async () => {
    if (Platform.OS === "web") {
      alert("Sharing is not available in web preview");
      return;
    }

    try {
      await Share.share({
        title: params.graphTitle || "DataLens Analysis",
        message: "Check out this data analysis from DataLens Analyzer!",
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: themeColors.background },
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.text }]}>
          Analyzing your graph...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={themeColors.text} />
        </Pressable>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Analysis Results
        </Text>
        <Pressable style={styles.trashButton} onPress={handleDeletePress}>
          <Trash2 size={24} color={"#E53935"} />
        </Pressable>
      </View>

      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              Confirm delete
            </Text>
            <Text
              style={{ color: themeColors.textSecondary, marginBottom: 12 }}
            >
              Are you sure you want to delete this analysis? This action cannot
              be undone.
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Pressable
                onPress={cancelDelete}
                style={[styles.modalButton, { backgroundColor: "#E0E0E0" }]}
              >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                style={[styles.modalButton, { backgroundColor: "#E53935" }]}
              >
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF" }}>Delete</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/** Prefer values from the full analysis object when available */}
        <View style={styles.graphInfoContainer}>
          <Text style={[styles.graphTitle, { color: themeColors.text }]}>
            {analysis?.analysisJson?.title || "Untitled Graph"}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            {/* Analaysis CHART TYPE */}
            {analysis?.analysisJson?.chart_type ||
            analysis?.type ||
            params.graphType ? (
              <Text
                style={[
                  styles.graphType,
                  {
                    color: themeColors.textSecondary,
                    textTransform: "capitalize",
                  },
                ]}
              >
                Chart Type:{" "}
                {analysis?.analysisJson?.chart_type ||
                  analysis?.type ||
                  params.graphType}
              </Text>
            ) : null}
            {/* Analaysis ID */}
            {analysis?.id ? (
              <Text
                style={[styles.graphType, { color: themeColors.textSecondary }]}
              >
                Analysis ID: {analysis?.id}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: analysis?.imageUrl,
            }}
            style={styles.graphImage}
            resizeMode="contain"
          />
        </View>

        {/* Summary Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Pressable
            style={styles.sectionHeader}
            onPress={() => toggleSection("summary")}
          >
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Executive Summary
            </Text>
            {expanded ? (
              <ChevronUp size={20} color={themeColors.text} />
            ) : (
              <ChevronDown size={20} color={themeColors.text} />
            )}
          </Pressable>

          {expandedSections.summary && (
            <View style={styles.sectionContent}>
              <Text style={[styles.summaryText, { color: themeColors.text }]}>
                {analysis?.summary}
              </Text>
            </View>
          )}
        </View>

        {/* Key Insights Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Pressable
            style={styles.sectionHeader}
            onPress={() => toggleSection("insights")}
          >
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Key Insights
            </Text>
            {expandedSections.insights ? (
              <ChevronUp size={20} color={themeColors.text} />
            ) : (
              <ChevronDown size={20} color={themeColors.text} />
            )}
          </Pressable>

          {expandedSections.insights && (
            <View style={styles.sectionContent}>
              {(analysis?.analysisJson?.insights ?? []).map(
                (insight: any, index: number) => (
                  <InsightCard key={index} insight={insight} isDark={isDark} />
                )
              )}
            </View>
          )}
        </View>

        {/* Trends Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Pressable
            style={styles.sectionHeader}
            onPress={() => toggleSection("trends")}
          >
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Trends
            </Text>
            {expandedSections.trends ? (
              <ChevronUp size={20} color={themeColors.text} />
            ) : (
              <ChevronDown size={20} color={themeColors.text} />
            )}
          </Pressable>

          {expandedSections.trends && (
            <View style={styles.sectionContent}>
              {(analysis?.analysisJson?.trends ?? []).map(
                (trend: any, index: number) => (
                  <TrendCard key={index} trend={trend} isDark={isDark} />
                )
              )}
            </View>
          )}
        </View>

        {/* ANOMALIES Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Pressable
            style={styles.sectionHeader}
            onPress={() => toggleSection("anomalies")}
          >
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Anomalies
            </Text>
            {expandedSections.anomalies ? (
              <ChevronUp size={20} color={themeColors.text} />
            ) : (
              <ChevronDown size={20} color={themeColors.text} />
            )}
          </Pressable>

          {expandedSections.anomalies && (
            <View style={styles.sectionContent}>
              {(analysis?.analysisJson?.anomalies ?? []).map(
                (anomaly: any, index: number) => (
                  <Text
                    key={`anomaly-${index}`}
                    style={[
                      styles.forecastText,
                      {
                        color: themeColors.text,
                        display: "flex",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Dot /> {anomaly}
                  </Text>
                )
              )}
            </View>
          )}
        </View>

        {/* Forecast Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Pressable
            style={styles.sectionHeader}
            onPress={() => toggleSection("forecast")}
          >
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Forecast
            </Text>
            {expandedSections.forecast ? (
              <ChevronUp size={20} color={themeColors.text} />
            ) : (
              <ChevronDown size={20} color={themeColors.text} />
            )}
          </Pressable>

          {expandedSections.forecast && (
            <View style={styles.sectionContent}>
              <Text style={[styles.forecastText, { color: themeColors.text }]}>
                {analysis?.analysisJson?.forecast}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <Button
            icon={<RefreshCcw size={20} color="#FFFFFF" />}
            title="Reanalyze"
            onPress={() => handleReAnalyze()}
            style={{ flex: 1, marginRight: 8 }}
          />

          <Button
            icon={<Share2 size={20} color="#FFFFFF" />}
            title="Share"
            onPress={handleShare}
            style={{ flex: 1, marginLeft: 8 }}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  trashButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 480,
    padding: 16,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  graphInfoContainer: {
    marginBottom: 16,
  },
  graphTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  graphType: {
    fontSize: 16,
    marginTop: 4,
  },
  imageContainer: {
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  graphImage: {
    width: "100%",
    height: "100%",
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
  },
  forecastText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 32,
  },
});
