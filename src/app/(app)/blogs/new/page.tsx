import { Metadata } from "next";
import { CreateBlogForm } from "@/lib/CreateBlogForm";

export const metadata: Metadata = {
  title: "Create a Blog",
};

export default function CreateBlogPage() {
  return <CreateBlogForm />;
}