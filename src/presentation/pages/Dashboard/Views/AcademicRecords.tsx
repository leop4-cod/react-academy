import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Award, Download, Calendar, ShieldCheck, Trash2, ArrowRight } from "lucide-react";
import { apiService } from "../../../../infrastructure/http/api-service";
import type { Certificate, Wishlist, Enrollment } from "../../../../infrastructure/http/api-service";
import { useAuthStore } from "../../../store/auth.store";

export default function AcademicRecords() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"certificates" | "wishlist">("certificates");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reclamar
  const [claimCourseId, setClaimCourseId] = useState<string>("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState("");

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const [certList, wishList, enrollList, courseList] = await Promise.all([
        apiService.certificates.list(),
        apiService.wishlist.list(),
        apiService.enrollments.list(),
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

      const hydratedWishlist = wishList.map((w) => ({
        ...w,
        course_details: w.course_details || courseMap.get(w.course)
      }));

      setCertificates(hydratedCertificates);
      setWishlist(hydratedWishlist);
      setEnrollments(hydratedEnrollments);
    } catch (err) {
      console.error("Fallo al cargar registros académicos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleClaimCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimCourseId) return;
    setClaimLoading(true);
    setClaimError("");
    setClaimSuccess("");
    try {
      await apiService.certificates.create(parseInt(claimCourseId));
      await loadRecords();
      setClaimSuccess("¡Señal de graduación confirmada! Certificado registrado exitosamente.");
      setClaimCourseId("");
    } catch (err: any) {
      console.error("Fallo al reclamar certificado:", err);
      setClaimError(
        err.response?.data?.detail || 
        "No se pudo registrar el diploma. Es posible que ya exista registrado."
      );
    } finally {
      setClaimLoading(false);
    }
  };

  const handleRemoveWishlist = async (id: number) => {
    try {
      await apiService.wishlist.destroy(id);
      setWishlist((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error("Fallo al eliminar de wishlist:", err);
    }
  };

  const handlePrintCertificate = (cert: Certificate) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>DIPLOMA DE GRADUACIÓN: ${cert.course_title || "CURSO"}</title>
          <style>
            body {
              background-color: #010828;
              color: #EFF4FF;
              font-family: monospace;
              padding: 60px;
              text-align: center;
              border: 10px double #6FFF00;
            }
            .title {
              font-size: 36px;
              letter-spacing: 4px;
              color: #6FFF00;
              margin-bottom: 20px;
            }
            .subtitle {
              font-size: 16px;
              color: #EFF4FF;
              margin-bottom: 50px;
            }
            .content {
              font-size: 20px;
              line-height: 1.8;
              margin-bottom: 50px;
            }
            .footer {
              margin-top: 100px;
              font-size: 12px;
              color: rgba(239, 244, 255, 0.5);
            }
          </style>
        </head>
        <body>
          <div class="title">CODEACADEMY</div>
          <div class="subtitle">CERTIFICACIÓN ACADÉMICA DE COMPETENCIA</div>
          <div class="content">
            ESTE DOCUMENTO CERTIFICA QUE EL EXPLORADOR:<br/>
            <strong>${user?.first_name || "ESTUDIANTE"} ${user?.last_name || "CODEACADEMY"}</strong><br/><br/>
            HA COMPLETADO EXITOSAMENTE TODOS LOS PROTOCOLOS DE AULA PARA EL CURSO:<br/>
            <strong>${cert.course_title || `CURSO #${cert.course}`}</strong><br/><br/>
            EMITIDO EL DÍA: ${new Date(cert.issued_at).toLocaleDateString()}<br/>
            CÓDIGO DE SEÑAL SEGURO: CERT-${cert.id}-${cert.certificate_code}
          </div>
          <div class="footer">
            SISTEMA OPERATIVO COMPILADO AUTOMÁTICAMENTE &copy; CODEACADEMY.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in font-mono text-cream">
      {/* Título */}
      <div>
        <h1 className="font-grotesk text-3xl uppercase tracking-wider text-cream">
          REGISTROS ACADÉMICOS
        </h1>
        <p className="text-[10px] text-cream/50 uppercase tracking-widest">
          Administra tus certificados emitidos y tu lista de deseos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("certificates")}
          className={`px-5 py-2.5 rounded-xl text-xs uppercase font-grotesk tracking-wider border transition-all cursor-pointer ${
            activeTab === "certificates"
              ? "bg-neon text-[#010828] border-neon font-bold"
              : "bg-white/[0.02] border-white/5 text-cream/70 hover:border-white/20"
          }`}
        >
          Diplomas Emitidos
        </button>
        <button
          onClick={() => setActiveTab("wishlist")}
          className={`px-5 py-2.5 rounded-xl text-xs uppercase font-grotesk tracking-wider border transition-all cursor-pointer ${
            activeTab === "wishlist"
              ? "bg-neon text-[#010828] border-neon font-bold"
              : "bg-white/[0.02] border-white/5 text-cream/70 hover:border-white/20"
          }`}
        >
          Lista de Deseos
        </button>
      </div>

      {activeTab === "certificates" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lado izquierdo: Reclamar Certificados */}
          <div className="lg:col-span-1 space-y-4">
            <div className="liquid-glass rounded-2xl p-5 border border-white/5 space-y-4">
              <h3 className="font-grotesk text-xs text-neon uppercase tracking-widest flex items-center gap-2">
                <Award className="h-4.5 w-4.5" /> Reclamar Certificado
              </h3>
              <p className="text-[10px] text-cream/60 uppercase leading-relaxed">
                Si has completado las clases y aprobado los exámenes, selecciona el curso para reclamar tu diploma.
              </p>

              {claimError && (
                <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl uppercase">
                  {claimError}
                </div>
              )}

              {claimSuccess && (
                <div className="text-[10px] text-neon bg-neon/10 border border-neon/30 p-3 rounded-xl uppercase">
                  {claimSuccess}
                </div>
              )}

              <form onSubmit={handleClaimCertificate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] uppercase tracking-wider text-cream/50">
                    Seleccionar Aula Graduada
                  </label>
                  <select
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                    value={claimCourseId}
                    onChange={(e) => setClaimCourseId(e.target.value)}
                  >
                    <option value="" className="bg-[#02092c] text-cream/50">-- Selecciona Curso --</option>
                    {enrollments.map((enr) => (
                      <option key={enr.id} value={enr.course} className="bg-[#02092c] text-cream">
                        {enr.course_details?.title || `Curso #${enr.course}`}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={claimLoading || !claimCourseId}
                  className="w-full py-3 bg-neon text-[#010828] font-grotesk text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-40"
                >
                  {claimLoading ? "VERIFICANDO..." : "EMITIR DIPLOMA"}
                </button>
              </form>
            </div>
          </div>

          {/* Lado derecho: Certificados */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-grotesk text-sm uppercase tracking-wider text-cream/60">
              Tus Diplomas Registrados
            </h3>

            {certificates.length > 0 ? (
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="liquid-glass rounded-2xl p-5 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[8px] bg-neon/10 border border-neon/20 text-neon px-2.5 py-0.5 rounded uppercase font-bold">
                          <ShieldCheck className="h-3 w-3" /> Emitido y Seguro
                        </span>
                        <span className="text-[9px] text-cream/40 font-mono">
                          ID: CERT-{cert.id}
                        </span>
                      </div>
                      <h4 className="font-grotesk text-base uppercase text-cream tracking-wide">
                        {cert.course_title || `Diploma Curso #${cert.course}`}
                      </h4>
                      <div className="flex gap-4 text-[9px] text-cream/50 uppercase font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(cert.issued_at).toLocaleDateString()}
                        </span>
                        <span>Código: {cert.certificate_code}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePrintCertificate(cert)}
                      className="px-4 py-2 bg-white/5 hover:bg-neon hover:text-[#010828] border border-white/10 hover:border-neon rounded-xl flex items-center gap-2 text-xs uppercase font-grotesk tracking-wider cursor-pointer transition-all"
                    >
                      <Download className="h-3.5 w-3.5" /> Imprimir
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="liquid-glass rounded-2xl p-8 border border-white/5 text-center text-xs uppercase text-cream/40">
                No tienes certificados registrados en este nodo.
              </div>
            )}
          </div>
        </div>
      ) : (
        // Lista de Deseos (Wishlist)
        <div className="space-y-4">
          <h3 className="font-grotesk text-sm uppercase tracking-wider text-cream/60">
            Cursos Guardados en tu Radar
          </h3>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="liquid-glass rounded-[24px] p-5 border border-white/5 flex flex-col justify-between hover-scale"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 text-cream/60 uppercase rounded">
                        ID Curso: {item.course}
                      </span>
                      <button
                        onClick={() => handleRemoveWishlist(item.id)}
                        className="text-cream/40 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h4 className="font-grotesk text-lg uppercase text-cream tracking-wide mt-4 line-clamp-1">
                      {item.course_details?.title || `Curso Guardado #${item.course}`}
                    </h4>
                    <p className="text-[10px] text-cream/60 uppercase leading-normal mt-1 line-clamp-3">
                      {item.course_details?.description || "Los detalles de la lección están guardados en tu radar."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
                    <span className="text-xs font-grotesk text-neon">
                      {item.course_details?.price && parseFloat(item.course_details.price) > 0 
                        ? `$${item.course_details.price}` 
                        : "GRATIS"}
                    </span>

                    <Link
                      to="/dashboard/explorer"
                      className="px-4 py-2 bg-white/5 hover:border-neon rounded-xl flex items-center gap-1 text-[10px] uppercase font-grotesk tracking-wider transition-all"
                    >
                      Ver Canal <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="liquid-glass rounded-2xl p-12 border border-white/5 text-center text-xs uppercase text-cream/40">
              No has añadido cursos a tu radar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
