import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import colors from "@/constants/colors";

export default function HelpSupportScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColors = isDark ? colors.dark : colors.light;

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.warn("Unable to open link", url, err);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.section,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Help & Support
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text }]}>
            Need help? Below are common questions and next steps. For account or
            data issues, contact support.
          </Text>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Frequently Asked Questions
          </Text>
          <Text style={[styles.question, { color: themeColors.text }]}>
            Q: Why does the app ask for camera and photo permissions?
          </Text>
          <Text style={[styles.answer, { color: themeColors.textSecondary }]}>
            A: To capture and analyze charts you take photos or pick images from
            your library. Images are only uploaded when you request analysis.
          </Text>

          <Text style={[styles.question, { color: themeColors.text }]}>
            Q: My analysis failed or returned an error
          </Text>
          <Text style={[styles.answer, { color: themeColors.textSecondary }]}>
            A: Ensure you have an internet connection and try again. If the
            issue persists, use the Contact Support button below and include a
            screenshot and the Analysis ID.
          </Text>

          <Text style={[styles.question, { color: themeColors.text }]}>
            Q: How is my data used?
          </Text>
          <Text style={[styles.answer, { color: themeColors.textSecondary }]}>
            A: Images you submit for analysis may be sent to our analysis
            service. We retain only the data necessary to provide the service
            and features; see our Privacy Policy for details.
          </Text>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Contact Support
          </Text>
          <Pressable onPress={() => openLink("mailto:support@example.com")}>
            <Text style={[styles.link, { color: themeColors.primary }]}>
              Email support@example.com
            </Text>
          </Pressable>
          <Pressable onPress={() => openLink("https://example.com/support")}>
            <Text style={[styles.link, { color: themeColors.primary }]}>
              Visit Support Center
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.sectionSmall,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Report a problem
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.textSecondary }]}
          >
            Include screenshots, the Analysis ID (if available), and steps to
            reproduce. This helps us investigate faster.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16 },
  section: { marginBottom: 16, padding: 12, borderRadius: 12 },
  sectionSmall: { marginBottom: 12, padding: 12, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  paragraph: { fontSize: 14, lineHeight: 20 },
  question: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  answer: { fontSize: 14, marginTop: 4 },
  link: { fontSize: 14, marginTop: 8 },
});
