# GESS Website + Self-Serve Content Portal

## Product Requirements Document

---

# 1. Product Overview

**Product:** A modern public website and authenticated self-serve content portal for the **Geomatics Engineering Student Society (GESS)**.

The product consists of two connected surfaces:

### Public Website

The public-facing GESS website communicates:

- Who GESS is
- What Geomatics Engineering is
- The GESS executive team
- Upcoming and past events
- Contact and social information
- GESS partners and affiliated organizations where applicable

The public website must feel **technical, premium, modern, and engineering-focused**, rather than looking like a generic university club website.

### GESS Portal

The portal is the private operational companion to the public website.

Authorized GESS executives can manage:

- Their own team profile
- Team photos and descriptions
- Events
- Event images
- Event categories
- Upcoming/Past status
- Featured events

Content entered through the portal automatically propagates to the public website through Supabase + ISR revalidation.

The portal should feel like a **professional internal engineering tool**, while remaining visually consistent with the public GESS brand.

---

# 2. Problem

GESS currently requires developer involvement for routine website changes such as:

- Replacing an executive headshot
- Updating an executive description
- Adding a new executive
- Creating an event
- Updating an event
- Removing an old event

This creates unnecessary dependency on developers and makes the website difficult to maintain as executive teams and events change throughout the year.

The new system allows authorized executives to manage this content themselves without editing code or deploying the website.

---

# 3. Goals

## Public Website Goals

- Establish a strong, recognizable GESS visual identity.
- Present GESS as a modern technical engineering organization.
- Clearly communicate what Geomatics Engineering is.
- Make events and team information easy to discover.
- Maintain excellent mobile performance.
- Keep public pages extremely lightweight.
- Avoid shipping authentication, Supabase client, or portal functionality to public routes.

## Portal Goals

- Allow authorized executives to manage content without developer involvement.
- Allow executives to update their own profile.
- Allow executives to create, edit, and delete events.
- Allow administrators to manage executive accounts.
- Make image management simple and safe.
- Automatically synchronize portal changes with public pages.
- Maintain strict authentication and database access controls.

## Non-Goals

- General-purpose CMS functionality.
- Public user accounts.
- Public event RSVPs or attendance management.
- Real-time collaboration.
- Complex editorial workflows.
- A full analytics platform.
- User-generated public content.

---

# 4. Users & Permissions

| User    | Public Website | Portal      | Team Profile              | Events   | Account Management |
| ------- | -------------- | ----------- | ------------------------- | -------- | ------------------ |
| Visitor | View           | None        | None                      | View     | None               |
| Exec    | View           | Full access | Edit own                  | CRUD all | None               |
| Admin   | View           | Full access | Edit own + admin controls | CRUD all | Create/deactivate  |

### Visitor

Unauthenticated website visitor.

Can access only public pages.

### Exec

Authenticated GESS executive.

Can:

- Access `/portal`
- Edit their own team profile
- Upload/replace their own photo
- Create events
- Edit events
- Delete events

Cannot:

- Edit another executive's profile
- Create accounts
- Access administrative account management

### Admin

Authenticated executive with administrative privileges.

Can do everything an Exec can do, plus:

- Create new executive accounts
- Invite executives through Supabase Auth
- Deactivate/remove departed executives
- Remove team profiles
- Reorder team members
- Manage administrative settings

---

# 5. Information Architecture

## Public Website

```text
/
├── /about
├── /events
├── /contact
└── /portal
```

### Home `/`

Primary marketing/landing page.

Contains:

- Hero
- GESS identity/tagline
- Primary CTA
- Secondary CTA
- Data/stat strip
- Short GESS introduction
- Featured/upcoming event
- Geomatics visual element
- Footer

### About `/about`

Contains:

- GESS mission
- What is Geomatics?
- Executive/team section
- Executive cards
- Partner/affiliated organization section where applicable

### Events `/events`

Contains:

- Featured upcoming event
- Upcoming events
- Past events
- Event cards
- Event metadata
- Category/tag indicators

### Contact `/contact`

Contains:

- Contact form
- GESS email/social links
- Meeting information where applicable
- Footer

---

# 6. GESS Design Language

The entire product, including both the public website and authenticated portal, must share one visual language.

The public website should feel like a **premium engineering/technology organization**, not a conventional student-club template.

## 6.1 Visual Principles

### Technical

