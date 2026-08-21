import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Globe,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: React.ReactNode;
  userEmail?: string | null;
}

export function AdminLayout({ children, userEmail }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Berhasil keluar dari akun admin");
      navigate({ to: "/admin/login" });
    } catch (error: any) {
      toast.error("Gagal logout: " + (error.message || "Terjadi kesalahan"));
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      to: "/admin",
      exact: true,
    },
    {
      label: "Data Pendaftar",
      icon: Users,
      to: "/admin/applications",
    },
    {
      label: "Pengaturan",
      icon: Settings,
      to: "/admin/settings",
    },
  ];

  const isActive = (to: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100">
      {/* Mobile Topbar */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white">Global Study Planner</h1>
            <p className="text-[10px] text-emerald-400 font-medium">Admin Panel</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-300 hover:text-white hover:bg-slate-800"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Drawer Navigation Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-72 bg-slate-900 text-white p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out md:hidden shadow-2xl border-r border-slate-800 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-base text-white">Global Study</h2>
                <span className="text-xs text-emerald-400 font-medium">Admin Dashboard</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.to, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="h-4 w-4 ml-auto text-emerald-200" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <Link
            to="/form"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>Lihat Form Pendaftar</span>
            <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
          </Link>

          {userEmail && (
            <div className="px-3.5 py-2 rounded-lg bg-slate-850 bg-slate-800/60 text-xs text-slate-300 flex items-center justify-between">
              <span className="truncate max-w-[150px]">{userEmail}</span>
              <Badge variant="outline" className="text-[10px] border-emerald-500/50 text-emerald-400">
                Admin
              </Badge>
            </div>
          )}

          <Button
            variant="destructive"
            size="sm"
            className="w-full justify-start gap-2 bg-rose-600/90 hover:bg-rose-600 text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar (Logout)</span>
          </Button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col justify-between p-5 border-r border-slate-800 shrink-0 sticky top-0 h-screen">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight text-white">Global Study</h2>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <ShieldCheck className="h-3 w-3" />
                <span>Admin Console</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Menu Utama
            </p>
            {navItems.map((item) => {
              const active = isActive(item.to, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="h-4 w-4 ml-auto text-emerald-200" />}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <Link
            to="/form"
            target="_blank"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors border border-slate-800"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-400" />
            <span>Buka Form Publik</span>
            <ExternalLink className="h-3 w-3 ml-auto text-slate-400" />
          </Link>

          {userEmail && (
            <div className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span className="truncate max-w-[140px]" title={userEmail}>
                {userEmail}
              </span>
              <Badge variant="outline" className="text-[10px] border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                Admin
              </Badge>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 text-slate-400 group-hover:text-rose-400" />
            <span>Keluar (Logout)</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
