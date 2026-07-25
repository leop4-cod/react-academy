import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Award, Download, Calendar, ShieldCheck, Trash2, ArrowRight, X } from "lucide-react";
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

  const [activeCertRender, setActiveCertRender] = useState<Certificate | null>(null);

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
    setActiveCertRender(cert);
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
          LISTA DE DESEOS
        </h1>
        <p className="text-[10px] text-cream/50 uppercase tracking-widest">
          Cursos Guardados en tu Radar
        </p>
      </div>

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
    </div>
  );
}
