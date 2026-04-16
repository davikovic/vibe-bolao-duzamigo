"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { registerUser } from "@/app/actions/register";
import { toast } from "sonner";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else {
      toast.success(result.message || "Conta criada com sucesso!");
      // Tentar logar automaticamente ou redirecionar
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-2">
            <Sparkles className="size-8 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Crie sua Conta</h1>
          <p className="text-gray-400 font-medium">Junte-se à elite dos palpites da Copa.</p>
        </div>

        <div className="bg-[#121212] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Como quer ser chamado?"
                required
                className="h-12 bg-black/40 border-white/5 focus:border-yellow-500/50 rounded-xl text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu-email@exemplo.com"
                required
                className="h-12 bg-black/40 border-white/5 focus:border-yellow-500/50 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    required
                    className="h-12 bg-black/40 border-white/5 focus:border-yellow-500/50 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Confirmar</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  required
                  className="h-12 bg-black/40 border-white/5 focus:border-yellow-500/50 rounded-xl text-white"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-sm font-black uppercase tracking-widest bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black shadow-[0_10px_20px_rgba(234,179,8,0.2)] rounded-xl mt-4" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Finalizar Cadastro"}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="size-3" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
