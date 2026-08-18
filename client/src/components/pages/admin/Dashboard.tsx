import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import type { Response } from "../../../types";
import {
  BookOpen,
  Users,
  ShoppingCart,
  DollarSign,
  Folder,
  FileText,
  GraduationCap,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Award,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LineChart as LucideLineChart } from "lucide-react";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import TopBar from "../../lazy/TopBar";

interface DashboardStatistics extends Response {
  data: {
    totals: {
      courses: number;
      students: number;
      purchases: number;
      chapters: number;
      modules: number;
      lessons: number;
      skillCategories: number;
      expertise: number;
    };
    revenue: {
      total: number;
      average: number;
    };
    purchasesByMonth: Array<{
      month: string;
      count: number;
      revenue: number;
    }>;
    chapterPriceDistribution: Array<{
      range: string;
      count: number;
    }>;
    topCourses: Array<{
      course: any;
      purchaseCount: number;
      totalRevenue: number;
    }>;
    studentsByMonth: Array<{
      month: string;
      count: number;
    }>;
    coursesByMonth: Array<{
      month: string;
      count: number;
    }>;
    recentPurchases: any[];
    studentsByGoal: Array<{
      goal: string;
      count: number;
    }>;
    studentsByStatus: Array<{
      status: string;
      count: number;
    }>;
    chapters: {
      total: number;
      free: number;
      paid: number;
      totalValue: number;
      averagePrice: number;
    };
  };
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function Dashboard() {
  useInitNavStackOnce([{ title: "Dashboard", path: "/admin/dashboard" }]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-statistics"],
    queryFn: async () => {
      const res = await api.get<DashboardStatistics>(
        API_ROUTES.STATISTICS.GET_DASHBOARD
      );
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full p-8">
        <div className="text-center py-12">
          <div className="text-destructive text-lg mb-4">
            Failed to load dashboard statistics
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = data.data;

  // Format month labels
  const formatMonth = (month: string) => {
    const [year, mon] = month.split("-");
    const date = new Date(parseInt(year), parseInt(mon) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <TopBar />
      <div className="w-full p-6 lg:p-8 space-y-8 bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Overview of your LMS platform statistics
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Courses */}
          <StatCard
            title="Total Value Streams"
            value={stats.totals.courses}
            icon={<BookOpen size={24} />}
            color="bg-blue-500"
          />

          {/* Total Students */}
          <StatCard
            title="Total Students"
            value={stats.totals.students}
            icon={<Users size={24} />}
            color="bg-green-500"
          />

          {/* Total Purchases */}
          <StatCard
            title="Total Purchases"
            value={stats.totals.purchases}
            icon={<ShoppingCart size={24} />}
            color="bg-purple-500"
          />

          {/* Total Revenue */}
          <StatCard
            title="Total Revenue"
            value={`$${stats.revenue.total.toFixed(2)}`}
            icon={<DollarSign size={24} />}
            color="bg-yellow-500"
          />

          {/* Total Modules */}
          <StatCard
            title="Expertise"
            value={stats.totals.modules}
            icon={<Folder size={24} />}
            color="bg-indigo-500"
          />

          {/* Total Chapters */}
          <StatCard
            title="Chapters"
            value={stats.totals.chapters}
            icon={<FileText size={24} />}
            color="bg-pink-500"
          />

          {/* Total Lessons */}
          <StatCard
            title="Lessons"
            value={stats.totals.lessons}
            icon={<GraduationCap size={24} />}
            color="bg-orange-500"
          />

          {/* Average Purchase */}
          <StatCard
            title="Avg Purchase"
            value={`$${stats.revenue.average.toFixed(2)}`}
            icon={<TrendingUp size={24} />}
            color="bg-teal-500"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Revenue & Purchases Over Time"
            subtitle="Last 12 months"
            icon={<LucideLineChart size={20} />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.purchasesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelStyle={{ color: "var(--foreground)" }}
                  labelFormatter={(value) => formatMonth(value)}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue ($)"
                  stroke="#0088FE"
                  fill="#0088FE"
                  fillOpacity={0.6}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="count"
                  name="Purchases"
                  stroke="#00C49F"
                  fill="#00C49F"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Student Registration - Bar Chart */}
          <ChartCard
            title="Student Registration"
            subtitle="Last 12 months"
            icon={<BarChart3 size={20} />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.studentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelStyle={{ color: "var(--foreground)" }}
                  labelFormatter={(value) => formatMonth(value)}
                />
                <Bar
                  dataKey="count"
                  name="New Students"
                  fill="#8884d8"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chapter Price Distribution - Pie Chart */}
          <ChartCard
            title="Chapter Price Distribution"
            subtitle="Free vs Paid"
            icon={<PieChart size={20} />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={stats.chapterPriceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent, payload }) =>
                    `${payload.range}: ${
                      percent !== undefined ? (percent * 100).toFixed(0) : "0"
                    }%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.chapterPriceDistribution.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelStyle={{ color: "var(--foreground)" }}
                  labelFormatter={(value) => (typeof value === 'string' && value.includes('-') ? formatMonth(value) : value)}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Students by Goal - Pie Chart */}
          <ChartCard
            title="Students by Learning Goal"
            subtitle="Distribution"
            icon={<Award size={20} />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={stats.studentsByGoal}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload, percent }) =>
                    `${payload.goal}: ${
                      percent !== undefined ? (percent * 100).toFixed(0) : "0"
                    }%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.studentsByGoal.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelStyle={{ color: "var(--foreground)" }}
                  labelFormatter={(value) => (typeof value === 'string' && value.includes('-') ? formatMonth(value) : value)}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Course Creation Over Time - Line Chart */}
          <ChartCard
            title="Value Stream Creation Timeline"
            subtitle="Last 12 months"
            icon={<Calendar size={20} />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.coursesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelStyle={{ color: "var(--foreground)" }}
                  labelFormatter={(value) => formatMonth(value)}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Value Streams Created"
                  stroke="#FF8042"
                  strokeWidth={3}
                  dot={{ fill: "#FF8042", r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top Courses - Bar Chart */}
          <ChartCard
            title="Top 5 Selling Value Streams"
            subtitle="By purchase count"
            icon={<TrendingUp size={20} />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.topCourses.map((tc) => ({
                  name: tc.course?.title || "Unknown",
                  purchases: tc.purchaseCount,
                  revenue: tc.totalRevenue,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelStyle={{ color: "var(--foreground)" }}
                  labelFormatter={(value) => (typeof value === 'string' && value.includes('-') ? formatMonth(value) : value)}
                />
                <Legend />
                <Bar
                  dataKey="purchases"
                  name="Purchases"
                  fill="#82ca9d"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chapters Stats */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Chapters Overview
                </h3>
                <p className="text-sm text-muted-foreground">
                  Free vs Paid breakdown
                </p>
              </div>
              <FileText className="text-primary" size={24} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-foreground font-medium">
                  Total Chapters
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {stats.chapters.total}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Free</div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.chapters.free}
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Paid</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.chapters.paid}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <span className="text-foreground font-medium">
                  Average Price
                </span>
                <span className="text-xl font-bold text-primary">
                  ${stats.chapters.averagePrice.toFixed(2)}
                </span>
              </div>
            </div>

          </div>

          {/* Recent Purchases */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Recent Purchases
                </h3>
                <p className="text-sm text-muted-foreground">
                  Last 10 transactions
                </p>
              </div>
              <ShoppingCart className="text-primary" size={24} />
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.recentPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {purchase.user?.name || "Unknown User"}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {purchase.chapter?.module?.expertise?.skillCategory
                        ?.course?.title || "Unknown Value Stream"}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-bold text-foreground">
                      ${purchase.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(purchase.purchaseAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg text-white`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </div>
  );
}

// Chart Card Component
function ChartCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {icon}
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}