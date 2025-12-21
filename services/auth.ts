import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken,
  signInWithCredential,
  OAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/config/firebase";
import * as SecureStore from "expo-secure-store";

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
      await SecureStore.setItemAsync("idToken", token);

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
      await SecureStore.setItemAsync("idToken", token);

      return userData;
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  }

  async loginWithGoogle(idToken: string): Promise<User> {
    try {
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
      await SecureStore.setItemAsync("idToken", token);

      return userData;
    } catch (error: any) {
      throw new Error(error.message || "Google Sign-In failed");
    }
  }

  async loginWithFacebook(accessToken: string): Promise<User> {
    try {
      const credential = FacebookAuthProvider.credential(accessToken);
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
      await SecureStore.setItemAsync("idToken", token);

      return userData;
    } catch (error: any) {
      throw new Error(error.message || "Facebook Sign-In failed");
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      await SecureStore.deleteItemAsync("idToken");

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
            const token = await getIdToken(firebaseUser);
            await SecureStore.setItemAsync("idToken", token);

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
        const token = await SecureStore.getItemAsync("idToken");
        return token || null;
      }

      const token = await getIdToken(currentUser);
      await SecureStore.setItemAsync("idToken", token);
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
            await SecureStore.setItemAsync("idToken", token);

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
