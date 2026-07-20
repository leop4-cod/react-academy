import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, User, Mail, Lock } from "lucide-react";
import { axiosClient } from "../../../infrastructure/http/axios-client";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const nameParts = name.trim().split(" ");
      const first_name = nameParts[0] || "";
      const last_name = nameParts.slice(1).join(" ") || "";
      
      await axiosClient.post("/auth/register/", {
        email,
        password,
        first_name,
        last_name,
        is_teacher: role === "teacher",
        is_student: role === "student",
      });
      navigate("/login");
    } catch (err: any) {
      console.error("Register error details:", err);
      const errorMsg = 
        err.response?.data?.email?.[0] || 
        err.response?.data?.detail || 
        err.response?.data?.non_field_errors?.[0] ||
        "Ocurrió un error al registrarse. Verifica tus coordenadas.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-mono px-4 py-12">
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

      {/* Registration Card Panel */}
      <div className="relative z-10 w-full max-w-[480px]">
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
          <div className="text-center mb-8 relative">
            <span className="font-condiment text-neon text-3xl absolute -top-5 right-2 -rotate-6 select-none">
              Registro
            </span>
            <h1 className="font-grotesk text-4xl uppercase tracking-wider text-cream">
              NUEVO RECLUTA
            </h1>
            <p className="text-[10px] text-cream/50 uppercase mt-2 tracking-widest">
              Establece tus coordenadas de aprendizaje
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-cream/70 mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/40">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="ej. Isaac Newton"
                  className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-[14px] text-cream placeholder-white/20 text-sm focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
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
                  placeholder="recluta@codeacademy.edu"
                  className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-[14px] text-cream placeholder-white/20 text-sm focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-cream/70 mb-2">
                Llave Secreta de Acceso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-[14px] text-cream placeholder-white/20 text-sm focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-cream/70 mb-2">
                Verificar Llave Secreta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-[14px] text-cream placeholder-white/20 text-sm focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Rol de Acceso */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-cream/70 mb-2">
                Rol de Acceso Académico
              </label>
              <select
                className="w-full px-4 py-2.5 bg-[#02092c] border border-white/10 rounded-[14px] text-cream text-sm focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">ESTUDIANTE</option>
                <option value="teacher">PROFESOR / MAESTRO</option>
              </select>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 bg-white/5 border border-white/10 rounded accent-neon cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="ml-2.5 text-[10px] text-cream/60 uppercase tracking-wider cursor-pointer hover:text-cream select-none transition-colors"
              >
                Acepto los protocolos de la academia
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
                "COMPLETAR REGISTRO"
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-xs text-cream/60 uppercase tracking-wider">
              ¿Ya estás registrado?{" "}
              <Link
                to="/login"
                className="text-neon hover:underline font-bold transition-colors"
              >
                Acceder a la Cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
