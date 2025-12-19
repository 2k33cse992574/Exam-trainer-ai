import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, History, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useConversations, useDeleteSession } from "@/hooks/use-academic";
import { formatDistanceToNow } from "date-fns";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: sessions, isLoading } = useConversations();
  const { mutate: deleteSession } = useDeleteSession();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="w-80 border-r border-border hidden md:flex flex-col bg-card/50 backdrop-blur-xl">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-primary text-primary-foreground rounded-md group-hover:bg-primary/90 transition-colors">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-lg tracking-tight">NEET/JEE</h1>
              <p className="text-xs text-muted-foreground font-mono">ACADEMIC TRAINER</p>
            </div>
          </Link>
        </div>

        <div className="p-4">
          <Link href="/">
            <Button className="w-full justify-start gap-2 font-mono shadow-sm" size="lg">
              <Plus className="h-4 w-4" />
              NEW SESSION
            </Button>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0">
          <div className="mb-2 px-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            History
          </div>
          
          <div className="space-y-1">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-secondary/50 rounded animate-pulse" />
                ))}
              </div>
            ) : sessions?.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center border border-dashed border-border rounded-lg">
                No past sessions
              </div>
            ) : (
              sessions?.map((session) => (
                <div
                  key={session.id}
                  className="group relative flex items-center"
                >
                  <Link
                    href={`/session/${session.id}`}
                    className={cn(
                      "flex-1 px-3 py-2.5 rounded-md text-sm transition-all duration-200 border border-transparent",
                      location === `/session/${session.id}`
                        ? "bg-secondary text-secondary-foreground border-border shadow-sm font-medium"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <div className="truncate pr-6 font-mono text-xs mb-0.5">
                      {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                    </div>
                    <div className="truncate font-medium">
                      {session.title || "Untitled Session"}
                    </div>
                  </Link>
                  {/* Delete button only shows on hover */}
                  {/* <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm("Delete this session?")) deleteSession(session.id);
                    }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                  >
                    <X className="h-3 w-3" />
                  </button> */}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative z-10">
        {children}
      </main>
    </div>
  );
}