Use visual language associated with:

- Geospatial data
- LiDAR
- GNSS
- Mapping
- Point clouds
- Coordinate systems
- Terrain
- Surveying technology
- Robotics
- Digital twins

### Minimal

Avoid visual clutter.

Large typography, generous whitespace, strong alignment, and restrained decoration should define the interface.

### Premium

The design should rely on:

- Strong typography
- Precise spacing
- High-quality imagery
- Subtle motion
- Carefully controlled color
- Technical details

Avoid excessive gradients, glowing effects, generic glassmorphism, or "AI startup" aesthetics.

### Data-driven

Small technical details can reinforce the geomatics identity:

```text
51.0447° N
114.0719° W

GESS / 2026

EVENT 004
```

These should be subtle supporting elements, not the primary content.

---

# 7. Color System

Primary palette:

```text
Black:  #0A0A0A
White:  #FAFAFA
```

Do **not** use pure `#000000` as the primary black.

The design uses one restrained accent color.

The accent may be:

- Desaturated cyan/teal, inspired by GNSS equipment, mapping interfaces, and contour lines

OR

- Warm amber, inspired by LiDAR intensity visualization and scanning systems

The final accent must be selected before implementation.

### Accent Usage

The accent is intentionally scarce.

Use it for:

- Interactive states
- Links
- CTA highlights
- Active navigation
- Important data points
- Small technical markers
- Hover states
- Selected filters

Do not use the accent as a large background fill.

The website should remain primarily black and white.

---

# 8. Typography

Primary typeface:

**Inter or Geist**

Geist is preferred if compatible with the existing Next.js setup.

Typography should use:

- Heavy/bold display headings
- Clean regular body text
- Tight heading tracking
- Comfortable body line height

A secondary monospaced or technical typeface may be used for:

- Coordinates
- Dates
- Statistics
- Event numbers
- Technical labels
- Metadata

Example:

```text
51.0447° N
114.0719° W

EVENT 003
SEP 24 / 2026
```

Technical typography should be used sparingly.

---

# 9. Geomatics Visual Language

The website should communicate Geomatics through **texture and structure**, rather than excessive iconography.

Possible visual elements:

- Coordinate grids
- Contour lines
- Point clouds
- Wireframe terrain
- Triangulation meshes
- Crosshairs
- Reticles
- Scan lines
- Mapping grids
- Coordinate labels
- Elevation markers
- Subtle topographic patterns

These elements should generally exist as:

- SVG overlays
- CSS backgrounds
- Low-cost canvas elements
- Subtle decorative graphics

They should never interfere with readability.

---

# 10. Public Website Design

## 10.1 Navigation

Persistent navigation across public pages.

Structure:

```text
GESS                          About  Events  Contact  [Join]
```

Characteristics:

- Slim
- Minimal
- Strong typography
- Sticky or fixed where appropriate
- Black/white base
- Accent used for the primary CTA

The navigation should not feel like a traditional university navigation bar.

---

# 11. Home Page

## Hero

Full-viewport hero section.

Large headline:

```text
Geomatics Engineering
Student Society
```

Supported by a concise tagline.

Primary CTA:

```text
Explore GESS
```

Secondary CTA:

```text
View Events
```

The hero may contain an animated 3D geomatics visualization.

The 3D visual must remain subordinate to the typography.

---

## Hero 3D Visualization

Preferred implementation:

```text
React Three Fiber
@react-three/fiber
@react-three/drei
```

Visual concept:

- Low-poly terrain
- LiDAR point cloud
- Triangulated terrain mesh
- Delaunay-like network
- Slowly moving scan/terrain visualization

Avoid:

- Photorealistic globes
- Heavy GLTF assets
- Tens of thousands of particles
- Large textures
- Bloom
- Depth of field
- Expensive post-processing

The 3D element is decorative and must never become a performance bottleneck.

---

# 12. Performance Requirements

Performance is a **non-negotiable product requirement**.

Public-site performance takes priority over visual complexity.

## 3D Requirements

The implementation must:

1. Dynamically import the 3D component.
2. Use `ssr: false`.
3. Cap device pixel ratio.
4. Respect `prefers-reduced-motion`.
5. Detect low-end devices.
6. Reduce or remove 3D on low-end/mobile devices.
7. Pause rendering when the hero is outside the viewport.
8. Mount the canvas after the initial page render.

