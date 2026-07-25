import { Link } from "react-router-dom";
import { ArrowLeft, Home as HomeIcon, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";

export default function NotFound() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-mono px-4 py-12 bg-[#02092c]">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#02092c] via-[#02092c]/80 to-[#02092c]/90 z-0" />

      {/* Card Container */}
      <div className="relative z-10 w-full max-w-[540px]">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center text-xs font-grotesk tracking-widest text-cream/60 hover:text-neon uppercase mb-6 transition-colors gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al Inicio
        </Link>

        <div className="liquid-glass rounded-[32px] p-8 sm:p-12 border border-white/10 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden">
          {/* Decorative badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-[10px] uppercase font-mono tracking-widest mb-6">
            <AlertCircle className="w-3.5 h-3.5" />
            Error 404
          </div>

          {/* Big 404 Number */}
          <h1 className="font-grotesk text-7xl sm:text-9xl font-extrabold tracking-widest text-cream leading-none select-none mb-2">
            4<span className="text-neon">0</span>4
          </h1>

          {/* Message */}
          <h2 className="font-grotesk text-lg sm:text-xl uppercase tracking-wider text-cream mt-2 mb-3">
            Página No Encontrada
          </h2>

          <p className="text-xs text-cream/60 uppercase tracking-widest leading-relaxed max-w-sm mx-auto mb-8 font-mono">
            La ruta que buscas no existe o fue movida. Verifica la URL o regresa al inicio.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 bg-neon text-[#02092c] hover:bg-neon/90 font-grotesk text-xs uppercase tracking-widest rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              Ir al Inicio
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-3 bg-white/5 border border-white/10 hover:border-neon text-cream hover:text-neon font-grotesk text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Panel de Control
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
