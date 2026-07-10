/**
 * Evaluations Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Admin: all evaluations with approve/reject/delete
 * User: own evaluations only
 */
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getEvaluations, getEmployees, getDepartments, getUsers,
  updateEvaluationStatus, deleteEvaluation,
  EVALUATION_QUESTIONS, RATING_LABELS, type Evaluation, type EvaluationStatus
} from "@/lib/store";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search, CheckCircle, XCircle, Trash2, Eye, Star, User,
  Building2, Calendar, EyeOff, MessageSquare, Filter
} from "lucide-react";
import { Link } from "wouter";

const RATING_COLORS: Record<number, string> = {
  1: "oklch(0.65 0.22 15)",
  2: "oklch(0.72 0.20 40)",
  3: "oklch(0.78 0.17 70)",
  4: "oklch(0.65 0.20 150)",
  5: "oklch(0.70 0.18 162)",
};

function StatusBadge({ status }: { status: EvaluationStatus }) {
  const cls = status === "pending" ? "badge-pending" : status === "approved" ? "badge-approved" : "badge-rejected";
  return (
    <span className={`${cls} text-xs px-2.5 py-1 rounded-full font-medium`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function EvaluationDetailModal({
  evaluation, onClose, isAdmin, onApprove, onReject, onDelete
}: {
  evaluation: Evaluation;
  onClose: () => void;
  isAdmin: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onDelete: () => void;
}) {
  const employees = getEmployees();
  const departments = getDepartments();
  const users = getUsers();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const employee = employees.find(e => e.id === evaluation.employeeId);
  const dept = departments.find(d => d.id === employee?.departmentId);
  const evaluator = users.find(u => u.id === evaluation.userId);
  const avgRating = Object.values(evaluation.ratings).reduce((a, b) => a + b, 0) / Object.values(evaluation.ratings).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "oklch(0.16 0.018 264)", border: "1px solid oklch(1 0 0 / 0.12)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: "oklch(1 0 0 / 0.08)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
                Evaluation Details
              </h2>
              <StatusBadge status={evaluation.status} />
            </div>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {new Date(evaluation.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ background: "oklch(1 0 0 / 0.06)" }}>
            <XCircle className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Employee & Evaluator info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl" style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Employee</p>
              <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{employee?.name || "Unknown"}</p>
              <p className="text-xs" style={{ color: "oklch(0.60 0.22 264)" }}>{employee?.position}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{dept?.name}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Evaluator</p>
              {evaluation.isAnonymous && !isAdmin ? (
                <div className="flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                  <p className="font-semibold text-sm" style={{ color: "var(--muted-foreground)" }}>Anonymous</p>
                </div>
              ) : (
                <>
                  <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{evaluator?.username || "Unknown"}</p>
                  {evaluation.isAnonymous && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "oklch(0.60 0.22 264 / 0.15)", color: "oklch(0.60 0.22 264)" }}>
                      Anonymous submission
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Average Rating */}
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "oklch(0.78 0.17 70 / 0.08)", border: "1px solid oklch(0.78 0.17 70 / 0.2)" }}>
            <Star className="w-5 h-5" style={{ color: "oklch(0.78 0.17 70)" }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.78 0.17 70)" }}>Average Rating</p>
              <p className="text-2xl font-bold font-mono" style={{ fontFamily: "'Sora', sans-serif", color: "oklch(0.78 0.17 70)" }}>
                {avgRating.toFixed(2)} / 5.00
              </p>
            </div>
          </div>

          {/* Ratings Grid */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
              Criteria Ratings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EVALUATION_QUESTIONS.map(q => {
                const val = evaluation.ratings[q.id] || 0;
                return (
                  <div key={q.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.05)" }}>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{q.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <div key={n} className="w-2 h-2 rounded-full" style={{ background: n <= val ? RATING_COLORS[val] : "oklch(1 0 0 / 0.1)" }} />
                        ))}
                      </div>
                      <span className="text-xs font-bold font-mono w-4" style={{ color: RATING_COLORS[val] }}>{val}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          {evaluation.comment && (
            <div className="p-4 rounded-xl" style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5" style={{ color: "oklch(0.60 0.22 264)" }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Additional Comments</p>
              </div>
              <p className="text-sm" style={{ color: "var(--foreground)" }}>{evaluation.comment}</p>
            </div>
          )}

          {/* Rejection reason */}
          {evaluation.status === "rejected" && evaluation.rejectionReason && (
            <div className="p-4 rounded-xl" style={{ background: "oklch(0.65 0.22 15 / 0.08)", border: "1px solid oklch(0.65 0.22 15 / 0.2)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "oklch(0.65 0.22 15)" }}>Rejection Reason</p>
              <p className="text-sm" style={{ color: "var(--foreground)" }}>{evaluation.rejectionReason}</p>
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin && evaluation.status === "pending" && (
            <div className="space-y-3 pt-2 border-t" style={{ borderColor: "oklch(1 0 0 / 0.08)" }}>
              {!showRejectForm ? (
                <div className="flex gap-3">
                  <Button
                    onClick={onApprove}
                    className="flex-1 gap-2 text-white"
                    style={{ background: "oklch(0.60 0.18 162)", border: "none" }}
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </Button>
                  <Button
                    onClick={() => setShowRejectForm(true)}
                    variant="outline"
                    className="flex-1 gap-2"
                    style={{ borderColor: "oklch(0.65 0.22 15 / 0.5)", color: "oklch(0.65 0.22 15)" }}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Rejection reason (optional)..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowRejectForm(false)} className="flex-1">Cancel</Button>
                    <Button
                      onClick={() => onReject(rejectReason)}
                      className="flex-1 text-white"
                      style={{ background: "oklch(0.65 0.22 15)", border: "none" }}
                    >
                      Confirm Rejection
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete (admin only) */}
          {isAdmin && (
            <div className="pt-2 border-t" style={{ borderColor: "oklch(1 0 0 / 0.08)" }}>
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: "oklch(0.65 0.22 15 / 0.7)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.65 0.22 15)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.65 0.22 15 / 0.7)")}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete permanently
                </button>
              ) : (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setDeleteConfirm(false)} className="flex-1 text-sm">Cancel</Button>
                  <Button onClick={onDelete} className="flex-1 text-sm text-white" style={{ background: "oklch(0.65 0.22 15)", border: "none" }}>
                    Confirm Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Evaluations() {
  const { user, isAdmin } = useAuth();
  const [evaluations, setEvaluations] = useState(() => getEvaluations());
  const employees = useMemo(() => getEmployees(), []);
  const departments = useMemo(() => getDepartments(), []);
  const users = useMemo(() => getUsers(), []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EvaluationStatus>("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);

  const getEmpName = (id: string) => employees.find(e => e.id === id)?.name || "Unknown";
  const getDeptName = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    return departments.find(d => d.id === emp?.departmentId)?.name || "—";
  };
  const getDeptId = (empId: string) => employees.find(e => e.id === empId)?.departmentId || "";
  const getEvaluatorName = (ev: Evaluation) => {
    if (ev.isAnonymous && !isAdmin) return "Anonymous";
    return users.find(u => u.id === ev.userId)?.username || "Unknown";
  };

  const filtered = useMemo(() => {
    let list = isAdmin ? evaluations : evaluations.filter(e => e.userId === user?.id);
    if (search) {
      list = list.filter(e =>
        getEmpName(e.employeeId).toLowerCase().includes(search.toLowerCase()) ||
        getDeptName(e.employeeId).toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") list = list.filter(e => e.status === statusFilter);
    if (deptFilter !== "all") list = list.filter(e => getDeptId(e.employeeId) === deptFilter);
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [evaluations, search, statusFilter, deptFilter, isAdmin, user]);

  const handleApprove = (id: string) => {
    updateEvaluationStatus(id, "approved");
    setEvaluations(getEvaluations());
    setSelectedEval(null);
    toast.success("Evaluation approved");
  };

  const handleReject = (id: string, reason: string) => {
    updateEvaluationStatus(id, "rejected", reason);
    setEvaluations(getEvaluations());
    setSelectedEval(null);
    toast.success("Evaluation rejected");
  };

  const handleDelete = (id: string) => {
    deleteEvaluation(id);
    setEvaluations(getEvaluations());
    setSelectedEval(null);
    toast.success("Evaluation deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            {isAdmin ? "All Evaluations" : "My Evaluations"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {filtered.length} evaluation{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Link href="/evaluations/new">
          <Button
            className="gap-2 font-semibold text-white"
            style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", border: "none", boxShadow: "0 4px 12px oklch(0.60 0.22 264 / 0.3)" }}
          >
            + New Evaluation
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          <Input placeholder="Search by employee or department..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        {isAdmin && (
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Evaluations Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Employee", "Department", isAdmin ? "Evaluator" : null, "Avg Rating", "Status", "Date", ""].filter(Boolean).map(h => (
                  <th key={h as string} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev, i) => {
                const avgRating = Object.values(ev.ratings).reduce((a, b) => a + b, 0) / Object.values(ev.ratings).length;
                return (
                  <tr
                    key={ev.id}
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    onClick={() => setSelectedEval(ev)}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {getEmpName(ev.employeeId)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {getDeptName(ev.employeeId)}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {ev.isAnonymous && <EyeOff className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />}
                          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                            {getEvaluatorName(ev)}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" style={{ color: "oklch(0.78 0.17 70)" }} />
                        <span className="text-sm font-mono font-semibold" style={{ color: "var(--foreground)" }}>
                          {avgRating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                        {new Date(ev.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedEval(ev)}
                          className="p-1.5 rounded-lg"
                          style={{ background: "oklch(0.60 0.22 264 / 0.1)" }}
                        >
                          <Eye className="w-3.5 h-3.5" style={{ color: "oklch(0.60 0.22 264)" }} />
                        </button>
                        {isAdmin && ev.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(ev.id)}
                              className="p-1.5 rounded-lg"
                              style={{ background: "oklch(0.70 0.18 162 / 0.1)" }}
                            >
                              <CheckCircle className="w-3.5 h-3.5" style={{ color: "oklch(0.70 0.18 162)" }} />
                            </button>
                            <button
                              onClick={() => { setSelectedEval(ev); }}
                              className="p-1.5 rounded-lg"
                              style={{ background: "oklch(0.65 0.22 15 / 0.1)" }}
                            >
                              <XCircle className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.22 15)" }} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-5 py-12 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                    No evaluations found.{" "}
                    <Link href="/evaluations/new">
                      <span style={{ color: "oklch(0.60 0.22 264)" }} className="cursor-pointer">Create one now.</span>
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEval && (
        <EvaluationDetailModal
          evaluation={selectedEval}
          onClose={() => setSelectedEval(null)}
          isAdmin={isAdmin}
          onApprove={() => handleApprove(selectedEval.id)}
          onReject={(reason) => handleReject(selectedEval.id, reason)}
          onDelete={() => handleDelete(selectedEval.id)}
        />
      )}
    </div>
  );
}
