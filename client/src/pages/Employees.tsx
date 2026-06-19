/**
 * Employees Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Admin: Full CRUD | User: View only
 */
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getEmployees, getDepartments, addEmployee, updateEmployee, deleteEmployee,
  getEmployeeStats, getEvaluations, EVALUATION_QUESTIONS, type Employee
} from "@/lib/store";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Search, Edit2, Trash2, User, Building2, Mail, Briefcase,
  Star, BarChart2, X, ChevronDown, ChevronUp
} from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

function EmployeeModal({
  open, onClose, employee, departments, onSave
}: {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  departments: { id: string; name: string }[];
  onSave: (data: Omit<Employee, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState(employee?.name || "");
  const [position, setPosition] = useState(employee?.position || "");
  const [departmentId, setDepartmentId] = useState(employee?.departmentId || "");
  const [email, setEmail] = useState(employee?.email || "");

  const handleSave = () => {
    if (!name.trim() || !position.trim() || !departmentId) {
      toast.error("Please fill in all required fields.");
      return;
    }
    onSave({ name: name.trim(), position: position.trim(), departmentId, email: email.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        style={{ background: "oklch(0.16 0.018 264)", border: "1px solid oklch(1 0 0 / 0.12)" }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            {employee ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-sm mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Full Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Smith" />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Position *</Label>
            <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Senior Developer" />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Department *</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Email (optional)</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="employee@company.com" type="email" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleSave}
              className="flex-1 text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", border: "none" }}
            >
              {employee ? "Save Changes" : "Add Employee"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmployeeProfile({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const stats = useMemo(() => getEmployeeStats(employee.id), [employee.id]);
  const departments = getDepartments();
  const deptName = departments.find(d => d.id === employee.departmentId)?.name || "—";

  const radarData = EVALUATION_QUESTIONS.map(q => ({
    subject: q.label.split(" ")[0],
    value: stats.questionAverages[q.id] ? Math.round(stats.questionAverages[q.id] * 10) / 10 : 0,
    fullMark: 5,
  }));

  const ratingColors = ["oklch(0.65 0.22 15)", "oklch(0.75 0.20 40)", "oklch(0.78 0.17 70)", "oklch(0.65 0.20 150)", "oklch(0.70 0.18 162)"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "oklch(0.16 0.018 264)", border: "1px solid oklch(1 0 0 / 0.12)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: "oklch(1 0 0 / 0.08)" }}>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", fontFamily: "'Sora', sans-serif" }}
            >
              {employee.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
                {employee.name}
              </h2>
              <p className="text-sm" style={{ color: "oklch(0.60 0.22 264)" }}>{employee.position}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{deptName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ background: "oklch(1 0 0 / 0.06)" }}>
            <X className="w-4 h-4" style={{ color: "var(--foreground)" }} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Avg Rating", value: stats.avgRating || "—", color: "oklch(0.78 0.17 70)" },
              { label: "Evaluations", value: stats.totalEvaluations, color: "oklch(0.60 0.22 264)" },
              { label: "Top Score", value: stats.avgRating >= 4 ? "High" : stats.avgRating >= 3 ? "Mid" : stats.avgRating > 0 ? "Low" : "—", color: "oklch(0.70 0.18 162)" },
            ].map(s => (
              <div key={s.label} className="text-center p-4 rounded-xl" style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
                <p className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Rating Distribution */}
          {stats.totalEvaluations > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
                Rating Distribution
              </h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = stats.ratingDistribution[rating] || 0;
                  const total = Object.values(stats.ratingDistribution).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-xs font-mono w-4 text-right" style={{ color: "var(--muted-foreground)" }}>{rating}</span>
                      <div className="flex-1 h-2 rounded-full" style={{ background: "oklch(1 0 0 / 0.08)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: ratingColors[rating - 1] }}
                        />
                      </div>
                      <span className="text-xs font-mono w-8" style={{ color: "var(--muted-foreground)" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Radar Chart */}
          {stats.totalEvaluations > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
                Performance by Category
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="oklch(1 0 0 / 0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "oklch(0.55 0.015 264)" }} />
                  <Radar dataKey="value" stroke="oklch(0.60 0.22 264)" fill="oklch(0.60 0.22 264)" fillOpacity={0.2} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.16 0.018 264)",
                      border: "1px solid oklch(1 0 0 / 0.12)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {stats.totalEvaluations === 0 && (
            <div className="text-center py-8" style={{ color: "var(--muted-foreground)" }}>
              <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No approved evaluations yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Employees() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState(() => getEmployees());
  const departments = useMemo(() => getDepartments(), []);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [profileEmployee, setProfileEmployee] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.position.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === "all" || e.departmentId === deptFilter;
      return matchSearch && matchDept;
    });
  }, [employees, search, deptFilter]);

  const handleSave = (data: Omit<Employee, "id" | "createdAt">) => {
    if (editEmployee) {
      updateEmployee(editEmployee.id, data);
      toast.success("Employee updated successfully");
    } else {
      addEmployee(data);
      toast.success("Employee added successfully");
    }
    setEmployees(getEmployees());
    setModalOpen(false);
    setEditEmployee(null);
  };

  const handleDelete = (id: string) => {
    deleteEmployee(id);
    setEmployees(getEmployees());
    setDeleteConfirm(null);
    toast.success("Employee deleted");
  };

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            Employees
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {employees.length} employees across {departments.length} departments
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => { setEditEmployee(null); setModalOpen(true); }}
            className="gap-2 font-semibold text-white"
            style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", border: "none", boxShadow: "0 4px 12px oklch(0.60 0.22 264 / 0.3)" }}
          >
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
        {filtered.map(emp => {
          const stats = getEmployeeStats(emp.id);
          return (
            <div
              key={emp.id}
              className="glass-card p-5 cursor-pointer"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              onClick={() => setProfileEmployee(emp)}
            >
              {/* Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
                  style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", fontFamily: "'Sora', sans-serif" }}
                >
                  {emp.name.charAt(0)}
                </div>
                {isAdmin && (
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setEditEmployee(emp); setModalOpen(true); }}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ background: "oklch(0.60 0.22 264 / 0.1)" }}
                    >
                      <Edit2 className="w-3.5 h-3.5" style={{ color: "oklch(0.60 0.22 264)" }} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(emp.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ background: "oklch(0.65 0.22 15 / 0.1)" }}
                    >
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.22 15)" }} />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-sm mb-0.5" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
                {emp.name}
              </h3>
              <p className="text-xs mb-1" style={{ color: "oklch(0.60 0.22 264)" }}>{emp.position}</p>
              <div className="flex items-center gap-1 mb-3">
                <Building2 className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{getDeptName(emp.departmentId)}</span>
              </div>

              {emp.email && (
                <div className="flex items-center gap-1 mb-3">
                  <Mail className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
                  <span className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{emp.email}</span>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" style={{ color: "oklch(0.78 0.17 70)" }} />
                  <span className="text-sm font-bold font-mono" style={{ color: "var(--foreground)" }}>
                    {stats.avgRating || "—"}
                  </span>
                </div>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {stats.totalEvaluations} eval{stats.totalEvaluations !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12" style={{ color: "var(--muted-foreground)" }}>
            <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No employees found</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <EmployeeModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditEmployee(null); }}
          employee={editEmployee}
          departments={departments}
          onSave={handleSave}
        />
      )}

      {profileEmployee && (
        <EmployeeProfile employee={profileEmployee} onClose={() => setProfileEmployee(null)} />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "oklch(0 0 0 / 0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: "oklch(0.16 0.018 264)", border: "1px solid oklch(1 0 0 / 0.12)" }}
          >
            <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
              Delete Employee?
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
              This action cannot be undone. All associated evaluations will remain but may reference a deleted employee.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
              <Button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 text-white"
                style={{ background: "oklch(0.65 0.22 15)", border: "none" }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
