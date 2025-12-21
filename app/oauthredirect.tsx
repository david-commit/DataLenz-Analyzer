import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function OAuthRedirect() {
  const router = useRouter();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    // Only run in browser popups/windows
    try {
      if (typeof window !== "undefined") {
        const url = window.location.href;

        // Send the full URL back to the opener (if present)
        if (window.opener && typeof window.opener.postMessage === "function") {
          window.opener.postMessage({ type: "expo-auth-session", url }, "*");
        }

        // Try to force navigation on the opener window as a fallback (works when same-origin)
        try {
          if (window.opener) {
            const hash = window.location.hash || "";
            if (hash) {
              try {
                window.opener.location.hash = hash;
              } catch (e) {
                window.opener.location.assign(url);
              }
            } else {
              window.opener.location.assign(url);
            }
          }
        } catch (e) {
          // ignore cross-origin errors
        }

        // Try to close the popup after a short delay
        setTimeout(() => {
          try {
            router.replace("/");
            window.close();
          } catch (e) {
            // ignore
          }
        }, 5000);

        setHandled(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in complete</Text>
      <Text style={styles.body}>
        You can close this window and return to the app. If nothing happens, use
        the button below.
      </Text>
      <Pressable
        style={styles.button}
        onPress={() => {
          // If running inside the Expo Router app, navigate home as a fallback
          try {
            router.replace("/");
          } catch (e) {
            // ignore
            window.location.href = "/";
          }
        }}
      >
        <Text style={styles.buttonText}>Go to home screen</Text>
      </Pressable>
      {handled ? null : <Text style={styles.note}>Processing...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#444",
  },
  button: {
    backgroundColor: "#1E88E5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  note: {
    marginTop: 12,
    color: "#666",
  },
});
