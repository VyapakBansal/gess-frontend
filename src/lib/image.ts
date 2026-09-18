"use client";

import imageCompression from "browser-image-compression";
import { IMAGE_LIMITS } from "@/lib/constants";

export async function optimizeImage(file: File): Promise<File> {
  if (!IMAGE_LIMITS.acceptedTypes.includes(file.type as (typeof IMAGE_LIMITS.acceptedTypes)[number])) {
    throw new Error("Please upload a JPEG, PNG, WebP, or GIF image.");
  }

  if (file.size > IMAGE_LIMITS.maxInputBytes) {
    throw new Error("Image is too large. Please choose a file under 12MB.");
  }

  const compressed = await imageCompression(file, {
    maxWidthOrHeight: IMAGE_LIMITS.maxWidthOrHeight,
    maxSizeMB: IMAGE_LIMITS.maxSizeMB,
    useWebWorker: true,
    fileType: file.type === "image/png" ? "image/png" : "image/jpeg",
    initialQuality: 0.82,
  });

  const extension = compressed.type === "image/png" ? "png" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";

  return new File([compressed], `${baseName}.${extension}`, {
    type: compressed.type,
    lastModified: Date.now(),
  });
}
