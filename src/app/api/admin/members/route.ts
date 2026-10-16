import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminApi } from "@/lib/admin-api";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { storagePathFromPublicUrl } from "@/lib/utils";
import { memberCreateSchema, memberUpdateSchema } from "@/lib/validations";

const deleteSchema = z.object({
  id: z.string().uuid(),
});

function revalidateTeam() {
  revalidatePath("/team");
  revalidatePath("/about");
  revalidatePath("/");
}

function blankToNull(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const parsed = memberCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid member", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const email = parsed.data.email?.trim() ?? "";
  const isAdmin = Boolean(email) && parsed.data.is_admin;

  const { count } = await admin.from("team").select("*", { count: "exact", head: true });
  const displayOrder = (count ?? 0) + 1;

  const profile = {
    display_name: parsed.data.display_name,
    role: parsed.data.role,
    description: blankToNull(parsed.data.description),
    linkedin_url: blankToNull(parsed.data.linkedin_url),
    is_admin: isAdmin,
    is_active: true,
    display_order: displayOrder,
  };

  if (email) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/portal/login`,
      data: {
        display_name: parsed.data.display_name,
        role: parsed.data.role,
      },
    });

    if (inviteError || !invited.user) {
      return NextResponse.json(
        { error: inviteError?.message ?? "Failed to invite user" },
        { status: 400 },
      );
    }

    const { error: teamError } = await admin.from("team").upsert({
      id: invited.user.id,
      ...profile,
    });

    if (teamError) {
      return NextResponse.json({ error: teamError.message }, { status: 400 });
    }

    revalidateTeam();
    return NextResponse.json({ ok: true, id: invited.user.id });
  }

  // Team rows must reference an Auth user. Page-only members get a login-less
  // account so they can appear on the public page without an invite email.
  const internalEmail = `member.${crypto.randomUUID()}@portal.gess.invalid`;
  const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
    email: internalEmail,
    email_confirm: true,
    password: `${crypto.randomUUID()}Aa1!`,
    user_metadata: {
      display_name: parsed.data.display_name,
      role: parsed.data.role,
      portal_login: false,
    },
  });

  if (createError || !createdUser.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Unable to add member" },
      { status: 400 },
    );
  }

  const { error: teamError } = await admin.from("team").insert({
    id: createdUser.user.id,
    ...profile,
  });

  if (teamError) {
    await admin.auth.admin.deleteUser(createdUser.user.id);
    return NextResponse.json({ error: teamError.message }, { status: 400 });
  }

  revalidateTeam();
  return NextResponse.json({ ok: true, id: createdUser.user.id });
}

export async function PATCH(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const parsed = memberUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid member", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (parsed.data.id === auth.user.id && parsed.data.is_admin === false) {
    return NextResponse.json(
      { error: "You cannot remove your own admin access" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: existing, error: readError } = await admin
    .from("team")
    .select("photo_url")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 400 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const update: {
    display_name?: string;
    role?: string;
    description?: string | null;
    linkedin_url?: string | null;
    photo_url?: string | null;
    is_admin?: boolean;
  } = {};

  if (parsed.data.display_name !== undefined) update.display_name = parsed.data.display_name;
  if (parsed.data.role !== undefined) update.role = parsed.data.role;
  if (parsed.data.description !== undefined) update.description = blankToNull(parsed.data.description);
  if (parsed.data.linkedin_url !== undefined) update.linkedin_url = blankToNull(parsed.data.linkedin_url);
  if (parsed.data.photo_url !== undefined) update.photo_url = blankToNull(parsed.data.photo_url);
  if (parsed.data.is_admin !== undefined) update.is_admin = parsed.data.is_admin;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await admin.from("team").update(update).eq("id", parsed.data.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (
    update.photo_url !== undefined &&
    existing.photo_url &&
    existing.photo_url !== update.photo_url
  ) {
    const oldPath = storagePathFromPublicUrl(existing.photo_url);
    if (oldPath) {
      await admin.storage.from(STORAGE_BUCKETS.teamPhotos).remove([oldPath]);
    }
  }

  revalidateTeam();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.id === auth.user.id) {
    return NextResponse.json({ error: "You cannot remove your own account" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing, error: readError } = await admin
    .from("team")
    .select("photo_url")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 400 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const { data: photoFiles } = await admin.storage
    .from(STORAGE_BUCKETS.teamPhotos)
    .list(parsed.data.id);
  const photoPaths = (photoFiles ?? [])
    .filter((file) => file.name)
    .map((file) => `${parsed.data.id}/${file.name}`);
  const currentPhoto = storagePathFromPublicUrl(existing.photo_url);
  if (currentPhoto && !photoPaths.includes(currentPhoto)) {
    photoPaths.push(currentPhoto);
  }
  if (photoPaths.length > 0) {
    await admin.storage.from(STORAGE_BUCKETS.teamPhotos).remove(photoPaths);
  }

  const { error: teamError } = await admin.from("team").delete().eq("id", parsed.data.id);
  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 400 });
  }

  const { error: authError } = await admin.auth.admin.deleteUser(parsed.data.id);
  if (authError && !/not found/i.test(authError.message)) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  revalidateTeam();
  return NextResponse.json({ ok: true });
}
