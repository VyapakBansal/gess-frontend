/**
 * Bulk-invite executives so each person gets a password-setup email.
 *
 * Usage:
 *   npm run bulk-invite
 *   npm run bulk-invite -- --force          # re-invite even if already set up
 *   npm run bulk-invite -- --resend         # email via Resend (bypasses Supabase mailer limits)
 *
 * Built-in Supabase email ≈ a few invites/hour. For 20+, either:
 *   1) Wait and re-run (script skips people who already got an invite), or
 *   2) Auth → SMTP: use Resend/SendGrid, then re-run, or
 *   3) --resend with RESEND_API_KEY + verified sending domain
 */

import { createClient } from "@supabase/supabase-js";

const MEMBERS = [
  { email: "rebecca.pettigrew@ucalgary.ca", display_name: "Rebecca Pettigrew", role: "Executive" },
  { email: "isabel.luck1@ucalgary.ca", display_name: "Isabel Luck", role: "Executive" },
  { email: "khalil.abukallossa@ucalgary.ca", display_name: "Khalil Abukallossa", role: "Executive" },
  { email: "danika.svetelj@ucalgary.ca", display_name: "Danika Svetelj", role: "Executive" },
  { email: "emma.milo@ucalgary.ca", display_name: "Emma Milo", role: "Executive" },
  { email: "tavish.comrie@ucalgary.ca", display_name: "Tavish Comrie", role: "Executive" },
  { email: "gabby.chin@ucalgary.ca", display_name: "Gabby Chin", role: "Executive" },
  { email: "aleinmar.win@ucalgary.ca", display_name: "Aleinmar Win", role: "Executive" },
  { email: "brayden.graf@ucalgary.ca", display_name: "Brayden Graf", role: "Executive" },
  { email: "andredominic.malabad@ucalgary.ca", display_name: "Andre Dominic Malabad", role: "Executive" },
  { email: "li.tan1@ucalgary.ca", display_name: "Li Tan", role: "Executive" },
  { email: "aidan.tran@ucalgary.ca", display_name: "Aidan Tran", role: "Executive" },
  { email: "matyas.gergely@ucalgary.ca", display_name: "Matyas Gergely", role: "Executive" },
  { email: "hady.ibrahim@ucalgary.ca", display_name: "Hady Ibrahim", role: "Executive" },
  { email: "andrew.mills1@ucalgary.ca", display_name: "Andrew Mills", role: "Executive" },
  { email: "ruthanne.gillis@ucalgary.ca", display_name: "Ruthanne Gillis", role: "Executive" },
  { email: "tanek.friesen@ucalgary.ca", display_name: "Tanek Friesen", role: "Executive" },
  { email: "vyapak.bansal@ucalgary.ca", display_name: "Vyapak Bansal", role: "Executive" },
  { email: "timothy.sears@ucalgary.ca", display_name: "Timothy Sears", role: "Executive" },
  { email: "bryce.ohara@ucalgary.ca", display_name: "Bryce O'Hara", role: "Executive" },
  { email: "samantha.figueroa@ucalgary.ca", display_name: "Samantha Figueroa", role: "Executive" },
  { email: "namal.nadeem@ucalgary.ca", display_name: "Namal Nadeem", role: "Executive" },
];

const FORCE = process.argv.includes("--force");
const USE_RESEND = process.argv.includes("--resend");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const redirectTo = `${siteUrl}/portal/login`;
const resendKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.CONTACT_FROM_EMAIL ?? process.env.INVITE_FROM_EMAIL;

if (!url || !secret) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

if (USE_RESEND && (!resendKey || !fromEmail)) {
  console.error(
    " --resend needs RESEND_API_KEY and CONTACT_FROM_EMAIL (verified domain) in .env.local",
  );
  process.exit(1);
}

