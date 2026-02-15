import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { makeRedirectUri } from "expo-auth-session";

// Required for web to complete auth session
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Debug: log the redirect URI being used
const redirectUri = makeRedirectUri({
  scheme: "datalensanalyzer",
  path: "oauthredirect",
});
console.log("[oauthHandlers] Redirect URI:", redirectUri);
console.log("[oauthHandlers] Platform:", Platform.OS);
console.log("[oauthHandlers] Android Client ID:", GOOGLE_ANDROID_CLIENT_ID?.slice(0, 20) + "...");

// Hook for Google Sign-In - use this in components
export function useGoogleAuth() {
  const config = {
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    scopes: ["profile", "email"],
  };

  const [request, response, promptAsync] = Google.useAuthRequest(config);

  const signIn = async (): Promise<string | null> => {
    try {
      console.log("[useGoogleAuth] Starting sign in...");
      console.log("[useGoogleAuth] Config:", {
        webClientId: config.webClientId?.slice(0, 20) + "...",
        androidClientId: config.androidClientId?.slice(0, 20) + "...",
      });

      const result = await promptAsync();
      console.log("[useGoogleAuth] Result type:", result?.type);

      if (result?.type === "success") {
        // For Google auth, we get the id_token from authentication
        const idToken = result.authentication?.idToken;
        console.log("[useGoogleAuth] Got ID token:", !!idToken);
        return idToken || null;
      }

      if (result?.type === "error") {
        console.error("[useGoogleAuth] Error:", result.error);
      }

      return null;
    } catch (error) {
      console.error("[useGoogleAuth] Exception:", error);
      throw error;
    }
  };

  return { request, response, signIn, isReady: !!request };
}

// Legacy function for backwards compatibility
export async function handleGoogleSignIn(): Promise<string | null> {
  throw new Error("Use useGoogleAuth hook instead of handleGoogleSignIn");
}
