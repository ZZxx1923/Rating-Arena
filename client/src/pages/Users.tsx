/**
 * Users Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Admin only: Full user management
 */
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUsers, addUser, updateUser, deleteUser, type User, type Role
} from "@/lib/store";
import * as api from "@/lib/api";
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
  user: User | null;
  onSave: (data: { username: string; password: string; role: Role }) => void;
}) {
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(user?.role || "user");

  const handleSave = () => {
    if (!username.trim()) { toast.error("Username is required"); return; }
    if (!user && !password.trim()) { toast.error("Password is required for new users"); return; }
    onSave({ username: username.trim(), password: password || user?.password || "", role });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ background: "oklch(0.16 0.018 264)", border: "1px solid oklch(1 0 0 / 0.12)" }}>
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
            <Select value={role} onValueChange={v => setRole(v as Role)}>
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
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleSave}
              className="flex-1 text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))", border: "none" }}
            >
              {user ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Users() {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState(() => getUsers());
  const [apiUsers, setApiUsers] = useState<api.ApiUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load users from external API on mount
  useEffect(() => {
    const loadApiUsers = async () => {
      setLoading(true);
      try {
        const externalUsers = await api.apiGetUsers();
        setApiUsers(externalUsers);
      } catch (error) {
        console.error("Failed to load API users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadApiUsers();
  }, []);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.username.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const handleSave = async (data: { username: string; password: string; role: Role }) => {
    // Check username uniqueness
    const existing = users.find(u => u.username === data.username && u.id !== editUser?.id);
    if (existing) { toast.error("Username already taken"); return; }

    try {
      if (editUser) {
        const updates: Partial<User> = { username: data.username, role: data.role };
        if (data.password !== editUser.password) updates.password = data.password;
        updateUser(editUser.id, updates);
        
        // Update in API if exists
        const apiUser = apiUsers.find(u => u.username === editUser.username);
        if (apiUser) {
          await api.apiUpdateUser(apiUser.id, { role: data.role });
          const updated = await api.apiGetUsers();
          setApiUsers(updated);
        }
        toast.success("User updated (local + API)");
      } else {
        addUser(data);
        // Also add to API
        await api.apiCreateUser(data.username, data.password, data.role);
        const updated = await api.apiGetUsers();
        setApiUsers(updated);
        toast.success("User created (local + API)");
      }
      setUsers(getUsers());
      refreshUser();
      setModalOpen(false);
      setEditUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to sync with API");
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) { toast.error("You cannot delete your own account"); setDeleteConfirm(null); return; }
    try {
      const userToDelete = users.find(u => u.id === id);
      deleteUser(id);
      
      // Delete from API if exists
      const apiUser = apiUsers.find(u => u.username === userToDelete?.username);
      if (apiUser) {
        await api.apiDeleteUser(apiUser.id);
        const updated = await api.apiGetUsers();
        setApiUsers(updated);
      }
      
      setUsers(getUsers());
      setDeleteConfirm(null);
      toast.success("User deleted (local + API)");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete from API");
    }
  };

  const handleToggleRole = (u: User) => {
    if (u.id === currentUser?.id) { toast.error("You cannot change your own role"); return; }
    const newRole: Role = u.role === "admin" ? "user" : "admin";
    updateUser(u.id, { role: newRole });
    setUsers(getUsers());
    refreshUser();
    toast.success(`${u.username} is now ${newRole === "admin" ? "an Administrator" : "a Regular User"}`);
  };

  const adminCount = users.filter(u => u.role === "admin").length;
  const userCount = users.filter(u => u.role === "user").length;

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
        <Select value={roleFilter} onValueChange={v => setRoleFilter(v as any)}>
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
              {["User", "Role", "Created", "Actions"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                  {h}
                </th>
              ))}
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
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "oklch(0 0 0 / 0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "oklch(0.16 0.018 264)", border: "1px solid oklch(1 0 0 / 0.12)" }}>
            <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>Delete User?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
              This will permanently delete the user account. Their evaluations will remain in the system.
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
