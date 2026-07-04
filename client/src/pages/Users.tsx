/**
 * Users Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Admin only: Full user management
 */
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  apiGetUsers, apiRegisterUser, apiUpdateUser, apiDeleteUser, ApiUser, ApiRole
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, Shield, User as UserIcon, Key, Crown } from "lucide-react";

function UserModal({
  open, onClose, user, onSave
}: {
  open: boolean;
  onClose: () => void;
  user: ApiUser | null;
  onSave: (data: { username: string; password?: string; role: ApiRole }) => Promise<void>;
}) {
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<ApiRole>(user?.role || "user");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setRole(user.role);
      setPassword(""); // Clear password field when editing existing user
    } else {
      setUsername("");
      setRole("user");
      setPassword("");
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!username.trim()) { toast.error("Username is required"); return; }
    if (!user && !password.trim()) { toast.error("Password is required for new users"); return; }
    setLoading(true);
    try {
      await onSave({ username: username.trim(), password: password.trim() || undefined, role });
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            {user ? "Edit User" : "Create New User"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-sm mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Username *</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
              Password {user ? "(leave blank to keep current)" : "*"}
            </Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={user ? "New password (optional)" : "Enter password"}
            />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Role *</Label>
            <Select value={role} onValueChange={v => setRole(v as ApiRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Regular User</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
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
              {loading ? "Saving..." : (user ? "Save Changes" : "Create User")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Users() {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | ApiRole>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<ApiUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const fetchedUsers = await apiGetUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.username.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const handleSave = async (data: { username: string; password?: string; role: ApiRole }) => {
    try {
      if (editUser) {
        // Update existing user
        await apiUpdateUser(editUser.id, { username: data.username, password: data.password, role: data.role });
        toast.success("User updated successfully.");
      } else {
        // Create new user
        if (!data.password) { toast.error("Password is required for new users."); return; }
        await apiRegisterUser(data.username, data.password, data.role);
        toast.success("User created successfully.");
      }
      fetchUsers(); // Refresh the user list
      refreshUser(); // Refresh current user context in case own role changed
      setModalOpen(false);
      setEditUser(null);
    } catch (error: any) {
      console.error("Error saving user:", error);
      throw error; // Re-throw to be caught by UserModal
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) { toast.error("You cannot delete your own account"); setDeleteConfirm(null); return; }
    try {
      await apiDeleteUser(id);
      toast.success("User deleted successfully.");
      fetchUsers(); // Refresh the user list
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  const handleToggleRole = async (u: ApiUser) => {
    if (u.id === currentUser?.id) { toast.error("You cannot change your own role"); return; }
    const newRole: ApiRole = u.role === "admin" ? "user" : "admin";
    try {
      await apiUpdateUser(u.id, { role: newRole });
      toast.success(`${u.username} is now ${newRole === "admin" ? "an Administrator" : "a Regular User"}`);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error toggling user role:", error);
      toast.error("Failed to update user role.");
    }
  };

  const adminCount = users.filter(u => u.role === "admin").length;
  const userCount = users.filter(u => u.role === "user").length;

  if (loadingUsers) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            User Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {adminCount} admins · {userCount} regular users
          </p>
        </div>
        <Button
          onClick={() => { setEditUser(null); setModalOpen(true); }}
          className="gap-2 font-semibold text-white"
          style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", border: "none", boxShadow: "0 4px 12px oklch(0.60 0.22 264 / 0.3)" }}
        >
          <Plus className="w-4 h-4" /> Create User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={v => setRoleFilter(v as "all" | ApiRole)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Administrators</SelectItem>
            <SelectItem value="user">Regular Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Created</th>
              <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr
                key={u.id}
                className="transition-colors"
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{
                        background: u.role === "admin"
                          ? "linear-gradient(135deg, oklch(0.78 0.17 70), oklch(0.72 0.20 50))"
                          : "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))",
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                        {u.username}
                        {u.id === currentUser?.id && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: "oklch(0.60 0.22 264 / 0.15)", color: "oklch(0.60 0.22 264)" }}>
                            You
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit"
                    style={
                      u.role === "admin"
                        ? { background: "oklch(0.78 0.17 70 / 0.15)", color: "oklch(0.78 0.17 70)", border: "1px solid oklch(0.78 0.17 70 / 0.3)" }
                        : { background: "oklch(0.60 0.22 264 / 0.15)", color: "oklch(0.60 0.22 264)", border: "1px solid oklch(0.60 0.22 264 / 0.3)" }
                    }
                  >
                    {u.role === "admin" ? <Crown className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                    {u.role === "admin" ? "Administrator" : "Regular User"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditUser(u); setModalOpen(true); }}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ background: "oklch(0.60 0.22 264 / 0.1)" }}
                      title="Edit user"
                    >
                      <Edit2 className="w-3.5 h-3.5" style={{ color: "oklch(0.60 0.22 264)" }} />
                    </button>
                    <button
                      onClick={() => handleToggleRole(u)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ background: "oklch(0.78 0.17 70 / 0.1)" }}
                      title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                    >
                      <Shield className="w-3.5 h-3.5" style={{ color: "oklch(0.78 0.17 70)" }} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(u.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ background: "oklch(0.65 0.22 15 / 0.1)" }}
                      title="Delete user"
                    >
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.22 15)" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modalOpen && (
        <UserModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditUser(null); }}
          user={editUser}
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
              Are you sure you want to delete this user? This action cannot be undone.
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
