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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SettingsModal } from "@/components/SettingsModal";

type Exam = "JEE" | "NEET" | "SSC" | "AKTU" | "GATE" | "CAT";
type StudyMode = "Follow Roadmap" | "Make Roadmap" | "Random Search";

const EXAMS: Exam[] = ["JEE", "NEET", "SSC", "AKTU", "GATE", "CAT"];
const TARGET_YEARS = ["2025", "2026", "2027"];
const TIME_OPTIONS = ["3 months", "6 months", "12 months"];

const MODE_DESCRIPTIONS: Record<StudyMode, string> = {
  "Follow Roadmap": "Get a complete, mentor-designed preparation plan.",
  "Make Roadmap": "Create your own plan and get it logically improved.",
  "Random Search": "Ask exam-specific doubts instantly.",
};

export default function Home() {
  const { context, hasOnboarded, isLoading, saveContext, updateContext } = useUserContext();
  const [exam, setExam] = useState<Exam | "">("");
  const [target, setTarget] = useState<"year" | "time">("year");
  const [targetValue, setTargetValue] = useState("");
  const [studyMode, setStudyMode] = useState<StudyMode | "">("");
  const [query, setQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [, setLocation] = useLocation();
  const { mutate: startSession, isPending } = useStartSession();

  // Initialize from context or show onboarding
  useEffect(() => {
    if (isLoading) return;

    if (context && hasOnboarded) {
      // User has completed onboarding, restore context
      setExam(context.exam);
      setTargetValue(context.target);
      setStudyMode(context.mode);
      setTarget(TARGET_YEARS.includes(context.target) ? "year" : "time");
    }
  }, [context, hasOnboarded, isLoading]);

  const handleContinueOnboarding = () => {
    if (!exam || !targetValue || !studyMode) return;

    saveContext({
      exam: exam as Exam,
      target: targetValue,
      mode: studyMode as StudyMode,
    });
  };

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !exam || !targetValue || !studyMode) return;

    const contextPayload = {
      exam: exam as Exam,
      target: targetValue,
      mode: studyMode as StudyMode,
      query: query.trim(),
    };

    startSession(contextPayload, {
      onSuccess: (session) => {
        setLocation(`/session/${session.id}`, {
          state: {
            exam,
            target: targetValue,
            mode: studyMode,
          },
        });
      },
    });
  };

  const handleSaveSettings = (newContext: any) => {
    setExam(newContext.exam);
    setTargetValue(newContext.target);
    setStudyMode(newContext.mode);
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

  const canContinueOnboarding = exam && targetValue && studyMode;
  const canStart = query.trim() && !isPending;

  // First-time onboarding screen
  if (!hasOnboarded || !context) {
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

            {/* Study Mode Selector */}
            <div className="space-y-4">
              <Label className="text-base font-mono font-semibold">
                Step 3: Choose how you want to study
              </Label>
              <RadioGroup
                value={studyMode}
                onValueChange={(value: any) => setStudyMode(value)}
              >
                <div className="space-y-3">
                  {(
                    [
                      "Follow Roadmap",
                      "Make Roadmap",
                      "Random Search",
                    ] as StudyMode[]
                  ).map((mode) => (
                    <label
                      key={mode}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border bg-background cursor-pointer hover:bg-secondary/30 hover:border-primary/50 transition-all"
                    >
                      <RadioGroupItem
                        value={mode}
                        id={`mode-${mode}`}
                        className="mt-1 h-5 w-5"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{mode}</div>
                        <p className="text-sm text-muted-foreground">
                          {MODE_DESCRIPTIONS[mode]}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
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
              <span className="text-muted-foreground">|</span>
              <span>
                <strong>Mode:</strong> {studyMode}
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
            {/* Mode-specific heading and input */}
            {studyMode === "Follow Roadmap" && (
              <>
                <div className="space-y-3 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-2">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h2 className="text-3xl font-bold font-mono">Generate Your Roadmap</h2>
                  <p className="text-muted-foreground">
                    Receive a complete, mentor-designed preparation plan tailored to your exam
                    and timeline.
                  </p>
                </div>
                <form onSubmit={handleStartSession} className="space-y-4">
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
                        Generate My Preparation Roadmap
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}

            {studyMode === "Make Roadmap" && (
              <>
                <div className="space-y-3 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-2">
                    <Zap className="h-7 w-7" />
                  </div>
                  <h2 className="text-3xl font-bold font-mono">Optimize Your Plan</h2>
                  <p className="text-muted-foreground">
                    Share your preparation plan and get it logically improved.
                  </p>
                </div>
                <form onSubmit={handleStartSession} className="space-y-4">
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
                    disabled={!canStart}
                    data-testid="button-optimize-plan"
                  >
                    {isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Optimize My Plan
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}

            {studyMode === "Random Search" && (
              <>
                <div className="space-y-3 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-2">
                    <Search className="h-7 w-7" />
                  </div>
                  <h2 className="text-3xl font-bold font-mono">Ask Your Question</h2>
                  <p className="text-muted-foreground">
                    Ask any exam-specific doubt or concept question instantly.
                  </p>
                </div>
                <form onSubmit={handleStartSession} className="space-y-4">
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
                    disabled={!canStart}
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
