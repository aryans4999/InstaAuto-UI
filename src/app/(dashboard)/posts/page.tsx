"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Image as ImageIcon, Heart, MessageCircle, ExternalLink, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { instagramApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await instagramApi.getMedia(""); // Token handled by backend if already saved
      setPosts(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-syne font-bold">Your Media</h3>
          <p className="text-sm text-muted-foreground">Select a post to view comments and manage automation</p>
        </div>
        <Button onClick={fetchPosts} disabled={loading} className="gap-2">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          {loading ? "Fetching..." : "Fetch Latest Posts"}
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card className="border-dashed py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-muted/30 rounded-2xl flex items-center justify-center mb-6">
            <ImageIcon className="w-10 h-10 text-muted-foreground opacity-30" />
          </div>
          <h4 className="font-syne font-bold text-xl">No posts found</h4>
          <p className="max-w-xs text-muted-foreground mt-2">
            Configure your access token then click "Fetch Latest Posts" to see your Instagram media.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post: any) => (
            <Card key={post.id} className="overflow-hidden group hover:ring-2 ring-primary/20 transition-all cursor-pointer">
              <div className="aspect-square bg-muted relative overflow-hidden">
                <img 
                  src={post.media_url || post.thumbnail_url} 
                  alt={post.caption} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                   <div className="flex items-center gap-1"><Heart className="w-4 h-4 fill-current" /> {post.like_count}</div>
                   <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4 fill-current" /> {post.comments_count}</div>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{post.caption || "No caption"}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] uppercase">{post.media_type}</Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
