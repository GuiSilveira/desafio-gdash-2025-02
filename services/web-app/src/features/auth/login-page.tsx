import { LoginForm } from "@/components/auth/login-form";
import { CloudSun } from "lucide-react";

function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-6 md:p-10 bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-[#1E2A38] dark:via-[#243447] dark:to-[#1E2A38]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#6C5CE7]/5 dark:bg-[#6C5CE7]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-md flex-col gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#6C5CE7] to-[#a29bfe] shadow-lg shadow-[#6C5CE7]/25">
            <CloudSun className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#2D3436] dark:text-[#F7F9FC] tracking-tight">
              PokeNimbus
            </h1>
            <p className="text-sm text-[#636E72] dark:text-[#9BA6B5]">
              Dashboard Climático
            </p>
          </div>
        </div>

        {/* Form */}
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
