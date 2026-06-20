"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Settings, 
  Image as ImageIcon, 
  Reply, 
  ListOrdered, 
  Activity,
  Hexagon
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "API Config", href: "/config", icon: Settings },
  { name: "My Posts", href: "/posts", icon: ImageIcon },
  { name: "Auto Reply", href: "/autoreply", icon: Reply },
  { name: "Activity Logs", href: "/logs", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
          <Hexagon className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="font-syne font-bold text-lg leading-tight">InstaComment</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Auto Reply Pro</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground")} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs font-medium">Not connected</span>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono">Graph API v25.0</p>
      </div>
    </aside>
  );
}
