/**
 * AppLayout — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Persistent sidebar for admin, top nav for regular users
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/hooks/useI18n";
import {
  LayoutDashboard, Users, Building2, UserCheck, ClipboardList,
  LogOut, Menu, X, Sun, Moon, ChevronRight, Star, PlusCircle,
  BarChart3, Settings, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  adminOnly?: boolean;
}

const getNavItems = (t: any): NavItem[] => [
  { icon: <LayoutDashboard className="w-4 h-4" />, label: t("dashboard"), path: "/dashboard" },
  { icon: <PlusCircle className="w-4 h-4" />, label: t("newEvaluation"), path: "/evaluations/new" },
  { icon: <ClipboardList className="w-4 h-4" />, label: t("evaluations"), path: "/evaluations" },
  { icon: <UserCheck className="w-4 h-4" />, label: t("employees"), path: "/employees", adminOnly: true },
  { icon: <Building2 className="w-4 h-4" />, label: t("departments"), path: "/departments", adminOnly: true },
  { icon: <Users className="w-4 h-4" />, label: t("users"), path: "/users", adminOnly: true },
  { icon: <BarChart3 className="w-4 h-4" />, label: t("analytics"), path: "/analytics", adminOnly: true },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const NAV_ITEMS = getNavItems(t);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    setLocation("/login");
  };

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "oklch(1 0 0 / 0.06)" }}>
        <div
          className="relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg"
          style={{
            background: "linear-gradient(135deg, oklch(0.60 0.22 264 / 0.3), oklch(0.60 0.22 264 / 0.15))",
            border: "1px solid oklch(0.60 0.22 264 / 0.4)",
            color: "white",
            fontFamily: "'Sora', sans-serif",
            boxShadow: "0 0 20px oklch(0.60 0.22 264 / 0.2), inset 0 1px 0 oklch(1 0 0 / 0.1)",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            letterSpacing: "0.05em"
          }}
        >
          Arena
        </div>
        <div>
          <p className="font-bold text-sm" style={{ fontFamily: "'Sora', sans-serif", color: "white" }}>
            Arena
          </p>
          <p className="text-xs" style={{ color: "oklch(0.70 0.015 264)" }}>
            {isAdmin ? t("administrator") : t("regularUser")}
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <span style={{ color: isActive ? "oklch(0.70 0.22 264)" : "oklch(0.55 0.015 264)" }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 ml-auto" style={{ color: "oklch(0.60 0.22 264)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t space-y-2" style={{ borderColor: "oklch(1 0 0 / 0.06)" }}>
        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          className="nav-item w-full"
        >
          <Globe className="w-4 h-4" style={{ color: "oklch(0.60 0.22 264)" }} />
          <span>{language === "ar" ? "English" : "العربية"}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="nav-item w-full"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" style={{ color: "oklch(0.78 0.17 70)" }} /> : <Moon className="w-4 h-4" style={{ color: "oklch(0.60 0.22 264)" }} />}
          <span>{theme === "dark" ? t("lightMode") : t("darkMode")}</span>
        </button>

        {/* User info */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
            style={{
              background: "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))",
              color: "white",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
              {user?.username}
            </p>
            <p className="text-xs truncate" style={{ color: "oklch(0.55 0.015 264)" }}>
              {user?.role === "admin" ? t("administrator") : t("regularUser")}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.22 15)" }} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 flex-shrink-0 fixed top-0 left-0 h-full z-30"
        style={{
          background: "var(--sidebar)",
          borderRight: "1px solid oklch(1 0 0 / 0.06)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{ background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(4px)" }}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 lg:hidden transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "var(--sidebar)",
          borderRight: "1px solid oklch(1 0 0 / 0.06)",
        }}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg"
            style={{ background: "oklch(1 0 0 / 0.06)" }}
          >
            <X className="w-4 h-4" style={{ color: "var(--foreground)" }} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Mobile Top Bar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20"
          style={{
            background: "var(--sidebar)",
            borderBottom: "1px solid oklch(1 0 0 / 0.06)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg"
            style={{ background: "oklch(1 0 0 / 0.06)" }}
          >
            <Menu className="w-5 h-5" style={{ color: "var(--foreground)" }} />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663759114716/eRUNRJ3b2Sb7joLBCFhNPQ/logo-icon-V9WrUSAbBSpZxNMGjtfDme.webp"
              alt="EvalPro"
              className="w-6 h-6 object-contain"
            />
            <span className="font-bold text-sm" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
              EvalPro
            </span>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-lg" style={{ background: "oklch(1 0 0 / 0.06)" }}>
            {theme === "dark" ? <Sun className="w-4 h-4" style={{ color: "oklch(0.78 0.17 70)" }} /> : <Moon className="w-4 h-4" style={{ color: "oklch(0.60 0.22 264)" }} />}
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 xl:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
