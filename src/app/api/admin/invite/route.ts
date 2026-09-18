import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin-api";
import { createAdminClient } from "@/lib/supabase/admin";
import { inviteSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid invite payload", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const admin = createAdminClient();

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      redirectTo: `${siteUrl}/portal/login`,
      data: {
        display_name: parsed.data.display_name,
        role: parsed.data.role,
      },
    },
  );

  if (inviteError || !invited.user) {
    return NextResponse.json(
      { error: inviteError?.message ?? "Failed to invite user" },
      { status: 400 },
    );
  }

  const { count } = await admin
    .from("team")
    .select("*", { count: "exact", head: true });

  const { error: teamError } = await admin.from("team").upsert({
    id: invited.user.id,
    display_name: parsed.data.display_name,
    role: parsed.data.role,
    is_admin: parsed.data.is_admin,
    is_active: true,
    display_order: (count ?? 0) + 1,
  });

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: invited.user.id });
}
