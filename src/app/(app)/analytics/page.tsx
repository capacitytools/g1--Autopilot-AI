import { redirect } from "next/navigation";

export default function AnalyticsPage() {
  // Redirect to the main dashboard, which serves as the analytics hub
  redirect("/dashboard");
}