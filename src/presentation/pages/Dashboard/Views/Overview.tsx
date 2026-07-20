import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, BookOpen, MessageSquare, Bell, Play, CheckCircle, Loader2 } from "lucide-react";
import { apiService } from "../../../../infrastructure/http/api-service";
import type { Enrollment, Certificate, Notification } from "../../../../infrastructure/http/api-service";
import { useAuthStore } from "../../../store/auth.store";

export default function Overview() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverviewData = async () => {
    try {
      const [enrollList, certList, notifList, courseList] = await Promise.all([
        apiService.enrollments.list(),
        apiService.certificates.list(),
        apiService.notifications.list(),
        apiService.courses.list()
      ]);
      const courseMap = new Map(courseList.map((c) => [c.id, c]));

      const hydratedEnrollments = enrollList.map((e) => ({
        ...e,
        course_details: e.course_details || courseMap.get(e.course)
      }));

      const hydratedCertificates = certList.map((cert) => ({
        ...cert,
        course_title: cert.course_title || courseMap.get(cert.course)?.title || `CURSO #${cert.course}`
      }));

      setEnrollments(hydratedEnrollments);
      setCertificates(hydratedCertificates);
      setNotifications(notifList);
    } catch (err) {
      console.error("Fallo al cargar datos de estadísticas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await apiService.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Fallo al marcar notificación como leída:", err);
    }
  };

  // Mock de porcentaje para visualización correcta
  const mockProgressPercentage = (enrollmentId: number) => {
    return (enrollmentId % 4) * 25 || 10;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoaderSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Banner de Bienvenida */}
      <div className="liquid-glass rounded-[24px] p-6 md:p-8 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-grotesk text-3xl sm:text-4xl uppercase tracking-wider text-cream">
            BIENVENIDO, {user?.first_name || "EXPLORADOR"}
          </h1>
          <p className="text-xs text-cream/60 uppercase mt-2 tracking-wider">
            Sector: Panel Académico / ID de Nodo: {user?.id}
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/dashboard/explorer"
            className="px-5 py-2.5 bg-neon text-[#010828] text-xs font-grotesk tracking-wider uppercase rounded-xl hover:scale-105 hover:bg-neon/90 transition-all font-bold"
          >
            Explorar Catálogo
          </Link>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inscritos */}
        <div className="liquid-glass rounded-[20px] p-5 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center text-neon">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-cream/50 uppercase tracking-widest">Inscritos</div>
            <div className="text-2xl font-grotesk text-cream mt-0.5">{enrollments.length}</div>
          </div>
        </div>

        {/* Certificados */}
        <div className="liquid-glass rounded-[20px] p-5 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-cream/50 uppercase tracking-widest">Diplomas</div>
            <div className="text-2xl font-grotesk text-cream mt-0.5">{certificates.length}</div>
          </div>
        </div>

        {/* Debates/Foros */}
        <div className="liquid-glass rounded-[20px] p-5 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-cream/50 uppercase tracking-widest">Debates</div>
            <div className="text-2xl font-grotesk text-cream mt-0.5">Activos</div>
          </div>
        </div>

        {/* Alertas */}
        <div className="liquid-glass rounded-[20px] p-5 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-cream/50 uppercase tracking-widest">Pendientes</div>
            <div className="text-2xl font-grotesk text-cream mt-0.5">
              {notifications.filter((n) => !n.read).length}
            </div>
          </div>
        </div>
      </div>

      {/* Cuerpo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inscripciones Activas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-grotesk text-xl uppercase tracking-wider text-cream">
              Protocolos de Acceso Activos
            </h2>
            <Link
              to="/dashboard/learning"
              className="text-[10px] text-neon uppercase tracking-widest hover:underline"
            >
              Sala de Aprendizaje
            </Link>
          </div>

          {enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollments.map((enr) => {
                const prog = mockProgressPercentage(enr.id);
                return (
                  <div
                    key={enr.id}
                    className="liquid-glass rounded-[20px] p-5 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-cream/60 uppercase">
                          ID: {enr.course}
                        </span>
                        {prog === 100 && (
                          <span className="flex items-center gap-1 text-[9px] text-neon uppercase font-bold">
                            <CheckCircle className="h-3 w-3" /> Completado
                          </span>
                        )}
                      </div>
                      <h3 className="font-grotesk text-lg text-cream uppercase tracking-wider">
                        {enr.course_details?.title || `REFERENCIA DE CURSO #${enr.course}`}
                      </h3>
                      
                      {/* Barra de Progreso */}
                      <div className="space-y-1 max-w-[280px]">
                        <div className="flex justify-between text-[9px] text-cream/50 uppercase">
                          <span>Progreso</span>
                          <span>{prog}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-neon h-full rounded-full transition-all duration-500"
                            style={{ width: `${prog}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/dashboard/learning"
                      state={{ selectedCourseId: enr.course }}
                      className="px-4 py-2 bg-white/5 hover:bg-neon hover:text-[#010828] border border-white/10 hover:border-neon rounded-xl flex items-center gap-2 text-xs uppercase font-grotesk tracking-wider transition-all"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Continuar
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="liquid-glass rounded-[20px] p-8 border border-white/5 text-center">
              <p className="text-sm text-cream/50 uppercase">No tienes accesos activos a aulas.</p>
              <Link
                to="/dashboard/explorer"
                className="inline-block mt-4 text-xs font-grotesk text-neon uppercase tracking-wider hover:underline"
              >
                Explorar catálogo para conectarse &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Panel de Comunicaciones/Alertas */}
        <div className="space-y-6">
          <h2 className="font-grotesk text-xl uppercase tracking-wider text-cream">
            Seguridad y Alertas
          </h2>

          <div className="liquid-glass rounded-[24px] p-5 border border-white/5 space-y-4 max-h-[460px] overflow-y-auto no-scrollbar">
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      notif.read
                        ? "bg-transparent border-white/5 opacity-55"
                        : "bg-white/[0.02] border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-mono uppercase text-neon tracking-widest">
                        {notif.read ? "Señal Registrada" : "Alerta Activa"}
                      </span>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-[9px] text-cream/50 hover:text-neon uppercase tracking-widest cursor-pointer"
                        >
                          Confirmar
                        </button>
                      )}
                    </div>
                    <h4 className="font-grotesk text-xs uppercase text-cream tracking-wider mt-1">
                      {notif.title}
                    </h4>
                    <p className="text-[10px] text-cream/70 mt-1 uppercase leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-cream/40 uppercase">
                Canales de comunicación en silencio.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoaderSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-neon" />
      <span className="text-[10px] uppercase tracking-widest text-cream/40">Sincronizando datos de nodo...</span>
    </div>
  );
}
