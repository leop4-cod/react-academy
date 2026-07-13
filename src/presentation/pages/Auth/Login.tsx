import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Loader2, ArrowLeft } from "lucide-react";
import { axiosClient } from "../../../infrastructure/http/axios-client";
import { useAuthStore } from "../../store/auth.store";

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
      // El backend de SimpleJWT suele devolver { access, refresh }
      const token = response.data.access;
      setAuth(token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Credenciales inválidas. Inténtalo de nuevo.");
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
              Inicia sesión
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/recover-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
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
                    "Ingresar a la plataforma"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Imagen/Decoración */}
      <div className="hidden lg:block relative w-0 flex-1 bg-slate-900">
        <div className="absolute inset-0 h-full w-full object-cover bg-gradient-to-br from-blue-900 via-slate-900 to-black overflow-hidden flex items-center justify-center">
            {/* Elemento de diseño abstracto simulando código/tecnología */}
            <div className="absolute w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -top-48 -right-48"></div>
            <div className="absolute w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl bottom-0 left-0"></div>
            
            <div className="relative z-10 max-w-lg px-8 text-center text-white">
              <h2 className="text-3xl font-bold mb-6">Tu viaje al dominio del código comienza aquí</h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Accede a tu panel, retoma tus cursos y continúa construyendo tu portafolio profesional con la guía de expertos.
              </p>
              
              <div className="mt-10 grid grid-cols-2 gap-4 text-left">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="font-bold text-2xl text-blue-400 mb-1">+50</div>
                      <div className="text-sm text-slate-300">Cursos disponibles</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="font-bold text-2xl text-purple-400 mb-1">10k</div>
                      <div className="text-sm text-slate-300">Estudiantes activos</div>
                  </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
