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
import { useAppContext } from "@/contexts/AppContext";

// Try to read version from package.json at project root; fallback to 1.0.0
let appName = "DataLens Analyzer";
let appVersion = "1.0.0";
try {
  // relative path from app/ -> ../package.json
  // bundlers usually allow requiring JSON
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require("../package.json");
  if (pkg) {
    appVersion = pkg.version || appVersion;
    appName = pkg.name || appName;
  }
} catch (err) {
  // ignore
}

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColors = isDark ? colors.dark : colors.light;
  const { supportEmail, developerWebsite, companyName } = useAppContext();

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
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            {appName}
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.textSecondary }]}>
            Version {appVersion}
          </Text>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            About this app
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text }]}>
            DataLens Analyzer helps you capture charts and receive structured
            insights, trends and forecasts using on-device and cloud AI
            services. We aim to provide clear, privacy-conscious analysis of
            visual data for professionals and students.
          </Text>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Developer
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text }]}>
            {companyName}
          </Text>
          <Pressable onPress={() => openLink(`mailto:${supportEmail}`)}>
            <Text style={[styles.link, { color: themeColors.primary }]}>
              {supportEmail}
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Privacy & Permissions
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text }]}>
            This app requests access to your Camera and Photos to capture
            charts. Images are uploaded to our analysis service only with your
            consent when you request an analysis. For full details, see our
            Privacy Policy.
          </Text>
          <Pressable onPress={() => openLink(`${developerWebsite}/privacy`)}>
            <Text style={[styles.link, { color: themeColors.primary }]}>
              View Privacy Policy
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
            Third-party libraries
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text }]}>
            This app uses well-known open-source libraries such as Expo,
            Firebase, lucide-react-native and axios. See LICENSE files in the
            repository for details.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16 },
  header: { paddingVertical: 24, alignItems: "flex-start" },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    borderRadius: 12,
  },
  sectionSmall: {
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    borderRadius: 12,
  },
  sectionTitle: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
  paragraph: { fontSize: 14, lineHeight: 20 },
  question: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  answer: { fontSize: 14, marginTop: 4 },
  link: { fontSize: 14, marginTop: 8 },
});
