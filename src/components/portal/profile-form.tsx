"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FormMessage, Input, Label, Textarea } from "@/components/ui/form";
import { DESCRIPTION_MAX, STORAGE_BUCKETS } from "@/lib/constants";
import { optimizeImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import type { TeamMember } from "@/lib/types";
import { storagePathFromPublicUrl } from "@/lib/utils";
import { profileSchema } from "@/lib/validations";

export function ProfileForm({ profile }: { profile: TeamMember }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(profile.photo_url);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [descriptionLength, setDescriptionLength] = useState(
    profile.description?.length ?? 0,
  );

  const initial = useMemo(
    () => ({
      display_name: profile.display_name,
      role: profile.role,
      description: profile.description ?? "",
      linkedin_url: profile.linkedin_url ?? "",
    }),
    [profile],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage(null);
    setUploadProgress(null);

    const formData = new FormData(event.currentTarget);
    const parsed = profileSchema.safeParse({
      display_name: formData.get("display_name"),
      role: formData.get("role"),
      description: formData.get("description"),
      linkedin_url: formData.get("linkedin_url"),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] ?? "form");
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      setPending(false);
      return;
    }

    const supabase = createClient();
    let nextPhotoUrl = profile.photo_url;
    let uploadedPath: string | null = null;

    try {
      if (selectedFile) {
        setUploadProgress("Optimizing image…");
        const optimized = await optimizeImage(selectedFile);
        const extension = optimized.type === "image/png" ? "png" : "jpg";
        uploadedPath = `${profile.id}/${Date.now()}.${extension}`;

        setUploadProgress("Uploading…");
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.teamPhotos)
          .upload(uploadedPath, optimized, {
            cacheControl: "3600",
            upsert: false,
            contentType: optimized.type,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from(STORAGE_BUCKETS.teamPhotos)
          .getPublicUrl(uploadedPath);
        nextPhotoUrl = data.publicUrl;
      }

      setUploadProgress("Saving profile…");
      const { error: updateError } = await supabase
        .from("team")
        .update({
          display_name: parsed.data.display_name,
          role: parsed.data.role,
          description: parsed.data.description || null,
          linkedin_url: parsed.data.linkedin_url || null,
          photo_url: nextPhotoUrl,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      if (selectedFile && profile.photo_url && uploadedPath) {
        const oldPath = storagePathFromPublicUrl(profile.photo_url);
        if (oldPath && oldPath !== uploadedPath) {
          await supabase.storage.from(STORAGE_BUCKETS.teamPhotos).remove([oldPath]);
        }
      }

      // Bust public /team ISR cache (router.refresh only updates the portal).
      await fetch("/api/portal/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "team" }),
      }).catch(() => null);

      setMessage({ tone: "success", text: "Profile updated." });
      setSelectedFile(null);
      router.refresh();
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage.from(STORAGE_BUCKETS.teamPhotos).remove([uploadedPath]);
      }
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Unable to update profile",
      });
    } finally {
      setPending(false);
      setUploadProgress(null);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[180px_1fr]">
        <div className="space-y-3">
          <div className="relative aspect-[4/5] overflow-hidden border border-gess-border bg-gess-surface">
            {preview ? (
              <Image src={preview} alt="" fill className="object-cover" unoptimized={preview.startsWith("blob:")} />
            ) : (
              <div className="flex h-full items-end p-3 text-meta text-gess-muted">NO PHOTO</div>
            )}
          </div>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
              if (file) {
                setPreview(URL.createObjectURL(file));
              }
            }}
          />
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display name</Label>
            <Input id="display_name" name="display_name" defaultValue={initial.display_name} required />
            <FieldError>{errors.display_name}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role / title</Label>
            <Input id="role" name="role" defaultValue={initial.role} required />
            <FieldError>{errors.role}</FieldError>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="description">Description</Label>
              <span className="text-meta text-gess-muted">
                {descriptionLength}/{DESCRIPTION_MAX}
              </span>
            </div>
            <Textarea
              id="description"
              name="description"
              maxLength={DESCRIPTION_MAX}
              defaultValue={initial.description}
              onChange={(event) => setDescriptionLength(event.target.value.length)}
            />
            <FieldError>{errors.description}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              placeholder="https://linkedin.com/in/…"
              defaultValue={initial.linkedin_url}
            />
            <FieldError>{errors.linkedin_url}</FieldError>
          </div>
        </div>
      </div>

      {uploadProgress ? <FormMessage>{uploadProgress}</FormMessage> : null}
      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}

      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
