"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Key, Settings, Info, Save, Search, RefreshCw, AlertCircle, CheckCircle2, Shield, User, Users, FileText, Globe } from "lucide-react";
import { instagramApi, configApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AccountInfo {
  id: string;
  name?: string;
  username: string;
  profile_picture_url?: string;
  followers_count: number;
  media_count: number;
  biography?: string;
  website?: string;
}

export default function ConfigPage() {
  const [token, setToken] = useState("");
  const [defaultMessage, setDefaultMessage] = useState("");
  const [interval, setInterval] = useState(30);
  const [enabled, setEnabled] = useState(false);

  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [debugResult, setDebugResult] = useState<any>(null);

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingToken, setSavingToken] = useState(false);
  const [debuggingToken, setDebuggingToken] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await configApi.getConfig();
      const configData = res.data;
      setDefaultMessage(configData.default_message || "");
      setInterval(configData.interval || 30);
      setEnabled(configData.enabled || false);
      if (configData.token) {
        setToken(configData.token);
        fetchAccountInfo(configData.token);
      }
    } catch (error: any) {
      console.error("Failed to load config:", error);
      toast.error("Failed to load configuration from server.");
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchAccountInfo = async (activeToken: string) => {
    try {
      const res = await instagramApi.getAccount(activeToken);
      if (res.data && !res.data.error) {
        setAccountInfo(res.data);
      } else {
        setAccountInfo(null);
      }
    } catch (error) {
      console.error("Failed to fetch account info:", error);
      setAccountInfo(null);
    }
  };

  const handleSaveAndTest = async () => {
    if (!token.trim()) {
      toast.error("Access Token cannot be empty.");
      return;
    }
    setSavingToken(true);
    try {
      // 1. Fetch/Test with Instagram (this also saves the token in fastapi memory store)
      const res = await instagramApi.getAccount(token.trim());
      if (res.data && !res.data.error) {
        setAccountInfo(res.data);
        toast.success(`Token verified successfully! Linked to @${res.data.username}`);

        // 2. Explicitly save the config via config API
        await configApi.saveConfig({
          token: token.trim(),
          default_message: defaultMessage,
          interval: interval,
          enabled: enabled,
        });
      } else {
        const errMsg = res.data?.error?.message || "Verification failed";
        toast.error(`Verification failed: ${errMsg}`);
        setAccountInfo(null);
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || error.message || "Request failed";
      toast.error(`Verification failed: ${errMsg}`);
      setAccountInfo(null);
    } finally {
      setSavingToken(false);
    }
  };

  const handleDebugToken = async () => {
    setDebuggingToken(true);
    setDebugResult(null);
    try {
      // First ensure backend has the token
      if (token.trim()) {
        await configApi.saveConfig({ token: token.trim() });
      }
      const res = await instagramApi.debugToken();
      setDebugResult(res.data);
      toast.success("Token debug information retrieved.");
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || error.message || "Failed to debug token";
      toast.error(errMsg);
      setDebugResult({ error: errMsg });
    } finally {
      setDebuggingToken(false);
    }
  };

  const handleSaveGlobalSettings = async () => {
    setSavingSettings(true);
    try {
      await configApi.saveConfig({
        default_message: defaultMessage,
        interval: interval,
        enabled: enabled,
        token: token.trim(),
      });
      toast.success("Global settings saved successfully.");
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || error.message || "Failed to save settings";
      toast.error(errMsg);
    } finally {
      setSavingSettings(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Linked Account Card */}
      {accountInfo && (
        <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted border-2 border-primary/30 overflow-hidden flex items-center justify-center shrink-0">
                  {accountInfo.profile_picture_url ? (
                    <img 
                      src={accountInfo.profile_picture_url} 
                      alt={accountInfo.username} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <h4 className="text-xl font-bold font-syne text-foreground">
                      {accountInfo.name || `@${accountInfo.username}`}
                    </h4>
                    <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">@{accountInfo.username}</p>
                  {accountInfo.biography && (
                    <p className="text-xs text-muted-foreground italic max-w-md line-clamp-1">
                      {accountInfo.biography}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 border-t md:border-t-0 border-primary/10 pt-4 md:pt-0 w-full md:w-auto justify-around">
                <div className="text-center px-4">
                  <p className="text-2xl font-bold font-syne text-primary">{accountInfo.followers_count.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Followers</p>
                </div>
                <div className="text-center px-4">
                  <p className="text-2xl font-bold font-syne text-secondary">{accountInfo.media_count}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Posts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              <Input 
                id="token" 
                type="password" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="EAABx... or IGQVJx..." 
                className="font-mono text-xs" 
              />
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
              <Button 
                onClick={handleSaveAndTest} 
                disabled={savingToken} 
                className="flex-1 gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/20"
              >
                {savingToken ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save & Test
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDebugToken} 
                disabled={debuggingToken} 
                className="gap-2"
              >
                {debuggingToken ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
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
                value={defaultMessage}
                onChange={(e) => setDefaultMessage(e.target.value)}
                placeholder="Thanks for your comment! 🙏" 
                className="min-h-[100px] bg-secondary/5 border-secondary/20 focus:border-secondary"
              />
              <p className="text-xs text-muted-foreground">Used when no keyword rules match a comment.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="interval">Polling Interval (s)</Label>
                <Input 
                  id="interval" 
                  type="number" 
                  value={interval} 
                  onChange={(e) => setInterval(Number(e.target.value))}
                  min={10} 
                  max={300} 
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-secondary/30 bg-secondary/5">
              <div className="space-y-0.5">
                <Label className="text-base text-foreground">Master Automation Switch</Label>
                <p className="text-sm text-muted-foreground font-medium">Turn auto-reply ON or OFF globally</p>
              </div>
              <Switch 
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>

            <Button 
              onClick={handleSaveGlobalSettings}
              disabled={savingSettings}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-lg shadow-secondary/20"
            >
              {savingSettings ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Global Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info Display */}
      {debugResult && (
        <Card className="mt-8 border-primary/20 animate-in fade-in duration-300">
          <CardHeader>
            <CardTitle className="font-syne font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Token Debug Information
            </CardTitle>
            <CardDescription>Verify Graph API scopes and metadata details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-muted p-4 overflow-hidden border">
              <ScrollArea className="h-[250px] w-full pr-4">
                <pre className="text-xs font-mono whitespace-pre-wrap text-foreground select-text">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
