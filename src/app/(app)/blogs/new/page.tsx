import { Metadata } from "next";
import { WebsiteBuilderUI } from "@/lib/WebsiteBuilderUI";

export const metadata: Metadata = {
  title: "Create a Website",
};

export default function CreateBlogPage() {
  return <WebsiteBuilderUI />;
}