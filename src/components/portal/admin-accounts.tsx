"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  FieldError,
  FormMessage,
  Input,
  Label,
  Select,
} from "@/components/ui/form";
import type { TeamMember } from "@/lib/types";
import { inviteSchema } from "@/lib/validations";

export function InviteForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const parsed = inviteSchema.safeParse({
      display_name: formData.get("display_name"),
      email: formData.get("email"),
      role: formData.get("role"),
      is_admin: formData.get("is_admin") === "on",
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

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Invite failed");

      setMessage({ tone: "success", text: `Invite sent to ${parsed.data.email}.` });
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Invite failed",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-gess-border bg-gess-surface/40 p-5">
      <div>
        <p className="text-meta text-gess-accent mb-2">Invite executive</p>
        <p className="text-sm text-gess-muted">
          Creates an Auth invite and a corresponding team profile. No public signup.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="display_name">Name</Label>
          <Input id="display_name" name="display_name" required />
          <FieldError>{errors.display_name}</FieldError>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
          <FieldError>{errors.email}</FieldError>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input id="role" name="role" placeholder="Vice President" required />
          <FieldError>{errors.role}</FieldError>
        </div>
        <div className="flex items-end">
          <label className="flex h-11 items-center gap-3 text-sm">
            <input type="checkbox" name="is_admin" className="size-4 accent-[var(--gess-accent)]" />
            Grant admin
          </label>
        </div>
      </div>

      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Sending invite…" : "Send invite"}
      </Button>
    </form>
  );
}

export function AccountsTable({ accounts }: { accounts: TeamMember[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function deactivate(account: TeamMember) {
    if (!window.confirm(`Deactivate ${account.display_name}?`)) return;

    setPendingId(account.id);
    setError(null);

    try {
      const response = await fetch("/api/admin/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Deactivation failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deactivation failed");
    } finally {
      setPendingId(null);
    }
  }

  async function updateOrder(account: TeamMember, display_order: number) {
    setPendingId(account.id);
    setError(null);

    try {
      const response = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id, display_order }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to update order");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update order");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      <div className="overflow-x-auto border border-gess-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gess-surface text-meta text-gess-muted">
            <tr>
              <th className="px-4 py-3 font-normal">Name</th>
              <th className="px-4 py-3 font-normal">Role</th>
              <th className="px-4 py-3 font-normal">Access</th>
              <th className="px-4 py-3 font-normal">Order</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="border-t border-gess-border">
                <td className="px-4 py-3 font-medium">{account.display_name}</td>
                <td className="px-4 py-3">{account.role}</td>
                <td className="px-4 py-3">{account.is_admin ? "Admin" : "Exec"}</td>
                <td className="px-4 py-3">
                  <Select
                    aria-label={`Display order for ${account.display_name}`}
                    value={String(account.display_order)}
                    disabled={pendingId === account.id}
                    onChange={(event) =>
                      updateOrder(account, Number(event.target.value))
                    }
                  >
                    {Array.from({ length: Math.max(accounts.length, 12) }, (_, i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-4 py-3">
                  {account.is_active ? "Active" : "Inactive"}
                </td>
                <td className="px-4 py-3">
                  {account.is_active ? (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={pendingId === account.id}
                      onClick={() => deactivate(account)}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <span className="text-gess-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
