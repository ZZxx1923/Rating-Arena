/**
 * Evaluations Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Admin: all evaluations with approve/reject/delete
 * User: own evaluations only
 */
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  apiGetEvaluations, apiGetEmployees, apiGetDepartments, apiGetUsers,
  apiUpdateEvaluationStatus, apiDeleteEvaluation,
  ApiEvaluation, ApiEmployee, ApiDepartment, ApiUser
} from "@/lib/api";
import { EVALUATION_QUESTIONS, RATING_LABELS } from "@/lib/store"; // Keep constants
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

function StatusBadge({ status }: { status: string }) {
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
  evaluation: ApiEvaluation;
  onClose: () => void;
  isAdmin: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onDelete: (id: string) => void;
}) {
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedEmployees, fetchedDepartments, fetchedUsers] = await Promise.all([
          apiGetEmployees(),
          apiGetDepartments(),
          apiGetUsers(),
        ]);
        setEmployees(fetchedEmployees);
        setDepartments(fetchedDepartments);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch modal data:", error);
        toast.error("Failed to load evaluation details.");
      }
    };
    fetchData();
  }, []);

  const employee = employees.find(e => e.id === evaluation.employee_id);
  const dept = departments.find(d => d.id === employee?.department_id);
  const evaluator = users.find(u => u.id === evaluation.user_id);
  const avgRating = Object.values(evaluation.ratings).reduce((a, b) => a + b, 0) / Object.values(evaluation.ratings).length;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluation Details</DialogTitle>
        </DialogHeader>
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
              {evaluation.is_anonymous && !isAdmin ? (
                <div className="flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                  <p className="font-semibold text-sm" style={{ color: "var(--muted-foreground)" }}>Anonymous</p>
                </div>
              ) : (
                <>
                  <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{evaluator?.username || "Unknown"}</p>
                  {evaluation.is_anonymous && (
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
          {evaluation.status === "rejected" && evaluation.rejection_reason && (
            <div className="p-4 rounded-xl" style={{ background: "oklch(0.65 0.22 15 / 0.08)", border: "1px solid oklch(0.65 0.22 15 / 0.2)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "oklch(0.65 0.22 15)" }}>Rejection Reason</p>
              <p className="text-sm" style={{ color: "var(--foreground)" }}>{evaluation.rejection_reason}</p>
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin && evaluation.status === "pending" && (
            <div className="space-y-3 pt-2 border-t" style={{ borderColor: "oklch(1 0 0 / 0.08)" }}>
              {!showRejectForm ? (
                <div className="flex gap-3">
                  <Button
                    onClick={() => onApprove(evaluation.id)}
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
                      onClick={() => onReject(evaluation.id, rejectReason)}
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
                  <Button onClick={() => onDelete(evaluation.id)} className="flex-1 text-sm text-white" style={{ background: "oklch(0.65 0.22 15)", border: "none" }}>
                    Confirm Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Evaluations() {
  const { user, isAdmin } = useAuth();
  const [evaluations, setEvaluations] = useState<ApiEvaluation[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selectedEval, setSelectedEval] = useState<ApiEvaluation | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedEvaluations, fetchedEmployees, fetchedDepartments, fetchedUsers] = await Promise.all([
        apiGetEvaluations(),
        apiGetEmployees(),
        apiGetDepartments(),
        apiGetUsers(),
      ]);
      setEvaluations(fetchedEvaluations);
      setEmployees(fetchedEmployees);
      setDepartments(fetchedDepartments);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch evaluations data:", error);
      toast.error("Failed to load evaluations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getEmpName = (id: string) => employees.find(e => e.id === id)?.name || "Unknown";
  const getDeptName = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    return departments.find(d => d.id === emp?.department_id)?.name || "—";
  };
  const getDeptId = (empId: string) => employees.find(e => e.id === empId)?.department_id || "";
  const getEvaluatorName = (ev: ApiEvaluation) => {
    if (ev.is_anonymous && !isAdmin) return "Anonymous";
    return users.find(u => u.id === ev.user_id)?.username || "Unknown";
  };

  const filtered = useMemo(() => {
    let list = isAdmin ? evaluations : evaluations.filter(e => e.user_id === user?.id);
    if (search) {
      list = list.filter(e =>
        getEmpName(e.employee_id).toLowerCase().includes(search.toLowerCase()) ||
        getDeptName(e.employee_id).toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") list = list.filter(e => e.status === statusFilter);
    if (deptFilter !== "all") list = list.filter(e => getDeptId(e.employee_id) === deptFilter);
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [evaluations, search, statusFilter, deptFilter, isAdmin, user, employees, departments, users]);

  const handleApprove = async (id: string) => {
    try {
      await apiUpdateEvaluationStatus(id, "approved");
      toast.success("Evaluation approved");
      fetchData(); // Refresh data
      setSelectedEval(null);
    } catch (error) {
      console.error("Failed to approve evaluation:", error);
      toast.error("Failed to approve evaluation.");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await apiUpdateEvaluationStatus(id, "rejected", reason);
      toast.success("Evaluation rejected");
      fetchData(); // Refresh data
      setSelectedEval(null);
    } catch (error) {
      console.error("Failed to reject evaluation:", error);
      toast.error("Failed to reject evaluation.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteEvaluation(id);
      toast.success("Evaluation deleted");
      fetchData(); // Refresh data
      setSelectedEval(null);
    } catch (error) {
      console.error("Failed to delete evaluation:", error);
      toast.error("Failed to delete evaluation.");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading evaluations...</div>; // Simple loading state
  }

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
            style={{
              background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))",
              border: "none",
              boxShadow: "0 4px 12px oklch(0.60 0.22 264 / 0.3)",
            }}
          >
            <PlusCircle className="w-4 h-4" />
            New Evaluation
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee or department..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full">
            <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Evaluations Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Employee</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Department</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Evaluator</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Avg Rating</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev, i) => {
                const avgRating = Object.values(ev.ratings).reduce((a, b) => a + b, 0) / Object.values(ev.ratings).length;
                return (
                  <tr
                    key={ev.id}
                    className="transition-colors"
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {getEmpName(ev.employee_id)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {getDeptName(ev.employee_id)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm" style={{ color: "var(--foreground)" }}>
                        {getEvaluatorName(ev)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" style={{ color: RATING_COLORS[Math.round(avgRating)] || RATING_COLORS[3] }} />
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
                        {new Date(ev.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedEval(ev)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                    No evaluations yet. <Link href="/evaluations/new"><span style={{ color: "oklch(0.60 0.22 264)" }} className="cursor-pointer">Create the first one.</span></Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEval && (
        <EvaluationDetailModal
          evaluation={selectedEval}
          onClose={() => setSelectedEval(null)}
          isAdmin={isAdmin}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
