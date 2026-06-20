"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Settings, Reply } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const getTitle = () => {
    switch (pathname) {
      case "/": return "Overview";
      case "/config": return "API Configuration";
      case "/posts": return "My Posts";
      case "/autoreply": return "Auto Reply Rules";
      case "/logs": return "Activity Logs";
      default: return "Dashboard";
    }
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-8 sticky top-0 z-10">
      <h2 className="font-syne font-bold text-xl">{getTitle()}</h2>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 py-1 hidden sm:flex">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          AUTO-REPLY ON
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Link href="/config">
          <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
            <Settings className="w-4 h-4" />
            Config
          </Button>
        </Link>
        
        <Link href="/autoreply">
          <Button size="sm" className="hidden sm:flex gap-2">
            <Reply className="w-4 h-4" />
            Auto Reply
          </Button>
        </Link>
      </div>
    </header>
  );
}
