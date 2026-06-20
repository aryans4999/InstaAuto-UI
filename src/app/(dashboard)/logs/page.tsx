"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Activity, RefreshCw, Trash2, Ghost } from "lucide-react";
import { logsApi } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await logsApi.getLogs();
      setLogs(res.data.logs || []);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      if (!silent) {
        toast.error("Failed to load activity logs.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all activity logs? This action cannot be undone.")) {
      return;
    }
    setClearing(true);
    try {
      await logsApi.clearLogs();
      setLogs([]);
      toast.success("Activity logs cleared successfully.");
    } catch (error) {
      console.error("Failed to clear logs:", error);
      toast.error("Failed to clear activity logs.");
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading activity logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-syne font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activity Logs
            </CardTitle>
            <CardDescription>Comprehensive history of all automated and manual actions</CardDescription>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleClearLogs}
              disabled={clearing || logs.length === 0}
              className="gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Reply</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Ghost className="w-12 h-12 opacity-10 mb-4" />
                        <p className="font-bold">No activity logs yet</p>
                        <p className="text-sm">Once the bot starts replying, history will be recorded here.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold">{log.id}</TableCell>
                      <TableCell className="font-medium text-primary">@{log.username}</TableCell>
                      <TableCell className="max-w-[180px] truncate" title={log.comment_text}>{log.comment_text}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-secondary font-medium" title={log.replied_with}>{log.replied_with || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-semibold bg-accent/5 border-accent/20 uppercase text-accent">
                          {log.source}
                        </Badge>
                      </td>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
