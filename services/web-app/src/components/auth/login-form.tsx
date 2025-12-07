import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { api } from "@/config/api";
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { loginSchema } from "@/schemas/auth";
import { getFieldError, extractApiErrorMessage } from "@/utils/form";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      try {
        const { data } = await api.post("/auth/login", value);

        const success = signIn(data.access_token);

        if (success) {
          await navigate({ to: "/" });
        }
      } catch (error) {
        console.error("Login falhou", error);
        let message = "Erro inesperado ao tentar entrar.";

        if (isAxiosError(error)) {
          const apiMessage = error.response?.data?.message;
          message = extractApiErrorMessage(
            apiMessage,
            "Credenciais inválidas ou erro no servidor.",
          );
        } else if (error instanceof Error) {
          message = error.message;
        }

        toast.error("Erro ao entrar", {
          description: message,
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-3xl border border-slate-200 dark:border-[#3E4C5E] shadow-[0px_8px_24px_rgba(45,52,54,0.08)] dark:bg-[#2C3A4B] dark:shadow-[0px_8px_24px_rgba(0,0,0,0.2)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#2D3436] dark:text-[#F7F9FC]">
            Bem-vindo de volta!
          </CardTitle>
          <CardDescription className="text-[#636E72] dark:text-[#9BA6B5]">
            Entre com seu email para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup className="gap-4">
              <form.Field
                name="email"
                validators={{ onChange: loginSchema.shape.email }}
                children={(field) => (
                  <Field className="gap-2">
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
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Mail
                          className={`h-4 w-4 ${
                            field.state.meta.errors.length
                              ? "text-red-400"
                              : "text-[#9BA6B5]"
                          }`}
                        />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`h-12 pl-11 rounded-xl border-slate-200 dark:border-[#3E4C5E] bg-white dark:bg-[#1E2A38] text-[#2D3436] dark:text-[#F7F9FC] placeholder:text-[#9BA6B5] focus:border-[#6C5CE7] focus:ring-[#6C5CE7]/20 ${
                          field.state.meta.errors.length
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                        disabled={isLoading}
                      />
                    </div>
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
                validators={{ onChange: loginSchema.shape.password }}
                children={(field) => (
                  <Field className="gap-2">
                    <FieldLabel
                      htmlFor="password"
                      className={`text-sm font-medium ${
                        field.state.meta.errors.length
                          ? "text-red-500"
                          : "text-[#2D3436] dark:text-[#F7F9FC]"
                      }`}
                    >
                      Senha
                    </FieldLabel>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Lock
                          className={`h-4 w-4 ${
                            field.state.meta.errors.length
                              ? "text-red-400"
                              : "text-[#9BA6B5]"
                          }`}
                        />
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`h-12 pl-11 rounded-xl border-slate-200 dark:border-[#3E4C5E] bg-white dark:bg-[#1E2A38] text-[#2D3436] dark:text-[#F7F9FC] placeholder:text-[#9BA6B5] focus:border-[#6C5CE7] focus:ring-[#6C5CE7]/20 ${
                          field.state.meta.errors.length
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <span className="text-xs text-red-500 font-medium">
                        {getFieldError(field.state.meta.errors)}
                      </span>
                    )}
                  </Field>
                )}
              />

              <Field className="pt-4">
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isLoading}
                      className="w-full h-12 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD5] text-white font-semibold shadow-lg shadow-[#6C5CE7]/25 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  )}
                />
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-[#636E72] dark:text-[#9BA6B5]">
        Desenvolvido com <span className="text-red-500">&#10084;</span> por{" "}
        <span className="font-medium text-[#6C5CE7]">Guilherme Silveira</span>
      </p>
    </div>
  );
}
