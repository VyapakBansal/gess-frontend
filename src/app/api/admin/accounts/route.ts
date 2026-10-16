import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminApi } from "@/lib/admin-api";
import { createAdminClient } from "@/lib/supabase/admin";
import { reorderIds } from "@/lib/team-order";

const orderSchema = z.object({
  id: z.string().uuid(),
  display_order: z.number().int().min(0).max(999),
});

export async function PATCH(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: members, error: readError } = await admin
    .from("team")
    .select("id, display_order")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 400 });
  }

  const ordered = reorderIds(
    (members ?? []).map((member) => member.id),
    parsed.data.id,
    parsed.data.display_order,
  );
  if (!ordered) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const currentOrder = new Map((members ?? []).map((member) => [member.id, member.display_order]));
  for (const [index, memberId] of ordered.entries()) {
    if (currentOrder.get(memberId) === index) continue;
    const { error } = await admin.from("team").update({ display_order: index }).eq("id", memberId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  revalidatePath("/team");
  revalidatePath("/about");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
