import { useState } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  userName: string;
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[440px] rounded-3xl border-0 shadow-[0px_8px_24px_rgba(45,52,54,0.12)] dark:bg-[#2C3A4B] dark:shadow-[0px_8px_24px_rgba(0,0,0,0.3)]"
        showCloseButton={false}
      >
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-950/30">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#2D3436] dark:text-[#F7F9FC]">
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription className="text-[#636E72] dark:text-[#9BA6B5] mt-1">
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
            <p className="text-[#2D3436] dark:text-[#F7F9FC]">
              Tem certeza que deseja excluir o usuário{" "}
              <strong className="text-red-600 dark:text-red-400">
                {userName}
              </strong>
              ?
            </p>
            <p className="text-sm text-[#636E72] dark:text-[#9BA6B5] mt-2">
              Todos os dados associados a este usuário serão permanentemente
              removidos.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="h-11 px-6 rounded-xl border-slate-200 dark:border-[#3E4C5E] text-[#636E72] dark:text-[#9BA6B5] hover:bg-slate-50 dark:hover:bg-[#3E4C5E]/50 hover:text-[#2D3436] dark:hover:text-[#F7F9FC] cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-md cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Excluir Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
