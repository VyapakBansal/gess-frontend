export type TeamMember = {
  id: string;
  display_name: string;
  role: string;
  description: string | null;
  linkedin_url: string | null;
  photo_url: string | null;
  display_order: number;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
};

export type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  image_url: string | null;
  tag: string;
  is_featured: boolean;
  status: "upcoming" | "past";
  created_by: string | null;
  created_at: string;
};

export type ProfileFormValues = {
  display_name: string;
  role: string;
  description: string;
  linkedin_url: string;
};

export type EventFormValues = {
  title: string;
  description: string;
  event_date: string;
  end_date: string;
  location: string;
  tag: string;
  status: "upcoming" | "past";
  is_featured: boolean;
};
