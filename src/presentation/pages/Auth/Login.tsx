import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Mail, Lock } from "lucide-react";
import { axiosClient } from "../../../infrastructure/http/axios-client";
import { useAuthStore } from "../../store/auth.store";
import { apiService } from "../../../infrastructure/http/api-service";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axiosClient.post("/auth/login/", {
        email,
        password,
      });
      const token = response.data.access || response.data.token;
      
      setAuth(token);
      
      const profile = await apiService.profile.get();
      setAuth(token, profile);
      
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error details:", err);
      setError(
        err.response?.data?.detail || 
        err.response?.data?.non_field_errors?.[0] ||
        "Credenciales inválidas. Por favor, verifica tu correo y contraseña."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-mono px-4">
      {/* Texture Overlay */}
      <div className="texture-overlay" />

      {/* Looping space video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4"
      />

      {/* Deep dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#02092c] via-[#02092c]/60 to-[#02092c]/80 z-0" />

      {/* Login Card Panel */}
      <div className="relative z-10 w-full max-w-[460px]">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center text-xs font-grotesk tracking-widest text-cream/60 hover:text-neon uppercase mb-6 transition-colors gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al Inicio
        </Link>

        {/* Form Container */}
        <div className="liquid-glass rounded-[32px] p-8 md:p-10 border border-white/5 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-grotesk text-4xl uppercase tracking-wider text-cream">
              CODEACADEMY
            </h1>
            <p className="text-xs text-neon uppercase mt-2 tracking-widest font-mono">
              Iniciar Sesión
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-cream/70 mb-2">
                Coordenadas de Correo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/40">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="nombre@dominio.com"
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-[14px] text-cream placeholder-white/20 text-sm focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] uppercase tracking-wider text-cream/70">
                  Contraseña
                </label>
                <Link
                  to="/recover-password"
                  className="text-[10px] text-cream/50 hover:text-neon transition-colors uppercase tracking-wider"
                >
                  ¿La olvidaste?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-[14px] text-cream placeholder-white/20 text-sm focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 bg-white/5 border border-white/10 rounded accent-neon cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2.5 text-[11px] text-cream/60 uppercase tracking-wider cursor-pointer hover:text-cream select-none transition-colors"
              >
                Mantener conexión activa
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-neon text-[#010828] font-grotesk text-sm uppercase tracking-widest py-3.5 rounded-[14px] hover:bg-neon/90 hover:scale-[1.01] transition-all cursor-pointer font-bold disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-[#010828]" />
              ) : (
                "INICIAR SESIÓN"
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-xs text-cream/60 uppercase tracking-wider">
              ¿Nuevo explorador?{" "}
              <Link
                to="/register"
                className="text-neon hover:underline font-bold transition-colors"
              >
                Crear Cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
