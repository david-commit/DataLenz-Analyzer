import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, RefreshTokenResponse, User } from '@/types/auth';

const FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const AUTH_ENDPOINT = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
const REGISTER_ENDPOINT = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
const REFRESH_ENDPOINT = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`;

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  TOKEN_EXPIRY: 'token_expiry',
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
      const response = await fetch(AUTH_ENDPOINT, {
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
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      await this.storeTokens(data);
      this.scheduleTokenRefresh(parseInt(data.expiresIn));

      const user: User = {
        localId: data.localId,
        email: data.email,
        displayName: data.displayName,
        emailVerified: false, // You can get this from user info endpoint if needed
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  }

  async register(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(REGISTER_ENDPOINT, {
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
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      await this.storeTokens(data);
      this.scheduleTokenRefresh(parseInt(data.expiresIn));

      const user: User = {
        localId: data.localId,
        email: data.email,
        displayName: data.displayName,
        emailVerified: false,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  }

  async loginWithGoogle(): Promise<User> {
    // For now, we'll throw an error since Google Sign-In requires additional setup
    // In a real implementation, you would use expo-auth-session or similar
    throw new Error('Google Sign-In not implemented yet. Please use email/password.');
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.TOKEN_EXPIRY,
      ]);

      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!userData) return null;

      const user = JSON.parse(userData);
      const token = await this.getValidToken();
      
      return token ? user : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async getValidToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const expiryStr = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      
      if (!token || !expiryStr) return null;

      const expiry = parseInt(expiryStr);
      const now = Date.now();

      // If token expires in less than 5 minutes, refresh it
      if (expiry - now < 5 * 60 * 1000) {
        return await this.refreshToken();
      }

      return token;
    } catch (error) {
      console.error('Get valid token error:', error);
      return null;
    }
  }

  private async storeTokens(authData: AuthResponse): Promise<void> {
    const expiryTime = Date.now() + (parseInt(authData.expiresIn) * 1000);
    
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, authData.idToken],
      [STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken],
      [STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()],
    ]);
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return null;

      const response = await fetch(REFRESH_ENDPOINT, {
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
        // If refresh fails, user needs to login again
        await this.logout();
        return null;
      }

      const data: RefreshTokenResponse = await response.json();
      
      const expiryTime = Date.now() + (parseInt(data.expires_in) * 1000);
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, data.id_token],
        [STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token],
        [STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()],
      ]);

      this.scheduleTokenRefresh(parseInt(data.expires_in));
      return data.id_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.logout();
      return null;
    }
  }

  private scheduleTokenRefresh(expiresInSeconds: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Schedule refresh 5 minutes before expiry
    const refreshTime = (expiresInSeconds - 300) * 1000;
    
    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshTime);
  }

  async initializeAuth(): Promise<User | null> {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        // Check if token is still valid and schedule refresh if needed
        const token = await this.getValidToken();
        if (token) {
          const expiryStr = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
          if (expiryStr) {
            const expiry = parseInt(expiryStr);
            const now = Date.now();
            const expiresInSeconds = Math.floor((expiry - now) / 1000);
            
            if (expiresInSeconds > 0) {
              this.scheduleTokenRefresh(expiresInSeconds);
            }
          }
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error('Initialize auth error:', error);
      return null;
    }
  }
}

export const authService = AuthService.getInstance();