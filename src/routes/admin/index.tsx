import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Globe2,
  Calendar,
  Phone,
  Eye,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { ApplicationDetailDialog } from "@/components/admin/application-detail-dialog";

type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard Pendaftar - Global Study Planner" },
      { name: "description", content: "Ringkasan statistik data pendaftar persiapan kuliah ke luar negeri." },
    ],
  }),
  component: AdminDashboardIndexPage,
});

function AdminDashboardIndexPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    s1Count: 0,
    s2s3Count: 0,
    intakeLessThanYear: 0,
    fullyFunded: 0,
  });
  const [recentApplications, setRecentApplications] = useState<ApplicationRow[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const all = data || [];
      const total = all.length;
      const s1Count = all.filter((a) => a.study_level?.includes("S1")).length;
      const s2s3Count = all.filter((a) => a.study_level?.includes("S2") || a.study_level?.includes("S3")).length;
      const intakeLessThanYear = all.filter((a) => a.intake_plan === "Kurang dari 1 tahun").length;
      const fullyFunded = all.filter(
        (a) => a.funding_preference && a.funding_preference.includes("Fully Funded (Beasiswa Penuh)")
      ).length;

      setStats({
        total,
        s1Count,
        s2s3Count,
        intakeLessThanYear,
        fullyFunded,
      });

      setRecentApplications(all.slice(0, 5));
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to realtime updates on applications table
    const subscription = supabase
      .channel("admin-dashboard-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const summaryCards = [
    {
      title: "Total Pendaftar",
      value: stats.total,
      description: "Jumlah seluruh peserta yang mengisi form",
      icon: Users,
      color: "from-blue-600 to-indigo-600",
      textColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      borderColor: "border-blue-200 dark:border-blue-900/50",
    },
    {
      title: "Pendaftar S1",
      value: stats.s1Count,
      description: "Program Bachelor's Degree",
      icon: GraduationCap,
      color: "from-emerald-600 to-teal-600",
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-200 dark:border-emerald-900/50",
    },
    {
      title: "Pendaftar S2 / S3",
      value: stats.s2s3Count,
      description: "Program Master's & PhD",
      icon: Award,
      color: "from-purple-600 to-violet-600",
      textColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      borderColor: "border-purple-200 dark:border-purple-900/50",
    },
    {
      title: "Rencana Intake < 1 Th",
      value: stats.intakeLessThanYear,
      description: "Persiapan mendesak / segera",
      icon: Clock,
      color: "from-amber-600 to-orange-600",
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-200 dark:border-amber-900/50",
    },
    {
      title: "Fully Funded",
      value: stats.fullyFunded,
      description: "Incar Beasiswa Penuh",
      icon: CheckCircle2,
      color: "from-teal-600 to-cyan-600",
      textColor: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/40",
      borderColor: "border-teal-200 dark:border-teal-900/50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard Pendaftar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Data Peserta Konsultasi Persiapan Kuliah ke Luar Negeri
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Supabase Realtime Sync
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 5 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={idx}
              className={`border shadow-sm hover:shadow-md transition-all ${card.borderColor} bg-white dark:bg-slate-900`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor} ${card.textColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {loading ? "..." : card.value}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Applications Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Pendaftar Terbaru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              5 peserta paling baru yang mengisi form konsultasi
            </p>
          </div>

          <Link
            to="/admin/applications"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Lihat Semua Pendaftar</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {recentApplications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
                  <span>Memuat data pendaftar...</span>
                </div>
              ) : (
                <p>Belum ada data pendaftar yang masuk.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-700 dark:text-slate-300">
                <thead className="text-xs font-semibold uppercase tracking-wider bg-slate-50 dark:bg-slate-950/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Nama Lengkap</th>
                    <th className="px-4 py-3">WhatsApp</th>
                    <th className="px-4 py-3">Jenjang</th>
                    <th className="px-4 py-3">Status Saat Ini</th>
                    <th className="px-4 py-3">Negara Tujuan</th>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {app.full_name}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/${app.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {app.whatsapp}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
                          {app.study_level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs">{app.current_status}</td>
                      <td className="px-4 py-3 text-xs font-medium">{app.destination_country}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(app.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs gap-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                          onClick={() => {
                            setSelectedApp(app);
                            setDetailOpen(true);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Detail</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <ApplicationDetailDialog
        application={selectedApp}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
