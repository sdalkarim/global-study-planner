import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];

interface ApplicationDeleteDialogProps {
  application: ApplicationRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ApplicationDeleteDialog({
  application,
  open,
  onOpenChange,
  onSuccess,
}: ApplicationDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!application) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", application.id);

      if (error) throw error;

      toast.success(`Data peserta ${application.full_name} telah berhasil dihapus`);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error("Gagal menghapus data: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Trash2 className="h-5 w-5" />
            <span>Hapus Data Peserta</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-slate-600 dark:text-slate-300">
            Apakah Anda yakin ingin menghapus data peserta{" "}
            <span className="font-bold text-slate-900 dark:text-slate-100">{application.full_name}</span>?
            Tindakan ini tidak dapat dibatalkan dan seluruh data pendaftaran peserta ini akan hilang dari sistem.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 justify-end pt-2">
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span>Hapus Peserta</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
