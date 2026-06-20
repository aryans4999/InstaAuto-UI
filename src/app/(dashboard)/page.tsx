"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, Reply, Zap, Power, CheckCircle2, AlertCircle, RefreshCw, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Comments Received</CardTitle>
            <MessageSquare className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-syne font-bold">0</div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/20 hover:bg-secondary/10 transition-colors">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Auto Replied</CardTitle>
            <Reply className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-syne font-bold">0</div>
          </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/20 hover:bg-accent/10 transition-colors">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rules Active</CardTitle>
            <Zap className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-syne font-bold">0</div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20 hover:bg-destructive/10 transition-colors">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Auto Reply</CardTitle>
            <Power className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-syne font-bold text-destructive">OFF</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Setup */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-syne font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <p className="font-bold">API Config</p>
                <p className="text-sm text-muted-foreground">Paste your Instagram Access Token in the settings and save to connect your account.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <p className="font-bold">My Posts</p>
                <p className="text-sm text-muted-foreground">Select the posts you want to monitor for new comments. Enable monitoring for each post.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <p className="font-bold">Auto Reply</p>
                <p className="text-sm text-muted-foreground">Add keyword-based rules to automatically reply to comments that match specific triggers.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="font-syne font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <span className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Access token not set
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                No posts monitored
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                No rules added
              </span>
            </div>
            <Button className="w-full mt-4" variant="secondary">Complete Setup</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-syne font-bold flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-secondary" />
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="icon" className="rounded-full">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 opacity-20" />
            </div>
            <p>No activity yet. Your automated replies will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
