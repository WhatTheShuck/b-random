"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Search,
  TrendingUp,
  Clock,
  Filter,
  Loader2,
} from "lucide-react";
import { Post, ApiResponse } from "@/lib/types";
import { AxiosError } from "axios";

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"score" | "createdAt" | "title">(
    "score",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse>("/api/posts", {
          params: {
            sort: sortBy,
            order: sortOrder,
          },
        });

        if (response.data.success) {
          setPosts(response.data.data);
          setError(null);
        } else {
          setError("Failed to fetch posts");
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        if (err instanceof AxiosError) {
          setError(
            `API Error: ${err.response?.status} ${err.response?.statusText || err.message}`,
          );
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [sortBy, sortOrder]);

  // Get unique sources for filter
  const uniqueSources = [
    "all",
    ...Array.from(new Set(posts.map((post) => post.source))),
  ];

  // Filter posts (client-side filtering for search and source)
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource =
      selectedSource === "all" || post.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getScoreBadgeVariant = (score: number | null) => {
    if (!score) return "secondary";
    if (score >= 90) return "default"; // Uses primary colour
    if (score >= 80) return "secondary";
    return "outline";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-[180px] flex-shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {uniqueSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source === "all" ? "All Sources" : source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: "score" | "createdAt" | "title") =>
              setSortBy(value)
            }
          >
            <SelectTrigger className="w-[140px] flex-shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="createdAt">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="flex-shrink-0 px-3"
          >
            {sortOrder === "desc" ? "↓" : "↑"}
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredPosts.length} of {posts.length} posts
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            className="transition-all duration-200 hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold leading-tight flex-1">
                  {post.url ? (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </a>
                  ) : (
                    post.title
                  )}
                </h2>
                {post.url && (
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {post.source}
                </Badge>
                {post.score !== null && (
                  <Badge
                    variant={getScoreBadgeVariant(post.score)}
                    className="text-xs"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {post.score}
                  </Badge>
                )}
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimeAgo(post.createdAt)}
                </div>
              </div>
            </CardHeader>

            {post.content && (
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {post.content}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No posts found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
