import React, {
  createContext,
  useContext,
  ReactNode,
} from "react";

interface AppContextType {
  backendUrl: string;
  companyName: string;
  developerWebsite: string;
  supportEmail: string;
  appName: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {

  const value: AppContextType = {
    backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8001/api",
    companyName: process.env.EXPO_PUBLIC_COMPANY_NAME || "Datalens Ltd.",
    developerWebsite: process.env.EXPO_PUBLIC_DEVELOPER_WEBSITE || "datalens.com",
    supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || "executiveanalyticsai@gmail.com",
    appName: process.env.EXPO_PUBLIC_APP_NAME || "DataLens Analyzer",
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
