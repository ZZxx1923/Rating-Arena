/**
 * Questions Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Admin only: Full CRUD for evaluation questions
 */
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  apiGetQuestions, apiCreateQuestion, apiUpdateQuestion, apiDeleteQuestion,
  ApiQuestion
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, HelpCircle, MessageSquare, ListOrdered } from "lucide-react";

function QuestionModal({
  open, onClose, question, onSave
}: {
  open: boolean;
  onClose: () => void;
  question: ApiQuestion | null;
  onSave: (data: { question_text: string; question_text_en?: string; question_type: string }) => Promise<void>;
}) {
  const [questionText, setQuestionText] = useState(question?.question_text || "");
  const [questionTextEn, setQuestionTextEn] = useState(question?.question_text_en || "");
  const [questionType, setQuestionType] = useState(question?.question_type || "rating");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text);
      setQuestionTextEn(question.question_text_en || "");
      setQuestionType(question.question_type);
    } else {
      setQuestionText("");
      setQuestionTextEn("");
      setQuestionType("rating");
    }
  }, [question, open]);

  const handleSave = async () => {
    if (!questionText.trim()) { toast.error("Question text is required"); return; }
    setLoading(true);
    try {
      await onSave({ question_text: questionText.trim(), question_text_en: questionTextEn.trim() || undefined, question_type: questionType });
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            {question ? "Edit Question" : "Add New Question"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-sm mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Question Text *</Label>
            <Input value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="e.g. Communication skills" />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Question Text (English)</Label>
            <Input value={questionTextEn} onChange={e => setQuestionTextEn(e.target.value)} placeholder="e.g. Communication skills (optional)" />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Question Type *</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating (1-5)</SelectItem>
                <SelectItem value="text">Text Input</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancel</Button>
            <Button
              onClick={handleSave}
              className="flex-1 text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", border: "none" }}
              disabled={loading}
            >
              {loading ? "Saving..." : (question ? "Save Changes" : "Add Question")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Questions() {
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<ApiQuestion | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedQuestions = await apiGetQuestions();
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      toast.error("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const filtered = useMemo(() => {
    return questions.filter(q =>
      q.question_text.toLowerCase().includes(search.toLowerCase()) ||
      (q.question_text_en && q.question_text_en.toLowerCase().includes(search.toLowerCase()))
    );
  }, [questions, search]);

  const openAdd = () => { setEditQuestion(null); setModalOpen(true); };
  const openEdit = (q: ApiQuestion) => { setEditQuestion(q); setModalOpen(true); };

  const handleSave = async (data: { question_text: string; question_text_en?: string; question_type: string }) => {
    try {
      if (editQuestion) {
        await apiUpdateQuestion(editQuestion.id, data);
        toast.success("Question updated successfully.");
      } else {
        await apiCreateQuestion(data.question_text, data.question_text_en, data.question_type);
        toast.success("Question added successfully.");
      }
      fetchQuestions(); // Refresh data
    } catch (error: any) {
      console.error("Error saving question:", error);
      throw error; // Re-throw to be caught by QuestionModal
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteQuestion(id);
      toast.success("Question deleted successfully.");
      fetchQuestions(); // Refresh data
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question.");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading questions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            Evaluation Questions
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Manage the questions used in employee evaluations
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2 font-semibold text-white"
          style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", border: "none", boxShadow: "0 4px 12px oklch(0.60 0.22 264 / 0.3)" }}
        >
          <Plus className="w-4 h-4" /> Add Question
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
        <Input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Questions List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Question</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Type</th>
              <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q, i) => (
              <tr
                key={q.id}
                className="transition-colors"
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{q.question_text}</p>
                  {q.question_text_en && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{q.question_text_en}</p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit"
                    style={
                      q.question_type === "rating"
                        ? { background: "oklch(0.60 0.22 264 / 0.15)", color: "oklch(0.60 0.22 264)", border: "1px solid oklch(0.60 0.22 264 / 0.3)" }
                        : { background: "oklch(0.78 0.17 70 / 0.15)", color: "oklch(0.78 0.17 70)", border: "1px solid oklch(0.78 0.17 70 / 0.3)" }
                    }
                  >
                    {q.question_type === "rating" ? <ListOrdered className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                    {q.question_type === "rating" ? "Rating" : "Text Input"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(q)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ background: "oklch(0.60 0.22 264 / 0.1)" }}
                      title="Edit question"
                    >
                      <Edit2 className="w-3.5 h-3.5" style={{ color: "oklch(0.60 0.22 264)" }} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(q.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ background: "oklch(0.65 0.22 15 / 0.1)" }}
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.22 15)" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                  <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No questions found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modalOpen && (
        <QuestionModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditQuestion(null); }}
          question={editQuestion}
          onSave={handleSave}
        />
      )}

      {deleteConfirm && (
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              Are you sure you want to delete this question? This action cannot be undone.
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button
                onClick={() => handleDelete(deleteConfirm)}
                className="text-white"
                style={{ background: "oklch(0.65 0.22 15)", border: "none" }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
