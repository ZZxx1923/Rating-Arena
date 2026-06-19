/**
 * Departments Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 */
import { useState, useMemo } from "react";
import {
  getDepartments, addDepartment, updateDepartment, deleteDepartment,
  getEmployees, getEvaluations, type Department
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Building2, Users, ClipboardList, Search } from "lucide-react";

export default function Departments() {
  const [departments, setDepartments] = useState(() => getDepartments());
  const employees = useMemo(() => getEmployees(), []);
  const evaluations = useMemo(() => getEvaluations(), []);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditDept(null); setDeptName(""); setModalOpen(true); };
  const openEdit = (d: Department) => { setEditDept(d); setDeptName(d.name); setModalOpen(true); };

  const handleSave = () => {
    if (!deptName.trim()) { toast.error("Department name is required"); return; }
    if (editDept) {
      updateDepartment(editDept.id, deptName.trim());
      toast.success("Department updated");
    } else {
      addDepartment(deptName.trim());
      toast.success("Department added");
    }
    setDepartments(getDepartments());
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const hasEmployees = employees.some(e => e.departmentId === id);
    if (hasEmployees) {
      toast.error("Cannot delete: department has employees. Reassign them first.");
      setDeleteConfirm(null);
      return;
    }
    deleteDepartment(id);
    setDepartments(getDepartments());
    setDeleteConfirm(null);
    toast.success("Department deleted");
  };

  const getDeptStats = (deptId: string) => {
    const empCount = employees.filter(e => e.departmentId === deptId).length;
    const empIds = employees.filter(e => e.departmentId === deptId).map(e => e.id);
    const evalCount = evaluations.filter(ev => empIds.includes(ev.employeeId) && ev.status === "approved").length;
    return { empCount, evalCount };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            Departments
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Manage organizational departments and their structure
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2 font-semibold text-white"
          style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", border: "none", boxShadow: "0 4px 12px oklch(0.60 0.22 264 / 0.3)" }}
        >
          <Plus className="w-4 h-4" /> Add Department
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
        <Input placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filtered.map((dept, i) => {
          const { empCount, evalCount } = getDeptStats(dept.id);
          const colors = [
            "oklch(0.60 0.22 264)", "oklch(0.65 0.20 295)", "oklch(0.70 0.18 162)",
            "oklch(0.78 0.17 70)", "oklch(0.65 0.22 15)"
          ];
          const color = colors[i % colors.length];
          return (
            <div
              key={dept.id}
              className="glass-card p-5"
              style={{ background: "var(--card)", border: "1px solid var(--border)", animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                >
                  <Building2 className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(dept)}
                    className="p-1.5 rounded-lg"
                    style={{ background: "oklch(0.60 0.22 264 / 0.1)" }}
                  >
                    <Edit2 className="w-3.5 h-3.5" style={{ color: "oklch(0.60 0.22 264)" }} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(dept.id)}
                    className="p-1.5 rounded-lg"
                    style={{ background: "oklch(0.65 0.22 15 / 0.1)" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.22 15)" }} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-base mb-1" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
                {dept.name}
              </h3>
              <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
                Created {new Date(dept.createdAt).toLocaleDateString()}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl" style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
                  <p className="text-xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color }}>{empCount}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Employees</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
                  <p className="text-xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color }}>{evalCount}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Evaluations</p>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12" style={{ color: "var(--muted-foreground)" }}>
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No departments found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent style={{ background: "oklch(0.16 0.018 264)", border: "1px solid oklch(1 0 0 / 0.12)" }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
              {editDept ? "Rename Department" : "Add New Department"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              placeholder="Department name"
              value={deptName}
              onChange={e => setDeptName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              autoFocus
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
              <Button
                onClick={handleSave}
                className="flex-1 text-white"
                style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", border: "none" }}
              >
                {editDept ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "oklch(0 0 0 / 0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "oklch(0.16 0.018 264)", border: "1px solid oklch(1 0 0 / 0.12)" }}>
            <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>Delete Department?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
              Departments with employees cannot be deleted. Reassign all employees first.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
              <Button onClick={() => handleDelete(deleteConfirm)} className="flex-1 text-white" style={{ background: "oklch(0.65 0.22 15)", border: "none" }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
