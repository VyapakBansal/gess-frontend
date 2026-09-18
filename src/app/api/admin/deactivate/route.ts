import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminApi } from "@/lib/admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

const deactivateSchema = z.object({
  id: z.string().uuid(),
});

export async function POST(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const parsed = deactivateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.id === auth.user.id) {
    return NextResponse.json(
      { error: "You cannot deactivate your own account" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { error: teamError } = await admin
    .from("team")
    .update({ is_active: false })
    .eq("id", parsed.data.id);

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 400 });
  }

  const { error: banError } = await admin.auth.admin.updateUserById(parsed.data.id, {
    ban_duration: "876000h",
  });

  if (banError) {
    return NextResponse.json({ error: banError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
