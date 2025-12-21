import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStartSession } from "@/hooks/use-academic";
import { useUserContext } from "@/hooks/use-user-context";
import { useLocation } from "wouter";
import { Loader2, ArrowRight, BookOpen, Zap, Search, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SettingsModal } from "@/components/SettingsModal";

type Exam = "JEE" | "NEET" | "SSC" | "AKTU" | "GATE" | "CAT";

const EXAMS: Exam[] = ["JEE", "NEET", "SSC", "AKTU", "GATE", "CAT"];
const TARGET_YEARS = ["2025", "2026", "2027"];
const TIME_OPTIONS = ["3 months", "6 months", "12 months"];

export default function Home() {
  const { context, hasOnboarded, isLoading, saveContext, updateContext } = useUserContext();
  const [exam, setExam] = useState<Exam | "">("");
  const [target, setTarget] = useState<"year" | "time">("year");
  const [targetValue, setTargetValue] = useState("");
  const [query, setQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [currentZone, setCurrentZone] = useState<"ask" | "roadmap" | "optimize" | null>(null);
  const [, setLocation] = useLocation();
  const { mutate: startSession, isPending } = useStartSession();

  // Initialize from context or show onboarding
  useEffect(() => {
    if (isLoading) return;

    if (context && hasOnboarded) {
      // User has completed onboarding, restore context
      setExam(context.exam as Exam);
      setTargetValue(context.target);
      setTarget(TARGET_YEARS.includes(context.target) ? "year" : "time");
    }
  }, [context, hasOnboarded, isLoading]);

  const handleContinueOnboarding = () => {
    if (!exam || !targetValue) return;

    saveContext({
      exam: exam as Exam,
      target: targetValue,
    });
  };

  const handleStartSession = (zone: "ask" | "roadmap" | "optimize") => {
    setCurrentZone(zone);
    let contextPayload: any;

    if (zone === "roadmap") {
      contextPayload = {
        exam: exam as Exam,
        target: targetValue,
        zone: "roadmap",
      };
    } else if (zone === "optimize") {
      if (!query.trim()) return;
      contextPayload = {
        exam: exam as Exam,
        target: targetValue,
        zone: "optimize",
        query: query.trim(),
      };
    } else {
      if (!query.trim()) return;
      contextPayload = {
        exam: exam as Exam,
        target: targetValue,
        zone: "ask",
        query: query.trim(),
      };
    }

    startSession(contextPayload, {
      onSuccess: (session) => {
        setLocation(`/session/${session.id}`, {
          state: {
            exam,
            target: targetValue,
            zone,
          },
        });
      },
    });
  };

  const handleSaveSettings = (newContext: any) => {
    setExam(newContext.exam);
    setTargetValue(newContext.target);
    setTarget(TARGET_YEARS.includes(newContext.target) ? "year" : "time");
    updateContext(newContext);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  // First-time onboarding screen
  if (!hasOnboarded || !context) {
    const canContinueOnboarding = exam && targetValue;

    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full overflow-y-auto">
          {/* Header */}
          <div className="text-center space-y-3 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-mono tracking-tight text-foreground">
              Exam Preparation Accelerator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Structured preparation for competitive exams — not random answers.
            </p>
          </div>

          {/* Setup Card */}
          <Card className="w-full max-w-2xl p-8 bg-card/50 backdrop-blur border-border shadow-xl space-y-8">
            {/* Exam Selector */}
            <div className="space-y-3">
              <Label htmlFor="exam-select" className="text-base font-mono font-semibold">
                Step 1: Select your exam
              </Label>
              <Select value={exam} onValueChange={(value) => setExam(value as Exam)}>
                <SelectTrigger
                  id="exam-select"
                  className="h-12 px-4 text-base border-border bg-background"
                >
                  <SelectValue placeholder="Choose your exam..." />
                </SelectTrigger>
                <SelectContent>
                  {EXAMS.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Selector */}
            <div className="space-y-4">
              <Label className="text-base font-mono font-semibold">
                Step 2: Select your target year or time remaining
              </Label>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor="target-type"
                    className="text-sm text-muted-foreground"
                  >
                    Type
                  </Label>
                  <Select
                    value={target}
                    onValueChange={(value: any) => setTarget(value)}
                  >
                    <SelectTrigger
                      id="target-type"
                      className="h-10 px-3 text-sm bg-background border-border"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="year">Target Year</SelectItem>
                      <SelectItem value="time">Time Remaining</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor="target-value"
                    className="text-sm text-muted-foreground"
                  >
                    Value
                  </Label>
                  <Select value={targetValue} onValueChange={setTargetValue}>
                    <SelectTrigger
                      id="target-value"
                      className="h-10 px-3 text-sm bg-background border-border"
                    >
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {target === "year"
                        ? TARGET_YEARS.map((y) => (
                            <SelectItem key={y} value={y}>
                              {y}
                            </SelectItem>
                          ))
                        : TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinueOnboarding}
              disabled={!canContinueOnboarding}
              className="w-full h-12 font-mono font-bold text-base"
              data-testid="button-continue"
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  // Workspace screen (after onboarding)
  const canAskQuestion = query.trim() && !isPending;
  const canOptimizePlan = query.trim() && !isPending;

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Context Banner */}
        <div className="px-6 py-3 bg-secondary/40 border-b border-border font-mono text-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 text-foreground">
              <span>
                <strong>Exam:</strong> {exam}
              </span>
              <span className="text-muted-foreground">|</span>
              <span>
                <strong>Target:</strong> {targetValue}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-mono gap-2"
              onClick={() => setShowSettings(true)}
              data-testid="button-edit-settings"
            >
              <Settings className="h-3 w-3" />
              Edit
            </Button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-3xl space-y-8">
            {/* Feature Selection Grid */}
            {!currentZone ? (
              <>
                <div className="text-center space-y-3 mb-12">
                  <h2 className="text-3xl font-bold font-mono">How can we help?</h2>
                  <p className="text-muted-foreground">
                    Choose how you'd like to prepare for your exam
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Ask a Question Button */}
                  <button
                    onClick={() => setCurrentZone("ask")}
                    className="p-6 rounded-lg border border-border bg-background hover:bg-secondary/30 hover:border-primary/50 transition-all text-left group"
                    data-testid="button-feature-ask"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3 group-hover:scale-105 transition-transform">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Ask a Question</h3>
                    <p className="text-sm text-muted-foreground">
                      Get instant answers to doubts and concept questions.
                    </p>
                  </button>

                  {/* Generate Roadmap Button */}
                  <button
                    onClick={() => setCurrentZone("roadmap")}
                    className="p-6 rounded-lg border border-border bg-background hover:bg-secondary/30 hover:border-primary/50 transition-all text-left group"
                    data-testid="button-feature-roadmap"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3 group-hover:scale-105 transition-transform">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Generate Roadmap
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Get a complete preparation plan from a mentor.
                    </p>
                  </button>

                  {/* Optimize Plan Button */}
                  <button
                    onClick={() => setCurrentZone("optimize")}
                    className="p-6 rounded-lg border border-border bg-background hover:bg-secondary/30 hover:border-primary/50 transition-all text-left group"
                    data-testid="button-feature-optimize"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3 group-hover:scale-105 transition-transform">
                      <Zap className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Optimize Plan
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Improve your existing study plan.
                    </p>
                  </button>
                </div>
              </>
            ) : currentZone === "roadmap" ? (
              <>
                <div className="space-y-3 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-2">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h2 className="text-3xl font-bold font-mono">Your Preparation Roadmap</h2>
                  <p className="text-muted-foreground">
                    A complete, mentor-designed plan tailored to your exam and timeline.
                  </p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleStartSession("roadmap");
                  }}
                  className="space-y-4"
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 font-mono font-bold text-base"
                    disabled={isPending}
                    data-testid="button-generate-roadmap"
                  >
                    {isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Generate My Roadmap
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setCurrentZone(null)}
                    disabled={isPending}
                  >
                    Back
                  </Button>
                </form>
              </>
            ) : currentZone === "optimize" ? (
              <>
                <div className="space-y-3 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-2">
                    <Zap className="h-7 w-7" />
                  </div>
                  <h2 className="text-3xl font-bold font-mono">Optimize Your Plan</h2>
                  <p className="text-muted-foreground">
                    Share your current plan and get logical improvements.
                  </p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleStartSession("optimize");
                  }}
                  className="space-y-4"
                >
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Describe your current preparation plan..."
                    className="h-12 px-4 text-base bg-background border-border focus-visible:ring-1 focus-visible:ring-primary/50"
                    disabled={isPending}
                    data-testid="input-prep-plan"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 font-mono font-bold text-base"
                    disabled={!canOptimizePlan}
                    data-testid="button-optimize-plan"
                  >
                    {isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Get Suggestions
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setCurrentZone(null)}
                    disabled={isPending}
                  >
                    Back
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="space-y-3 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-2">
                    <Search className="h-7 w-7" />
                  </div>
                  <h2 className="text-3xl font-bold font-mono">Ask Your Question</h2>
                  <p className="text-muted-foreground">
                    Get instant, structured answers to any exam-related doubt.
                  </p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleStartSession("ask");
                  }}
                  className="space-y-4"
                >
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask an exam-specific question..."
                    className="h-12 px-4 text-base bg-background border-border focus-visible:ring-1 focus-visible:ring-primary/50"
                    disabled={isPending}
                    data-testid="input-question"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 font-mono font-bold text-base"
                    disabled={!canAskQuestion}
                    data-testid="button-get-answer"
                  >
                    {isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Get Answer
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setCurrentZone(null)}
                    disabled={isPending}
                  >
                    Back
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {context && (
        <SettingsModal
          open={showSettings}
          onOpenChange={setShowSettings}
          context={context}
          onSave={handleSaveSettings}
        />
      )}
    </Layout>
  );
}
