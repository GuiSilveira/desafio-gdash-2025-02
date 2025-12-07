import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Shield, Clock, Hash } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getInitials } from "@/utils/format";

export function AccountPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-[#636E72] dark:text-[#9BA6B5]">
          Carregando informações da conta...
        </p>
      </div>
    );
  }

  const initials = getInitials(user.name || user.email);

  const createdDate = user.iat
    ? format(new Date(user.iat * 1000), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    : "N/A";

  const expirationDate = user.exp
    ? format(new Date(user.exp * 1000), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      })
    : "N/A";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-[#6C5CE7]/10 dark:bg-[#6C5CE7]/20">
          <User className="w-6 h-6 text-[#6C5CE7]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2D3436] dark:text-[#F7F9FC] tracking-tight">
            Minha Conta
          </h1>
          <p className="text-[#636E72] dark:text-[#9BA6B5]">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>
      </div>

      <Card className="rounded-3xl shadow-[0px_8px_24px_rgba(45,52,54,0.04)] border border-slate-200 dark:border-[#3E4C5E] dark:bg-[#2C3A4B] dark:shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/30">
              <User className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-[#2D3436] dark:text-[#F7F9FC]">
                Perfil
              </CardTitle>
              <CardDescription className="text-[#636E72] dark:text-[#9BA6B5]">
                Suas informações pessoais
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 rounded-2xl shadow-lg shadow-[#6C5CE7]/20">
              <AvatarFallback className="rounded-2xl text-2xl font-bold bg-linear-to-br from-[#6C5CE7] to-[#a29bfe] text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#2D3436] dark:text-[#F7F9FC]">
                {user.name || "Usuário"}
              </h3>
              <p className="text-sm text-[#636E72] dark:text-[#9BA6B5]">
                {user.email}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 border-0 font-medium gap-1.5 px-3 py-1 rounded-lg">
                  <Shield className="h-3.5 w-3.5" />
                  Usuário Ativo
                </Badge>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-[#3E4C5E]" />

          <div className="grid gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2A38] transition-colors">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6C5CE7]/10 dark:bg-[#6C5CE7]/20">
                <User className="h-5 w-5 text-[#6C5CE7]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2D3436] dark:text-[#F7F9FC]">
                  Nome Completo
                </p>
                <p className="text-sm text-[#636E72] dark:text-[#9BA6B5]">
                  {user.name || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2A38] transition-colors">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/30">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2D3436] dark:text-[#F7F9FC]">
                  Email
                </p>
                <p className="text-sm text-[#636E72] dark:text-[#9BA6B5]">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2A38] transition-colors">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/30">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2D3436] dark:text-[#F7F9FC]">
                  Membro desde
                </p>
                <p className="text-sm text-[#636E72] dark:text-[#9BA6B5]">
                  {createdDate}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-[0px_8px_24px_rgba(45,52,54,0.04)] border border-slate-200 dark:border-[#3E4C5E] dark:bg-[#2C3A4B] dark:shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-[#2D3436] dark:text-[#F7F9FC]">
                Informações da Sessão
              </CardTitle>
              <CardDescription className="text-[#636E72] dark:text-[#9BA6B5]">
                Detalhes técnicos da sua sessão atual
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2A38]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
                  <Hash className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
                <span className="text-sm font-medium text-[#636E72] dark:text-[#9BA6B5]">
                  ID do Usuário
                </span>
              </div>
              <span className="font-mono text-sm text-[#2D3436] dark:text-[#F7F9FC] bg-slate-100 dark:bg-[#3E4C5E] px-3 py-1.5 rounded-lg">
                {user.sub}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#1E2A38]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/30">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <span className="text-sm font-medium text-[#636E72] dark:text-[#9BA6B5]">
                  Token expira em
                </span>
              </div>
              <span className="text-sm font-medium text-[#2D3436] dark:text-[#F7F9FC]">
                {expirationDate}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
