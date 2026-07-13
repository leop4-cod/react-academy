import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Loader2, ArrowLeft, MailCheck } from "lucide-react";
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
      setError(err.response?.data?.email?.[0] || "Ocurrió un error al enviar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans fade-in">
      {/* Centro - Formulario Simple */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 items-center">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          {/* Elemento de diseño superior */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

          <div className="mb-8">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Login
            </Link>
          </div>
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recuperar Contraseña</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-xs">
              Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
            </p>
          </div>

          {!isSent ? (
            <div className="w-full">
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Correo electrónico registrado
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
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    "Enviar enlace de recuperación"
                  )}
                </button>
              </div>
            </form>
            </div>
          ) : (
            <div className="text-center fade-in bg-green-50 p-6 rounded-xl border border-green-100">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <MailCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-green-800 mb-2">¡Correo enviado!</h3>
              <p className="text-sm text-green-700">
                Hemos enviado un enlace de recuperación a tu bandeja de entrada. Por favor, revisa también tu carpeta de spam.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
