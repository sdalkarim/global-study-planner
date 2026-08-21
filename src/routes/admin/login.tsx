import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { GraduationCap, Lock, Mail, Loader2, ShieldAlert, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login - Global Study Planner" },
      { name: "description", content: "Halaman masuk khusus administrator Global Study Planner." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signUp">("login");
  const [claiming, setClaiming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in as admin
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check role
        const { data: hasRole } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin",
        });
        if (hasRole) {
          navigate({ to: "/admin" });
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Silakan isi email dan kata sandi");
      return;
    }

    try {
      setLoading(true);

      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check role
          const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
            _user_id: data.user.id,
            _role: "admin",
          });

          if (roleErr || !isAdmin) {
            // Attempt to claim first admin automatically if database has no admins
            const { data: claimed } = await supabase.rpc("claim_first_admin");
            if (claimed) {
              toast.success("Akun Anda berhasil dijadikan Admin Pertama!");
              navigate({ to: "/admin" });
              return;
            } else {
              toast.error("Akun Anda tidak memiliki peranan (role) Admin");
              await supabase.auth.signOut();
              return;
            }
          }

          toast.success("Selamat datang kembali, Admin!");
          navigate({ to: "/admin" });
        }
      } else {
        // Sign Up Mode for Admin Registration
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Try claiming first admin
          const { data: claimed } = await supabase.rpc("claim_first_admin");
          if (claimed) {
            toast.success("Pendaftaran berhasil! Akun Anda kini diklaim sebagai Admin Pertama.");
            navigate({ to: "/admin" });
          } else {
            toast.success("Pendaftaran berhasil. Silakan minta admin existing untuk menambahkan role admin Anda.");
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan autentikasi");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimFirstAdmin = async () => {
    try {
      setClaiming(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error("Silakan login terlebih dahulu untuk mengklaim akun Admin Pertama");
        return;
      }

      const { data: claimed, error } = await supabase.rpc("claim_first_admin");
      if (error) throw error;

      if (claimed) {
        toast.success("Berhasil! Akun Anda resmi didaftarkan sebagai Admin Pertama.");
        navigate({ to: "/admin" });
      } else {
        toast.info("Database sudah memiliki akun Admin yang terdaftar.");
      }
    } catch (err: any) {
      toast.error("Gagal klaim admin: " + err.message);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow Overlay */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-950/60 mb-2">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Global Study Planner</h1>
          <p className="text-sm text-slate-400">Portal Konsol Administrasi & Data Pendaftar</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-md shadow-2xl text-slate-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center font-bold text-white">
              {mode === "login" ? "Masuk Portal Admin" : "Daftar Akun Admin Baru"}
            </CardTitle>
            <CardDescription className="text-center text-slate-400 text-xs">
              {mode === "login"
                ? "Masukkan email dan kata sandi admin Anda"
                : "Buat kredensial admin baru untuk sistem"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-slate-300">
                  Email Admin
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@globalstudy.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-slate-300">
                  Kata Sandi
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-950/40"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === "login" ? (
                  "Masuk ke Dashboard"
                ) : (
                  "Buat Akun & Minta Akses Admin"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-0 text-center border-t border-slate-800/60 mt-2">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signUp" : "login")}
              className="text-xs text-emerald-400 hover:underline pt-3"
            >
              {mode === "login"
                ? "Belum punya akun admin? Buat akun di sini"
                : "Sudah punya akun admin? Masuk di sini"}
            </button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClaimFirstAdmin}
              disabled={claiming}
              className="w-full text-xs border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {claiming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 mr-1" />
              )}
              Klaim Akun Admin Pertama (First Run Setup)
            </Button>
          </CardFooter>
        </Card>

        {/* Security Note Footer */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-emerald-500/70" />
          <span>Akses dilindungi oleh Supabase Auth & Row Level Security (RLS)</span>
        </div>
      </div>
    </div>
  );
}
