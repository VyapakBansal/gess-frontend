import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

type WebhookPayload = {
  type?: string;
  table?: string;
  record?: Record<string, unknown>;
  schema?: string;
};

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: WebhookPayload = {};
  try {
    payload = (await request.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const table = payload.table?.toLowerCase();

  if (table === "team") {
    revalidatePath("/team");
    revalidatePath("/about");
    revalidatePath("/");
    return NextResponse.json({
      revalidated: true,
      paths: ["/team", "/about", "/"],
    });
  }

  if (table === "events") {
    revalidatePath("/events");
    revalidatePath("/");
    return NextResponse.json({ revalidated: true, paths: ["/events", "/"] });
  }

  return NextResponse.json(
    { error: "Unsupported table. Expected team or events." },
    { status: 400 },
  );
}
