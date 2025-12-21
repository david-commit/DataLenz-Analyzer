import { makeRedirectUri } from 'expo-auth-session';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;

const redirectUrl = makeRedirectUri({
  scheme: 'com.example.datamesh',
  path: 'oauth',
});

export async function handleGoogleSignIn(): Promise<string | null> {
  throw new Error(
    'Google Sign-In setup requires configuration. Please set up Google OAuth credentials in Firebase Console and configure the EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID environment variable.'
  );
}

export async function handleFacebookSignIn(): Promise<string | null> {
  throw new Error(
    'Facebook Sign-In setup requires configuration. Please set up Facebook OAuth in Facebook Developer Console and configure the EXPO_PUBLIC_FACEBOOK_APP_ID environment variable.'
  );
}
