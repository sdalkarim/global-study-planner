import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  Building2,
  Calendar,
  Globe2,
  BookOpen,
  DollarSign,
  Clock,
  ShieldCheck,
  ExternalLink,
  Users,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];

interface ApplicationDetailDialogProps {
  application: ApplicationRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationDetailDialog({
  application,
  open,
  onOpenChange,
}: ApplicationDetailDialogProps) {
  if (!application) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateStr;
    }
  };

  const getWaLink = (waNumber: string) => {
    const cleanNumber = waNumber.replace(/\D/g, "");
    const formatted = cleanNumber.startsWith("0") ? "62" + cleanNumber.slice(1) : cleanNumber;
    return `https://wa.me/${formatted}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
        <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{application.full_name}</span>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium">
                  {application.study_level}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                ID Pendaftaran: <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{application.id}</span>
              </DialogDescription>
            </div>
            <a
              href={getWaLink(application.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Chat WhatsApp</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* SECTION 1: DATA PESERTA */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <User className="h-4 w-4" />
              <span>Data Peserta</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 text-sm">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Nama Lengkap</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{application.full_name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Nomor WhatsApp</span>
                <a
                  href={getWaLink(application.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  {application.whatsapp}
                </a>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Email Aktif</span>
                <a
                  href={`mailto:${application.email}`}
                  className="font-medium text-slate-800 dark:text-slate-200 hover:underline inline-flex items-center gap-1"
                >
                  <Mail className="h-3 w-3 text-slate-400" />
                  {application.email}
                </a>
              </div>
            </div>
          </div>

          {/* SECTION 2: MINAT STUDI */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <GraduationCap className="h-4 w-4" />
              <span>Minat Studi & Profil</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 text-sm">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Program Minat</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{application.program_interest}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Jenjang Dituju</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{application.study_level}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Mendaftar Sebagai</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{application.applicant_type}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: STATUS PENDIDIKAN */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <Building2 className="h-4 w-4" />
              <span>Status Pendidikan & Pekerjaan</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 text-sm">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Status Saat Ini</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{application.current_status}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Sekolah / Universitas</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{application.school_university}</span>
              </div>
              {application.class && (
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Kelas</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{application.class}</span>
                </div>
              )}
              {application.semester && (
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Semester</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{application.semester}</span>
                </div>
              )}
              {application.graduation_year && (
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Tahun Lulus</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{application.graduation_year}</span>
                </div>
              )}
              {application.work_duration && (
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Lama Bekerja</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{application.work_duration}</span>
                </div>
              )}
              {application.last_work_duration && (
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Masa Pekerjaan Terakhir</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{application.last_work_duration}</span>
                </div>
              )}
              {application.work_field && (
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Bidang Pekerjaan</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{application.work_field}</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: DATA ORANG TUA */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <Users className="h-4 w-4" />
              <span>Data Orang Tua / Wali</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 text-sm">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Nama Orang Tua/Wali</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{application.parent_name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">WhatsApp Orang Tua/Wali</span>
                <a
                  href={getWaLink(application.parent_whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  {application.parent_whatsapp}
                </a>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Pekerjaan Orang Tua</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {application.parent_occupation === "Pekerjaan Lainnya"
                    ? `Lainnya (${application.parent_occupation_other || "-"})`
                    : application.parent_occupation || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 5: RENCANA STUDI KE LUAR NEGERI */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <Globe2 className="h-4 w-4" />
              <span>Rencana Studi Ke Luar Negeri</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 text-sm">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Rencana Intake / Mulai</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{application.intake_plan}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Negara Tujuan</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{application.destination_country}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Program Studi / Major</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{application.intended_major}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Rencana Pembiayaan</span>
                <div className="flex flex-wrap gap-1.5">
                  {application.funding_preference && application.funding_preference.length > 0 ? (
                    application.funding_preference.map((funding, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      >
                        {funding}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs">Belum dipilih</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: INFORMASI SISTEM */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <Clock className="h-4 w-4" />
              <span>Informasi Sistem</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 text-sm">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Waktu Mengisi</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(application.created_at)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Waktu Diperbarui</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(application.updated_at)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Status Persetujuan</span>
                {application.consent ? (
                  <Badge variant="outline" className="text-xs bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center gap-1 w-fit">
                    <ShieldCheck className="h-3 w-3" />
                    Menyetujui
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200">
                    Tidak Menyetujui
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
