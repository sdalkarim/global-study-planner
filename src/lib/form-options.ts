export const PROGRAM_INTEREST = [
  "Study Abroad (Kuliah di Luar Negeri)",
  "STYLE – International Exchange Program",
] as const;

export const STUDY_LEVEL = ["S1 (Bachelor's Degree)", "S2/S3 (Master's / PhD)"] as const;

export const APPLICANT_TYPE = ["Siswa / Hunters", "Orang Tua"] as const;

export const CURRENT_STATUS = [
  "SMP / Sederajat",
  "SMA / MA",
  "SMK",
  "Gap Year",
  "Mahasiswa",
  "Fresh Graduate S1",
  "Fresh Graduate S2",
  "Pekerja",
  "Sedang Tidak Bekerja",
] as const;

export const CLASS_OPTIONS = [
  "Kelas 7",
  "Kelas 8",
  "Kelas 9",
  "Kelas 10",
  "Kelas 11",
  "Kelas 12",
] as const;

export const SEMESTER_OPTIONS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8+",
] as const;

export const WORK_DURATION = ["Kurang dari 2 tahun", "2 tahun atau lebih"] as const;

export const LAST_WORK_DURATION = [
  "Kurang dari 1 tahun",
  "1–2 tahun",
  "3–5 tahun",
  "Lebih dari 5 tahun",
  "Belum Pernah Bekerja",
] as const;

export const PARENT_OCCUPATION = [
  "Belum/Tidak Bekerja",
  "Mengurus Rumah Tangga",
  "Petani",
  "Nelayan",
  "Peternak",
  "Pegawai Negeri",
  "TNI / POLRI",
  "Karyawan Swasta",
  "Pengusaha",
  "Tenaga Pengajar",
  "Dokter",
  "Akuntan",
  "Arsitek",
  "Pengacara",
  "BUMN / BUMD",
  "Pekerjaan Lainnya",
] as const;

export const INTAKE_PLAN = [
  "Kurang dari 1 tahun",
  "1–2 tahun",
  "2–3 tahun",
  "3–4 tahun",
  "Lebih dari 4 tahun",
] as const;

export const FUNDING_PREFERENCE = [
  "Fully Funded (Beasiswa Penuh)",
  "Partially Funded (Beasiswa Sebagian)",
  "Self Funded (Biaya Mandiri)",
] as const;

export const SCHOOL_STATUSES = ["SMP / Sederajat", "SMA / MA", "SMK"];

export function needsClass(status: string) {
  return SCHOOL_STATUSES.includes(status);
}
export function needsSemester(status: string) {
  return status === "Mahasiswa";
}
export function needsGraduationYear(status: string) {
  return status === "Gap Year";
}
export function needsWorkInfo(status: string) {
  return status === "Pekerja";
}

export const GRADUATION_YEARS = Array.from(
  { length: 16 },
  (_, i) => new Date().getFullYear() + 1 - i,
);

export type ApplicationRow = {
  id: string;
  full_name: string;
  whatsapp: string;
  email: string;
  program_interest: string;
  study_level: string;
  applicant_type: string;
  current_status: string;
  school_university: string;
  class: string | null;
  semester: string | null;
  graduation_year: number | null;
  work_duration: string | null;
  last_work_duration: string | null;
  work_field: string | null;
  parent_name: string;
  parent_whatsapp: string;
  parent_occupation: string | null;
  parent_occupation_other: string | null;
  intake_plan: string;
  destination_country: string;
  intended_major: string;
  funding_preference: string[];
  consent: boolean;
  created_at: string;
  updated_at: string;
};

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
