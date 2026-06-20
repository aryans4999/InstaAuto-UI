"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Reply, Plus, Target, Info, Trash2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AutoReplyPage() {
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
              <Input id="keyword" placeholder='e.g. price, shipping, "how much"' />
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Leave empty for a catch-all rule</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply">Reply Message</Label>
              <Textarea id="reply" placeholder="Hi! Thanks for asking. DM us for details 💬" />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <Plus className="w-4 h-4 mr-2" />
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
              ].map((ex, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border text-sm">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{ex.kw}</Badge>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{ex.reply}</span>
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
          <Badge variant="outline" className="font-mono">0 Rules</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
            <Reply className="w-12 h-12 opacity-10 mb-4" />
            <h5 className="font-bold">No rules yet</h5>
            <p className="text-sm mt-1">Add your first rule above to start automating replies.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
