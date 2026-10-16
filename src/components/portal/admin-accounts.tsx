"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  FieldError,
  FormMessage,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/form";
import { DESCRIPTION_MAX, STORAGE_BUCKETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { TeamMember } from "@/lib/types";
import { uploadTeamPhoto } from "@/lib/upload-team-photo";
import { memberCreateSchema, profileSchema } from "@/lib/validations";

const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function AddMemberForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  function clearPreview(next: string | null) {
    setPreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return next;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const parsed = memberCreateSchema.safeParse({
      display_name: formData.get("display_name"),
      role: formData.get("role"),
      description: formData.get("description"),
      linkedin_url: formData.get("linkedin_url"),
      email: formData.get("email"),
      is_admin: Boolean(String(formData.get("email") ?? "").trim()) && formData.get("is_admin") === "on",
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

    let createdId: string | null = null;
    let uploadedPath: string | null = null;

    try {
      const response = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to add member");
      createdId = data.id as string;

      if (selectedFile && createdId) {
        const uploaded = await uploadTeamPhoto(createdId, selectedFile);
        uploadedPath = uploaded.path;
        const photoResponse = await fetch("/api/admin/members", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: createdId, photo_url: uploaded.publicUrl }),
        });
        const photoData = await photoResponse.json();
        if (!photoResponse.ok) throw new Error(photoData.error ?? "Member added, but the photo did not save");
      }

      const invited = Boolean(parsed.data.email?.trim());
      setMessage({
        tone: "success",
        text: invited
          ? `${parsed.data.display_name} is on the team page, and an invite was sent to ${parsed.data.email}.`
          : `${parsed.data.display_name} is on the team page.`,
      });
      form.reset();
      setEmail("");
      setSelectedFile(null);
      setDescriptionLength(0);
      clearPreview(null);
      router.refresh();
    } catch (error) {
      if (uploadedPath) {
        const supabase = createClient();
        await supabase.storage.from(STORAGE_BUCKETS.teamPhotos).remove([uploadedPath]);
      }
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Unable to add member",
      });
      if (createdId) router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-gess-border bg-gess-surface/40 p-5">
      <div>
        <p className="text-meta text-gess-accent mb-2">Add member</p>
        <p className="text-sm text-gess-muted">
          They show on the public team page immediately. Add an email only if they should also get a portal login.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[180px_1fr]">
        <div className="space-y-3">
          <div className="relative aspect-[4/5] overflow-hidden border border-gess-border bg-gess-surface">
            {preview ? (
              <Image
                src={preview}
                alt=""
                fill
                className="object-cover"
                unoptimized={preview.startsWith("blob:")}
              />
            ) : (
              <div className="flex h-full items-end p-3 text-meta text-gess-muted">NO PHOTO</div>
            )}
          </div>
          <Input
            type="file"
            accept={PHOTO_ACCEPT}
            aria-label="Member photo"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
              clearPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display_name">Name</Label>
            <Input id="display_name" name="display_name" required />
            <FieldError>{errors.display_name}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" placeholder="Vice President" required />
            <FieldError>{errors.role}</FieldError>
          </div>
          <div className="space-y-2 md:col-span-2">
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
            />
            <FieldError>{errors.linkedin_url}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Portal email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Optional"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <FieldError>{errors.email}</FieldError>
          </div>
          <label className="flex h-11 items-center gap-3 text-sm md:col-span-2">
            <input
              type="checkbox"
              name="is_admin"
              disabled={!email.trim()}
              className="size-4 accent-[var(--gess-accent)]"
            />
            Grant admin
            <span className="text-gess-muted">Requires a portal email</span>
          </label>
        </div>
      </div>

      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Adding…" : "Add to team page"}
      </Button>
    </form>
  );
}

