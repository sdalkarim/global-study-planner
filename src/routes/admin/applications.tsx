import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  Download,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  Users,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { ApplicationDetailDialog } from "@/components/admin/application-detail-dialog";
import { ApplicationEditDialog } from "@/components/admin/application-edit-dialog";
import { ApplicationDeleteDialog } from "@/components/admin/application-delete-dialog";
import {
  CURRENT_STATUS,
  FUNDING_PREFERENCE,
  INTAKE_PLAN,
  STUDY_LEVEL,
} from "@/lib/form-options";

type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];

export const Route = createFileRoute("/admin/applications")({
  head: () => ({
    meta: [
      { title: "Data Pendaftar - Global Study Planner" },
      { name: "description", content: "Kelola data peserta pendaftar konsultasi persiapan kuliah ke luar negeri." },
    ],
  }),
  component: AdminApplicationsPage,
});

function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStudyLevel, setFilterStudyLevel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterIntake, setFilterIntake] = useState("all");
  const [filterFunding, setFilterFunding] = useState("all");
  const [filterCountry, setFilterCountry] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc">("newest");

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals state
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err: any) {
      toast.error("Gagal memuat data pendaftar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    // Supabase Realtime Listener
    const channel = supabase
      .channel("applications-table-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStudyLevel, filterStatus, filterIntake, filterFunding, filterCountry, sortBy, pageSize]);

  // Filtering & Sorting Logic
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Search term (Nama, WA, Email, Sekolah)
      const matchesSearch =
        !searchTerm ||
        app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.whatsapp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.school_university.toLowerCase().includes(searchTerm.toLowerCase());

      // Study Level
      const matchesStudyLevel =
        filterStudyLevel === "all" || app.study_level === filterStudyLevel;

      // Current Status
      const matchesStatus =
        filterStatus === "all" || app.current_status === filterStatus;

      // Intake Plan
      const matchesIntake =
        filterIntake === "all" || app.intake_plan === filterIntake;

      // Funding Preference
      const matchesFunding =
        filterFunding === "all" ||
        (app.funding_preference && app.funding_preference.includes(filterFunding));

      // Country filter
      const matchesCountry =
        !filterCountry ||
        app.destination_country.toLowerCase().includes(filterCountry.toLowerCase());

      return (
        matchesSearch &&
        matchesStudyLevel &&
        matchesStatus &&
        matchesIntake &&
        matchesFunding &&
        matchesCountry
      );
    }).sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "name_asc") {
        return a.full_name.localeCompare(b.full_name);
      }
      if (sortBy === "name_desc") {
        return b.full_name.localeCompare(a.full_name);
      }
      return 0;
    });
  }, [
    applications,
    searchTerm,
    filterStudyLevel,
    filterStatus,
    filterIntake,
    filterFunding,
    filterCountry,
    sortBy,
  ]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredApplications.length / pageSize) || 1;
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStudyLevel("all");
    setFilterStatus("all");
    setFilterIntake("all");
    setFilterFunding("all");
    setFilterCountry("");
    setSortBy("newest");
    setCurrentPage(1);
    toast.info("Filter telah di-reset");
  };

  // Export to Excel / CSV
  const handleExport = (type: "xlsx" | "csv") => {
    if (filteredApplications.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    const exportData = filteredApplications.map((app, index) => ({
      No: index + 1,
      ID: app.id,
      "Nama Lengkap": app.full_name,
      WhatsApp: app.whatsapp,
      Email: app.email,
      "Program Minat": app.program_interest,
      "Jenjang Studi": app.study_level,
      "Tipe Pendaftar": app.applicant_type,
      "Status Saat Ini": app.current_status,
      "Sekolah / Universitas": app.school_university,
      Kelas: app.class || "-",
      Semester: app.semester || "-",
      "Tahun Lulus": app.graduation_year || "-",
      "Lama Bekerja": app.work_duration || "-",
      "Bidang Pekerjaan": app.work_field || "-",
      "Nama Orang Tua": app.parent_name,
      "WhatsApp Orang Tua": app.parent_whatsapp,
      "Pekerjaan Orang Tua": app.parent_occupation === "Pekerjaan Lainnya" ? app.parent_occupation_other || "Lainnya" : app.parent_occupation || "-",
      "Rencana Intake": app.intake_plan,
      "Negara Tujuan": app.destination_country,
      "Program Studi / Major": app.intended_major,
      "Preferensi Pembiayaan": app.funding_preference?.join(", ") || "-",
      "Tanggal Pengisian": new Date(app.created_at).toLocaleString("id-ID"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pendaftar");

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Data_Pendaftar_Global_Study_${dateStr}.${type}`;

    if (type === "csv") {
      XLSX.writeFile(workbook, fileName, { bookType: "csv" });
    } else {
      XLSX.writeFile(workbook, fileName, { bookType: "xlsx" });
    }

    toast.success(`Berhasil mengexport ${filteredApplications.length} data pendaftar ke ${fileName}`);
  };

  const isNewApplicant = (dateStr: string) => {
    const diffHours = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600);
    return diffHours <= 24;
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span>Data Pendaftar Konsultasi</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total {filteredApplications.length} dari {applications.length} pendaftar ditemukan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("xlsx")}
            className="border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-xs font-semibold gap-1.5"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Excel</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            className="text-xs text-slate-700 dark:text-slate-300 gap-1.5"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar Controls */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 space-y-4">
        {/* Search & Main Sorting */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama, WhatsApp, email, sekolah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div>
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Urutan: Terbaru</SelectItem>
                <SelectItem value="oldest">Urutan: Terlama</SelectItem>
                <SelectItem value="name_asc">Nama: A - Z</SelectItem>
                <SelectItem value="name_desc">Nama: Z - A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="w-full text-xs gap-1.5 text-slate-600 dark:text-slate-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filter</span>
            </Button>
          </div>
        </div>

        {/* Extended Filter Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Jenjang Studi</label>
            <Select value={filterStudyLevel} onValueChange={setFilterStudyLevel}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Semua Jenjang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenjang</SelectItem>
                {STUDY_LEVEL.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Status Pendidikan</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {CURRENT_STATUS.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Rencana Intake</label>
            <Select value={filterIntake} onValueChange={setFilterIntake}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Semua Intake" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Intake</SelectItem>
                {INTAKE_PLAN.map((it) => (
                  <SelectItem key={it} value={it}>
                    {it}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Pembiayaan</label>
            <Select value={filterFunding} onValueChange={setFilterFunding}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Semua Pembiayaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pembiayaan</SelectItem>
                {FUNDING_PREFERENCE.map((fp) => (
                  <SelectItem key={fp} value={fp}>
                    {fp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Negara Tujuan</label>
            <Input
              placeholder="Cari negara..."
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="text-xs h-8"
            />
          </div>
        </div>
      </Card>

      {/* Main Applications Table */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
            <p className="text-sm font-medium">Memuat data pendaftar dari database...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Users className="h-10 w-10 text-slate-400 mx-auto" />
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Tidak ada data pendaftar yang sesuai
            </p>
            <p className="text-xs">Coba sesuaikan kata kunci pencarian atau reset filter yang sedang aktif.</p>
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2 text-xs">
              Reset Semua Filter
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300">
              <thead className="text-[11px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-950/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-3.5 py-3 w-12 text-center">No</th>
                  <th className="px-3.5 py-3">Nama Lengkap</th>
                  <th className="px-3.5 py-3">WhatsApp</th>
                  <th className="px-3.5 py-3">Email</th>
                  <th className="px-3.5 py-3">Jenjang</th>
                  <th className="px-3.5 py-3">Status Saat Ini</th>
                  <th className="px-3.5 py-3">Sekolah / Univ</th>
                  <th className="px-3.5 py-3">Negara Tujuan</th>
                  <th className="px-3.5 py-3">Program Studi</th>
                  <th className="px-3.5 py-3">Rencana Intake</th>
                  <th className="px-3.5 py-3">Pembiayaan</th>
                  <th className="px-3.5 py-3">Tanggal Mengisi</th>
                  <th className="px-3.5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedApplications.map((app, index) => {
                  const globalIndex = (currentPage - 1) * pageSize + index + 1;
                  const isNew = isNewApplicant(app.created_at);

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-3.5 py-3 text-center font-mono text-slate-500">
                        {globalIndex}
                      </td>

                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                          <span>{app.full_name}</span>
                          {isNew && (
                            <Badge
                              variant="default"
                              className="text-[9px] px-1.5 py-0 bg-emerald-600 text-white font-bold animate-pulse"
                            >
                              NEW
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="px-3.5 py-3">
                        <a
                          href={`https://wa.me/${app.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {app.whatsapp}
                        </a>
                      </td>

                      <td className="px-3.5 py-3 max-w-[150px] truncate" title={app.email}>
                        <a
                          href={`mailto:${app.email}`}
                          className="hover:underline text-slate-700 dark:text-slate-300 inline-flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{app.email}</span>
                        </a>
                      </td>

                      <td className="px-3.5 py-3">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                        >
                          {app.study_level}
                        </Badge>
                      </td>

                      <td className="px-3.5 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {app.current_status}
                      </td>

                      <td className="px-3.5 py-3 max-w-[140px] truncate" title={app.school_university}>
                        {app.school_university}
                      </td>

                      <td className="px-3.5 py-3 font-medium text-emerald-700 dark:text-emerald-300">
                        {app.destination_country}
                      </td>

                      <td className="px-3.5 py-3 max-w-[140px] truncate" title={app.intended_major}>
                        {app.intended_major}
                      </td>

                      <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 font-medium">
                        {app.intake_plan}
                      </td>

                      <td className="px-3.5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {app.funding_preference && app.funding_preference.length > 0 ? (
                            app.funding_preference.map((f, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                              >
                                {f.split(" ")[0]}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </div>
                      </td>

                      <td className="px-3.5 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(app.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-3.5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                            title="Lihat Detail"
                            onClick={() => {
                              setSelectedApp(app);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                            title="Edit Data"
                            onClick={() => {
                              setSelectedApp(app);
                              setEditOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                            title="Hapus Data"
                            onClick={() => {
                              setSelectedApp(app);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Pagination Controls */}
        {!loading && filteredApplications.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span>Tampilkan:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => setPageSize(Number(val))}
              >
                <SelectTrigger className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>data per halaman</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 mr-2">
                Halaman {currentPage} dari {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <ApplicationDetailDialog
        application={selectedApp}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <ApplicationEditDialog
        application={selectedApp}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={fetchApplications}
      />

      <ApplicationDeleteDialog
        application={selectedApp}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={fetchApplications}
      />
    </div>
  );
}
