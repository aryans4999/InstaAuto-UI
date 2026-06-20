"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  RefreshCw, 
  Image as ImageIcon, 
  Heart, 
  MessageCircle, 
  Eye, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Send, 
  Trash2, 
  CornerDownRight,
  MessageSquare,
  Sparkles,
  Volume2
} from "lucide-react";
import { instagramApi, configApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [monitoredPosts, setMonitoredPosts] = useState<string[]>([]);
  const [defaultMessage, setDefaultMessage] = useState("");

  // Selected post detail
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [postDetail, setPostDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Dialog/Modal state for quick replies
  const [replyTargetComment, setReplyTargetComment] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Quick comment (top-level comment on post)
  const [quickCommentText, setQuickCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    loadConfigAndPosts();
  }, []);

  const loadConfigAndPosts = async () => {
    setLoading(true);
    try {
      const configRes = await configApi.getConfig();
      setMonitoredPosts(configRes.data.monitored_posts || []);
      setDefaultMessage(configRes.data.default_message || "Thanks for your comment! 🙏");
      
      const postsRes = await instagramApi.getMedia("");
      setPosts(postsRes.data.data || []);
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPosts = async () => {
    setLoading(true);
    try {
      const postsRes = await instagramApi.getMedia("");
      setPosts(postsRes.data.data || []);
      toast.success(`Successfully fetched ${postsRes.data.data?.length || 0} posts.`);
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || error.message || "Failed to fetch posts";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPost = async (post: any) => {
    setSelectedPost(post);
    setLoadingDetail(true);
    setPostDetail(null);
    try {
      const res = await instagramApi.getMediaDetail(post.id);
      setPostDetail(res.data);
      setTimeout(() => {
        document.getElementById("post-detail-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error: any) {
      toast.error("Failed to load post comments.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleMonitor = async () => {
    if (!selectedPost) return;
    const isMonitored = monitoredPosts.includes(selectedPost.id);
    let updatedMonitored: string[];
    if (isMonitored) {
      updatedMonitored = monitoredPosts.filter(id => id !== selectedPost.id);
      toast.info("Post removed from auto-reply monitoring.");
    } else {
      updatedMonitored = [...monitoredPosts, selectedPost.id];
      toast.success("Post added to auto-reply monitoring.");
    }

    try {
      await configApi.saveConfig({ monitored_posts: updatedMonitored });
      setMonitoredPosts(updatedMonitored);
    } catch (error) {
      toast.error("Failed to update monitoring status on server.");
    }
  };

  const handlePostQuickComment = async () => {
    if (!selectedPost || !quickCommentText.trim()) return;
    setPostingComment(true);
    try {
      const res = await instagramApi.postComment(selectedPost.id, quickCommentText.trim());
      if (res.data && !res.data.error) {
        toast.success("Comment posted successfully!");
        setQuickCommentText("");
        handleSelectPost(selectedPost);
      } else {
        toast.error(res.data?.error?.message || "Failed to post comment.");
      }
    } catch (error: any) {
      toast.error("Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedPost || !replyTargetComment || !replyMessage.trim()) return;
    setSendingReply(true);
    try {
      const res = await instagramApi.replyToComment(
        replyTargetComment.id,
        selectedPost.id,
        replyMessage.trim()
      );
      if (res.data && !res.data.error) {
        toast.success("Reply posted successfully!");
        setReplyTargetComment(null);
        setReplyMessage("");
        handleSelectPost(selectedPost);
      } else {
        toast.error(res.data?.error?.message || "Failed to send reply.");
      }
    } catch (error: any) {
      toast.error("Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await instagramApi.deleteComment(commentId);
      if (res.data && res.data.success) {
        toast.success("Comment deleted.");
        if (selectedPost) handleSelectPost(selectedPost);
      } else {
        toast.error(res.data?.error?.message || "Failed to delete comment.");
      }
    } catch (error) {
      toast.error("Failed to delete comment.");
    }
  };

  const handleReplyAllUnreplied = async () => {
    if (!selectedPost || !postDetail || !postDetail.comments) return;
    const unreplied = postDetail.comments.filter(
      (c: any) => !(c.replies?.data && c.replies.data.length > 0)
    );
    if (unreplied.length === 0) {
      toast.info("No unreplied comments found.");
      return;
    }
    
    toast.info(`Starting auto-reply for ${unreplied.length} comment(s)...`);
    let count = 0;
    for (const c of unreplied) {
      try {
        const res = await instagramApi.replyToComment(c.id, selectedPost.id, defaultMessage);
        if (res.data && !res.data.error) {
          count++;
        }
        await new Promise(r => setTimeout(r, 1500)); // sleep to respect API limits
      } catch (err) {
        console.error("Failed to reply to comment", c.id, err);
      }
    }
    toast.success(`Successfully replied to ${count} comments.`);
    handleSelectPost(selectedPost);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-syne font-bold">Your Media Gallery</h3>
          <p className="text-sm text-muted-foreground">Select a post to view comments and configure auto-replies</p>
        </div>
        <Button onClick={handleFetchPosts} disabled={loading} className="gap-2">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          {loading ? "Fetching..." : "Fetch Latest Posts"}
        </Button>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Fetching Instagram posts...</p>
        </div>
      ) : posts.length === 0 ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {posts.map((post: any) => {
            const isMonitored = monitoredPosts.includes(post.id);
            return (
              <Card 
                key={post.id} 
                onClick={() => handleSelectPost(post)}
                className={cn(
                  "overflow-hidden group hover:ring-2 transition-all cursor-pointer relative",
                  selectedPost?.id === post.id 
                    ? "ring-2 ring-primary border-primary bg-primary/5" 
                    : isMonitored 
                      ? "ring-1 ring-emerald-500/30 border-emerald-500/30 hover:ring-emerald-500/50" 
                      : "hover:ring-primary/20"
                )}
              >
                {isMonitored && (
                  <span className="absolute top-2 right-2 z-10 text-[9px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle className="w-2 h-2 fill-current" /> Monitored
                  </span>
                )}
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {post.media_url || post.thumbnail_url ? (
                    <img 
                      src={post.media_url || post.thumbnail_url} 
                      alt={post.caption || ""} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      <ImageIcon className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                     <div className="flex items-center gap-1"><Heart className="w-4 h-4 fill-current text-red-400" /> {post.like_count || 0}</div>
                     <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4 fill-current text-sky-400" /> {post.comments_count || 0}</div>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem] font-medium">
                    {post.caption || <span className="italic text-muted-foreground/50">No caption</span>}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-tight">
                      {post.media_type}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Selected Post Detail Section */}
      {selectedPost && (
        <div id="post-detail-section" className="space-y-8 pt-4 scroll-mt-6">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl font-syne font-bold">Post Analysis</CardTitle>
                  <Badge variant="secondary" className="text-xs font-mono select-all">ID: {selectedPost.id}</Badge>
                </div>
                <CardDescription className="line-clamp-1 italic">
                  "{selectedPost.caption || "No Caption"}"
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleToggleMonitor}
                  variant={monitoredPosts.includes(selectedPost.id) ? "destructive" : "secondary"}
                  className="font-semibold shadow-sm"
                >
                  {monitoredPosts.includes(selectedPost.id) ? "Unmonitor Post" : "Monitor Post"}
                </Button>
                <Button 
                  onClick={handleReplyAllUnreplied}
                  disabled={loadingDetail || !postDetail || postDetail.comments?.length === 0}
                  variant="outline"
                  className="font-semibold hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-primary animate-pulse" />
                  Reply to All Unreplied
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-muted-foreground text-sm font-medium">Fetching comments and insights...</p>
                </div>
              ) : postDetail ? (
                <div className="space-y-6">
                  {/* Top row stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/40 rounded-xl text-center border">
                      <p className="text-2xl font-bold font-syne text-primary">{selectedPost.like_count || 0}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Likes</p>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-xl text-center border">
                      <p className="text-2xl font-bold font-syne text-secondary">{postDetail.total || 0}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Total Comments</p>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-xl text-center border">
                      <p className="text-2xl font-bold font-syne text-emerald-500">{postDetail.replied || 0}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Replied Comments</p>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-xl text-center border">
                      <p className="text-2xl font-bold font-syne text-accent">
                        {postDetail.total > 0 ? Math.round((postDetail.replied / postDetail.total) * 100) : 0}%
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Automation Rate</p>
                    </div>
                  </div>

                  {/* API Error Notification */}
                  {postDetail.api_error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl space-y-2">
                      <div className="flex gap-2 items-center font-bold">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>Instagram API Error ({postDetail.api_error.code})</span>
                      </div>
                      <p className="text-xs font-mono leading-relaxed select-text">
                        {postDetail.api_error.message}
                      </p>
                      <p className="text-[11px] opacity-80 leading-normal">
                        Common causes: The access token has expired, is missing the <code>instagram_manage_comments</code> permission, or the post was posted before authorizing the current token.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Comments List */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-bold text-foreground flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          Comments List
                        </h4>
                        <span className="text-xs text-muted-foreground font-mono">
                          {postDetail.comments?.length || 0} visible comment(s)
                        </span>
                      </div>
                      
                      <ScrollArea className="h-[400px] rounded-xl border p-4 bg-card">
                        {postDetail.comments?.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                            <MessageCircle className="w-10 h-10 opacity-20 mb-2" />
                            <p className="font-semibold text-sm">No comments yet</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {postDetail.comments?.map((comment: any) => {
                              const replies = comment.replies?.data || [];
                              const hasReplies = replies.length > 0;
                              return (
                                <div key={comment.id} className="space-y-3 pb-6 border-b last:border-b-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-primary">@{comment.username}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                          {new Date(comment.timestamp).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-sm text-foreground bg-muted/30 p-2 rounded-lg leading-normal">
                                        {comment.text}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setReplyTargetComment(comment)}
                                        className="h-8 text-xs text-secondary hover:text-secondary hover:bg-secondary/10"
                                      >
                                        Reply
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Reply thread */}
                                  {hasReplies && (
                                    <div className="pl-6 space-y-3 border-l-2 border-dashed border-muted ml-2">
                                      {replies.map((reply: any) => (
                                        <div key={reply.id} className="flex gap-2 items-start">
                                          <CornerDownRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                          <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-xs text-secondary">@{reply.username}</span>
                                              <span className="text-[9px] text-muted-foreground">
                                                {new Date(reply.timestamp).toLocaleString()}
                                              </span>
                                            </div>
                                            <p className="text-xs text-foreground bg-secondary/5 p-2 rounded-lg">
                                              {reply.text}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>

                      {/* Quick Top-Level Comment Input */}
                      <div className="space-y-3 p-4 bg-muted/20 border rounded-xl">
                        <Label htmlFor="quick-comment" className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                          Post New Top-Level Comment
                        </Label>
                        <div className="flex gap-3">
                          <Input 
                            id="quick-comment"
                            value={quickCommentText}
                            onChange={(e) => setQuickCommentText(e.target.value)}
                            placeholder="Type comment message here..." 
                            className="bg-card"
                          />
                          <Button 
                            onClick={handlePostQuickComment}
                            disabled={postingComment || !quickCommentText.trim()}
                            className="gap-2 shrink-0 bg-primary font-bold"
                          >
                            {postingComment ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Keywords & Insights Panel */}
                    <div className="space-y-6">
                      {/* Top Keywords */}
                      <div className="space-y-3">
                        <div className="border-b pb-2">
                          <h4 className="font-bold text-foreground flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                            Top Keywords
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {postDetail.top_keywords?.length === 0 ? (
                            <span className="text-sm text-muted-foreground italic">No keywords analyzed.</span>
                          ) : (
                            postDetail.top_keywords?.map(([word, count]: [string, number]) => (
                              <span 
                                key={word} 
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 border border-accent/20 text-accent"
                              >
                                {word}
                                <span className="bg-accent text-accent-foreground text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono">
                                  {count}
                                </span>
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Insights Card */}
                      {postDetail.insights && postDetail.insights.length > 0 && (
                        <div className="space-y-3">
                          <div className="border-b pb-2">
                            <h4 className="font-bold text-foreground flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-secondary" />
                              Post Insights
                            </h4>
                          </div>
                          <div className="space-y-3">
                            {postDetail.insights.map((insight: any) => (
                              <div key={insight.name} className="p-3 bg-muted/40 border rounded-lg flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{insight.title || insight.name}</p>
                                  <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{insight.description}</p>
                                </div>
                                <span className="text-lg font-bold font-syne text-foreground ml-4">
                                  {insight.values?.[0]?.value ?? 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground italic">
                  Select a post above to view comments and automation analysis.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reply Modal */}
      <Dialog open={!!replyTargetComment} onOpenChange={(open) => !open && setReplyTargetComment(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-syne font-bold">Reply to Comment</DialogTitle>
            <DialogDescription>
              Post a reply directly to Instagram for this comment.
            </DialogDescription>
          </DialogHeader>
          {replyTargetComment && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-xl border space-y-1">
                <p className="font-bold text-xs text-primary">@{replyTargetComment.username}</p>
                <p className="text-sm text-foreground italic leading-relaxed">
                  "{replyTargetComment.text}"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-message">Your Reply</Label>
                <Textarea 
                  id="reply-message"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply message..." 
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReplyTargetComment(null)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendReply}
              disabled={sendingReply || !replyMessage.trim()}
              className="bg-primary font-bold"
            >
              {sendingReply ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
