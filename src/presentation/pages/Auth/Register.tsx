import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Loader2, ArrowLeft } from "lucide-react";
import { axiosClient } from "../../../infrastructure/http/axios-client";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      const nameParts = name.split(" ");
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(" ");
      
      await axiosClient.post("/auth/register/", {
        email,
        password,
        first_name,
        last_name,
      });
      navigate("/login");
    } catch (err: any) {
      const errorMsg = err.response?.data?.email?.[0] || err.response?.data?.detail || "Ocurrió un error al registrarse.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans fade-in">
      {/* Columna Izquierda - Formulario */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
          
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">CodeAcademy</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
              Crea tu cuenta
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Nombre completo
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="Ej. Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="estudiante@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
                  Confirmar Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                  Acepto los <a href="#" className="text-blue-600 hover:underline">términos y condiciones</a>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    "Completar registro"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Imagen/Decoración */}
      <div className="hidden lg:block relative w-0 flex-1 bg-slate-900">
        <div className="absolute inset-0 h-full w-full object-cover bg-gradient-to-tr from-blue-900 via-indigo-900 to-black overflow-hidden flex items-center justify-center">
            <div className="absolute w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl top-0 left-0"></div>
            <div className="absolute w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl bottom-0 right-0"></div>
            
            <div className="relative z-10 max-w-lg px-8 text-center text-white">
              <h2 className="text-3xl font-bold mb-6">Únete a la comunidad de desarrolladores</h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Potencia tu carrera, aprende con proyectos del mundo real y conéctate con miles de estudiantes alrededor del mundo.
              </p>
              
              <div className="mt-10 grid grid-cols-1 gap-4 text-left">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm flex items-center gap-4">
                      <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg text-white">Acceso Inmediato</div>
                        <div className="text-sm text-slate-300">A todo el catálogo de cursos base</div>
                      </div>
                  </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