Example fallback hierarchy:

```text
High-end desktop
→ Full 3D visualization

Normal desktop/mobile
→ Reduced 3D visualization

Low-end device
→ Static/CSS visualization

prefers-reduced-motion
→ Static visualization
```

The 3D visualization must never block first paint.

---

# 13. Data / Stats Strip

Immediately below the hero:

```text
XX
Members

XX
Events / Year

2026
Founded

XX+
Partners
```

These should feel like technical data readouts rather than conventional marketing statistics.

---

# 14. About Page

## Mission

Short, high-impact explanation of GESS.

Avoid long paragraphs.

## What is Geomatics?

Explain Geomatics to visitors unfamiliar with the field.

Use visual support such as:

- Point cloud
- Contour map
- Coordinate grid
- Wireframe terrain

## Executive Team

Grid of team cards.

Each card contains:

- Photo
- Name
- Role
- Short description
- LinkedIn

Photography should have a consistent treatment.

Preferred approach:

- Black-and-white imagery
- Consistent crop/aspect ratio
- Subtle hover treatment
- Accent used sparingly

## Team Ordering

Team display order is controlled through `display_order`.

---

# 15. Events Page

Events should feel like a professional event/data interface rather than a generic card grid.

## Structure

```text
Featured Event

Upcoming
[Event] [Event] [Event]

Past
[Event] [Event] [Event]
```

Each event contains:

- Image
- Title
- Date
- Optional end date
- Location
- Description
- Category
- Status

Categories:

```text
Workshop
Social
Industry Night
Competition
Other
```

Status is manually controlled:

```text
Upcoming
Past
```

Status must **not** be automatically derived from the event date.

---

# 16. Contact Page

Simple and focused.

Contains:

- Name
- Email
- Message
- Submit

Also provide:

- GESS social accounts
- General contact information
- Meeting information where relevant

Form implementation may use a Next.js API route with Resend/Formspree or an equivalent service.

The contact implementation must not introduce unnecessary JavaScript to unrelated public routes.

---

# 17. Portal Design Language

The portal shares the public site's:

- Color palette
- Typography
- Accent
- Spacing system
- Technical visual language

However, the portal should prioritize **functionality over visual spectacle**.

The portal should feel similar to an internal engineering dashboard.

Use:

- Dense but readable tables
- Clear forms
- Strong labels
- Technical metadata
- Clear validation states
- Minimal decoration
- Predictable navigation

Do not use the hero 3D visualization inside the portal.

---

# 18. Portal Information Architecture

```text
/portal
├── /login
├── /profile
├── /events
│   ├── /new
│   └── /[id]/edit
└── /admin
    └── /accounts
```

## Portal Dashboard

Provides:

- Welcome message
- Current user's role
- Profile completion/status
- Number of upcoming events
- Quick actions
- Recent events
- Admin tools if applicable

Example:

```text
GESS PORTAL

Welcome, Vyapak

PROFILE
Complete

EVENTS
8 upcoming

[Edit Profile]
[Create Event]

ADMIN
[Manage Accounts]
```

---

# 19. Authentication

Use:

**Supabase Auth**

Authentication is invite-only.

There is **no public registration page**.

Accounts are created by administrators.

Supported authentication can include:

- Email/password
- Supabase invite flow
- Magic link where appropriate

Sessions must persist between visits.

Unauthenticated portal users are redirected to `/portal/login`.

Authentication code must never be imported into public route components.

---

# 20. Admin Account Management

Route:

```text
/portal/admin/accounts
```

Admin-only.

Admin can:

- Enter name
- Enter email
- Select role
- Invite new executive
- Deactivate/remove departed executives

Creating an account should:

1. Create/invite the Supabase Auth user.
2. Send a Supabase invitation email.
3. Allow the executive to establish their credentials.
4. Create or prepare their corresponding `team` record.

The Supabase service-role key must only be used server-side and must never be exposed to the browser.

---

# 21. Team Profile Management

Route:

```text
/portal/profile
```

Fields:

```text
Display Name
Role / Title
Description
LinkedIn URL
Photo
```

Description should have a reasonable character limit, approximately 280 characters.

An executive can only modify their own profile.

Admins may perform administrative operations such as removal and ordering.

---

# 22. Image Upload

Supabase Storage buckets:

```text
team-photos
event-images
```

Images must be compressed/resized client-side before upload.

