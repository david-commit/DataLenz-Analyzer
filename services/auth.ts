import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/config/firebase";
import * as SecureStore from "expo-secure-store";

// Secure storage helpers: use expo-secure-store on native, fall back to AsyncStorage on web
async function setSecureItem(key: string, value: string) {
  try {
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
  } catch (e) {
    // fall through to AsyncStorage
  }
  await AsyncStorage.setItem(key, value);
}

async function getSecureItem(key: string) {
  try {
    if (await SecureStore.isAvailableAsync()) {
      return await SecureStore.getItemAsync(key);
    }
  } catch (e) {
    // fall through to AsyncStorage
  }
  return await AsyncStorage.getItem(key);
}

async function deleteSecureItem(key: string) {
  try {
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
  } catch (e) {
    // fall through to AsyncStorage
  }
  await AsyncStorage.removeItem(key);
}

const STORAGE_KEYS = {
  USER_DATA: "user_data",
};

export class AuthService {
  private static instance: AuthService;
  private refreshTimer: NodeJS.Timeout | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await getIdToken(user);

      const userData: User = {
        localId: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        emailVerified: user.emailVerified,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData)
      );
      await setSecureItem("idToken", token);

      return userData;
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  }

  async register(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await getIdToken(user);

      const userData: User = {
        localId: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        emailVerified: user.emailVerified,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData)
      );
      await setSecureItem("idToken", token);

      return userData;
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  }

  async loginWithGoogle(idToken: string): Promise<User> {
    try {
      console.debug(
        "[authService] loginWithGoogle received idToken:",
        idToken?.slice?.(0, 32) + "..."
      );
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      const token = await getIdToken(user);

      const userData: User = {
        localId: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        emailVerified: user.emailVerified,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData)
      );
      await setSecureItem("idToken", token);

      return userData;
    } catch (error: any) {
      console.error("[authService] loginWithGoogle error:", error);
      throw new Error(error.message || "Google Sign-In failed");
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      await deleteSecureItem("idToken");

      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          unsubscribe();

          if (firebaseUser) {
            console.debug(
              "[authService] onAuthStateChanged: firebaseUser present",
              firebaseUser.uid
            );
            const token = await getIdToken(firebaseUser);
            await setSecureItem("idToken", token);

            const userData: User = {
              localId: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              emailVerified: firebaseUser.emailVerified,
            };

            await AsyncStorage.setItem(
              STORAGE_KEYS.USER_DATA,
              JSON.stringify(userData)
            );
            resolve(userData);
          } else {
            const cachedUser = await AsyncStorage.getItem(
              STORAGE_KEYS.USER_DATA
            );
            console.debug(
              "[authService] onAuthStateChanged: no firebaseUser, cachedUser=",
              cachedUser
            );
            resolve(cachedUser ? JSON.parse(cachedUser) : null);
          }
        });
      });
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  async getValidToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        const token = await getSecureItem("idToken");
        return token || null;
      }

      const token = await getIdToken(currentUser);
      await setSecureItem("idToken", token);
      return token;
    } catch (error) {
      console.error("Get valid token error:", error);
      return null;
    }
  }

  async initializeAuth(): Promise<User | null> {
    try {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          unsubscribe();

          if (firebaseUser) {
            const token = await getIdToken(firebaseUser);
            await setSecureItem("idToken", token);

            const userData: User = {
              localId: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              emailVerified: firebaseUser.emailVerified,
            };

            await AsyncStorage.setItem(
              STORAGE_KEYS.USER_DATA,
              JSON.stringify(userData)
            );
            resolve(userData);
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error("Initialize auth error:", error);
      return null;
    }
  }
}

export const authService = AuthService.getInstance();
