/**
 * Dashboard Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Admin: full stats + charts | User: limited view
 */
import { useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  getStats, getEvaluations, getEmployees, getDepartments,
  EVALUATION_QUESTIONS, type Evaluation
} from "@/lib/store";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis
} from "recharts";
import {
  Users, Building2, UserCheck, ClipboardList, Clock, CheckCircle,
  XCircle, Star, TrendingUp, PlusCircle, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = {
  indigo: "oklch(0.60 0.22 264)",
  violet: "oklch(0.65 0.20 295)",
  emerald: "oklch(0.70 0.18 162)",
  amber: "oklch(0.78 0.17 70)",
  rose: "oklch(0.65 0.22 15)",
};

function StatCard({
  icon, label, value, color, sub
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}) {
  return (
    <div
      className="glass-card p-5 fade-in-up"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <p
        className="text-3xl font-bold mb-1"
        style={{
          fontFamily: "'Sora', sans-serif",
          background: `linear-gradient(135deg, ${color}, ${color}bb)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
      </p>
      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === "pending" ? "badge-pending" : status === "approved" ? "badge-approved" : "badge-rejected";
  return (
    <span className={`${cls} text-xs px-2.5 py-0.5 rounded-full font-medium`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-sm"
        style={{
          background: "oklch(0.16 0.018 264)",
          border: "1px solid oklch(1 0 0 / 0.12)",
          color: "var(--foreground)",
          backdropFilter: "blur(12px)",
        }}
      >
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const stats = useMemo(() => getStats(), []);
  const evaluations = useMemo(() => getEvaluations(), []);
  const employees = useMemo(() => getEmployees(), []);
  const departments = useMemo(() => getDepartments(), []);

  // Recent evaluations
  const recentEvals = useMemo(() =>
    [...evaluations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [evaluations]
  );

  // My evaluations (for regular users)
  const myEvals = useMemo(() =>
    evaluations.filter(e => e.userId === user?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [evaluations, user]
  );

  // Status distribution chart
  const statusData = [
    { name: "Pending", value: stats.pending, color: COLORS.amber },
    { name: "Approved", value: stats.approved, color: COLORS.emerald },
    { name: "Rejected", value: stats.rejected, color: COLORS.rose },
  ];

  // Department evaluation counts
  const deptData = useMemo(() => {
    return departments.map(d => {
      const deptEmployees = employees.filter(e => e.departmentId === d.id).map(e => e.id);
      const count = evaluations.filter(ev => deptEmployees.includes(ev.employeeId) && ev.status === "approved").length;
      const avgRating = count > 0
        ? evaluations
            .filter(ev => deptEmployees.includes(ev.employeeId) && ev.status === "approved")
            .flatMap(ev => Object.values(ev.ratings))
            .reduce((a, b) => a + b, 0) /
          evaluations
            .filter(ev => deptEmployees.includes(ev.employeeId) && ev.status === "approved")
            .flatMap(ev => Object.values(ev.ratings)).length
        : 0;
      return {
        name: d.name.length > 12 ? d.name.substring(0, 12) + "..." : d.name,
        evaluations: count,
        avgRating: Math.round(avgRating * 10) / 10,
      };
    });
  }, [departments, employees, evaluations]);

  // Monthly trend (last 6 months)
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; total: number; approved: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short" });
      months[key] = { month: key, total: 0, approved: 0 };
    }
    evaluations.forEach(ev => {
      const d = new Date(ev.createdAt);
      const key = d.toLocaleString("default", { month: "short" });
      if (months[key]) {
        months[key].total++;
        if (ev.status === "approved") months[key].approved++;
      }
    });
    return Object.values(months);
  }, [evaluations]);

  // Radar chart for average question scores
  const radarData = useMemo(() => {
    const approved = evaluations.filter(e => e.status === "approved");
    if (approved.length === 0) return [];
    return EVALUATION_QUESTIONS.map(q => {
      const vals = approved.map(e => e.ratings[q.id]).filter(Boolean);
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { subject: q.label.split(" ")[0], value: Math.round(avg * 10) / 10, fullMark: 5 };
    });
  }, [evaluations]);

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || "Unknown";
  const getDeptName = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return "-";
    return departments.find(d => d.id === emp.departmentId)?.name || "-";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            {isAdmin ? "Admin Dashboard" : "My Dashboard"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {isAdmin
              ? "Overview of all evaluations and performance metrics"
              : `Welcome back, ${user?.username}. Track your evaluation activity.`}
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

      {/* Stats Grid */}
      {isAdmin ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={stats.totalUsers} color={COLORS.indigo} />
          <StatCard icon={<UserCheck className="w-5 h-5" />} label="Employees" value={stats.totalEmployees} color={COLORS.violet} />
          <StatCard icon={<Building2 className="w-5 h-5" />} label="Departments" value={stats.totalDepartments} color={COLORS.emerald} />
          <StatCard icon={<Star className="w-5 h-5" />} label="Avg Rating" value={stats.avgRating || "—"} color={COLORS.amber} sub="Across approved evaluations" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={stats.pending} color={COLORS.amber} sub="Awaiting review" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Approved" value={stats.approved} color={COLORS.emerald} sub="Verified evaluations" />
          <StatCard icon={<XCircle className="w-5 h-5" />} label="Rejected" value={stats.rejected} color={COLORS.rose} sub="Declined evaluations" />
          <StatCard icon={<ClipboardList className="w-5 h-5" />} label="Total Evaluations" value={stats.totalEvaluations} color={COLORS.indigo} sub="All time" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <StatCard icon={<ClipboardList className="w-5 h-5" />} label="My Evaluations" value={evaluations.filter(e => e.userId === user?.id).length} color={COLORS.indigo} />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={evaluations.filter(e => e.userId === user?.id && e.status === "pending").length} color={COLORS.amber} />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Approved" value={evaluations.filter(e => e.userId === user?.id && e.status === "approved").length} color={COLORS.emerald} />
          <StatCard icon={<UserCheck className="w-5 h-5" />} label="Employees" value={employees.length} color={COLORS.violet} sub="Available to evaluate" />
        </div>
      )}

      {/* Charts Row (admin only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Status Pie Chart */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
              Evaluation Status
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend */}
          <div
            className="lg:col-span-2 rounded-2xl p-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
              Evaluation Trend (Last 6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(0.55 0.015 264)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0.015 264)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="total" stroke={COLORS.indigo} strokeWidth={2} dot={{ fill: COLORS.indigo, r: 3 }} name="Total" />
                <Line type="monotone" dataKey="approved" stroke={COLORS.emerald} strokeWidth={2} dot={{ fill: COLORS.emerald, r: 3 }} name="Approved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Second Charts Row (admin only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Department Bar Chart */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
              Evaluations by Department
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "oklch(0.55 0.015 264)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0.015 264)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="evaluations" fill={COLORS.indigo} radius={[4, 4, 0, 0]} name="Evaluations" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
              Average Scores by Category
            </h3>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="oklch(1 0 0 / 0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "oklch(0.55 0.015 264)" }} />
                  <Radar name="Avg Score" dataKey="value" stroke={COLORS.indigo} fill={COLORS.indigo} fillOpacity={0.2} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center" style={{ color: "var(--muted-foreground)" }}>
                <p className="text-sm">No approved evaluations yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Evaluations Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold text-sm" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            {isAdmin ? "Recent Evaluations" : "My Recent Evaluations"}
          </h3>
          <Link href="/evaluations">
            <button className="flex items-center gap-1 text-xs font-medium transition-colors" style={{ color: "oklch(0.60 0.22 264)" }}>
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Employee", "Department", "Avg Rating", "Status", "Date"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(isAdmin ? recentEvals : myEvals).map((ev, i) => {
                const avgRating = Object.values(ev.ratings).reduce((a, b) => a + b, 0) / Object.values(ev.ratings).length;
                return (
                  <tr
                    key={ev.id}
                    className="transition-colors"
                    style={{ borderBottom: i < (isAdmin ? recentEvals : myEvals).length - 1 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {getEmployeeName(ev.employeeId)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {getDeptName(ev.employeeId)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" style={{ color: COLORS.amber }} />
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
                  </tr>
                );
              })}
              {(isAdmin ? recentEvals : myEvals).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                    No evaluations yet. <Link href="/evaluations/new"><span style={{ color: "oklch(0.60 0.22 264)" }} className="cursor-pointer">Create the first one.</span></Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
