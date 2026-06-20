"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Reply, Plus, Target, Info, Trash2, ArrowRight, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { rulesApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Rule {
  id: number;
  keyword: string;
  reply: string;
  active: boolean;
}

export default function AutoReplyPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [keyword, setKeyword] = useState("");
  const [reply, setReply] = useState("");

  const [loadingRules, setLoadingRules] = useState(true);
  const [addingRule, setAddingRule] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoadingRules(true);
    try {
      const res = await rulesApi.getRules();
      setRules(res.data.rules || []);
    } catch (error) {
      console.error("Failed to fetch rules:", error);
      toast.error("Failed to load automation rules.");
    } finally {
      setLoadingRules(false);
    }
  };

  const handleAddRule = async () => {
    if (!reply.trim()) {
      toast.error("Reply message is required.");
      return;
    }
    setAddingRule(true);
    try {
      const res = await rulesApi.addRule(keyword.trim(), reply.trim());
      if (res.data && res.data.id) {
        toast.success(
          keyword.trim() 
            ? `Rule added for keyword: "${keyword.trim()}"` 
            : "Catch-all rule added"
        );
        setKeyword("");
        setReply("");
        fetchRules();
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || error.message || "Failed to add rule";
      toast.error(errMsg);
    } finally {
      setAddingRule(false);
    }
  };

  const handleToggleRule = async (ruleId: number) => {
    try {
      const res = await rulesApi.toggleRule(ruleId);
      if (res.data) {
        toast.success(`Rule "${res.data.keyword || "catch-all"}" is now ${res.data.active ? "active" : "inactive"}`);
        // Optimistically update local state
        setRules(prev => 
          prev.map(r => r.id === ruleId ? { ...r, active: res.data.active } : r)
        );
      }
    } catch (error: any) {
      toast.error("Failed to toggle rule state.");
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
      await rulesApi.deleteRule(ruleId);
      toast.success("Rule deleted successfully.");
      setRules(prev => prev.filter(r => r.id !== ruleId));
    } catch (error) {
      toast.error("Failed to delete rule.");
    }
  };

  const handleUseExample = (exKw: string, exReply: string) => {
    setKeyword(exKw === "catch-all" ? "" : exKw);
    setReply(exReply);
    toast.info(`Filled form with example: "${exKw}"`);
  };

  if (loadingRules) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading automation rules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Rule Form */}
        <Card>
          <CardHeader>
            <CardTitle className="font-syne font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add Keyword Rule
            </CardTitle>
            <CardDescription>Trigger automated replies based on comment content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="keyword">Trigger Keyword</Label>
              <Input 
                id="keyword" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder='e.g. price, shipping, "how much"' 
              />
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Leave empty for a catch-all rule</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply">Reply Message</Label>
              <Textarea 
                id="reply" 
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Hi! Thanks for asking. DM us for details 💬" 
              />
            </div>
            <Button 
              onClick={handleAddRule}
              disabled={addingRule}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {addingRule ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Rule
            </Button>
          </CardContent>
        </Card>

        {/* Rule Examples/Tips */}
        <Card className="bg-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className="font-syne font-bold flex items-center gap-2">
              <Info className="w-5 h-5 text-accent" />
              Rule Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {[
                { kw: "price", reply: "DM us for pricing! 💬" },
                { kw: "how to order", reply: "Link in bio! 🔗" },
                { kw: "❤️", reply: "Thank you so much! ❤️" },
                { kw: "catch-all", reply: "Thanks for your comment! 🙏" },
              ].map((ex, i) => (
                <div 
                  key={i} 
                  onClick={() => handleUseExample(ex.kw, ex.reply)}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border text-sm hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="secondary" className={cn(
                      "border shrink-0 font-mono",
                      ex.kw === "catch-all" 
                        ? "bg-accent/10 text-accent border-accent/20" 
                        : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      {ex.kw}
                    </Badge>
                    <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground truncate">{ex.reply}</span>
                  </div>
                  <span className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity font-medium">Use template</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-accent/10 rounded-xl mt-4">
              <p className="text-sm text-accent-foreground font-medium leading-relaxed">
                Rules are checked from top to bottom. The first matching rule will be used. 
                Place the most specific rules at the top and catch-all rules at the bottom.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-syne font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              Keyword Rules
            </CardTitle>
            <CardDescription>All active automation rules</CardDescription>
          </div>
          <Badge variant="outline" className="font-mono">
            {rules.length} Rule{rules.length !== 1 ? "s" : ""}
          </Badge>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
              <Reply className="w-12 h-12 opacity-10 mb-4" />
              <h5 className="font-bold">No rules yet</h5>
              <p className="text-sm mt-1 font-medium">Add your first rule above to start automating replies.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div 
                  key={rule.id} 
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border gap-4 transition-all hover:bg-muted/10",
                    rule.active ? "bg-card border-border" : "bg-muted/30 border-muted opacity-60"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                    <Badge className={cn(
                      "w-fit font-mono font-bold uppercase py-1 border text-xs shrink-0",
                      rule.keyword 
                        ? "bg-primary/5 text-primary border-primary/20" 
                        : "bg-secondary/5 text-secondary border-secondary/20"
                    )}>
                      {rule.keyword || "CATCH-ALL"}
                    </Badge>
                    <span className="text-sm font-semibold truncate text-foreground pr-4">
                      {rule.reply}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        {rule.active ? "Active" : "Inactive"}
                      </span>
                      <Switch 
                        checked={rule.active}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteRule(rule.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
