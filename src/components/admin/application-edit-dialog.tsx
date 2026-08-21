import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import {
  APPLICANT_TYPE,
  CLASS_OPTIONS,
  CURRENT_STATUS,
  FUNDING_PREFERENCE,
  GRADUATION_YEARS,
  INTAKE_PLAN,
  LAST_WORK_DURATION,
  PARENT_OCCUPATION,
  PROGRAM_INTEREST,
  SEMESTER_OPTIONS,
  STUDY_LEVEL,
  WORK_DURATION,
} from "@/lib/form-options";

type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];

interface ApplicationEditDialogProps {
  application: ApplicationRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ApplicationEditDialog({
  application,
  open,
  onOpenChange,
  onSuccess,
}: ApplicationEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ApplicationRow>>({});

  useEffect(() => {
    if (application) {
      setFormData({ ...application });
    }
  }, [application]);

  if (!application) return null;

  const handleChange = (field: keyof ApplicationRow, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFundingToggle = (item: string) => {
    const current = formData.funding_preference || [];
    const exists = current.includes(item);
    const updated = exists ? current.filter((i) => i !== item) : [...current, item];
    handleChange("funding_preference", updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application?.id) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("applications")
        .update({
          full_name: formData.full_name,
          whatsapp: formData.whatsapp,
          email: formData.email,
          program_interest: formData.program_interest,
          study_level: formData.study_level,
          applicant_type: formData.applicant_type,
          current_status: formData.current_status,
          school_university: formData.school_university,
          class: formData.class || null,
          semester: formData.semester || null,
          graduation_year: formData.graduation_year ? Number(formData.graduation_year) : null,
          work_duration: formData.work_duration || null,
          last_work_duration: formData.last_work_duration || null,
          work_field: formData.work_field || null,
          parent_name: formData.parent_name,
          parent_whatsapp: formData.parent_whatsapp,
          parent_occupation: formData.parent_occupation || null,
          parent_occupation_other: formData.parent_occupation_other || null,
          intake_plan: formData.intake_plan,
          destination_country: formData.destination_country,
          intended_major: formData.intended_major,
          funding_preference: formData.funding_preference || [],
        })
        .eq("id", application.id);

      if (error) throw error;

      toast.success("Data peserta berhasil diperbarui!");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error("Gagal memperbarui data: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Edit Data Peserta
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
              Ubah informasi pendaftar: <span className="font-semibold">{application.full_name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* SECTION 1: DATA PESERTA */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b pb-1">
                Data Peserta
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nama Lengkap *</Label>
                  <Input
                    value={formData.full_name || ""}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nomor WhatsApp *</Label>
                  <Input
                    value={formData.whatsapp || ""}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: MINAT STUDI */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b pb-1">
                Minat Studi
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Program Minat *</Label>
                  <Select
                    value={formData.program_interest || ""}
                    onValueChange={(val) => handleChange("program_interest", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Program" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAM_INTEREST.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Jenjang Studi *</Label>
                  <Select
                    value={formData.study_level || ""}
                    onValueChange={(val) => handleChange("study_level", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDY_LEVEL.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Mendaftar Sebagai *</Label>
                  <Select
                    value={formData.applicant_type || ""}
                    onValueChange={(val) => handleChange("applicant_type", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Pendaftar" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICANT_TYPE.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SECTION 3: PENDIDIKAN */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b pb-1">
                Pendidikan & Pekerjaan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Status Saat Ini *</Label>
                  <Select
                    value={formData.current_status || ""}
                    onValueChange={(val) => handleChange("current_status", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENT_STATUS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Sekolah / Universitas *</Label>
                  <Input
                    value={formData.school_university || ""}
                    onChange={(e) => handleChange("school_university", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Kelas</Label>
                  <Select
                    value={formData.class || undefined}
                    onValueChange={(val) => handleChange("class", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kelas (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Semester</Label>
                  <Select
                    value={formData.semester || undefined}
                    onValueChange={(val) => handleChange("semester", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Semester (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTER_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Tahun Lulus</Label>
                  <Select
                    value={formData.graduation_year?.toString() || undefined}
                    onValueChange={(val) => handleChange("graduation_year", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Tahun (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADUATION_YEARS.map((yr) => (
                        <SelectItem key={yr} value={yr.toString()}>
                          {yr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Lama Bekerja</Label>
                  <Select
                    value={formData.work_duration || undefined}
                    onValueChange={(val) => handleChange("work_duration", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Lama Bekerja" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_DURATION.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SECTION 4: DATA ORANG TUA */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b pb-1">
                Data Orang Tua / Wali
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nama Orang Tua *</Label>
                  <Input
                    value={formData.parent_name || ""}
                    onChange={(e) => handleChange("parent_name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">WhatsApp Orang Tua *</Label>
                  <Input
                    value={formData.parent_whatsapp || ""}
                    onChange={(e) => handleChange("parent_whatsapp", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Pekerjaan Orang Tua</Label>
                  <Select
                    value={formData.parent_occupation || undefined}
                    onValueChange={(val) => handleChange("parent_occupation", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Pekerjaan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARENT_OCCUPATION.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SECTION 5: RENCANA STUDI */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b pb-1">
                Rencana Studi Ke Luar Negeri
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Rencana Intake *</Label>
                  <Select
                    value={formData.intake_plan || ""}
                    onValueChange={(val) => handleChange("intake_plan", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Intake" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTAKE_PLAN.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Negara Tujuan *</Label>
                  <Input
                    value={formData.destination_country || ""}
                    onChange={(e) => handleChange("destination_country", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Program Studi / Major *</Label>
                  <Input
                    value={formData.intended_major || ""}
                    onChange={(e) => handleChange("intended_major", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Preferensi Pembiayaan</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {FUNDING_PREFERENCE.map((funding) => {
                    const checked = (formData.funding_preference || []).includes(funding);
                    return (
                      <label
                        key={funding}
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => handleFundingToggle(funding)}
                        />
                        <span>{funding}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Simpan Perubahan</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
