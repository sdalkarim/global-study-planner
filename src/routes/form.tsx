import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Send,
  ShieldCheck,
  Building2,
  User,
  Users,
  Globe2,
  BookOpen,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
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
  needsClass,
  needsGraduationYear,
  needsSemester,
  needsWorkInfo,
} from "@/lib/form-options";

export const Route = createFileRoute("/form")({
  head: () => ({
    meta: [
      { title: "Form Konsultasi Persiapan Kuliah ke Luar Negeri" },
      {
        name: "description",
        content:
          "Isi form konsultasi untuk mendapatkan arahan dan rekomendasi persiapan kuliah ke luar negeri sesuai profil dan rencana studi Anda.",
      },
      { property: "og:title", content: "Form Konsultasi Persiapan Kuliah ke Luar Negeri" },
      {
        property: "og:description",
        content:
          "Pemetaan profil, negara tujuan, jurusan, dan rencana pembiayaan studi ke luar negeri.",
      },
    ],
  }),
  component: FormPage,
});

type FormState = {
  full_name: string;
  whatsapp: string;
  email: string;
  program_interest: string;
  study_level: string;
  applicant_type: string;
  current_status: string;
  school_university: string;
  class: string;
  semester: string;
  graduation_year: string;
  work_duration: string;
  last_work_duration: string;
  work_field: string;
  parent_name: string;
  parent_whatsapp: string;
  parent_occupation: string;
  parent_occupation_other: string;
  intake_plan: string;
  destination_country: string;
  intended_major: string;
  funding_preference: string[];
  consent: boolean;
};

const initialState: FormState = {
  full_name: "",
  whatsapp: "",
  email: "",
  program_interest: "",
  study_level: "",
  applicant_type: "",
  current_status: "",
  school_university: "",
  class: "",
  semester: "",
  graduation_year: "",
  work_duration: "",
  last_work_duration: "",
  work_field: "",
  parent_name: "",
  parent_whatsapp: "",
  parent_occupation: "",
  parent_occupation_other: "",
  intake_plan: "",
  destination_country: "",
  intended_major: "",
  funding_preference: [],
  consent: false,
};

const STEPS = [
  { id: 1, title: "Data Peserta", subtitle: "Informasi kontak Anda", icon: User },
  { id: 2, title: "Minat Studi", subtitle: "Program & jenjang yang dituju", icon: GraduationCap },
  { id: 3, title: "Status Pendidikan", subtitle: "Status pendidikan & pekerjaan saat ini", icon: Building2 },
  { id: 4, title: "Orang Tua / Wali", subtitle: "Data pendamping", icon: Users },
  { id: 5, title: "Data Pendidikan", subtitle: "Institusi & tingkat pendidikan", icon: BookOpen },
  { id: 6, title: "Rencana Studi", subtitle: "Negara, jurusan & pembiayaan", icon: Globe2 },
  { id: 7, title: "Konfirmasi", subtitle: "Pernyataan persetujuan & kirim", icon: ShieldCheck },
];

type Errors = Partial<Record<keyof FormState, string>>;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}
function isPhone(value: string) {
  return /^[0-9+()\s-]{8,20}$/.test(value);
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-destructive">{message}</p>;
}

