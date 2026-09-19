import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { assertActiveExecApi } from "@/lib/admin-api";

/**
 * Authenticated portal helper — bust public ISR after profile/event edits.
 * (Database webhooks also hit /api/revalidate; this covers when webhooks are missing.)
 */
export async function POST(request: Request) {
  const auth = await assertActiveExecApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let table = "team";
  try {
    const body = (await request.json()) as { table?: string };
    if (body.table === "events" || body.table === "team") {
      table = body.table;
    }
  } catch {
    // default team
  }

  if (table === "events") {
    revalidatePath("/events");
    revalidatePath("/");
    return NextResponse.json({ revalidated: true, paths: ["/events", "/"] });
  }

  revalidatePath("/team");
  revalidatePath("/about");
  revalidatePath("/");
  return NextResponse.json({
    revalidated: true,
    paths: ["/team", "/about", "/"],
  });
}
