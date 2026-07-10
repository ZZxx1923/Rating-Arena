import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Shield, User, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers, updateUserRole, deleteUser } from "@/lib/supabaseAuth";

interface User {
  id: string;
  email: string;
  role: "admin" | "user";
  created_at?: string;
}

export default function Users() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const result = await getAllUsers();
      setUsers(result.users as User[]);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: "admin" | "user") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await updateUserRole(userId, newRole);
      await loadUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("حدث خطأ أثناء تحديث الدور");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      await deleteUser(userId);
      await loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("حدث خطأ أثناء حذف المستخدم");
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8">
        <Card className="backdrop-blur-xl bg-white/80 border-white/30 p-8 text-center">
          <p className="text-gray-600 text-lg">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <p className="text-gray-600 mt-2">إدارة المستخدمين وصلاحياتهم</p>
      </div>

      <Card className="backdrop-blur-xl bg-white/80 border-white/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          مسؤول
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 mr-1" />
                          مستخدم
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString("ar-SA") : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {user.role === "admin" ? "إزالة الصلاحيات" : "منح الصلاحيات"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
