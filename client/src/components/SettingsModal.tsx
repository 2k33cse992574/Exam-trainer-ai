import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface UserContext {
  exam: string;
  target: string;
}

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: UserContext;
  onSave: (context: UserContext) => void;
}

type Exam = "JEE" | "NEET" | "SSC" | "AKTU" | "GATE" | "CAT";

const EXAMS: Exam[] = ["JEE", "NEET", "SSC", "AKTU", "GATE", "CAT"];
const TARGET_YEARS = ["2025", "2026", "2027"];
const TIME_OPTIONS = ["3 months", "6 months", "12 months"];

export function SettingsModal({
  open,
  onOpenChange,
  context,
  onSave,
}: SettingsModalProps) {
  const [exam, setExam] = useState<string>(context.exam);
  const [target, setTarget] = useState<"year" | "time">(
    TARGET_YEARS.includes(context.target) ? "year" : "time"
  );
  const [targetValue, setTargetValue] = useState(context.target);

  const handleSave = () => {
    onSave({
      exam,
      target: targetValue,
    });
    onOpenChange(false);
  };

  const canSave = exam && targetValue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg">Edit Exam Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Exam Selector */}
          <div className="space-y-3">
            <Label htmlFor="settings-exam" className="text-base font-mono font-semibold">
              Exam
            </Label>
            <Select value={exam} onValueChange={setExam}>
              <SelectTrigger
                id="settings-exam"
                className="h-10 px-3 text-sm bg-background border-border"
              >
                <SelectValue />
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
            <Label className="text-base font-mono font-semibold">Target</Label>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="settings-target-type" className="text-sm text-muted-foreground">
                  Type
                </Label>
                <Select value={target} onValueChange={(value: any) => setTarget(value)}>
                  <SelectTrigger
                    id="settings-target-type"
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
                <Label htmlFor="settings-target-value" className="text-sm text-muted-foreground">
                  Value
                </Label>
                <Select value={targetValue} onValueChange={setTargetValue}>
                  <SelectTrigger
                    id="settings-target-value"
                    className="h-10 px-3 text-sm bg-background border-border"
                  >
                    <SelectValue />
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

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-settings"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canSave}
              data-testid="button-save-settings"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
