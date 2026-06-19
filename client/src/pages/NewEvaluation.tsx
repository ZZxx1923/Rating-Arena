/**
 * New Evaluation Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * 1-5 rating system, anonymous option, optional comment
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  getEmployees, getDepartments, addEvaluation, hasUserEvaluatedEmployee,
  EVALUATION_QUESTIONS, RATING_LABELS
} from "@/lib/store";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle, EyeOff, Star, User, Building2, MessageSquare } from "lucide-react";

const RATING_COLORS: Record<number, string> = {
  1: "oklch(0.65 0.22 15)",
  2: "oklch(0.72 0.20 40)",
  3: "oklch(0.78 0.17 70)",
  4: "oklch(0.65 0.20 150)",
  5: "oklch(0.70 0.18 162)",
};

function RatingInput({ question, value, onChange }: {
  question: { id: string; label: string };
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="p-4 rounded-xl" style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{question.label}</span>
        {value > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
            background: `${RATING_COLORS[value]}20`,
            color: RATING_COLORS[value],
            border: `1px solid ${RATING_COLORS[value]}40`,
          }}>
            {RATING_LABELS[value]}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`rating-btn flex-1 ${value === n ? "active" : ""}`}
            style={value === n ? {
              background: RATING_COLORS[n],
              borderColor: RATING_COLORS[n],
              boxShadow: `0 0 12px ${RATING_COLORS[n]}50`,
            } : {}}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NewEvaluation() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const employees = useMemo(() => getEmployees(), []);
  const departments = useMemo(() => getDepartments(), []);

  const [step, setStep] = useState<"select" | "rate" | "done">("select");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const deptEmployees = useMemo(() =>
    selectedDept ? employees.filter(e => e.departmentId === selectedDept) : [],
    [selectedDept, employees]
  );

  const completedRatings = Object.keys(ratings).filter(k => ratings[k] > 0).length;
  const totalQuestions = EVALUATION_QUESTIONS.length;
  const progress = (completedRatings / totalQuestions) * 100;
  const avgRating = completedRatings > 0
    ? Object.values(ratings).filter(v => v > 0).reduce((a, b) => a + b, 0) / completedRatings
    : 0;

  const handleSelectNext = () => {
    if (!selectedDept) { toast.error("Please select a department"); return; }
    if (!selectedEmployee) { toast.error("Please select an employee"); return; }
    if (hasUserEvaluatedEmployee(user!.id, selectedEmployee)) {
      toast.error("You have already submitted an evaluation for this employee.");
      return;
    }
    setStep("rate");
  };

  const handleSubmit = async () => {
    const unanswered = EVALUATION_QUESTIONS.filter(q => !ratings[q.id] || ratings[q.id] === 0);
    if (unanswered.length > 0) {
      toast.error(`Please rate all ${totalQuestions} criteria before submitting.`);
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    addEvaluation({
      employeeId: selectedEmployee,
      userId: user!.id,
      isAnonymous,
      ratings,
      comment: comment.trim() || undefined,
    });
    setSubmitting(false);
    setStep("done");
  };

  const selectedEmpName = employees.find(e => e.id === selectedEmployee)?.name || "";
  const selectedDeptName = departments.find(d => d.id === selectedDept)?.name || "";

  if (step === "done") {
    return (
      <div className="max-w-lg mx-auto text-center py-16 fade-in-up">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "oklch(0.70 0.18 162 / 0.15)", border: "2px solid oklch(0.70 0.18 162 / 0.4)" }}
        >
          <CheckCircle className="w-10 h-10" style={{ color: "oklch(0.70 0.18 162)" }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
          Evaluation Submitted!
        </h2>
        <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
          Your evaluation for <strong style={{ color: "var(--foreground)" }}>{selectedEmpName}</strong> has been submitted successfully.
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
          It is now pending admin review.
          {isAnonymous && " Your identity is protected — this evaluation is anonymous."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => { setStep("select"); setSelectedDept(""); setSelectedEmployee(""); setRatings({}); setComment(""); setIsAnonymous(false); }}
          >
            New Evaluation
          </Button>
          <Button
            onClick={() => setLocation("/evaluations")}
            className="text-white"
            style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", border: "none" }}
          >
            View My Evaluations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step === "rate" && (
          <button
            onClick={() => setStep("select")}
            className="p-2 rounded-xl transition-colors"
            style={{ background: "oklch(1 0 0 / 0.06)" }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: "var(--foreground)" }} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            {step === "select" ? "New Evaluation" : `Evaluating ${selectedEmpName}`}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {step === "select"
              ? "Select a department and employee to evaluate"
              : `${selectedDeptName} · Rate each criterion from 1 to 5`}
          </p>
        </div>
      </div>

      {/* Step 1: Select */}
      {step === "select" && (
        <div
          className="rounded-2xl p-6 space-y-5 fade-in-up"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div>
            <Label className="text-sm font-medium mb-2 block flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <Building2 className="w-4 h-4" style={{ color: "oklch(0.60 0.22 264)" }} />
              Department
            </Label>
            <Select value={selectedDept} onValueChange={v => { setSelectedDept(v); setSelectedEmployee(""); }}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a department..." />
              </SelectTrigger>
              <SelectContent>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <User className="w-4 h-4" style={{ color: "oklch(0.60 0.22 264)" }} />
              Employee
            </Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={!selectedDept}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={selectedDept ? "Select an employee..." : "Select department first"} />
              </SelectTrigger>
              <SelectContent>
                {deptEmployees.length === 0 ? (
                  <div className="px-3 py-2 text-sm" style={{ color: "var(--muted-foreground)" }}>No employees in this department</div>
                ) : (
                  deptEmployees.map(e => {
                    const alreadyEval = hasUserEvaluatedEmployee(user!.id, e.id);
                    return (
                      <SelectItem key={e.id} value={e.id} disabled={alreadyEval}>
                        {e.name} — {e.position} {alreadyEval ? "(already evaluated)" : ""}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Anonymous option */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)" }}
          >
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={v => setIsAnonymous(!!v)}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="anonymous" className="text-sm font-medium cursor-pointer flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
                <EyeOff className="w-3.5 h-3.5" style={{ color: "oklch(0.60 0.22 264)" }} />
                Submit Anonymously
              </Label>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                Your identity will be hidden from the employee. Only administrators can view the evaluator identity.
              </p>
            </div>
          </div>

          <Button
            onClick={handleSelectNext}
            className="w-full h-11 font-semibold text-white gap-2"
            style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", border: "none", boxShadow: "0 4px 12px oklch(0.60 0.22 264 / 0.3)" }}
          >
            Continue to Rating <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Rate */}
      {step === "rate" && (
        <div className="space-y-4 fade-in-up">
          {/* Progress */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                {completedRatings}/{totalQuestions} criteria rated
              </span>
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" style={{ color: "oklch(0.78 0.17 70)" }} />
                <span className="text-sm font-bold font-mono" style={{ color: "var(--foreground)" }}>
                  {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full" style={{ background: "oklch(1 0 0 / 0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, oklch(0.60 0.22 264), oklch(0.70 0.18 162))",
                }}
              />
            </div>
          </div>

          {/* Rating Questions */}
          <div className="space-y-3">
            {EVALUATION_QUESTIONS.map(q => (
              <RatingInput
                key={q.id}
                question={q}
                value={ratings[q.id] || 0}
                onChange={v => setRatings(prev => ({ ...prev, [q.id]: v }))}
              />
            ))}
          </div>

          {/* Comment */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <Label className="text-sm font-medium mb-2 block flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <MessageSquare className="w-4 h-4" style={{ color: "oklch(0.60 0.22 264)" }} />
              Additional Comments
              <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>(optional)</span>
            </Label>
            <Textarea
              placeholder="Share any additional observations or feedback..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-xs mt-1 text-right" style={{ color: "var(--muted-foreground)" }}>
              {comment.length}/500
            </p>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || completedRatings < totalQuestions}
            className="w-full h-12 font-semibold text-white gap-2"
            style={{
              background: completedRatings < totalQuestions
                ? "oklch(0.40 0.10 264)"
                : "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))",
              border: "none",
              boxShadow: completedRatings < totalQuestions ? "none" : "0 4px 12px oklch(0.60 0.22 264 / 0.3)",
            }}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : completedRatings < totalQuestions ? (
              `Rate ${totalQuestions - completedRatings} more criteria to submit`
            ) : (
              <>Submit Evaluation <CheckCircle className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
