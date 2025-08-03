export interface Post {
  id: number;
  title: string;
  url: string | null;
  source: string;
  content: string | null;
  score: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  success: boolean;
  data: Post[];
  count: number;
}

export interface PostsApiParams {
  sort?: "score" | "createdAt" | "title";
  order?: "asc" | "desc";
  threshold?: number;
}

export interface TopPostsApiResponse extends ApiResponse {
  threshold: number;
}

export interface SourcePostsApiResponse extends ApiResponse {
  source: string;
}
