import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  KeyRound,
  UserCheck,
  LogOut,
  Sparkles,
  Loader2,
  Lock,
  Globe,
  Database,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Pengaturan Admin - Global Study Planner" },
      { name: "description", content: "Pengaturan akun administrator dan preferensi sistem." },
    ],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    fetchUser();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Kata sandi minimal harus 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok");
      return;
    }

    try {
      setLoadingPass(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Kata sandi admin berhasil diperbarui!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error("Gagal memperbarui password: " + err.message);
    } finally {
      setLoadingPass(false);
    }
  };

  const handleClaimAdmin = async () => {
    try {
      setClaiming(true);
      const { data: claimed, error } = await supabase.rpc("claim_first_admin");
      if (error) throw error;

      if (claimed) {
        toast.success("Akun Anda berhasil diklaim sebagai Admin Pertama!");
      } else {
        toast.info("Database sudah memiliki akun Admin yang terdaftar.");
      }
    } catch (err: any) {
      toast.error("Gagal klaim admin: " + err.message);
    } finally {
      setClaiming(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Berhasil keluar");
      navigate({ to: "/admin/login" });
    } catch (err: any) {
      toast.error("Gagal logout: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <span>Pengaturan Akun & Sistem</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Kelola kredensial akun administrator dan informasi keamanan sistem
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Info Card */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Informasi Akun</span>
            </CardTitle>
            <CardDescription className="text-xs">Detail profil admin aktif</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Email Admin</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email || "Memuat..."}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Role Sesi</span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 font-semibold text-[10px]">
                Administrator
              </Badge>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Terakhir Login</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString("id-ID")
                  : "-"}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClaimAdmin}
                disabled={claiming}
                className="w-full text-xs gap-1.5"
              >
                {claiming ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                )}
                <span>Klaim Role Admin</span>
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="w-full text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar Akun Admin</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ubah Kata Sandi Admin</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Perbarui kata sandi untuk mengamankan akses ke dashboard admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label htmlFor="new-pass" className="text-xs">
                  Kata Sandi Baru
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="new-pass"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-pass" className="text-xs">
                  Konfirmasi Kata Sandi Baru
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirm-pass"
                    type="password"
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loadingPass}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                {loadingPass ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                )}
                Simpan Kata Sandi Baru
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* System Status Overview */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Status Sistem & Integrasi Database</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block mb-1">Database Engine</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Supabase PostgreSQL</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block mb-1">Row Level Security (RLS)</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Aktif & Protected</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block mb-1">Realtime Subscription</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Connected</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