Requirements:

- Resize excessively large images.
- Compress before upload.
- Preserve acceptable visual quality.
- Store only the optimized image.
- Delete the previous image when replacing it.
- Avoid orphaned files.

Public images should be served efficiently through `next/image`.

---

# 23. Events Portal

Route:

```text
/portal/events
```

Features:

- View all events
- Create
- Edit
- Delete
- Mark Upcoming/Past
- Mark Featured
- Upload/change event image

Event fields:

```text
Title
Description
Event Date
End Date
Location
Image
Tag
Status
Featured
```

Status:

```text
Upcoming
Past
```

Status is manually controlled.

Do not calculate status from the current date.

---

# 24. Database Architecture

Stack:

```text
Next.js
TypeScript
Tailwind CSS
Supabase Auth
Supabase PostgreSQL
Supabase Storage
Vercel
```

## Team

```sql
id uuid primary key references auth.users(id)
display_name text not null
role text not null
description text
linkedin_url text
photo_url text
display_order int default 0
is_admin boolean default false
created_at timestamptz default now()
```

## Events

```sql
id uuid primary key default gen_random_uuid()
title text not null
description text
event_date date not null
end_date date
location text
image_url text
tag text
is_featured boolean default false
status text default 'upcoming'
created_by uuid references auth.users(id)
created_at timestamptz default now()
```

Status should be constrained to:

```text
upcoming
past
```

Tag/category should use a controlled set where practical.

---

# 25. Row Level Security

RLS must be enabled.

## Team

Public:

```text
SELECT
```

Authenticated user:

```text
UPDATE own row
```

Admin:

```text
INSERT
DELETE
administrative updates
```

An executive must not be able to modify another executive's team row.

## Events

Public:

```text
SELECT
```

Authenticated executives:

```text
INSERT
UPDATE
DELETE
```

Events are not owned by individual executives.

All authenticated executives can manage all events.

Administrative checks must not rely solely on hidden UI controls. Database-level RLS must enforce access.

---

# 26. Supabase Architecture

Create isolated utilities:

```text
lib/
└── supabase/
    ├── client.ts
    ├── server.ts
    └── middleware.ts
```

Use the official `@supabase/ssr` architecture for Next.js App Router.

The browser client should exist only where portal functionality requires it.

Public pages should use server-side Supabase access.

---

# 27. Public Data Fetching

Public:

```text
/about
/events
```

must fetch content server-side.

Use ISR:

```ts
export const revalidate = ...
```

The public pages must not query Supabase from React client components.

No Supabase browser client should be imported into:

```text
/about
/events
```

or other public presentation components.

---

# 28. Content Synchronization

Portal changes must propagate to public pages.

Flow:

```text
Portal
   ↓
Supabase Database
   ↓
Database Webhook
   ↓
/api/revalidate
   ↓
revalidatePath()
   ↓
Updated public page
```

Create:

```text
/api/revalidate
```

The route accepts POST requests from a Supabase Database Webhook.

Depending on the modified table:

```text
team
→ revalidate /about

events
→ revalidate /events
```

Protect the endpoint with a shared secret header.

The API must reject requests with an invalid or missing secret.

---

# 29. ISR Fallback

On-demand revalidation is the primary synchronization mechanism.

A time-based fallback should also exist.

For example:

```ts
export const revalidate = 21600;
```

or another appropriate interval.

This provides self-healing if a webhook fails.

Do not use aggressive polling.

---

# 30. Project Structure

Recommended structure:

```text
app/
├── (public)/
│   ├── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── events/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
│
├── portal/
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── events/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx
│   └── admin/
│       └── accounts/
│           └── page.tsx
│
└── api/
    └── revalidate/
        └── route.ts

components/
├── public/
├── team/
├── events/
├── portal/
└── ui/

lib/
└── supabase/
    ├── client.ts
    ├── server.ts
    └── middleware.ts
```

Exact structure may be adjusted where necessary for Next.js conventions.

---

# 31. Component Architecture

Separate public and portal components.

Public:

```text
components/public
components/team
components/events
```

Portal:

```text
components/portal
```

The public component tree must not import:

- Supabase browser client
- Auth UI
- Portal forms
- Portal upload logic
- Admin functionality

This separation exists specifically to protect public bundle size.

---

# 32. Performance Requirements

Performance is the highest priority for the public website.

