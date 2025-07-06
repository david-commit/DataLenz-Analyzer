import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, RefreshTokenResponse, User } from '@/types/auth';

const FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

const AUTH_ENDPOINTS = {
  SIGN_IN: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
  SIGN_UP: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
  REFRESH_TOKEN: `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
  GET_USER_DATA: `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
};

const STORAGE_KEYS = {
  ID_TOKEN: 'id_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  TOKEN_EXPIRY: 'token_expiry',
};

class AuthService {
  private refreshTimer: NodeJS.Timeout | null = null;

  async signInWithEmailPassword(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_ENDPOINTS.SIGN_IN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Login failed');
    }

    return response.json();
  }

  async signUpWithEmailPassword(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_ENDPOINTS.SIGN_UP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Registration failed');
    }

    return response.json();
  }

  async refreshIdToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await fetch(AUTH_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Token refresh failed');
    }

    return response.json();
  }

  async storeAuthData(authResponse: AuthResponse): Promise<void> {
    const expiryTime = Date.now() + parseInt(authResponse.expiresIn) * 1000;
    
    const userData: User = {
      localId: authResponse.localId,
      email: authResponse.email,
      displayName: authResponse.displayName,
      emailVerified: authResponse.emailVerified || false,
    };

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ID_TOKEN, authResponse.idToken),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refreshToken),
      AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()),
    ]);

    this.scheduleTokenRefresh(parseInt(authResponse.expiresIn));
  }

  async getStoredAuthData(): Promise<{ user: User; idToken: string } | null> {
    try {
      const [idToken, userData, tokenExpiry] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ID_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY),
      ]);

      if (!idToken || !userData || !tokenExpiry) {
        return null;
      }

      const expiryTime = parseInt(tokenExpiry);
      const now = Date.now();

      // If token is expired or will expire in the next 5 minutes, refresh it
      if (now >= expiryTime - 5 * 60 * 1000) {
        const refreshed = await this.handleTokenRefresh();
        if (!refreshed) {
          return null;
        }
        return this.getStoredAuthData();
      }

      const user: User = JSON.parse(userData);
      this.scheduleTokenRefresh(Math.floor((expiryTime - now) / 1000));

      return { user, idToken };
    } catch (error) {
      console.error('Error getting stored auth data:', error);
      return null;
    }
  }

  private async handleTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        return false;
      }

      const refreshResponse = await this.refreshIdToken(refreshToken);
      
      const expiryTime = Date.now() + parseInt(refreshResponse.expires_in) * 1000;
      
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ID_TOKEN, refreshResponse.id_token),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshResponse.refresh_token),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()),
      ]);

      this.scheduleTokenRefresh(parseInt(refreshResponse.expires_in));
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearAuthData();
      return false;
    }
  }

  private scheduleTokenRefresh(expiresInSeconds: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Refresh 5 minutes before expiry
    const refreshTime = Math.max(0, (expiresInSeconds - 300) * 1000);
    
    this.refreshTimer = setTimeout(() => {
      this.handleTokenRefresh();
    }, refreshTime);
  }

  async clearAuthData(): Promise<void> {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ID_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
    ]);
  }

  async getCurrentIdToken(): Promise<string | null> {
    const authData = await this.getStoredAuthData();
    return authData?.idToken || null;
  }
}

export const authService = new AuthService();