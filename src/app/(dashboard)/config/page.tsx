"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Key, Settings, Info, Save, Search } from "lucide-react";

export default function ConfigPage() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Access Token */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-syne font-bold flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Access Token
            </CardTitle>
            <CardDescription>Manage your Instagram Graph API credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="token">Access Token</Label>
              <Input id="token" type="password" placeholder="EAABx... or IGQVJx..." className="font-mono text-xs" />
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <div className="text-sm space-y-2">
                  <p className="font-bold">How to get the correct token:</p>
                  <ol className="list-decimal ml-4 space-y-1 text-muted-foreground">
                    <li>Go to Meta Graph API Explorer</li>
                    <li>Select your Facebook Page (not user)</li>
                    <li>Add: <code className="bg-primary/10 px-1 rounded text-primary">instagram_manage_comments</code></li>
                    <li>Generate & copy the token</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 gap-2">
                <Save className="w-4 h-4" />
                Save & Test
              </Button>
              <Button variant="outline" className="gap-2">
                <Search className="w-4 h-4" />
                Debug
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Reply Settings */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-syne font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-secondary" />
              Auto-Reply Settings
            </CardTitle>
            <CardDescription>Configure global automation behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="default-reply">Default Reply</Label>
              <Textarea 
                id="default-reply" 
                placeholder="Thanks for your comment! 🙏" 
                className="min-h-[100px] bg-secondary/5 border-secondary/20 focus:border-secondary"
              />
              <p className="text-xs text-muted-foreground">Used when no keyword rules match a comment.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="interval">Polling Interval (s)</Label>
                <Input id="interval" type="number" defaultValue={30} min={10} max={300} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-dashed">
              <div className="space-y-0.5">
                <Label className="text-base">Master Automation Switch</Label>
                <p className="text-sm text-muted-foreground font-medium">Turn auto-reply ON or OFF globally</p>
              </div>
              <Switch />
            </div>

            <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-lg shadow-secondary/20">
              <Save className="w-4 h-4 mr-2" />
              Save Global Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
