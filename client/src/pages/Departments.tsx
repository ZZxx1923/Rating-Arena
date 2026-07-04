/**
 * Departments Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 */
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  apiGetDepartments, apiCreateDepartment, apiUpdateDepartment, apiDeleteDepartment, apiGetEmployees,
  ApiDepartment, ApiEmployee
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Building2, Users, ClipboardList, Search } from "lucide-react";

function DepartmentModal({
  open, onClose, department, onSave
}: {
  open: boolean;
  onClose: () => void;
  department: ApiDepartment | null;
  onSave: (data: { name: string; name_en?: string }) => Promise<void>;
}) {
  const [name, setName] = useState(department?.name || "");
  const [nameEn, setNameEn] = useState(department?.name_en || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (department) {
      setName(department.name);
      setNameEn(department.name_en || "");
    } else {
      setName("");
      setNameEn("");
    }
  }, [department, open]);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Department name is required"); return; }
    setLoading(true);
    try {
      await onSave({ name: name.trim(), name_en: nameEn.trim() || undefined });
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save department.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            {department ? "Edit Department" : "Add New Department"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-sm mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Department Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter department name" />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Department Name (English)</Label>
            <Input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Enter English name (optional)" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancel</Button>
            <Button
              onClick={handleSave}
              className="flex-1 text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", border: "none" }}
              disabled={loading}
            >
              {loading ? "Saving..." : (department ? "Save Changes" : "Add Department")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Departments() {
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editDept, setEditDept] = useState<ApiDepartment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchDepartmentsAndEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedDepartments, fetchedEmployees] = await Promise.all([
        apiGetDepartments(),
        apiGetEmployees(),
      ]);
      setDepartments(fetchedDepartments);
      setEmployees(fetchedEmployees);
    } catch (error) {
      console.error("Failed to fetch departments or employees:", error);
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartmentsAndEmployees();
  }, [fetchDepartmentsAndEmployees]);

  const filtered = useMemo(() => {
    return departments.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.name_en && d.name_en.toLowerCase().includes(search.toLowerCase()))
    );
  }, [departments, search]);

  const openAdd = () => { setEditDept(null); setModalOpen(true); };
  const openEdit = (d: ApiDepartment) => { setEditDept(d); setModalOpen(true); };

  const handleSave = async (data: { name: string; name_en?: string }) => {
    try {
      if (editDept) {
        await apiUpdateDepartment(editDept.id, data);
        toast.success("Department updated successfully.");
      } else {
        await apiCreateDepartment(data.name, data.name_en);
        toast.success("Department added successfully.");
      }
      fetchDepartmentsAndEmployees(); // Refresh data
    } catch (error: any) {
      console.error("Error saving department:", error);
      throw error; // Re-throw to be caught by DepartmentModal
    }
  };

  const handleDelete = async (id: string) => {
    const hasEmployees = employees.some(e => e.department_id === id);
    if (hasEmployees) {
      toast.error("Cannot delete: department has employees. Reassign them first.");
      setDeleteConfirm(null);
      return;
    }
    try {
      await apiDeleteDepartment(id);
      toast.success("Department deleted successfully.");
      fetchDepartmentsAndEmployees(); // Refresh data
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("Failed to delete department.");
    }
  };

  const getDeptStats = (deptId: string) => {
    const empCount = employees.filter(e => e.department_id === deptId).length;
    // Note: Evaluations are not directly linked to departments in the API, but to employees.
    // To get evaluation count per department, we need to filter evaluations by employees in that department.
    // This requires fetching evaluations, which is not done here for simplicity, but could be added.
    // For now, we'll just show employee count.
    return { empCount, evalCount: 0 }; // evalCount is 0 as we don't have evaluations here
  };

  if (loading) {
    return <div className="text-center py-8">Loading departments...</div>;
  }

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
                Created {new Date(dept.created_at).toLocaleDateString()}
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
      {modalOpen && (
        <DepartmentModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditDept(null); }}
          department={editDept}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              Are you sure you want to delete this department? This action cannot be undone.
              Departments with employees cannot be deleted. Reassign all employees first.
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
