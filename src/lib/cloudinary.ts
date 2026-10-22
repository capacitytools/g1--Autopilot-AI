import { getConfig } from "./config";

export async function uploadToCloudinary(file: File): Promise<{ url: string; width: number; height: number }> {
  const config = getConfig();

  if (!config.cloudinary.isConfigured) {
    throw new Error("Cloudinary is not configured. Please add the environment variables.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", config.cloudinary.uploadPreset!);
  formData.append("folder", "g1-autopilot/images");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to upload image.");
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    width: data.width,
    height: data.height,
  };
}