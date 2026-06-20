"use client";

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

export default function LogsPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-syne font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activity Logs
            </CardTitle>
            <CardDescription>Comprehensive history of all automated and manual actions</CardDescription>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="destructive" size="sm" className="gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">
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
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Ghost className="w-12 h-12 opacity-10 mb-4" />
                      <p className="font-bold">No activity logs yet</p>
                      <p className="text-sm">Once the bot starts replying, history will be recorded here.</p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