Target:

- Excellent Lighthouse performance
- Fast first contentful paint
- Minimal JavaScript
- Minimal hydration
- Optimized images
- Server-rendered content
- No unnecessary client components

Audit specifically for:

```text
Supabase client leakage
Auth bundle leakage
Portal component leakage
Unnecessary React hydration
Large dependencies
3D bundle impact
Unoptimized images
```

The public website should use Server Components by default.

Use Client Components only where interaction genuinely requires them.

---

# 33. Accessibility

Requirements:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Sufficient contrast
- Form labels
- Accessible error messages
- Alt text for meaningful images
- Reduced-motion support
- Buttons should have clear states
- Do not communicate information through color alone

---

# 34. Responsive Design

The website must work across:

```text
Desktop
Laptop
Tablet
Mobile
```

Mobile is not simply a compressed desktop layout.

The hero, navigation, event cards, team cards, forms, and portal tables should each have intentional mobile layouts.

---

# 35. Error & Loading States

Portal forms must provide:

- Loading state
- Submission state
- Validation errors
- Upload progress where practical
- Success feedback
- Failure feedback

Public pages should have appropriate loading/error boundaries where necessary without unnecessarily increasing client-side JavaScript.

---

# 36. Security

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to the client.

Admin account creation must occur through trusted server-side code.

RLS must remain enabled even if UI-level permissions exist.

Validate:

- Authentication
- Authorization
- Uploaded file type
- Uploaded file size
- Database input
- URLs
- Event IDs

Do not trust client-side role information.

---

# 37. Styling Configuration Requirement

Before implementing the visual design, inspect the existing project.

Do **not** blindly overwrite:

- `tailwind.config`
- existing design tokens
- existing global CSS
- existing fonts
- existing component primitives

Ask the project owner for:

1. Black token
2. White token
3. Accent color token
4. Existing Tailwind configuration
5. Existing brand assets/logo if available

If these already exist in the repository, inspect and reuse them instead of asking unnecessarily.

Do not invent a completely separate design system.

---

# 38. Implementation Priorities

Priority order:

### P0

- Authentication
- RLS
- Public pages
- Team CRUD
- Event CRUD
- Storage
- ISR
- Revalidation
- Security

### P1

- Visual design system
- Responsive layouts
- Image optimization
- Portal UX
- Admin account management

### P2

- Featured events
- Advanced animation
- Enhanced geomatics visualization
- Additional polish

Never sacrifice public performance for P2 visual features.

---

# 39. Milestones

### Milestone 1

Project and Supabase foundation.

- Supabase project
- Database
- RLS
- Storage buckets
- Auth
- Environment variables

### Milestone 2

Public website.

- Home
- About
- Events
- Contact
- Responsive design

### Milestone 3

Portal.

- Login
- Dashboard
- Profile
- Image upload
- Events CRUD

### Milestone 4

Admin.

- Account creation
- Invites
- Admin permissions
- Account deactivation

### Milestone 5

Synchronization.

- Database webhook
- `/api/revalidate`
- ISR
- Fallback revalidation

### Milestone 6

QA.

- Lighthouse
- Mobile performance
- Authentication
- RLS
- Storage security
- Image handling
- Public bundle inspection
- Cross-user authorization testing

---

# 40. Definition of Done

The product is complete when:

- A visitor can browse the GESS public website without authentication.
- Public pages are fast and server-rendered.
- Public routes contain zero Supabase browser/auth code.
- An invited executive can log into the portal.
- An executive can edit their own profile.
- An executive cannot edit another executive's profile.
- Executives can CRUD events.
- Images are compressed before upload.
- Replaced images do not leave orphaned files.
- Admins can invite new executives.
- There is no public signup.
- RLS enforces permissions at the database level.
- Portal changes update public pages through webhook revalidation.
- ISR provides a fallback synchronization mechanism.
- The entire product uses the GESS design language.
- The public website maintains excellent Lighthouse performance.

---

# 41. Final Build Prompt

Build the complete **GESS (Geomatics Engineering Student Society) website and self-serve content portal** described in this PRD.

This is one product with two connected surfaces:

1. A premium public-facing GESS website.
2. An authenticated self-serve portal used by GESS executives to manage website content.

## Stack

Use:

- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Vercel

Follow modern Next.js App Router conventions and use Server Components by default.

---

## Phase 1: Inspect the Existing Project

