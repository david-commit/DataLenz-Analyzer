import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  return <Redirect href={isAuthenticated ? "/home" : "/auth"} />;
}
