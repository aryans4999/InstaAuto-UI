"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, Reply, Zap, Power, CheckCircle2, AlertCircle, RefreshCw, ListOrdered, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { configApi, logsApi } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: number;
  media_id: string;
  comment_id: string;
  username: string;
  comment_text: string;
  replied_with: string;
  status: string;
  source: string;
  timestamp: string;
}

export default function OverviewPage() {
  const [stats, setStats] = useState({
    commentsReceived: 0,
    autoReplied: 0,
    rulesActive: 0,
    enabled: false,
  });

  const [checklist, setChecklist] = useState({
    tokenSet: false,
    monitoredCount: 0,
    rulesCount: 0,
    enabled: false,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverviewData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statusRes, configRes, logsRes] = await Promise.all([
        configApi.getStatus(),
        configApi.getConfig(),
        logsApi.getLogs(),
      ]);

      const statusData = statusRes.data;
      const configData = configRes.data;
      const logsData = logsRes.data.logs || [];

      setStats({
        commentsReceived: logsData.length,
        autoReplied: statusData.replied_total,
        rulesActive: statusData.rules_active,
        enabled: statusData.enabled,
      });

      setChecklist({
        tokenSet: !!configData.token,
        monitoredCount: statusData.monitored,
        rulesCount: (configData.rules || []).length,
        enabled: statusData.enabled,
      });

      setLogs(logsData);
    } catch (error) {
      console.error("Failed to load overview data:", error);
      if (!silent) {
        toast.error("Failed to fetch fresh dashboard data.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
    const interval = setInterval(() => {
      fetchOverviewData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOverviewData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading dashboard overview...</p>
      </div>
    );
  }

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
            <div className="text-4xl font-syne font-bold">{stats.commentsReceived}</div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/20 hover:bg-secondary/10 transition-colors">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Auto Replied</CardTitle>
            <Reply className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-syne font-bold">{stats.autoReplied}</div>
          </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/20 hover:bg-accent/10 transition-colors">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rules Active</CardTitle>
            <Zap className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-syne font-bold">{stats.rulesActive}</div>
          </CardContent>
        </Card>

        <Card className={cn(
          "transition-colors",
          stats.enabled 
            ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10" 
            : "bg-destructive/5 border-destructive/20 hover:bg-destructive/10"
        )}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Auto Reply</CardTitle>
            <Power className={cn("w-4 h-4", stats.enabled ? "text-emerald-500" : "text-destructive")} />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-syne font-bold",
              stats.enabled ? "text-emerald-500" : "text-destructive"
            )}>
              {stats.enabled ? "ON" : "OFF"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Setup */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-syne font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Setup Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <p className="font-bold">API Config</p>
                <p className="text-sm text-muted-foreground">
                  Paste your Instagram Access Token in the settings and save to connect your account.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <p className="font-bold">My Posts</p>
                <p className="text-sm text-muted-foreground">
                  Select the posts you want to monitor for new comments. Enable monitoring for each post.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <p className="font-bold">Auto Reply Rules</p>
                <p className="text-sm text-muted-foreground">
                  Add keyword-based rules to automatically reply to comments that match specific triggers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="font-syne font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Setup Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Token Status */}
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              checklist.tokenSet 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-destructive/10 border-destructive/20 text-destructive"
            )}>
              <span className="text-sm font-medium flex items-center gap-2">
                {checklist.tokenSet ? (
                  <>
                    <Check className="w-4 h-4" />
                    Access token configured
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Access token not set
                  </>
                )}
              </span>
            </div>

            {/* Monitored Posts Status */}
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              checklist.monitoredCount > 0 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
            )}>
              <span className="text-sm font-medium flex items-center gap-2">
                {checklist.monitoredCount > 0 ? (
                  <>
                    <Check className="w-4 h-4" />
                    {checklist.monitoredCount} post(s) monitored
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    No posts monitored
                  </>
                )}
              </span>
            </div>

            {/* Rules Status */}
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              checklist.rulesCount > 0 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
            )}>
              <span className="text-sm font-medium flex items-center gap-2">
                {checklist.rulesCount > 0 ? (
                  <>
                    <Check className="w-4 h-4" />
                    {checklist.rulesCount} rule(s) added
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    No rules added
                  </>
                )}
              </span>
            </div>

            {/* Switch Enabled Status */}
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              checklist.enabled 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-destructive/10 border-destructive/20 text-destructive"
            )}>
              <span className="text-sm font-medium flex items-center gap-2">
                {checklist.enabled ? (
                  <>
                    <Check className="w-4 h-4" />
                    Auto-reply enabled
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Auto-reply disabled
                  </>
                )}
              </span>
            </div>

            <Link href="/config" className="block w-full mt-4">
              <Button className="w-full" variant="secondary">Go to Configuration</Button>
            </Link>
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
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="rounded-full"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </Button>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 opacity-20" />
              </div>
              <p>No activity yet. Your automated replies will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Comment</th>
                    <th className="p-4">Reply</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-mono text-xs">{log.id}</td>
                      <td className="p-4 font-semibold text-primary">@{log.username}</td>
                      <td className="p-4 max-w-[200px] truncate">{log.comment_text}</td>
                      <td className="p-4 max-w-[200px] truncate text-secondary font-medium">{log.replied_with || "—"}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px] font-semibold bg-accent/5 uppercase border-accent/20 text-accent">
                          {log.source}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-[10px] uppercase font-bold",
                            log.status === "replied" 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          )}
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
