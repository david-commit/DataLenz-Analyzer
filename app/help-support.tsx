import { Redirect } from "expo-router";

// Redirect to the actual help-and-support page
export default function HelpSupportRedirect() {
  return <Redirect href="/help-and-support" />;
}
