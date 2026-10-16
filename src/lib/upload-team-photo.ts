"use client";

import { STORAGE_BUCKETS } from "@/lib/constants";
import { optimizeImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";

export async function uploadTeamPhoto(memberId: string, file: File) {
  const optimized = await optimizeImage(file);
  const extension = optimized.type === "image/png" ? "png" : "jpg";
  const path = `${memberId}/${Date.now()}.${extension}`;
  const supabase = createClient();

  const { error } = await supabase.storage.from(STORAGE_BUCKETS.teamPhotos).upload(path, optimized, {
    cacheControl: "3600",
    upsert: false,
    contentType: optimized.type,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKETS.teamPhotos).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}
