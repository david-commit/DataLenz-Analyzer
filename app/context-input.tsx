import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  useColorScheme,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Sparkles,
  CircleHelp as HelpCircle,
} from "lucide-react-native";
import colors from "@/constants/colors";
import { authService } from "@/services/auth";
import { saveNavigationData } from "@/utils/navigationStore";
import { analyzeRecord } from "@/api/analyze";
import { nanoid } from "nanoid/non-secure";
import { useAppContext } from "@/contexts/AppContext";

export default function ContextInputScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { backendUrl } = useAppContext();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColors = isDark ? colors.dark : colors.light;

  const [dataContext, setDataContext] = useState("");
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRetake = () => {
    // go back to camera to retake
    router.push("/camera");
  };

  async function uploadImageAsync(uri: string) {
    setUploading(true);
    setError(null);
    try {
      // fetch the file as blob
      const blobResp = await fetch(uri);
      const blob = await blobResp.blob();

      const form = new FormData();
      const filename = `upload-${Date.now()}.jpg`;
      if (Platform.OS === "web") {
        // On web, append a real File so multer on the backend receives proper file metadata
        const file = new File([blob], filename, {
          type: blob.type || "image/jpeg",
        });
        form.append("file", file, filename);
      } else {
        // React Native (Expo) FormData accepts { uri, name, type }
        // @ts-ignore - React Native FormData accepts { uri, name, type }
        form.append("file", {
          uri,
          name: filename,
          type: blob.type || "image/jpeg",
        } as any);
      }

      const token = await authService.getValidToken();
      const user = await authService.getCurrentUser();

      const res = await fetch(`${backendUrl.replace(/\/$/, "")}/upload`, {
        method: "POST",
        headers: {
          // let fetch set Content-Type for multipart
          "Authorization": token ? `Bearer ${token}` : "",
          "x-user-id": user?.localId || "",
        },
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Upload failed: ${res.status} ${txt}`);
      }

      const data = await res.json();
      return data; // expect cloudinary result with secure_url
    } catch (err: any) {
      console.error("uploadImageAsync error", err);
      setError(err.message || String(err));
      throw err;
    } finally {
      setUploading(false);
    }
  }

  async function handleUsePhoto() {
    if (!imageUri) return;
    setProcessing(true);
    setError(null);
    try {
      const uploadRes = await uploadImageAsync(imageUri);

      const imageUrl =
        uploadRes.secure_url ||
        uploadRes.url ||
        uploadRes.secureUrl ||
        uploadRes.public_id ||
        "";

      const token = await authService.getValidToken();
      const user = await authService.getCurrentUser();

      const payload = {
        userId: user?.localId || "unknown",
        imageUrl,
        context: dataContext,
        public: true,
      } as any;

      const res = await fetch(
        `${backendUrl.replace(/\/$/, "")}/create-record`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
            "x-user-id": user?.localId || "",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Create record failed: ${res.status} ${txt}`);
      }

      const created = await res.json();

      // Analyzes and updates db
      const analyzedRecord = await analyzeRecord(created);

      console.log("[handleUsePhoto] analyzedRecord:", analyzedRecord);

      // save created record and navigate to results
      const key = `analysis:${nanoid()}`;
      saveNavigationData(key, analyzedRecord);
      router.push({ pathname: "/results", params: { dataKey: key } });
    } catch (err: any) {
      console.error("handleUsePhoto error", err);
      setError(err?.message || String(err));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={themeColors.text} />
          </Pressable>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Add Context
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          </View>

          <View
            style={[
              styles.infoContainer,
              { backgroundColor: themeColors.infoBackground },
            ]}
          >
            <HelpCircle size={20} color={themeColors.infoText} />
            <Text style={[styles.infoText, { color: themeColors.infoText }]}>
              Adding context helps our AI generate more accurate and relevant
              insights.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: themeColors.text }]}>
              Upload Context
            </Text>
            <TextInput
              style={[
                styles.textAreaInput,
                {
                  backgroundColor: themeColors.inputBackground,
                  color: themeColors.text,
                  borderColor: themeColors.border,
                },
              ]}
              placeholder="Describe what this graph represents or any additional context that would help with analysis..."
              placeholderTextColor={themeColors.textSecondary}
              value={dataContext}
              onChangeText={setDataContext}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View
          style={[styles.footer, { backgroundColor: themeColors.background }]}
        >
          {confirming ? (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                style={[
                  styles.analyzeButton,
                  { flex: 1, backgroundColor: "#B0BEC5" },
                ]}
                onPress={handleRetake}
                disabled={processing || uploading}
              >
                <Text style={styles.analyzeButtonText}>Retake</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.analyzeButton,
                  processing && styles.analyzeButtonDisabled,
                  { flex: 1 },
                ]}
                onPress={handleUsePhoto}
                disabled={processing || uploading}
              >
                {processing || uploading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.analyzeButtonText}>
                    <Sparkles className="h-6 w-6" /> Analyze
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[
                styles.analyzeButton,
                processing && styles.analyzeButtonDisabled,
              ]}
              onPress={handleUsePhoto}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.analyzeButtonText}>Generate Analysis</Text>
              )}
            </Pressable>
          )}
          {error ? (
            <Text style={{ color: "red", marginTop: 8 }}>{error}</Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  imagePreviewContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 4,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 120,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  analyzeButton: {
    backgroundColor: "#1E88E5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  analyzeButtonDisabled: {
    backgroundColor: "#90CAF9",
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
  },
});
