import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStartSession } from "@/hooks/use-academic";
import { useLocation } from "wouter";
import { BrainCircuit, ArrowRight, Loader2, BookOpen, Atom } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [, setLocation] = useLocation();
  const { mutate: startSession, isPending } = useStartSession();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    startSession(topic, {
      onSuccess: (session) => {
        setLocation(`/session/${session.id}`);
      },
    });
  };

  const suggestedTopics = [
    "Rotational Motion",
    "Electrostatics",
    "Organic Chemistry",
    "Thermodynamics",
    "Genetics",
    "Calculus Integration"
  ];

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
        
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/5 text-primary mb-4 ring-1 ring-border shadow-lg">
            <BrainCircuit className="h-12 w-12" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-foreground">
            Academic Performance <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
              Accelerator
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Strict, exam-oriented AI training for NEET/JEE aspirants. 
            Select a topic to begin rigorous conceptual validation and problem solving.
          </p>
        </div>

        <Card className="w-full max-w-lg p-2 bg-card/50 backdrop-blur border-border shadow-2xl">
          <form onSubmit={handleStart} className="flex gap-2">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g., Fluid Mechanics)..."
              className="h-14 px-6 text-lg bg-background border-none focus-visible:ring-0 shadow-none font-mono"
              disabled={isPending}
            />
            <Button 
              type="submit" 
              size="lg" 
              className="h-14 px-8 shrink-0 font-mono font-bold tracking-wide"
              disabled={!topic.trim() || isPending}
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  BEGIN
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </Card>

        <div className="mt-12 w-full max-w-2xl">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest text-center mb-6">
            Recommended Modules
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {suggestedTopics.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTopic(t);
                  // Optional: auto-submit
                }}
                className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 hover:border-primary/50 transition-all text-left"
              >
                <div className="p-2 rounded bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {t.includes("Chemistry") || t.includes("Genetics") ? (
                    <Atom className="h-4 w-4" />
                  ) : (
                    <BookOpen className="h-4 w-4" />
                  )}
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {t}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