export function AccountsTable({
  accounts,
  currentUserId,
}: {
  accounts: TeamMember[];
  currentUserId: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-meta text-gess-accent mb-2">Team page</p>
        <p className="text-sm text-gess-muted">
          Upload a photo for anyone here. Position 1 is the top of the team page — moving someone shifts the rest of the list. Removing a member takes them off the public page and deletes their portal login.
        </p>
      </div>
      {accounts.length === 0 ? (
        <div className="border border-dashed border-gess-border p-8 text-sm text-gess-muted">
          No members yet. Add the first one above.
        </div>
      ) : (
        <div className="divide-y divide-gess-border border border-gess-border">
          {accounts.map((account, index) => (
            <MemberRow
              key={account.id}
              account={account}
              position={index}
              total={accounts.length}
              isSelf={account.id === currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberRow({
  account,
  position,
  total,
  isSelf,
}: {
  account: TeamMember;
  position: number;
  total: number;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState(account.photo_url);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [descriptionLength, setDescriptionLength] = useState(account.description?.length ?? 0);

  useEffect(() => {
    setPreview(account.photo_url);
  }, [account.photo_url]);

  async function uploadPhoto(file: File) {
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setPending("photo");
    setError(null);
    let uploadedPath: string | null = null;

    try {
      const uploaded = await uploadTeamPhoto(account.id, file);
      uploadedPath = uploaded.path;
      setPreview(uploaded.publicUrl);
      const response = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id, photo_url: uploaded.publicUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save photo");
      URL.revokeObjectURL(localPreview);
      router.refresh();
    } catch (err) {
      if (uploadedPath) {
        const supabase = createClient();
        await supabase.storage.from(STORAGE_BUCKETS.teamPhotos).remove([uploadedPath]);
      }
      URL.revokeObjectURL(localPreview);
      setPreview(account.photo_url);
      setError(err instanceof Error ? err.message : "Unable to save photo");
    } finally {
      setPending(null);
    }
  }

  async function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("details");
    setError(null);

    const formData = new FormData(event.currentTarget);
    const parsed = profileSchema.safeParse({
      display_name: formData.get("display_name"),
      role: formData.get("role"),
      description: formData.get("description"),
      linkedin_url: formData.get("linkedin_url"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form");
      setPending(null);
      return;
    }

    const payload = {
      id: account.id,
      ...parsed.data,
      ...(isSelf ? {} : { is_admin: formData.get("is_admin") === "on" }),
    };

    try {
      const response = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save member");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save member");
    } finally {
      setPending(null);
    }
  }

  async function updateOrder(nextPosition: number) {
    if (nextPosition === position) return;

    setPending("order");
    setError(null);

    try {
      const response = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id, display_order: nextPosition }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to update order");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update order");
    } finally {
      setPending(null);
    }
  }

  async function removeMember() {
    if (!window.confirm(`Remove ${account.display_name} from the team page? This also deletes their portal login.`)) {
      return;
    }

    setPending("remove");
    setError(null);

    try {
      const response = await fetch("/api/admin/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to remove member");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove member");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <div className="relative aspect-[4/5] w-24 overflow-hidden border border-gess-border bg-gess-surface">
            {preview ? (
              <Image
                src={preview}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
                unoptimized={preview.startsWith("blob:")}
              />
            ) : (
              <div className="flex h-full items-end p-2 text-meta text-gess-muted">NO PHOTO</div>
            )}
          </div>
          <label className="inline-flex h-9 cursor-pointer items-center rounded-sm border border-gess-border px-3 text-sm hover:border-gess-white/40">
            {pending === "photo" ? "Uploading…" : preview ? "Replace photo" : "Upload photo"}
            <input
              type="file"
              accept={PHOTO_ACCEPT}
              className="sr-only"
              disabled={pending !== null}
              aria-label={`Photo for ${account.display_name}`}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void uploadPhoto(file);
              }}
            />
          </label>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-medium">{account.display_name}</p>
            <p className="text-meta text-gess-accent">{account.role}</p>
          </div>
          <p className="text-meta text-gess-muted">
            {account.is_admin ? "Admin" : "Member"}
            {" · "}
            {account.is_active ? "On the team page" : "Hidden"}
            {account.photo_url ? "" : " · No photo"}
          </p>
          {account.description ? (
            <p className="text-sm leading-relaxed text-gess-muted">{account.description}</p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" variant="secondary" disabled={pending !== null} onClick={() => setEditing((open) => !open)}>
              {editing ? "Close" : "Edit details"}
            </Button>
            {isSelf ? (
              <span className="self-center text-meta text-gess-muted">This is you</span>
            ) : (
              <Button size="sm" variant="danger" disabled={pending !== null} onClick={() => void removeMember()}>
                {pending === "remove" ? "Removing…" : "Remove"}
              </Button>
            )}
          </div>
        </div>

        <div className="w-full sm:w-28">
          <Label htmlFor={`order-${account.id}`}>Position</Label>
          <Select
            id={`order-${account.id}`}
            className="mt-2"
            aria-label={`Position for ${account.display_name}`}
            value={String(position)}
            disabled={pending !== null}
            onChange={(event) => void updateOrder(Number(event.target.value))}
          >
            {Array.from({ length: total }, (_, index) => (
              <option key={index} value={index}>
                {index + 1}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error ? <FormMessage tone="error">{error}</FormMessage> : null}

      {editing ? (
        <form onSubmit={saveDetails} className="grid gap-4 border border-gess-border bg-gess-surface/40 p-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`name-${account.id}`}>Name</Label>
            <Input id={`name-${account.id}`} name="display_name" defaultValue={account.display_name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`role-${account.id}`}>Role</Label>
            <Input id={`role-${account.id}`} name="role" defaultValue={account.role} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={`description-${account.id}`}>Description</Label>
              <span className="text-meta text-gess-muted">
                {descriptionLength}/{DESCRIPTION_MAX}
              </span>
            </div>
            <Textarea
              id={`description-${account.id}`}
              name="description"
              maxLength={DESCRIPTION_MAX}
              defaultValue={account.description ?? ""}
              onChange={(event) => setDescriptionLength(event.target.value.length)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`linkedin-${account.id}`}>LinkedIn URL</Label>
            <Input
              id={`linkedin-${account.id}`}
              name="linkedin_url"
              type="url"
              placeholder="https://linkedin.com/in/…"
              defaultValue={account.linkedin_url ?? ""}
            />
          </div>
          <label className="flex h-11 items-end gap-3 pb-2 text-sm">
            <input
              type="checkbox"
              name="is_admin"
              defaultChecked={account.is_admin}
              disabled={isSelf}
              className="size-4 accent-[var(--gess-accent)]"
            />
            Admin
          </label>
          <div className="md:col-span-2">
            <Button type="submit" variant="accent" size="sm" disabled={pending !== null}>
              {pending === "details" ? "Saving…" : "Save details"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
