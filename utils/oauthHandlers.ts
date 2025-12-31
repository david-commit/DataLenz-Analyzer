import { makeRedirectUri, AuthRequest } from "expo-auth-session";
import { Platform } from "react-native";

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;

// Authorized Domains: https://console.firebase.google.com/u/1/project/datalens-6030b/authentication/settings
const redirectUrl = makeRedirectUri({ scheme: "myapp", path: "oauthredirect" });

// Helpful debug output for redirect URI registration in Google/Facebook console
if (typeof console !== "undefined") {
  console.debug("[oauthHandlers] redirectUrl =", redirectUrl);
}

// Returns Google ID token (string) or null if cancelled
export async function handleGoogleSignIn(): Promise<string | null> {
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error(
      "Google Sign-In setup requires configuration. Please set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your environment."
    );
  }

  const request = new AuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri: redirectUrl,
    responseType: "id_token",
    scopes: ["openid", "email", "profile"],
    extraParams: { nonce: Math.random().toString(36).substring(2) },
    // Implicit flow (id_token) must not use PKCE
    usePKCE: false,
  });

  const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  } as any;
  // On web, open popup and listen for the redirect message from `app/oauthredirect`
  let result: any;
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const authUrl = await request.makeAuthUrlAsync(discovery);

    result = await new Promise((resolve) => {
      const timeoutMs = 60000;
      let resolved = false;

      const onMessage = (e: MessageEvent) => {
        try {
          if (!e?.data) return;
          const url =
            e.data?.url || (typeof e.data === "string" ? e.data : null);
          if (!url) return;
          console.debug("[oauthHandlers] received popup message", e.data);
          const parsed = request.parseReturnUrl(url);
          resolved = true;
          window.removeEventListener("message", onMessage);
          try {
            popup?.close();
          } catch (err) {}
          resolve(parsed);
        } catch (err) {
          resolved = true;
          window.removeEventListener("message", onMessage);
          try {
            popup?.close();
          } catch (err) {}
          resolve({ type: "error", error: err });
        }
      };

      window.addEventListener("message", onMessage);

      const popup = window.open(authUrl, "_blank", "width=500,height=700");

      const checkInterval = setInterval(() => {
        try {
          const isClosed = popup == null || popup.closed;
          if (isClosed) {
            clearInterval(checkInterval);
            if (!resolved) {
              window.removeEventListener("message", onMessage);
              resolve({ type: "dismiss" });
            }
          }
        } catch (e) {
          // Cross-origin opener policy may throw when accessing popup.closed
          // Treat as still open and continue; the message listener will resolve when message arrives.
        }
      }, 500);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (!resolved) {
          window.removeEventListener("message", onMessage);
          try {
            popup?.close();
          } catch (err) {}
          resolve({ type: "dismiss" });
        }
      }, timeoutMs);
    });
  } else {
    // Native (Expo Go / device) - use the library prompt which opens native/web browser
    result = await request.promptAsync(discovery);
  }

  if (result.type === "success" && result.params) {
    console.log(result);
    const idToken = (result.params.id_token as string) || null;

    return idToken;
  }

  if (result.type === "dismiss" || result.type === "cancel") return null;

  throw new Error("Google Sign-In failed");
}

// Returns Facebook access token (string) or null if cancelled
export async function handleFacebookSignIn(): Promise<string | null> {
  if (!FACEBOOK_APP_ID) {
    throw new Error(
      "Facebook Sign-In setup requires configuration. Please set EXPO_PUBLIC_FACEBOOK_APP_ID in your environment."
    );
  }

  const request = new AuthRequest({
    clientId: FACEBOOK_APP_ID,
    redirectUri: redirectUrl,
    responseType: "token",
    scopes: ["email", "public_profile"],
    // Implicit flow (token) must not use PKCE
    usePKCE: false,
  });

  const discovery = {
    authorizationEndpoint: "https://www.facebook.com/v16.0/dialog/oauth",
  } as any;

  let result: any;
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const authUrl = await request.makeAuthUrlAsync(discovery);

    result = await new Promise((resolve) => {
      const timeoutMs = 60000;
      let resolved = false;
      const onMessage = (e: MessageEvent) => {
        try {
          if (!e?.data) return;
          const url =
            e.data?.url || (typeof e.data === "string" ? e.data : null);
          if (!url) return;
          console.debug("[oauthHandlers] received popup message", e.data);
          const parsed = request.parseReturnUrl(url);
          resolved = true;
          window.removeEventListener("message", onMessage);
          try {
            popup?.close();
          } catch (err) {}
          resolve(parsed);
        } catch (err) {
          resolved = true;
          window.removeEventListener("message", onMessage);
          try {
            popup?.close();
          } catch (err) {}
          resolve({ type: "error", error: err });
        }
      };

      window.addEventListener("message", onMessage);

      const popup = window.open(authUrl, "_blank", "width=500,height=700");

      const checkInterval = setInterval(() => {
        if (popup == null || popup.closed) {
          clearInterval(checkInterval);
          if (!resolved) {
            window.removeEventListener("message", onMessage);
            resolve({ type: "dismiss" });
          }
        }
      }, 500);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (!resolved) {
          window.removeEventListener("message", onMessage);
          try {
            popup?.close();
          } catch (err) {}
          resolve({ type: "dismiss" });
        }
      }, timeoutMs);
    });
  } else {
    result = await request.promptAsync(discovery);
  }

  if (result.type === "success" && result.params) {
    const idToken = (result.params.access_token as string) || null;

    return idToken;
  }

  if (result.type === "dismiss" || result.type === "cancel") return null;

  throw new Error("Facebook Sign-In failed");
}