const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findUserByEmail(email) {
  const target = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (match) return match;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function upsertTeam(userId, member, displayOrder) {
  const { error } = await admin.from("team").upsert({
    id: userId,
    display_name: member.display_name,
    role: member.role,
    is_admin: false,
    is_active: true,
    display_order: displayOrder,
  });
  if (error) throw error;
}

async function sendViaResend({ to, name, actionLink }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject: "You're invited to the GESS executive portal",
      text: [
        `Hi ${name},`,
        "",
        "You've been invited to the GESS executive portal.",
        "Open this link to confirm your email and set your password:",
        "",
        actionLink,
        "",
        "After that, sign in at:",
        redirectTo,
        "",
        "— GESS",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend: ${await response.text()}`);
  }
}

/** Create/ensure Auth user + team, email invite link through Resend (no Supabase mailer). */
async function inviteViaResend(member, displayOrder) {
  let user = await findUserByEmail(member.email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: member.email,
      email_confirm: false,
      user_metadata: {
        display_name: member.display_name,
        role: member.role,
      },
    });
    if (error || !data.user) throw new Error(error?.message ?? "createUser failed");
    user = data.user;
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email: member.email,
    options: {
      redirectTo,
      data: {
        display_name: member.display_name,
        role: member.role,
      },
    },
  });

  if (linkError) throw linkError;

  const actionLink = linkData?.properties?.action_link;
  if (!actionLink) throw new Error("generateLink did not return action_link");

  await sendViaResend({
    to: member.email,
    name: member.display_name,
    actionLink,
  });

  await upsertTeam(user.id, member, displayOrder);
  return user.id;
}

/** Supabase Auth sends the invite email (rate-limited on free mailer). */
async function inviteViaSupabase(member, displayOrder) {
  // Do NOT delete first — if invite fails (rate limit), delete+fail orphans accounts
  // and can break portal sessions. Only replace after a successful invite.
  const existing = await findUserByEmail(member.email);

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    member.email,
    {
      redirectTo,
      data: {
        display_name: member.display_name,
        role: member.role,
      },
    },
  );

  if (inviteError || !invited.user) {
    // User may already exist from a prior SQL/script run — fall back to generateLink path expectation
    if (existing && /already|registered|exists/i.test(inviteError?.message ?? "")) {
      throw new Error(
        `${inviteError.message} — use --resend or delete this Auth user in the dashboard, then re-run`,
      );
    }
    throw new Error(inviteError?.message ?? "Invite failed");
  }

  // If we re-invited over a previous id somehow, keep team on the returned user id
  if (existing && existing.id !== invited.user.id) {
    await admin.auth.admin.deleteUser(existing.id).catch(() => {});
  }

  await upsertTeam(invited.user.id, member, displayOrder);
  return invited.user.id;
}

async function alreadyInvited(member) {
  if (FORCE) return false;
  const user = await findUserByEmail(member.email);
  if (!user) return false;

  const { data: team } = await admin.from("team").select("id").eq("id", user.id).maybeSingle();
  // Invited successfully earlier: Auth user + team row exist.
  return Boolean(team);
}

async function main() {
  const mode = USE_RESEND ? "Resend API" : "Supabase Auth mailer";
  console.log(`Inviting members via ${mode}`);
  console.log(`Redirect: ${redirectTo}`);
  if (!FORCE) console.log("Skipping people who already have Auth + team (use --force to redo).\n");
  else console.log("FORCE: re-inviting everyone.\n");

  const { count } = await admin.from("team").select("*", { count: "exact", head: true });
  let order = count ?? 0;

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  let stoppedForRateLimit = false;

  for (const member of MEMBERS) {
    if (await alreadyInvited(member)) {
      skipped += 1;
      console.log(`↷ skip ${member.email} (already invited)`);
      continue;
    }

    order += 1;
    try {
      const id = USE_RESEND
        ? await inviteViaResend(member, order)
        : await inviteViaSupabase(member, order);
      ok += 1;
      console.log(`✓ ${member.email}  (${id})`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failed += 1;
      console.error(`✗ ${member.email}: ${message}`);

      if (!USE_RESEND && /rate limit/i.test(message)) {
        stoppedForRateLimit = true;
        console.error(
          "\nStopped: Supabase built-in email rate limit. Wait ~1 hour and re-run, or set custom SMTP / use --resend.\n",
        );
        break;
      }
    }

    await sleep(USE_RESEND ? 400 : 1500);
  }

  console.log(`\nDone. sent: ${ok}, skipped: ${skipped}, failed: ${failed}`);

  if (stoppedForRateLimit || failed > 0) {
    console.log(`
Next steps (pick one):
  A) Wait ~1 hour, then:  npm run bulk-invite
     (already-emailed people are skipped automatically)

  B) Supabase → Authentication → SMTP — connect Resend/SendGrid, then re-run:
       npm run bulk-invite

  C) Verified Resend domain + RESEND_API_KEY + CONTACT_FROM_EMAIL in .env.local:
       npm run bulk-invite -- --resend
`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
