/**
 * Analytics Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Admin only: Detailed analytics and performance insights
 */
import { useMemo } from "react";
import {
  getEvaluations, getEmployees, getDepartments, getEmployeeStats,
  EVALUATION_QUESTIONS
} from "@/lib/store";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, ScatterChart, Scatter
} from "recharts";
import { TrendingUp, Award, Star, BarChart2 } from "lucide-react";

const COLORS = ["oklch(0.60 0.22 264)", "oklch(0.65 0.20 295)", "oklch(0.70 0.18 162)", "oklch(0.78 0.17 70)", "oklch(0.65 0.22 15)"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-sm" style={{ background: "oklch(0.16 0.018 264)", border: "1px solid oklch(1 0 0 / 0.12)", color: "var(--foreground)" }}>
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const evaluations = useMemo(() => getEvaluations(), []);
  const employees = useMemo(() => getEmployees(), []);
  const departments = useMemo(() => getDepartments(), []);

  const approvedEvals = evaluations.filter(e => e.status === "approved");

  // Top performers
  const topPerformers = useMemo(() => {
    return employees
      .map(emp => {
        const stats = getEmployeeStats(emp.id);
        const dept = departments.find(d => d.id === emp.departmentId);
        return { ...emp, ...stats, deptName: dept?.name || "—" };
      })
      .filter(e => e.totalEvaluations > 0)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10);
  }, [employees, departments]);

  // Question averages
  const questionData = useMemo(() => {
    return EVALUATION_QUESTIONS.map(q => {
      const vals = approvedEvals.map(e => e.ratings[q.id]).filter(Boolean);
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { name: q.label, avg: Math.round(avg * 100) / 100, shortName: q.label.split(" ")[0] };
    }).sort((a, b) => b.avg - a.avg);
  }, [approvedEvals]);

  // Department performance
  const deptPerformance = useMemo(() => {
    return departments.map(d => {
      const empIds = employees.filter(e => e.departmentId === d.id).map(e => e.id);
      const deptEvals = approvedEvals.filter(e => empIds.includes(e.employeeId));
      const allRatings = deptEvals.flatMap(e => Object.values(e.ratings));
      const avg = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
      return {
        name: d.name.length > 15 ? d.name.substring(0, 15) + "..." : d.name,
        avgRating: Math.round(avg * 100) / 100,
        evaluations: deptEvals.length,
        employees: empIds.length,
      };
    });
  }, [departments, employees, approvedEvals]);

  // Rating distribution overall
  const overallDistribution = useMemo(() => {
    const dist: Record<number, number> = {1:0,2:0,3:0,4:0,5:0};
    approvedEvals.forEach(e => {
      Object.values(e.ratings).forEach(r => { dist[r] = (dist[r] || 0) + 1; });
    });
    return [
      { name: "1 - Very Poor", value: dist[1], color: "oklch(0.65 0.22 15)" },
      { name: "2 - Poor", value: dist[2], color: "oklch(0.72 0.20 40)" },
      { name: "3 - Average", value: dist[3], color: "oklch(0.78 0.17 70)" },
      { name: "4 - Good", value: dist[4], color: "oklch(0.65 0.20 150)" },
      { name: "5 - Excellent", value: dist[5], color: "oklch(0.70 0.18 162)" },
    ];
  }, [approvedEvals]);

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
        {title}
      </h3>
      {children}
    </div>
  );

  if (approvedEvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ color: "var(--muted-foreground)" }}>
        <BarChart2 className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>No Data Yet</h2>
        <p className="text-sm">Approve some evaluations to see analytics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "var(--foreground)" }}>
          Analytics & Insights
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Based on {approvedEvals.length} approved evaluation{approvedEvals.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <ChartCard title="Top Performers">
          <div className="space-y-2">
            {topPerformers.slice(0, 5).map((emp, i) => (
              <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "oklch(1 0 0 / 0.03)" }}>
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: i === 0 ? "oklch(0.78 0.17 70)" : i === 1 ? "oklch(0.65 0.015 264)" : i === 2 ? "oklch(0.72 0.20 40)" : "oklch(0.45 0.015 264)", fontFamily: "'Sora', sans-serif" }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{emp.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{emp.position} · {emp.deptName}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Star className="w-3.5 h-3.5" style={{ color: "oklch(0.78 0.17 70)" }} />
                  <span className="text-sm font-bold font-mono" style={{ color: "var(--foreground)" }}>{emp.avgRating}</span>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>({emp.totalEvaluations})</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Question Averages */}
        <ChartCard title="Average Score by Criterion">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={questionData} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" horizontal={false} />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10, fill: "oklch(0.55 0.015 264)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="shortName" tick={{ fontSize: 10, fill: "oklch(0.55 0.015 264)" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg" name="Avg Score" radius={[0, 4, 4, 0]}>
                {questionData.map((_, i) => (
                  <Cell key={i} fill={`oklch(${0.55 + (questionData[i].avg / 5) * 0.2} 0.22 ${264 - (questionData[i].avg / 5) * 100})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Rating Distribution Pie */}
        <ChartCard title="Overall Rating Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={overallDistribution} cx="50%" cy="45%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                {overallDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Department Performance */}
        <ChartCard title="Department Performance Comparison">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptPerformance} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "oklch(0.55 0.015 264)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "oklch(0.55 0.015 264)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgRating" name="Avg Rating" radius={[4, 4, 0, 0]}>
                {deptPerformance.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Employees vs Evaluations scatter */}
        <ChartCard title="Employee Evaluation Volume">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptPerformance} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "oklch(0.55 0.015 264)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.55 0.015 264)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="employees" name="Employees" fill="oklch(0.60 0.22 264)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="evaluations" name="Evaluations" fill="oklch(0.70 0.18 162)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
