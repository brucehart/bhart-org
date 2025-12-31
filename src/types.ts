export type PostStatus = 'draft' | 'published';

export type PostRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body_markdown: string;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  reading_time_minutes: number;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  featured: number;
  author_name: string;
  author_email: string;
  seo_title: string | null;
  seo_description: string | null;
  tag_names?: string | null;
  tag_slugs?: string | null;
};

export type PostWithTags = Omit<PostRecord, 'tag_names' | 'tag_slugs'> & {
  tag_names: string[];
  tag_slugs: string[];
};

export type TagRecord = {
  id: string;
  name: string;
  slug: string;
  post_count?: number;
};

export type AuthorizedUser = {
  id: string;
  email: string;
  name: string | null;
  google_sub: string | null;
  avatar_url: string | null;
  is_active: number;
  created_at: string;
  last_login_at: string | null;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
};

export type MediaAssetRecord = {
  id: string;
  key: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  caption: string | null;
  internal_description: string | null;
  tags: string | null;
  author_name: string;
  author_email: string;
  uploaded_at: string;
  published_at: string | null;
};

export type MediaAsset = Omit<MediaAssetRecord, 'tags'> & {
  tags: string[];
};

export type NewsStatus = 'draft' | 'published';

export type NewsItemRecord = {
  id: string;
  category: string;
  title: string;
  body_markdown: string;
  status: NewsStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
