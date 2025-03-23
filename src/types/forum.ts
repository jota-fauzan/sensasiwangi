export interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
    exp: number;
  };
  vote_count?: {
    cendol: number;
    bata: number;
  };
  reply_count?: number;
}

export interface ForumReply {
  id: string;
  content: string;
  user_id: string;
  thread_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
    exp: number;
  };
  vote_count?: {
    cendol: number;
    bata: number;
  };
}

export interface ForumVote {
  id: string;
  user_id: string;
  thread_id: string | null;
  reply_id: string | null;
  vote_type: "cendol" | "bata";
  created_at: string;
}

export type VoteType = "cendol" | "bata";