Before making changes:

- Inspect the existing repository.
- Identify the current Next.js version.
- Inspect the existing Tailwind configuration.
- Inspect global CSS.
- Inspect existing components.
- Inspect fonts.
- Inspect existing brand assets.
- Inspect existing routing.
- Inspect existing environment variables without exposing secrets.

If the project already has design tokens or components, reuse them.

**Do not overwrite the existing Tailwind configuration or design system blindly.**

If the black, white, and accent color tokens are not already defined in the project, ask me for them before implementing the final visual styling.

The intended default design direction is:

```text
Black: #0A0A0A
White: #FAFAFA
Accent: TBD
```

Do not assume the final accent color.

---

## Phase 2: Build the Public Website

Build:

```text
/
 /about
 /events
 /contact
```

The public website should feel:

- Technical
- Premium
- Minimal
- Engineering-focused
- Geomatics-inspired

Use restrained visual language inspired by:

- LiDAR
- GNSS
- Point clouds
- Coordinate grids
- Contour lines
- Wireframes
- Terrain meshes
- Triangulation
- Mapping interfaces

Do not turn the website into a generic "tech startup" design.

Avoid excessive:

- Gradients
- Glassmorphism
- Glow effects
- Giant particle fields
- Generic icons
- Decorative animations

---

## Home Page

Build a full-viewport hero with:

- Strong GESS headline
- Short tagline
- Primary CTA
- Secondary CTA
- Subtle geomatics visualization
- Scroll cue

Below the hero, include a technical data/stat strip.

Then include:

- GESS introduction
- Featured/upcoming event
- Geomatics visual section
- Appropriate CTA
- Footer

---

## 3D Hero

Use React Three Fiber only if it can be implemented without compromising performance.

Preferred visual:

- Low-poly terrain
- LiDAR-like point cloud
- Triangulated terrain
- Delaunay-like mesh

Do not use:

- Heavy GLTF models
- Photorealistic scenes
- Tens of thousands of particles
- Expensive post-processing

Requirements:

- Dynamic import
- `ssr: false`
- Capped pixel ratio
- `prefers-reduced-motion`
- Low-end device fallback
- Pause rendering when off-screen
- Lazy mount after initial rendering

If the 3D implementation meaningfully hurts Lighthouse performance, replace it with a lightweight SVG/CSS/static visualization.

**Performance wins over visual complexity.**

---

## About Page

Build:

- Mission section
- What is Geomatics section
- Executive team
- Executive cards
- Partner/affiliation section if appropriate

Team data must come from Supabase.

Team photos should have a consistent visual treatment.

Use the `display_order` database field to control ordering.

---

## Events Page

Build:

- Featured event
- Upcoming events
- Past events
- Event cards
- Categories
- Dates
- Locations
- Descriptions

The `status` field is manually controlled.

**Never automatically derive Upcoming/Past from the event date.**

---

## Contact Page

Build:

- Name
- Email
- Message
- Submit
- Social links
- Contact information

Use an appropriate API-based email/form solution.

Do not add unnecessary client-side JavaScript to unrelated public routes.

---

# Supabase

Set up Supabase using the official `@supabase/ssr` pattern.

Create:

```text
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/middleware.ts
```

The service-role key must only exist in trusted server-side code.

---

# Database

Create:

```sql
team
events
```

Team:

```text
id
display_name
role
description
linkedin_url
photo_url
display_order
is_admin
created_at
```

Events:

```text
id
title
description
event_date
end_date
location
image_url
tag
is_featured
status
created_by
created_at
```

Use appropriate constraints for:

```text
status = upcoming | past
```

and event categories.

---

# RLS

Enable Row Level Security.

### Team

Public:

```text
SELECT
```

Authenticated executive:

```text
UPDATE own row only
```

Admin:

```text
INSERT
DELETE
administrative operations
```

An executive must never be able to update another executive's profile.

### Events

Public:

```text
SELECT
```

Authenticated executives:

```text
INSERT
UPDATE
DELETE
```

Any authenticated executive can manage any event.

RLS must enforce these permissions independently of the UI.

---

# Authentication

Build:

```text
/portal/login
```

There must be:

**NO PUBLIC SIGN-UP.**

Accounts are created by an admin.

Use Supabase Auth.

Unauthenticated users attempting to access `/portal` must be redirected to login.

