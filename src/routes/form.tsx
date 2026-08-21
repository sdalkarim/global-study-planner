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
  { title: "Data Peserta", subtitle: "Informasi kontak Anda" },
  { title: "Minat Studi", subtitle: "Program & jenjang yang dituju" },
  { title: "Pendidikan", subtitle: "Status & institusi saat ini" },
  { title: "Orang Tua / Wali", subtitle: "Data pendamping" },
  { title: "Rencana Studi", subtitle: "Negara, jurusan & pembiayaan" },
  { title: "Persetujuan", subtitle: "Konfirmasi & kirim" },
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
    <div>
      <Label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">
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

  const progress = useMemo(() => Math.round(((step + (done ? 1 : 0)) / STEPS.length) * 100), [
    step,
    done,
  ]);

  function validateStep(index: number): boolean {
    const e: Errors = {};
    if (index === 0) {
      // Only format validation if user entered data (optional)
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
    for (let i = 0; i <= 5; i++) {
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
      toast.error("Gagal mengirim formulir. Silakan coba lagi: " + error.message);
      return;
    }
    toast.success("Formulir berhasil dikirim!");
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <div className="card-elevated w-full max-w-lg p-8 text-center sm:p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Terima Kasih!</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Data Anda telah berhasil dikirim. Tim kami akan menghubungi Anda untuk memberikan
            informasi dan arahan terkait persiapan kuliah ke luar negeri.
          </p>
          <Button
            className="mt-8 w-full sm:w-auto"
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

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="bg-hero-gradient relative overflow-hidden px-4 pb-24 pt-14 text-primary-foreground sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-sidebar-border/60 bg-sidebar-accent/40 px-3 py-1 text-xs font-semibold tracking-wide">
            <GraduationCap className="size-4" />
            Konsultasi Studi Luar Negeri
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-[2.6rem]">
            Persiapan Kuliah ke Luar Negeri{" "}
            <span className="text-gradient-gold">Dimulai dari Sekarang</span>
          </h1>
          <div className="mt-5 space-y-3 text-sm leading-relaxed opacity-90 sm:text-base">
            <p>
              Kuliah ke luar negeri bukan hanya tentang memilih universitas atau negara tujuan.
              Persiapan yang tepat perlu dimulai sejak dini, mulai dari menentukan jurusan, memilih
              negara tujuan, memahami persyaratan masuk, mempersiapkan kemampuan bahasa, hingga
              mencari peluang beasiswa.
            </p>
            <p>
              Melalui form ini, kami ingin memahami profil dan rencana studi Anda agar dapat
              memberikan informasi, arahan, dan rekomendasi yang sesuai dengan kebutuhan persiapan
              kuliah ke luar negeri.
            </p>
            <p>Silakan isi data berikut sesuai kondisi Anda.</p>
          </div>
        </div>
      </header>

      <div className="mx-auto -mt-16 max-w-3xl px-4 sm:px-8">
        <div className="card-elevated p-5 sm:p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Langkah {step + 1} dari {STEPS.length}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">{progress}%</p>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="bg-gold-gradient h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progress, 6)}%` }}
              />
            </div>
            <h2 className="mt-4 text-xl font-bold">{STEPS[step]!.title}</h2>
            <p className="text-sm text-muted-foreground">{STEPS[step]!.subtitle}</p>
          </div>

          <div className="space-y-6">
            {step === 0 && (
              <>
                <Field label="Nama Lengkap" error={errors.full_name} htmlFor="full_name">
                  <Input
                    id="full_name"
                    value={data.full_name}
                    maxLength={120}
                    placeholder="Nama sesuai dokumen resmi"
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
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Program yang Anda Minati" error={errors.program_interest}>
                  <RadioGroup
                    value={data.program_interest}
                    onValueChange={(v) => set("program_interest", v)}
                    className="gap-3"
                  >
                    {PROGRAM_INTEREST.map((o) => (
                      <label
                        key={o}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm transition-colors hover:border-accent has-[button[data-state=checked]]:border-accent has-[button[data-state=checked]]:bg-secondary"
                      >
                        <RadioGroupItem value={o} />
                        <span className="font-medium">{o}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </Field>
                <Field label="Jenjang Studi yang Dituju" error={errors.study_level}>
                  <RadioGroup
                    value={data.study_level}
                    onValueChange={(v) => set("study_level", v)}
                    className="gap-3"
                  >
                    {STUDY_LEVEL.map((o) => (
                      <label
                        key={o}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm transition-colors hover:border-accent has-[button[data-state=checked]]:border-accent has-[button[data-state=checked]]:bg-secondary"
                      >
                        <RadioGroupItem value={o} />
                        <span className="font-medium">{o}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </Field>
                <Field label="Saya Mendaftar Sebagai" error={errors.applicant_type}>
                  <RadioGroup
                    value={data.applicant_type}
                    onValueChange={(v) => set("applicant_type", v)}
                    className="gap-3 sm:grid-cols-2"
                  >
                    {APPLICANT_TYPE.map((o) => (
                      <label
                        key={o}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm transition-colors hover:border-accent has-[button[data-state=checked]]:border-accent has-[button[data-state=checked]]:bg-secondary"
                      >
                        <RadioGroupItem value={o} />
                        <span className="font-medium">{o}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="Status Anda Saat Ini" error={errors.current_status}>
                  <Select
                    value={data.current_status}
                    onValueChange={(v) => set("current_status", v)}
                  >
                    <SelectTrigger>
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

                <Field
                  label="Nama Sekolah / Universitas / Instansi"
                  error={errors.school_university}
                  htmlFor="school"
                >
                  <Input
                    id="school"
                    maxLength={160}
                    value={data.school_university}
                    placeholder="Contoh: SMA Negeri 1 Jakarta"
                    onChange={(e) => set("school_university", e.target.value)}
                  />
                </Field>

                {needsClass(data.current_status) && (
                  <Field label="Kelas" error={errors.class}>
                    <Select value={data.class} onValueChange={(v) => set("class", v)}>
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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
                    <Field
                      label="Bidang Pekerjaan"
                      error={errors.work_field}
                      htmlFor="work_field"
                    >
                      <Input
                        id="work_field"
                        maxLength={120}
                        value={data.work_field}
                        placeholder="Contoh: Teknologi Informasi"
                        onChange={(e) => set("work_field", e.target.value)}
                      />
                    </Field>
                  </>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <Field
                  label="Nama Orang Tua / Wali"
                  error={errors.parent_name}
                  htmlFor="parent_name"
                >
                  <Input
                    id="parent_name"
                    maxLength={120}
                    value={data.parent_name}
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
                    onChange={(e) => set("parent_whatsapp", e.target.value)}
                  />
                </Field>
                <Field label="Pekerjaan Orang Tua / Wali">
                  <Select
                    value={data.parent_occupation}
                    onValueChange={(v) => set("parent_occupation", v)}
                  >
                    <SelectTrigger>
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
                      onChange={(e) => set("parent_occupation_other", e.target.value)}
                    />
                  </Field>
                )}
              </>
            )}

            {step === 4 && (
              <>
                <Field
                  label="Kapan Anda Berencana Memulai Kuliah di Luar Negeri?"
                  error={errors.intake_plan}
                >
                  <RadioGroup
                    value={data.intake_plan}
                    onValueChange={(v) => set("intake_plan", v)}
                    className="gap-3"
                  >
                    {INTAKE_PLAN.map((o) => (
                      <label
                        key={o}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm transition-colors hover:border-accent has-[button[data-state=checked]]:border-accent has-[button[data-state=checked]]:bg-secondary"
                      >
                        <RadioGroupItem value={o} />
                        <span className="font-medium">{o}</span>
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
                    onChange={(e) => set("destination_country", e.target.value)}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
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
                    onChange={(e) => set("intended_major", e.target.value)}
                  />
                </Field>
                <Field label="Rencana Pembiayaan Studi">
                  <div className="space-y-3">
                    {FUNDING_PREFERENCE.map((o) => {
                      const checked = data.funding_preference.includes(o);
                      return (
                        <label
                          key={o}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm transition-colors hover:border-accent has-[button[data-state=checked]]:border-accent has-[button[data-state=checked]]:bg-secondary"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) =>
                              set(
                                "funding_preference",
                                v
                                  ? [...data.funding_preference, o]
                                  : data.funding_preference.filter((f) => f !== o),
                              )
                            }
                          />
                          <span className="font-medium">{o}</span>
                        </label>
                      );
                    })}
                  </div>
                </Field>
              </>
            )}

            {step === 5 && (
              <>
                <div className="rounded-xl border border-border bg-secondary/60 p-5 text-sm leading-relaxed">
                  <ShieldCheck className="mb-3 size-5 text-accent" />
                  Saya menyatakan bahwa data yang diberikan benar dan bersedia dihubungi untuk
                  mendapatkan informasi, konsultasi, serta rekomendasi program persiapan kuliah ke
                  luar negeri sesuai kebutuhan saya.
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-semibold">
                  <Checkbox
                    checked={data.consent}
                    onCheckedChange={(v) => set("consent", Boolean(v))}
                  />
                  Saya menyetujui
                </label>
                <FieldError message={errors.consent} />

                <div className="rounded-xl border border-border p-5">
                  <h3 className="text-base font-bold">Ringkasan Data</h3>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {[
                      ["Nama", data.full_name],
                      ["WhatsApp", data.whatsapp],
                      ["Email", data.email],
                      ["Program", data.program_interest],
                      ["Jenjang", data.study_level],
                      ["Status", data.current_status],
                      ["Institusi", data.school_university],
                      ["Negara Tujuan", data.destination_country],
                      ["Jurusan", data.intended_major],
                      ["Rencana Intake", data.intake_plan],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs text-muted-foreground">{k}</dt>
                        <dd className="font-medium">{v || "-"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={back} disabled={step === 0 || submitting}>
              <ArrowLeft className="size-4" />
              Kembali
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next}>
                Lanjutkan
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Kirim Formulir
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Area admin?{" "}
          <Link to="/admin/login" className="font-semibold underline underline-offset-4">
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
