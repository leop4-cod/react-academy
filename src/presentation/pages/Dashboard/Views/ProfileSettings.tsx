import { useState } from "react";
import { Loader2, User as UserIcon, Shield, Sparkles, Upload, Trash2 } from "lucide-react";
import { apiService } from "../../../../infrastructure/http/api-service";
import { useAuthStore } from "../../../store/auth.store";

export default function ProfileSettings() {
  const { user, token, updateUser } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const updated = await apiService.profile.update({
        first_name: firstName,
        last_name: lastName,
        bio: bio
      });
      updateUser(updated);
      setSuccess("¡Coordenadas de perfil actualizadas exitosamente!");
    } catch (err: any) {
      console.error("Fallo al actualizar perfil:", err);
      setError(
        err.response?.data?.detail || 
        "No se pudo guardar la información. Revisa los datos."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    setError("");
    setSuccess("");
    
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await apiService.profile.uploadAvatar(formData);
      updateUser(response);
      setSuccess("¡Avatar de perfil actualizado exitosamente!");
    } catch (err: any) {
      console.error("Error al subir avatar:", err);
      setError(
        err.response?.data?.avatar?.[0] || 
        "No se pudo subir la imagen de perfil. Revisa el formato."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setUploadLoading(true);
    setError("");
    setSuccess("");
    try {
      await apiService.profile.deleteAvatar();
      updateUser({ avatar: undefined, avatar_url: undefined });
      setSuccess("Se ha eliminado el avatar. Volviendo al icono base.");
    } catch (err: any) {
      console.error("Fallo al eliminar avatar:", err);
      setError(
        err.response?.data?.detail || 
        "No se pudo eliminar el avatar de perfil."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 fade-in font-mono text-cream">
      {/* Cabecera */}
      <div>
        <h1 className="font-grotesk text-3xl uppercase tracking-wider text-cream">
          CONFIGURACIÓN DEL NODO
        </h1>
        <p className="text-[10px] text-cream/50 uppercase tracking-widest">
          Modifica tus especificaciones académicas de acceso
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-xl uppercase">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-neon/10 border border-neon/30 text-neon text-xs px-4 py-3 rounded-xl uppercase">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Foto de Perfil */}
        <div className="md:col-span-1 space-y-4">
          <div className="liquid-glass rounded-2xl p-6 border border-white/5 text-center flex flex-col items-center">
            <h3 className="font-grotesk text-xs text-neon uppercase tracking-widest mb-4">
              Avatar de Perfil
            </h3>

            {/* Visualización del Avatar */}
            <div className="relative group w-28 h-28 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden mb-4 shadow-inner">
              {uploadLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-neon" />
              ) : user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 text-cream/35" />
              )}
            </div>

            {/* Acciones de Foto */}
            <div className="space-y-2 w-full">
              <label className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] uppercase font-grotesk tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="h-3.5 w-3.5" />
                Sube Foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadLoading}
                />
              </label>

              {user?.avatar && (
                <button
                  onClick={handleDeleteAvatar}
                  disabled={uploadLoading}
                  className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 text-red-400 rounded-xl text-[10px] uppercase font-grotesk tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar Foto
                </button>
              )}
            </div>

            {/* Metadatos adicionales */}
            <div className="mt-6 pt-6 border-t border-white/5 w-full text-left space-y-2 text-[9px] text-cream/50 uppercase font-mono">
              <div className="flex justify-between">
                <span>Rango:</span>
                <span className="text-neon">{user?.role === 'admin' ? 'ADMIN' : (user?.role === 'teacher' ? 'PROFESOR' : 'ESTUDIANTE')}</span>
              </div>
              <div className="flex justify-between">
                <span>Token:</span>
                <span className="truncate max-w-[120px] text-cream/70">
                  {token ? "Activo (JWT)" : "Ninguno"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Datos */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="liquid-glass rounded-3xl p-6 md:p-8 border border-white/5 space-y-6">
            <h3 className="font-grotesk text-sm text-cream uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
              <Shield className="h-4.5 w-4.5 text-neon" /> Detalles del Perfil Académico
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-cream/60">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Isaac"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-cream focus:outline-none focus:border-neon transition-all"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-cream/60">
                  Apellidos
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Newton"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-cream focus:outline-none focus:border-neon transition-all"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Biografía */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-cream/60">
                Firma / Biografía Académica
              </label>
              <textarea
                placeholder="Escribe tu trayectoria, intereses y código de especialización..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-cream focus:outline-none focus:border-neon h-28 uppercase resize-none leading-relaxed"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Correo (Deshabilitado) */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-cream/40">
                Correo Electrónico (No Modificable)
              </label>
              <input
                type="text"
                disabled
                className="w-full bg-white/[0.01] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-cream/50 cursor-not-allowed uppercase"
                value={user?.email || "correo@academia.com"}
              />
            </div>

            {/* Botón Guardar */}
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-neon text-[#010828] font-grotesk text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    GUARDAR CAMBIOS
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