Sessions should persist correctly across visits.

---

# Portal

Build:

```text
/portal
/portal/profile
/portal/events
/portal/events/new
/portal/events/[id]/edit
/portal/admin/accounts
```

## Dashboard

Show:

- Current user
- Role
- Profile status
- Event statistics
- Recent events
- Quick actions
- Admin actions where applicable

---

# Profile

Build a form allowing an executive to edit:

```text
Display Name
Role
Description
LinkedIn URL
Photo
```

The executive can only edit their own row.

Use the `team-photos` Supabase Storage bucket.

Compress images client-side before upload.

When replacing a photo:

1. Upload the new optimized image.
2. Update the database.
3. Delete the old storage object.

Handle failure states carefully so a failed replacement does not unnecessarily destroy the existing profile image.

---

# Events

Build:

```text
/portal/events
```

with:

- Event table/list
- Create
- Edit
- Delete
- Featured toggle
- Status toggle

Build:

```text
/portal/events/new
/portal/events/[id]/edit
```

with fields for:

```text
Title
Description
Date
End date
Location
Image
Category
Upcoming/Past
Featured
```

Use the `event-images` Supabase Storage bucket.

Compress images client-side.

---

# Admin Accounts

Build:

```text
/portal/admin/accounts
```

Only admins may access this route.

Allow admins to:

- Enter name
- Enter email
- Select role
- Invite an executive
- Deactivate/remove departed executives

Account creation must use trusted server-side Supabase functionality.

The Supabase service-role key must never reach the browser.

Trigger a Supabase invitation email so the invited executive can establish their credentials.

---

# Public Data Architecture

Public `/about` and `/events` pages must:

- Fetch data server-side.
- Use ISR.
- Use `export const revalidate = ...`.
- Avoid client-side Supabase queries.
- Avoid Supabase browser SDK imports.
- Avoid authentication code.

The public website should ship **zero Supabase client/auth JavaScript**.

Use Server Components wherever possible.

---

# Route Isolation

Keep portal code isolated from public code.

Public:

```text
components/public
components/team
components/events
```

Portal:

```text
components/portal
```

Do not import portal components into public routes.

Do not import Supabase browser/auth utilities into public components.

Audit the resulting bundles to verify that Supabase/auth code has not leaked into:

```text
/
 /about
 /events
 /contact
```

---

# Revalidation

Create:

```text
/api/revalidate
```

Accept POST requests from a Supabase Database Webhook.

Use a shared secret header.

Reject invalid requests.

When:

```text
team
```

changes:

```text
revalidatePath("/about")
```

When:

```text
events
```

changes:

```text
revalidatePath("/events")
```

Use ISR fallback revalidation as a secondary safety mechanism.

Do not poll Supabase from the public client.

---

# Performance

Performance is the highest priority.

Before considering the implementation complete:

- Run Lighthouse against public routes.
- Test mobile.
- Inspect JavaScript bundles.
- Confirm no Supabase browser SDK appears in public bundles.
- Confirm no Auth UI appears in public bundles.
- Confirm portal code is isolated.
- Optimize all images.
- Minimize Client Components.
- Avoid unnecessary dependencies.
- Test the 3D hero on low-end hardware.
- Test `prefers-reduced-motion`.

If a visual feature conflicts with performance, simplify or remove the visual feature.

---

# Design Implementation

Do not make the portal look like a completely different application.

Both surfaces must share:

- Typography
- Colors
- Spacing
- Buttons
- Form controls
- Borders
- Radius
- Accent treatment
- Technical metadata
- Interaction states

The public website can be more expressive.

The portal should be more utilitarian.

The common identity should still be immediately recognizable.

---

# Quality Bar

Do not stop after scaffolding.

Implement the actual product end-to-end.

Test:

- Authentication
- Login/logout
- Session persistence
- RLS
- Cross-user profile access
- Admin authorization
- Event CRUD
- Image upload
- Image replacement
- Image deletion
- Invite flow
- ISR
- Webhook revalidation
- Public rendering
- Mobile layout
- Accessibility
- Lighthouse performance

Do not use mock authentication or fake database functionality in the final implementation.

Where an external configuration step is required, clearly identify the exact Supabase/Vercel configuration needed.

The finished result should be a **production-quality GESS public website plus a production-quality self-serve content portal**, with the portal acting as the content-management layer behind the public site.
