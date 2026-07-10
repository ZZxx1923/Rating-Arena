import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getEmployees, addEmployee, updateEmployee, deleteEmployee, getDepartments } from "@/lib/supabaseOperations";

interface Employee {
  id: string;
  name: string;
  position: string;
  department_id: string;
  email?: string;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
}

export default function Employees() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    department_id: "",
    email: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [empResult, deptResult] = await Promise.all([
        getEmployees(),
        getDepartments(),
      ]);
      setEmployees(empResult.employees);
      setDepartments(deptResult.departments);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.position || !formData.department_id) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      if (editingId) {
        await updateEmployee(editingId, {
          name: formData.name,
          position: formData.position,
          department_id: formData.department_id,
          email: formData.email || undefined,
        });
      } else {
        await addEmployee({
          name: formData.name,
          position: formData.position,
          department_id: formData.department_id,
          email: formData.email || undefined,
        });
      }
      setIsOpen(false);
      setFormData({ name: "", position: "", department_id: "", email: "" });
      setEditingId(null);
      await loadData();
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("حدث خطأ أثناء حفظ الموظف");
    }
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      name: employee.name,
      position: employee.position,
      department_id: employee.department_id,
      email: employee.email || "",
    });
    setEditingId(employee.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;
    try {
      await deleteEmployee(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("حدث خطأ أثناء حذف الموظف");
    }
  };

  const getDepartmentName = (id: string) => {
    return departments.find(d => d.id === id)?.name || "غير محدد";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">الموظفون</h1>
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: "", position: "", department_id: "", email: "" });
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة موظف
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "تعديل الموظف" : "إضافة موظف جديد"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسم الموظف"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المنصب</label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="أدخل المنصب"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">اختر القسم</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="البريد الإلكتروني (اختياري)"
                  />
                </div>
                <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
                  حفظ
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="backdrop-blur-xl bg-white/80 border-white/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>المنصب</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                {isAdmin && <TableHead>الإجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{getDepartmentName(employee.department_id)}</TableCell>
                  <TableCell>{employee.email || "—"}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(employee)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
