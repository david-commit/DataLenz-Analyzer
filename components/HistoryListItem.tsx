import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { Calendar, ChevronRight } from "lucide-react-native";
import { AnalysisType } from "@/types";
import colors from "@/constants/colors";
import { saveNavigationData } from "@/utils/navigationStore";
import { nanoid } from "nanoid/non-secure";

interface HistoryListItemProps {
  analysis: AnalysisType;
  isDark: boolean;
}

export default function HistoryListItem({
  analysis,
  isDark,
}: HistoryListItemProps) {
  const themeColors = isDark ? colors.dark : colors.light;
  // Chart type name mapping (do not mutate incoming analysis object)
  const chartTypeMapping: { [key: string]: string } = {
    line: "Line Chart",
    bar: "Bar Chart",
    pie: "Pie Chart",
    scatter_plot: "Scatter Plot",
  };

  const rawChartType = analysis?.analysisJson?.chart_type;
  const displayChartType =
    chartTypeMapping[rawChartType] ||
    (typeof rawChartType === "string" && rawChartType.length > 0
      ? rawChartType
      : "Unknown Chart");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePress = () => {
    const key = `analysis:${nanoid()}`;
    saveNavigationData(key, analysis);
    router.push({
      pathname: "/results",
      params: { dataKey: key },
    });
  };

  return (
    <Pressable
      style={[styles.item, { backgroundColor: themeColors.cardBackground }]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: analysis.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: themeColors.text }]}
          numberOfLines={1}
        >
          {analysis.analysisJson.title
            ? analysis.analysisJson.title
            : "Not analysed"}
        </Text>
        <View style={styles.detailsRow}>
          <Text style={[{ color: themeColors.textSecondary }]}>
            {displayChartType}
          </Text>
          <Text style={[{ color: themeColors.textSecondary }]}>-</Text>
          <View style={styles.dateContainer}>
            <Calendar size={12} color={themeColors.textSecondary} />
            <Text style={[styles.date, { color: themeColors.textSecondary }]}>
              {formatDate(analysis.date)}
            </Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={themeColors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    marginLeft: 4,
  },
});
