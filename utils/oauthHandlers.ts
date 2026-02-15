import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

// Required for web to complete auth session
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Returns Google ID token (string) or null if cancelled
export async function handleGoogleSignIn(): Promise<string | null> {
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error(
      "Google Sign-In setup requires configuration. Please set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your environment."
    );
  }

  return new Promise((resolve, reject) => {
    // This creates a proper OAuth request using Expo's Google provider
    const config = {
      webClientId: GOOGLE_WEB_CLIENT_ID,
      androidClientId: GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
    };

    // For web, we use a different approach - direct OAuth
    if (Platform.OS === "web") {
      handleWebGoogleSignIn(config).then(resolve).catch(reject);
    } else {
      // For native, prompt will be handled by the component
      reject(new Error("Use the useGoogleAuth hook for native platforms"));
    }
  });
}

// Web-specific Google Sign-In using popup
async function handleWebGoogleSignIn(config: {
  webClientId: string;
  scopes: string[];
}): Promise<string | null> {
  const redirectUri = `${window.location.origin}/oauthredirect`;

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", config.webClientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "id_token");
  authUrl.searchParams.set("scope", config.scopes.join(" "));
  authUrl.searchParams.set("nonce", Math.random().toString(36).substring(2));
  authUrl.searchParams.set("prompt", "select_account");

  return new Promise((resolve) => {
    const popup = window.open(
      authUrl.toString(),
      "_blank",
      "width=500,height=700"
    );

    const onMessage = (e: MessageEvent) => {
      try {
        if (!e?.data) return;
        const url = e.data?.url || (typeof e.data === "string" ? e.data : null);
        if (!url || !url.includes("id_token")) return;

        window.removeEventListener("message", onMessage);
        popup?.close();

        // Extract id_token from URL fragment
        const hashParams = new URLSearchParams(url.split("#")[1] || "");
        const idToken = hashParams.get("id_token");
        resolve(idToken);
      } catch (err) {
        window.removeEventListener("message", onMessage);
        popup?.close();
        resolve(null);
      }
    };

    window.addEventListener("message", onMessage);

    // Check if popup was closed
    const checkInterval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkInterval);
        window.removeEventListener("message", onMessage);
        resolve(null);
      }
    }, 500);

    // Timeout after 2 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
      window.removeEventListener("message", onMessage);
      popup?.close();
      resolve(null);
    }, 120000);
  });
}

// Hook for native Google Sign-In - use this in components
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
  });

  const signIn = async (): Promise<string | null> => {
    if (Platform.OS === "web") {
      return handleGoogleSignIn();
    }

    const result = await promptAsync();

    if (result?.type === "success") {
      // The id_token is in authentication
      return result.authentication?.idToken || null;
    }

    return null;
  };

  return { request, response, signIn, isReady: !!request };
}
