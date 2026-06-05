export interface TokensOrganization {
  id: number;
  name: string;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  invite_code?: string;
}

export interface TokensWorkspace {
  id: number;
  name: string;
  organization_id: number;
  created_by: number;
  created_at?: string;
  updated_at?: string;
}

export interface TokensColumn {
  id: number;
  workspace_id: number;
  name: string;
  position: number;
  created_by: number;
  slug?: string;
}

export interface TokensCard {
  id: number;
  workspace_id: number;
  column_id: number;
  title: string;
  description?: string;
  assigned_to?: number;
  due_at?: string;
  position: number;
  is_archived?: boolean;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  priority?: string;
  story_points?: number;
  tag?: string;
  category?: string;
  completed_at?: string;
  assignee_email?: string;
  assignee_name?: string;
}

export interface TokensChatMessage {
  id: number;
  workspace_id: number;
  card_id: number | null;
  user_id: number;
  user_name?: string;
  user_email?: string;
  text: string;
  created_at: string;
}