function Field({
  label,
  error,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="block text-xs sm:text-sm font-semibold text-foreground">
        {label}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function FormPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const progress = useMemo(
    () => Math.round(((step + 1) / STEPS.length) * 100),
    [step]
  );

  function validateStep(index: number): boolean {
    const e: Errors = {};
    if (index === 0) {
      if (data.whatsapp.trim() && !isPhone(data.whatsapp)) {
        e.whatsapp = "Format nomor WhatsApp tidak valid.";
      }
      if (data.email.trim() && !isEmail(data.email)) {
        e.email = "Format email tidak valid.";
      }
    }
    if (index === 3) {
      if (data.parent_whatsapp.trim() && !isPhone(data.parent_whatsapp)) {
        e.parent_whatsapp = "Format nomor WhatsApp tidak valid.";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep(step)) {
      toast.error("Mohon periksa kembali format data yang diisi.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) {
        setStep(i);
        toast.error("Mohon periksa kembali format data yang diisi.");
        return;
      }
    }
    setSubmitting(true);
    const status = data.current_status;
    const payload = {
      full_name: data.full_name.trim() || "",
      whatsapp: data.whatsapp.trim() || "",
      email: data.email.trim().toLowerCase() || "",
      program_interest: data.program_interest || "",
      study_level: data.study_level || "",
      applicant_type: data.applicant_type || "",
      current_status: status || "",
      school_university: data.school_university.trim() || "",
      class: needsClass(status) ? data.class || null : null,
      semester: needsSemester(status) ? data.semester || null : null,
      graduation_year: needsGraduationYear(status) ? Number(data.graduation_year) || null : null,
      work_duration: needsWorkInfo(status) ? data.work_duration || null : null,
      last_work_duration: needsWorkInfo(status) ? data.last_work_duration || null : null,
      work_field: needsWorkInfo(status) ? data.work_field.trim() || null : null,
      parent_name: data.parent_name.trim() || "",
      parent_whatsapp: data.parent_whatsapp.trim() || "",
      parent_occupation: data.parent_occupation || null,
      parent_occupation_other:
        data.parent_occupation === "Pekerjaan Lainnya"
          ? data.parent_occupation_other.trim() || null
          : null,
      intake_plan: data.intake_plan || "",
      destination_country: data.destination_country.trim() || "",
      intended_major: data.intended_major.trim() || "",
      funding_preference: data.funding_preference || [],
      consent: data.consent,
    };

    const { error } = await supabase.from("applications").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error("Gagal mengirim formulir: " + error.message);
      return;
    }
    toast.success("Formulir berhasil dikirim!");
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="card-elevated w-full max-w-md p-6 text-center sm:p-10 rounded-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Terima Kasih!</h1>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            Data Anda telah berhasil dikirim. Tim kami akan menghubungi Anda untuk memberikan
            informasi dan arahan terkait persiapan kuliah ke luar negeri.
          </p>
          <Button
            className="mt-8 w-full min-h-[44px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-md"
            onClick={() => {
              setData(initialState);
              setStep(0);
              setDone(false);
            }}
          >
            Kembali ke Beranda
          </Button>
        </div>
      </main>
    );
  }

  const currentStepInfo = STEPS[step]!;
  const StepIcon = currentStepInfo.icon;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <header className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 px-4 pb-20 pt-10 text-white sm:px-8 shadow-md">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-sm">
            <GraduationCap className="h-4 w-4" />
            <span>Konsultasi Studi Luar Negeri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Persiapan Kuliah ke Luar Negeri{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Dimulai dari Sekarang
            </span>
          </h1>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto opacity-90 space-y-2">
            <p>
              Kuliah ke luar negeri bukan hanya tentang memilih universitas. Ada banyak hal yang
              perlu dipersiapkan sejak dini, mulai dari jurusan, negara tujuan, persyaratan,
              kemampuan bahasa, hingga peluang beasiswa.
            </p>
            <p>
              Melalui form ini, kami ingin memahami rencana Anda agar dapat memberikan arahan dan
              rekomendasi persiapan yang tepat.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="mx-auto -mt-12 max-w-2xl px-3 sm:px-6">
        {/* Step Progress Bar & Horizontal Compact Indicator */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200/80 dark:border-slate-800 mb-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <StepIcon className="h-4 w-4" />
              <span>Langkah {step + 1} dari {STEPS.length}</span>
            </span>
            <span className="text-slate-500 font-mono">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Horizontal Mobile Scrollable Step Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-[11px]">
            {STEPS.map((s, idx) => {
              const isCompleted = idx < step;
              const isCurrent = idx === step;

              return (
                <button
                  key={s.id}
                  onClick={() => setStep(idx)}
                  type="button"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap transition-all border font-medium ${
                    isCurrent
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : isCompleted
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span>{s.id}.</span>
                  )}
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Step Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <StepIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>{currentStepInfo.title}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {currentStepInfo.subtitle}
            </p>
          </div>

          <div className="space-y-5">
            {/* STEP 1: Data Peserta */}
            {step === 0 && (
              <>
                <Field label="Nama Lengkap" error={errors.full_name} htmlFor="full_name">
                  <Input
                    id="full_name"
                    value={data.full_name}
                    maxLength={120}
                    placeholder="Nama sesuai dokumen resmi"
                    className="min-h-[44px] text-sm"
                    onChange={(e) => set("full_name", e.target.value)}
                  />
                </Field>
                <Field label="Nomor WhatsApp" error={errors.whatsapp} htmlFor="whatsapp">
                  <Input
                    id="whatsapp"
                    type="tel"
                    inputMode="tel"
                    maxLength={20}
                    placeholder="08xxxxxxxxxx"
                    value={data.whatsapp}
                    className="min-h-[44px] text-sm"
                    onChange={(e) => set("whatsapp", e.target.value)}
                  />
                </Field>
                <Field label="Email Aktif" error={errors.email} htmlFor="email">
                  <Input
                    id="email"
                    type="email"
                    maxLength={255}
                    placeholder="nama@email.com"
                    value={data.email}
                    className="min-h-[44px] text-sm"
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Field>
              </>
            )}

            {/* STEP 2: Minat Studi */}
            {step === 1 && (
              <>
                <Field label="Program yang Anda Minati" error={errors.program_interest}>
                  <RadioGroup
                    value={data.program_interest}
                    onValueChange={(v) => set("program_interest", v)}
                    className="gap-2.5"
                  >
                    {PROGRAM_INTEREST.map((o) => (
                      <label
                        key={o}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 text-xs sm:text-sm font-medium transition-all hover:border-emerald-500 has-[button[data-state=checked]]:border-emerald-600 has-[button[data-state=checked]]:bg-emerald-50/50 dark:has-[button[data-state=checked]]:bg-emerald-950/40 min-h-[48px]"
                      >
                        <RadioGroupItem value={o} />
                        <span className="text-slate-800 dark:text-slate-200">{o}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </Field>

                <Field label="Jenjang Studi yang Dituju" error={errors.study_level}>
                  <RadioGroup
                    value={data.study_level}
                    onValueChange={(v) => set("study_level", v)}
                    className="gap-2.5"
                  >
                    {STUDY_LEVEL.map((o) => (
                      <label
                        key={o}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 text-xs sm:text-sm font-medium transition-all hover:border-emerald-500 has-[button[data-state=checked]]:border-emerald-600 has-[button[data-state=checked]]:bg-emerald-50/50 dark:has-[button[data-state=checked]]:bg-emerald-950/40 min-h-[48px]"
                      >
                        <RadioGroupItem value={o} />
                        <span className="text-slate-800 dark:text-slate-200">{o}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </Field>

                <Field label="Saya Mendaftar Sebagai" error={errors.applicant_type}>
                  <RadioGroup
                    value={data.applicant_type}
                    onValueChange={(v) => set("applicant_type", v)}
                    className="gap-2.5 sm:grid-cols-2"
                  >
                    {APPLICANT_TYPE.map((o) => (
                      <label
                        key={o}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 text-xs sm:text-sm font-medium transition-all hover:border-emerald-500 has-[button[data-state=checked]]:border-emerald-600 has-[button[data-state=checked]]:bg-emerald-50/50 dark:has-[button[data-state=checked]]:bg-emerald-950/40 min-h-[48px]"
                      >
                        <RadioGroupItem value={o} />
                        <span className="text-slate-800 dark:text-slate-200">{o}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </Field>
              </>
            )}

            {/* STEP 3: Status Pendidikan */}
            {step === 2 && (
              <>
                <Field label="Status Anda Saat Ini" error={errors.current_status}>
                  <Select
                    value={data.current_status}
                    onValueChange={(v) => set("current_status", v)}
                  >
                    <SelectTrigger className="min-h-[44px] text-sm">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENT_STATUS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {needsClass(data.current_status) && (
                  <Field label="Kelas" error={errors.class}>
                    <Select value={data.class} onValueChange={(v) => set("class", v)}>
                      <SelectTrigger className="min-h-[44px] text-sm">
                        <SelectValue placeholder="Pilih kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {needsSemester(data.current_status) && (
                  <Field label="Semester" error={errors.semester}>
                    <Select value={data.semester} onValueChange={(v) => set("semester", v)}>
                      <SelectTrigger className="min-h-[44px] text-sm">
                        <SelectValue placeholder="Pilih semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTER_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {needsGraduationYear(data.current_status) && (
                  <Field label="Tahun Lulus" error={errors.graduation_year}>
                    <Select
                      value={data.graduation_year}
                      onValueChange={(v) => set("graduation_year", v)}
                    >
                      <SelectTrigger className="min-h-[44px] text-sm">
                        <SelectValue placeholder="Pilih tahun lulus" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADUATION_YEARS.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {needsWorkInfo(data.current_status) && (
                  <>
                    <Field label="Sudah Bekerja Berapa Lama?" error={errors.work_duration}>
                      <Select
                        value={data.work_duration}
                        onValueChange={(v) => set("work_duration", v)}
                      >
                        <SelectTrigger className="min-h-[44px] text-sm">
                          <SelectValue placeholder="Pilih lama bekerja" />
                        </SelectTrigger>
                        <SelectContent>
                          {WORK_DURATION.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Masa Bekerja di Pekerjaan Terakhir" error={errors.last_work_duration}>
                      <Select
                        value={data.last_work_duration}
                        onValueChange={(v) => set("last_work_duration", v)}
                      >
                        <SelectTrigger className="min-h-[44px] text-sm">
                          <SelectValue placeholder="Pilih masa bekerja" />
                        </SelectTrigger>
                        <SelectContent>
                          {LAST_WORK_DURATION.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Bidang Pekerjaan" error={errors.work_field} htmlFor="work_field">
                      <Input
                        id="work_field"
                        maxLength={120}
                        value={data.work_field}
                        placeholder="Contoh: Teknologi Informasi"
                        className="min-h-[44px] text-sm"
                        onChange={(e) => set("work_field", e.target.value)}
                      />
                    </Field>
                  </>
                )}
              </>
            )}

            {/* STEP 4: Data Orang Tua / Wali */}
            {step === 3 && (
              <>
                <Field label="Nama Orang Tua / Wali" error={errors.parent_name} htmlFor="parent_name">
                  <Input
                    id="parent_name"
                    maxLength={120}
                    value={data.parent_name}
                    placeholder="Nama orang tua/wali"
                    className="min-h-[44px] text-sm"
                    onChange={(e) => set("parent_name", e.target.value)}
                  />
                </Field>
                <Field
                  label="Nomor WhatsApp Orang Tua / Wali"
                  error={errors.parent_whatsapp}
                  htmlFor="parent_whatsapp"
                >
                  <Input
                    id="parent_whatsapp"
                    type="tel"
                    inputMode="tel"
                    maxLength={20}
                    placeholder="08xxxxxxxxxx"
                    value={data.parent_whatsapp}
                    className="min-h-[44px] text-sm"
                    onChange={(e) => set("parent_whatsapp", e.target.value)}
                  />
                </Field>
                <Field label="Pekerjaan Orang Tua / Wali">
                  <Select
                    value={data.parent_occupation}
                    onValueChange={(v) => set("parent_occupation", v)}
                  >
                    <SelectTrigger className="min-h-[44px] text-sm">
                      <SelectValue placeholder="Pilih pekerjaan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARENT_OCCUPATION.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {data.parent_occupation === "Pekerjaan Lainnya" && (
                  <Field
                    label="Sebutkan Pekerjaan Lainnya"
                    error={errors.parent_occupation_other}
                    htmlFor="occ_other"
                  >
                    <Input
                      id="occ_other"
                      maxLength={120}
                      value={data.parent_occupation_other}
                      placeholder="Sebutkan pekerjaan"
                      className="min-h-[44px] text-sm"
                      onChange={(e) => set("parent_occupation_other", e.target.value)}
                    />
                  </Field>
                )}
              </>
            )}

            {/* STEP 5: Data Pendidikan */}
            {step === 4 && (
              <>
                <Field
                  label="Nama Sekolah / Universitas / Instansi"
                  error={errors.school_university}
                  htmlFor="school"
                >
                  <Input
                    id="school"
                    maxLength={160}
                    value={data.school_university}
                    placeholder="Contoh: SMA Negeri 1 Jakarta / Universitas Indonesia"
                    className="min-h-[44px] text-sm"
                    onChange={(e) => set("school_university", e.target.value)}
                  />
                </Field>

                {needsClass(data.current_status) && (
                  <Field label="Kelas" error={errors.class}>
                    <Select value={data.class} onValueChange={(v) => set("class", v)}>
                      <SelectTrigger className="min-h-[44px] text-sm">
                        <SelectValue placeholder="Pilih kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {needsSemester(data.current_status) && (
                  <Field label="Semester" error={errors.semester}>
                    <Select value={data.semester} onValueChange={(v) => set("semester", v)}>
                      <SelectTrigger className="min-h-[44px] text-sm">
                        <SelectValue placeholder="Pilih semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTER_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {needsGraduationYear(data.current_status) && (
                  <Field label="Tahun Lulus" error={errors.graduation_year}>
                    <Select
                      value={data.graduation_year}
                      onValueChange={(v) => set("graduation_year", v)}
                    >
                      <SelectTrigger className="min-h-[44px] text-sm">
                        <SelectValue placeholder="Pilih tahun lulus" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADUATION_YEARS.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </>
            )}

            {/* STEP 6: Rencana Studi */}
            {step === 5 && (
              <>
                <Field
                  label="Kapan Anda Berencana Memulai Kuliah di Luar Negeri?"
                  error={errors.intake_plan}
                >
                  <RadioGroup
                    value={data.intake_plan}
                    onValueChange={(v) => set("intake_plan", v)}
                    className="gap-2.5"
                  >
                    {INTAKE_PLAN.map((o) => (
                      <label
                        key={o}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 text-xs sm:text-sm font-medium transition-all hover:border-emerald-500 has-[button[data-state=checked]]:border-emerald-600 has-[button[data-state=checked]]:bg-emerald-50/50 dark:has-[button[data-state=checked]]:bg-emerald-950/40 min-h-[48px]"
                      >
                        <RadioGroupItem value={o} />
                        <span className="text-slate-800 dark:text-slate-200">{o}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </Field>

                <Field
                  label="Negara Tujuan yang Diminati"
                  error={errors.destination_country}
                  htmlFor="country"
                >
                  <Input
                    id="country"
                    maxLength={200}
                    placeholder="Contoh: Jerman, Belanda, Jepang"
                    value={data.destination_country}
                    className="min-h-[44px] text-sm"
                    onChange={(e) => set("destination_country", e.target.value)}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Boleh lebih dari satu, pisahkan dengan koma.
                  </p>
                </Field>

                <Field
                  label="Program Studi / Jurusan yang Diminati"
                  error={errors.intended_major}
                  htmlFor="major"
                >
                  <Input
                    id="major"
                    maxLength={200}
                    placeholder="Contoh: Computer Science"
                    value={data.intended_major}
                    className="min-h-[44px] text-sm"
                    onChange={(e) => set("intended_major", e.target.value)}
                  />
                </Field>

                <Field label="Rencana Pembiayaan Studi">
                  <div className="space-y-2.5">
                    {FUNDING_PREFERENCE.map((o) => {
                      const checked = data.funding_preference.includes(o);
                      return (
                        <label
                          key={o}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 text-xs sm:text-sm font-medium transition-all hover:border-emerald-500 has-[button[data-state=checked]]:border-emerald-600 has-[button[data-state=checked]]:bg-emerald-50/50 dark:has-[button[data-state=checked]]:bg-emerald-950/40 min-h-[48px]"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) =>
                              set(
                                "funding_preference",
                                v
                                  ? [...data.funding_preference, o]
                                  : data.funding_preference.filter((f) => f !== o)
                              )
                            }
                          />
                          <span className="text-slate-800 dark:text-slate-200">{o}</span>
                        </label>
                      );
                    })}
                  </div>
                </Field>
              </>
            )}

            {/* STEP 7: Konfirmasi */}
            {step === 6 && (
              <>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    <span>Pernyataan Persetujuan</span>
                  </div>
                  <p>
                    Saya menyatakan bahwa data yang diberikan benar dan bersedia dihubungi untuk
                    mendapatkan informasi, konsultasi, serta rekomendasi program persiapan kuliah ke
                    luar negeri sesuai kebutuhan saya.
                  </p>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs sm:text-sm font-semibold min-h-[48px]">
                  <Checkbox
                    checked={data.consent}
                    onCheckedChange={(v) => set("consent", Boolean(v))}
                  />
                  <span>Saya menyetujui</span>
                </label>

                {/* Summary Box */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-900">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ringkasan Data yang Diisi
                  </h3>
                  <dl className="grid gap-3 text-xs sm:grid-cols-2">
                    {[
                      ["Nama Lengkap", data.full_name],
                      ["WhatsApp", data.whatsapp],
                      ["Email", data.email],
                      ["Program Minat", data.program_interest],
                      ["Jenjang", data.study_level],
                      ["Mendaftar Sebagai", data.applicant_type],
                      ["Status Saat Ini", data.current_status],
                      ["Sekolah / Univ", data.school_university],
                      ["Orang Tua / Wali", data.parent_name],
                      ["Negara Tujuan", data.destination_country],
                      ["Program Studi", data.intended_major],
                      ["Rencana Intake", data.intake_plan],
                    ].map(([k, v]) => (
                      <div key={k} className="border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                        <dt className="text-[10px] text-slate-400 uppercase font-semibold">{k}</dt>
                        <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                          {v || <span className="text-slate-400 font-normal italic">Belum diisi</span>}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Area administrator?{" "}
          <Link to="/admin/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            Masuk ke Portal Admin
          </Link>
        </p>
      </div>

      {/* Sticky Bottom Navigation Bar for Mobile & Desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3 px-4 shadow-2xl">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={back}
            disabled={step === 0 || submitting}
            className={`min-h-[44px] px-4 text-xs font-semibold gap-1.5 border-slate-300 dark:border-slate-700 ${
              step === 0 ? "invisible" : ""
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={next}
              className="min-h-[44px] px-6 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white ml-auto shadow-md"
            >
              <span>Lanjutkan</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={submitting}
              className="min-h-[44px] px-6 text-xs font-semibold gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white ml-auto shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Kirim Formulir</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
