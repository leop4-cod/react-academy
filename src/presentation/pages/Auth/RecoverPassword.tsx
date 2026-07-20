import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, Mail, MailCheck } from "lucide-react";
import { axiosClient } from "../../../infrastructure/http/axios-client";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await axiosClient.post("/auth/password-reset/", { email });
      setIsSent(true);
    } catch (err: any) {
      console.error("Recover password error details:", err);
      setError(
        err.response?.data?.email?.[0] || 
        err.response?.data?.detail || 
        err.response?.data?.non_field_errors?.[0] ||
        "Ocurrió un error. Por favor, verifica tus coordenadas de correo."
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

      {/* Recover Card Panel */}
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
              Recuperar
            </span>
            <h1 className="font-grotesk text-4xl uppercase tracking-wider text-cream">
              RESETEAR ACCESO
            </h1>
            <p className="text-[10px] text-cream/50 uppercase mt-2 tracking-widest">
              Transmite coordenadas para reestablecer la llave
            </p>
          </div>

          {!isSent ? (
            <div className="w-full">
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-cream/70 mb-2">
                    Coordenadas de Correo Registrado
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/40">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="coordenadas@codeacademy.edu"
                      className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-[14px] text-cream placeholder-white/20 text-sm focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
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
                    "TRANSMITIR SEÑAL DE RECUPERACIÓN"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center bg-white/[0.02] border border-white/10 p-6 rounded-[20px] fade-in">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-neon/10 border border-neon/30 text-neon mb-4">
                <MailCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-grotesk uppercase tracking-wider text-cream mb-2">
                SEÑAL TRANSMITIDA
              </h3>
              <p className="text-xs text-cream/70 leading-relaxed uppercase">
                Se ha enviado una señal de restablecimiento de contraseña a tu correo. Revisa tu carpeta de spam si no llega pronto.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
