import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  useColorScheme,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Moon,
  Sun,
  Bell,
  Globe,
  VolumeX,
  Volume2,
  FileText,
  CircleHelp as HelpCircle,
  Info,
  LogOut,
  User,
  Delete,
  DeleteIcon,
  UserRoundX,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import colors from "@/constants/colors";
import { router } from "expo-router";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColors = isDark ? colors.dark : colors.light;
  const { user, logout } = useAuth();

  // Profile state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedVoice, setSelectedVoice] = useState("Default");

  // Mock function for Profile that would actually change system Profile
  const handleDarkModeToggle = () => {
    setDarkModeEnabled(!darkModeEnabled);
    // In a real app, you would use a theme provider to change the theme
    if (Platform.OS === "web") {
      Alert.alert("Dark mode settings would be applied here");
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  const confirmLogout = async () => {
    setProcessing(true);
    try {
      await logout();
      // route to auth/root
      router.replace("/auth");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setProcessing(false);
      setShowLogoutConfirm(false);
    }
  };

  const confirmDeleteAccount = async () => {
    // For now, treat delete as logout + route; in a real app call backend to remove user
    setProcessing(true);
    try {
      // TODO: call account deletion API
      await logout();
      router.replace("/auth");
    } catch (err) {
      console.error("Delete account failed", err);
    } finally {
      setProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.section}>
          {/* <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Profile</Text> */}

          <View
            style={[
              styles.settingItem,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <View style={styles.settingInfo}>
              <User size={24} color={themeColors.text} />
              <View style={styles.userInfo}>
                <Text style={[styles.settingText, { color: themeColors.text }]}>
                  {user?.displayName || user?.email}
                </Text>
                <Text
                  style={[
                    styles.userEmail,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={[
              styles.settingItem,
              { backgroundColor: themeColors.cardBackground },
            ]}
            onPress={handleLogout}
          >
            <View style={styles.settingInfo}>
              <LogOut size={24} color={themeColors.error} />
              <Text style={[styles.settingText, { color: themeColors.error }]}>
                Sign Out
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Appearance
          </Text>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <View style={styles.settingInfo}>
              {isDark ? (
                <Moon size={24} color={themeColors.text} />
              ) : (
                <Sun size={24} color={themeColors.text} />
              )}
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: "#767577", true: "#1E88E5" }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <View style={styles.settingInfo}>
              <Globe size={24} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                Language
              </Text>
            </View>
            <Pressable>
              <Text style={{ color: themeColors.primary }}>
                {selectedLanguage}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Notifications
          </Text>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <View style={styles.settingInfo}>
              <Bell size={24} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                Push Notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: "#1E88E5" }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        {/* Analysis Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Analysis Settings
          </Text>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <View style={styles.settingInfo}>
              {textToSpeechEnabled ? (
                <Volume2 size={24} color={themeColors.text} />
              ) : (
                <VolumeX size={24} color={themeColors.text} />
              )}
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                Text-to-Speech
              </Text>
            </View>
            <Switch
              value={textToSpeechEnabled}
              onValueChange={setTextToSpeechEnabled}
              trackColor={{ false: "#767577", true: "#1E88E5" }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <View style={styles.settingInfo}>
              <FileText size={24} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                Auto-Save Analysis
              </Text>
            </View>
            <Switch
              value={autoSaveEnabled}
              onValueChange={setAutoSaveEnabled}
              trackColor={{ false: "#767577", true: "#1E88E5" }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <View style={styles.settingInfo}>
              <Volume2 size={24} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                Voice Type
              </Text>
            </View>
            <Pressable>
              <Text style={{ color: themeColors.primary }}>
                {selectedVoice}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            About
          </Text>

          <Pressable
            style={[
              styles.settingItem,
              { backgroundColor: themeColors.cardBackground },
            ]}
            onPress={() => {
              router.push("/help-and-support");
            }}
          >
            <View style={styles.settingInfo}>
              <HelpCircle size={24} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                Help & Support
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.settingItem,
              { backgroundColor: themeColors.cardBackground },
            ]}
            onPress={() => {
              router.push("/about");
            }}
          >
            <View style={styles.settingInfo}>
              <Info size={24} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                About DataLens
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Delete Account */}
        <Pressable
          style={[
            styles.modalButton,
            { backgroundColor: themeColors.error, padding: 16 },
          ]}
          onPress={() => setShowDeleteConfirm(true)}
        >
          <View style={[styles.settingInfo, styles.deleteButton]}>
            <UserRoundX size={24} color={themeColors.text} />
            <Text style={[styles.settingText, { color: themeColors.text }]}>
              Delete Account
            </Text>
          </View>
        </Pressable>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text
            style={[styles.versionText, { color: themeColors.textSecondary }]}
          >
            DataLens Analyzer v1.0.0
          </Text>
        </View>
      </ScrollView>
      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <Modal visible={showLogoutConfirm} transparent animationType="fade">
          <View style={[styles.modalOverlay]}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: themeColors.cardBackground },
              ]}
            >
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                Confirm Sign Out
              </Text>
              <Text
                style={{ color: themeColors.textSecondary, marginBottom: 12 }}
              >
                Are you sure you want to sign out?
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <Pressable
                  onPress={() => setShowLogoutConfirm(false)}
                  style={[styles.modalButton, { backgroundColor: "#E0E0E0" }]}
                >
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={confirmLogout}
                  style={[
                    styles.modalButton,
                    { backgroundColor: themeColors.error },
                  ]}
                >
                  <Text style={{ color: "#FFFFFF" }}>
                    {processing ? "..." : "Sign Out"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Delete account confirmation modal */}
      {showDeleteConfirm && (
        <Modal visible={showDeleteConfirm} transparent animationType="fade">
          <View style={[styles.modalOverlay]}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: themeColors.cardBackground },
              ]}
            >
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                Delete Account
              </Text>
              <Text
                style={{ color: themeColors.textSecondary, marginBottom: 12 }}
              >
                This will permanently delete your account and all data. This
                action cannot be undone.
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <Pressable
                  onPress={() => setShowDeleteConfirm(false)}
                  style={[styles.modalButton, { backgroundColor: "#E0E0E0" }]}
                >
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={confirmDeleteAccount}
                  style={[styles.modalButton, { backgroundColor: "#E53935" }]}
                >
                  <Text style={{ color: "#FFFFFF" }}>
                    {processing ? "..." : "Delete"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
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
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userEmail: {
    marginLeft: 12,
    fontSize: 14,
    marginTop: 4,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    maxWidth: 480,
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButton: {
    textAlign: "center",
    justifyContent: "center",
  },
});
