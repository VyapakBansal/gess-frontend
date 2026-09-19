"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  FieldError,
  FormMessage,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/form";
import { EVENT_TAGS, STORAGE_BUCKETS } from "@/lib/constants";
import { optimizeImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import type { EventRecord } from "@/lib/types";
import { storagePathFromPublicUrl } from "@/lib/utils";
import { eventSchema } from "@/lib/validations";

export function EventForm({
  event,
  userId,
}: {
  event?: EventRecord;
  userId: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(event);
  const [pending, setPending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(event?.image_url ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);

  async function onSubmit(eventSubmit: FormEvent<HTMLFormElement>) {
    eventSubmit.preventDefault();
    setPending(true);
    setErrors({});
    setMessage(null);
    setStatusText(null);

    const formData = new FormData(eventSubmit.currentTarget);
    const parsed = eventSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      event_date: formData.get("event_date"),
      end_date: formData.get("end_date"),
      location: formData.get("location"),
      tag: formData.get("tag"),
      status: formData.get("status"),
      is_featured: formData.get("is_featured") === "on",
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0] ?? "form")] = issue.message;
      });
      setErrors(fieldErrors);
      setPending(false);
      return;
    }

    const supabase = createClient();
    let imageUrl = event?.image_url ?? null;
    let uploadedPath: string | null = null;

    try {
      if (selectedFile) {
        setStatusText("Optimizing image…");
        const optimized = await optimizeImage(selectedFile);
        const extension = optimized.type === "image/png" ? "png" : "jpg";
        uploadedPath = `${userId}/${Date.now()}.${extension}`;

        setStatusText("Uploading image…");
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.eventImages)
          .upload(uploadedPath, optimized, {
            cacheControl: "3600",
            upsert: false,
            contentType: optimized.type,
          });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from(STORAGE_BUCKETS.eventImages)
          .getPublicUrl(uploadedPath);
        imageUrl = data.publicUrl;
      }

      const payload = {
        title: parsed.data.title,
        description: parsed.data.description || null,
        event_date: parsed.data.event_date,
        end_date: parsed.data.end_date || null,
        location: parsed.data.location || null,
        tag: parsed.data.tag,
        status: parsed.data.status,
        is_featured: parsed.data.is_featured,
        image_url: imageUrl,
      };

      setStatusText("Saving event…");

      if (isEdit && event) {
        const { error } = await supabase.from("events").update(payload).eq("id", event.id);
        if (error) throw error;

        if (selectedFile && event.image_url && uploadedPath) {
          const oldPath = storagePathFromPublicUrl(event.image_url);
          if (oldPath && oldPath !== uploadedPath) {
            await supabase.storage.from(STORAGE_BUCKETS.eventImages).remove([oldPath]);
          }
        }

        setMessage({ tone: "success", text: "Event updated." });
        await fetch("/api/portal/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table: "events" }),
        }).catch(() => null);
        router.refresh();
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert({ ...payload, created_by: userId })
          .select("id")
          .single();
        if (error) throw error;
        await fetch("/api/portal/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table: "events" }),
        }).catch(() => null);
        router.push(`/portal/events/${data.id}/edit`);
        router.refresh();
      }
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage.from(STORAGE_BUCKETS.eventImages).remove([uploadedPath]);
      }
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Unable to save event",
      });
    } finally {
      setPending(false);
      setStatusText(null);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={event?.title ?? ""} required />
          <FieldError>{errors.title}</FieldError>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={event?.description ?? ""} />
          <FieldError>{errors.description}</FieldError>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_date">Event date</Label>
          <Input id="event_date" name="event_date" type="date" defaultValue={event?.event_date ?? ""} required />
          <FieldError>{errors.event_date}</FieldError>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End date</Label>
          <Input id="end_date" name="end_date" type="date" defaultValue={event?.end_date ?? ""} />
          <FieldError>{errors.end_date}</FieldError>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={event?.location ?? ""} />
          <FieldError>{errors.location}</FieldError>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tag">Category</Label>
          <Select id="tag" name="tag" defaultValue={event?.tag ?? "other"}>
            {EVENT_TAGS.map((tag) => (
              <option key={tag.value} value={tag.value}>
                {tag.label}
              </option>
            ))}
          </Select>
          <FieldError>{errors.tag}</FieldError>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={event?.status ?? "upcoming"}>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </Select>
          <FieldError>{errors.status}</FieldError>
        </div>

        <div className="flex items-end">
          <label className="flex h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={event?.is_featured ?? false}
              className="size-4 accent-[var(--gess-accent)]"
            />
            Featured event
          </label>
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label htmlFor="image">Image</Label>
          {preview ? (
            <div className="relative aspect-[16/9] max-w-xl overflow-hidden border border-gess-border">
              <Image
                src={preview}
                alt=""
                fill
                className="object-cover"
                unoptimized={preview.startsWith("blob:")}
              />
            </div>
          ) : null}
          <Input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(changeEvent) => {
              const file = changeEvent.target.files?.[0] ?? null;
              setSelectedFile(file);
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </div>
      </div>

      {statusText ? <FormMessage>{statusText}</FormMessage> : null}
      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Update event" : "Create event"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/portal/events")}
        >
          Back to events
        </Button>
      </div>
    </form>
  );
}
