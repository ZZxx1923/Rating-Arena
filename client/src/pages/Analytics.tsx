/**
 * Analytics Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Admin only: Detailed analytics and performance insights (No charts)
 */
import { useState, useEffect, useMemo } from "react";
import { apiGetEvaluations, apiGetEmployees, apiGetDepartments, apiGetAnalytics, ApiEvaluation, ApiEmployee, ApiDepartment } from "@/lib/api";
import { EVALUATION_QUESTIONS } from "@/lib/store"; // Keep constants
import { TrendingUp, Award, Star, BarChart2 } from "lucide-react";
import { toast } from "sonner";

const COLORS = {
  indigo: "oklch(0.60 0.22 264)",
  violet: "oklch(0.65 0.20 295)",
  emerald: "oklch(0.70 0.18 162)",
  amber: "oklch(0.78 0.17 70)",
  rose: "oklch(0.65 0.22 15)",
};

export default function Analytics() {
  const [evaluations, setEvaluations] = useState<ApiEvaluation[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedEvaluations, fetchedEmployees, fetchedDepartments, fetchedAnalytics] = await Promise.all([
          apiGetEvaluations(),
          apiGetEmployees(),
          apiGetDepartments(),
          apiGetAnalytics(),
        ]);
        setEvaluations(fetchedEvaluations);
        setEmployees(fetchedEmployees);
        setDepartments(fetchedDepartments);
        setAnalytics(fetchedAnalytics);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
        toast.error("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const approvedEvals = useMemo(() => evaluations.filter(e => e.status === "approved"), [evaluations]);

  // Helper to get employee stats (moved from store)
  const getEmployeeStats = useCallback((employeeId: string) => {
    const employeeEvaluations = approvedEvals.filter(ev => ev.employee_id === employeeId);
    const totalEvaluations = employeeEvaluations.length;
    let avgRating = 0;
    if (totalEvaluations > 0) {
      const allRatings = employeeEvaluations.flatMap(ev => Object.values(ev.ratings));
      avgRating = allRatings.reduce((sum, score) => sum + score, 0) / allRatings.length;
    }
    return { totalEvaluations, avgRating };
  }, [approvedEvals]);

  // Top performers
  const topPerformers = useMemo(() => {
    return employees
      .map(emp => {
        const stats = getEmployeeStats(emp.id);
        const dept = departments.find(d => d.id === emp.department_id);
        return { ...emp, ...stats, deptName: dept?.name || "—" };
      })
      .filter(e => e.totalEvaluations > 0)
      .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
      .slice(0, 10);
  }, [employees, departments, getEmployeeStats]);

  // Department performance
  const deptPerformance = useMemo(() => {
    return departments.map(dept => {
      const deptEmps = employees.filter(e => e.department_id === dept.id);
      const deptEvals = approvedEvals.filter(ev => deptEmps.some(e => e.id === ev.employee_id));
      const avgRating = deptEvals.length > 0
        ? deptEvals.flatMap(ev => Object.values(ev.ratings)).reduce((a, b) => a + b, 0) /
          deptEvals.flatMap(ev => Object.values(ev.ratings)).length
        : 0;
      return {
        name: dept.name,
        employees: deptEmps.length,
        evaluations: deptEvals.length,
        avgRating: Math.round(avgRating * 10) / 10,
      };
    }).sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
  }, [departments, employees, approvedEvals]);

  // Question insights
  const questionInsights = useMemo(() => {
    return EVALUATION_QUESTIONS.map(q => {
      const scores = approvedEvals
        .map(ev => ev.ratings[q.id])
        .filter(score => score !== undefined && score !== null);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return {
        question: q.label,
        avgScore: Math.round(avg * 10) / 10,
        totalResponses: scores.length,
      };
    }).sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));
  }, [approvedEvals]);

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>; // Simple loading state
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
          Analytics & Insights
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Detailed performance metrics and evaluation insights
        </p>
      </div>

      {/* Top Performers */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <Award className="w-4 h-4" style={{ color: COLORS.amber }} />
          <h3 className="font-semibold text-sm" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            Top Performers
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Rank", "Employee", "Department", "Avg Rating", "Evaluations"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((emp, idx) => (
                <tr
                  key={emp.id}
                  style={{ borderBottom: idx < topPerformers.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold" style={{ color: COLORS.amber }}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {emp.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {emp.deptName}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" style={{ color: COLORS.amber }} />
                      <span className="text-sm font-mono font-semibold" style={{ color: "var(--foreground)" }}>
                        {(emp.avgRating || 0).toFixed(1)}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-mono" style={{ color: "var(--foreground)" }}>
                      {emp.totalEvaluations}
                    </span>
                  </td>
                </tr>
              ))}
              {topPerformers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                    No evaluation data available yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Performance */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <BarChart2 className="w-4 h-4" style={{ color: COLORS.indigo }} />
          <h3 className="font-semibold text-sm" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            Department Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Department", "Employees", "Evaluations", "Avg Rating"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deptPerformance.map((dept, idx) => (
                <tr
                  key={dept.name}
                  style={{ borderBottom: idx < deptPerformance.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {dept.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {dept.employees}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-mono" style={{ color: "var(--foreground)" }}>
                      {dept.evaluations}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" style={{ color: COLORS.emerald }} />
                      <span className="text-sm font-mono font-semibold" style={{ color: "var(--foreground)" }}>
                        {dept.avgRating.toFixed(1)}/5
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {deptPerformance.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                    No department data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question Insights */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <TrendingUp className="w-4 h-4" style={{ color: COLORS.violet }} />
          <h3 className="font-semibold text-sm" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
            Question Insights
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Question", "Avg Score", "Responses"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {questionInsights.map((q, idx) => (
                <tr
                  key={q.question}
                  style={{ borderBottom: idx < questionInsights.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {q.question}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" style={{ color: COLORS.amber }} />
                      <span className="text-sm font-mono font-semibold" style={{ color: "var(--foreground)" }}>
                        {q.avgScore.toFixed(1)}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-mono" style={{ color: "var(--muted-foreground)" }}>
                      {q.totalResponses}
                    </span>
                  </td>
                </tr>
              ))}
              {questionInsights.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                    No question data available
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
