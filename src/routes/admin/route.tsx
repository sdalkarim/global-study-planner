import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminRouteWrapper,
});

function AdminRouteWrapper() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const verifyAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          if (mounted) {
            setChecking(false);
            setAuthorized(false);
            navigate({ to: "/admin/login" });
          }
          return;
        }

        setUserEmail(session.user.email || null);

        // Check user role
        const { data: isAdmin, error } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin",
        });

        if (error || !isAdmin) {
          // Attempt automatic first admin claim if database has zero admins
          const { data: claimed } = await supabase.rpc("claim_first_admin");
          if (claimed) {
            if (mounted) {
              setAuthorized(true);
              setChecking(false);
            }
            return;
          }

          if (mounted) {
            setAuthorized(false);
            setChecking(false);
            navigate({ to: "/admin/login" });
          }
          return;
        }

        if (mounted) {
          setAuthorized(true);
          setChecking(false);
        }
      } catch (err) {
        if (mounted) {
          setChecking(false);
          setAuthorized(false);
          navigate({ to: "/admin/login" });
        }
      }
    };

    verifyAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setAuthorized(false);
        navigate({ to: "/admin/login" });
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Memverifikasi Hak Akses Admin...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <AdminLayout userEmail={userEmail}>
      <Outlet />
    </AdminLayout>
  );
}
