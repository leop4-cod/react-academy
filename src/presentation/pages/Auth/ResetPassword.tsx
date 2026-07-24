import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, ArrowLeft, Lock, CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { axiosPublic } from "../../../infrastructure/http/axios-client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || searchParams.get("uidb64") || "";
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!uid || !token) {
      setError("Paramétros de verificación faltantes (uid o token). Solicita un nuevo enlace.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden. Por favor verifica.");
      return;
    }

    setIsLoading(true);

    try {
      await axiosPublic.post("/auth/password-reset-confirm/", {
        uid: uid,
        uidb64: uid,
        token: token,
        new_password: newPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Reset password confirm error details:", err);
      const serverMsg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.token?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.uidb64?.[0] ||
        "El enlace de recuperación es inválido o ha expirado. Solicita un nuevo enlace.";
      setError(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isLinkInvalid = !uid || !token;

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

      {/* Reset Card Panel */}
      <div className="relative z-10 w-full max-w-[460px]">
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-grotesk tracking-widest text-cream/60 hover:text-neon uppercase mb-6 transition-colors gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al Login
        </Link>

        {/* Form Container */}
        <div className="liquid-glass rounded-[32px] p-8 md:p-10 border border-white/5 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8 relative">
            <span className="font-condiment text-neon text-3xl absolute -top-5 right-2 -rotate-6 select-none">
              Nueva Llave
            </span>
            <h1 className="font-grotesk text-4xl uppercase tracking-wider text-cream">
              RESTABLECER
            </h1>
            <p className="text-[10px] text-cream/50 uppercase mt-2 tracking-widest">
              Establece tu nueva contraseña de acceso
            </p>
          </div>

          {isLinkInvalid && !isSuccess ? (
            <div className="text-center bg-red-500/10 border border-red-500/30 p-6 rounded-[20px] fade-in">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 text-red-400 mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-grotesk uppercase tracking-wider text-cream mb-2">
                ENLACE INÁLIDO
              </h3>
              <p className="text-xs text-cream/70 leading-relaxed uppercase mb-6">
                El enlace de recuperación no contiene los parámetros necesarios o se encuentra corrupto.
              </p>
              <Link
                to="/recover-password"
                className="inline-block w-full bg-neon text-[#010828] font-grotesk text-xs uppercase tracking-widest py-3 rounded-[14px] font-bold hover:bg-neon/90 transition-all text-center"
              >
                SOLICITAR NUEVO ENLACE
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="text-center bg-white/[0.02] border border-white/10 p-6 rounded-[20px] fade-in space-y-4">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-neon/10 border border-neon/30 text-neon mb-2">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-grotesk uppercase tracking-wider text-cream">
                LLAVE ACTUALIZADA
              </h3>
              <p className="text-xs text-cream/70 leading-relaxed uppercase">
                Tu contraseña ha sido restablecida exitosamente. Ya puedes ingresar con tu nueva llave.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-block w-full bg-neon text-[#010828] font-grotesk text-xs uppercase tracking-widest py-3.5 rounded-[14px] font-bold hover:bg-neon/90 hover:scale-[1.01] transition-all text-center"
                >
                  INICIAR SESIÓN AHORA
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-xl flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-cream/70 mb-2">
                    Nueva Llave de Acceso
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/40">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-white/[0.03] border border-white/10 rounded-[14px] text-cream placeholder-white/20 text-sm focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-cream/40 hover:text-cream/80 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-cream/70 mb-2">
                    Confirmar Nueva Llave
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/40">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-white/[0.03] border border-white/10 rounded-[14px] text-cream placeholder-white/20 text-sm focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-cream/40 hover:text-cream/80 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
                    "GUARDAR NUEVA CONTRASEÑA"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
