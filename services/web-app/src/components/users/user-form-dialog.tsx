import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2, UserPlus, Pencil } from "lucide-react";
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user";
import {
  nameSchema,
  emailSchema,
  passwordRequiredSchema,
  passwordOptionalSchema,
} from "@/schemas/user";
import { getFieldError } from "@/utils/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

type UserFormMode = "create" | "edit";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserDto | UpdateUserDto) => Promise<void>;
  mode: UserFormMode;
  user?: User | null;
}

export function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  mode,
  user,
}: UserFormDialogProps) {
  const isEditMode = mode === "edit";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user" as "admin" | "user",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        if (isEditMode) {
          const data: UpdateUserDto = {
            name: value.name.trim(),
            email: value.email.trim(),
            roles: [value.role],
          };
          if (value.password) {
            data.password = value.password;
          }
          await onSubmit(data);
        } else {
          const data: CreateUserDto = {
            name: value.name.trim(),
            email: value.email.trim(),
            password: value.password,
            roles: [value.role],
          };
          await onSubmit(data);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && user) {
        form.reset();
        form.setFieldValue("name", user.name || "");
        form.setFieldValue("email", user.email || "");
        form.setFieldValue("password", "");
        form.setFieldValue(
          "role",
          user.roles?.includes("admin") ? "admin" : "user",
        );
      } else {
        form.reset();
      }
    }
  }, [open, user, isEditMode, form]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  const title = isEditMode ? "Editar Usuário" : "Novo Usuário";
  const description = isEditMode
    ? "Atualize os dados do usuário."
    : "Preencha os dados para criar um novo usuário.";
  const submitText = isEditMode ? "Salvar Alterações" : "Criar Usuário";
  const Icon = isEditMode ? Pencil : UserPlus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl border-0 shadow-[0px_8px_24px_rgba(45,52,54,0.12)] dark:bg-[#2C3A4B] dark:shadow-[0px_8px_24px_rgba(0,0,0,0.3)]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#6C5CE7]/10 dark:bg-[#6C5CE7]/20">
                <Icon className="w-5 h-5 text-[#6C5CE7]" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-[#2D3436] dark:text-[#F7F9FC]">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-[#636E72] dark:text-[#9BA6B5] mt-1">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <FieldGroup className="py-6 space-y-4">
            <form.Field
              name="name"
              validators={{ onChange: nameSchema }}
              children={(field) => (
                <Field>
                  <FieldLabel
                    htmlFor="name"
                    className={`text-sm font-medium ${
                      field.state.meta.errors.length
                        ? "text-red-500"
                        : "text-[#2D3436] dark:text-[#F7F9FC]"
                    }`}
                  >
                    Nome
                  </FieldLabel>
                  <Input
                    id="name"
                    placeholder="João Silva"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`h-11 rounded-xl border-slate-200 dark:border-[#3E4C5E] bg-white dark:bg-[#1E2A38] text-[#2D3436] dark:text-[#F7F9FC] placeholder:text-[#9BA6B5] focus:border-[#6C5CE7] focus:ring-[#6C5CE7]/20 ${
                      field.state.meta.errors.length
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span className="text-xs text-red-500 font-medium">
                      {getFieldError(field.state.meta.errors)}
                    </span>
                  )}
                </Field>
              )}
            />

            <form.Field
              name="email"
              validators={{ onChange: emailSchema }}
              children={(field) => (
                <Field>
                  <FieldLabel
                    htmlFor="email"
                    className={`text-sm font-medium ${
                      field.state.meta.errors.length
                        ? "text-red-500"
                        : "text-[#2D3436] dark:text-[#F7F9FC]"
                    }`}
                  >
                    Email
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`h-11 rounded-xl border-slate-200 dark:border-[#3E4C5E] bg-white dark:bg-[#1E2A38] text-[#2D3436] dark:text-[#F7F9FC] placeholder:text-[#9BA6B5] focus:border-[#6C5CE7] focus:ring-[#6C5CE7]/20 ${
                      field.state.meta.errors.length
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span className="text-xs text-red-500 font-medium">
                      {getFieldError(field.state.meta.errors)}
                    </span>
                  )}
                </Field>
              )}
            />

            <form.Field
              name="password"
              validators={{
                onChange: isEditMode
                  ? passwordOptionalSchema
                  : passwordRequiredSchema,
              }}
              children={(field) => (
                <Field>
                  <FieldLabel
                    htmlFor="password"
                    className={`text-sm font-medium ${
                      field.state.meta.errors.length
                        ? "text-red-500"
                        : "text-[#2D3436] dark:text-[#F7F9FC]"
                    }`}
                  >
                    Senha{" "}
                    {isEditMode && (
                      <span className="text-[#9BA6B5] font-normal">
                        (deixe em branco para não alterar)
                      </span>
                    )}
                  </FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`h-11 rounded-xl border-slate-200 dark:border-[#3E4C5E] bg-white dark:bg-[#1E2A38] text-[#2D3436] dark:text-[#F7F9FC] placeholder:text-[#9BA6B5] focus:border-[#6C5CE7] focus:ring-[#6C5CE7]/20 ${
                      field.state.meta.errors.length
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span className="text-xs text-red-500 font-medium">
                      {getFieldError(field.state.meta.errors)}
                    </span>
                  )}
                </Field>
              )}
            />

            <form.Field
              name="role"
              children={(field) => (
                <Field>
                  <FieldLabel
                    htmlFor="role"
                    className="text-sm font-medium text-[#2D3436] dark:text-[#F7F9FC]"
                  >
                    Função
                  </FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as "admin" | "user")
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-[#3E4C5E] bg-white dark:bg-[#1E2A38] text-[#2D3436] dark:text-[#F7F9FC] focus:border-[#6C5CE7] focus:ring-[#6C5CE7]/20">
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-[#3E4C5E] bg-white dark:bg-[#2C3A4B]">
                      <SelectItem
                        value="user"
                        className="rounded-lg text-[#2D3436] dark:text-[#F7F9FC] focus:bg-[#6C5CE7]/10 dark:focus:bg-[#6C5CE7]/20"
                      >
                        Usuário
                      </SelectItem>
                      <SelectItem
                        value="admin"
                        className="rounded-lg text-[#2D3436] dark:text-[#F7F9FC] focus:bg-[#6C5CE7]/10 dark:focus:bg-[#6C5CE7]/20"
                      >
                        Administrador
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-11 px-6 rounded-xl border-slate-200 dark:border-[#3E4C5E] text-[#636E72] dark:text-[#9BA6B5] hover:bg-slate-50 dark:hover:bg-[#3E4C5E]/50 hover:text-[#2D3436] dark:hover:text-[#F7F9FC] cursor-pointer"
            >
              Cancelar
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="h-11 px-6 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD5] text-white shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {submitText}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
