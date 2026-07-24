import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, Star, CheckCircle, Heart, User as UserIcon, X, MessageSquare, Award } from "lucide-react";
import { apiService } from "../../../../infrastructure/http/api-service";
import type { Course, Category, Review, Enrollment, Wishlist, User } from "../../../../infrastructure/http/api-service";

export default function CoursesExplorer() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modales
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseReviews, setCourseReviews] = useState<Review[]>([]);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [enrollSuccess, setEnrollSuccess] = useState("");
  
  // Reseñas
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allCourses, allCategories] = await Promise.all([
        apiService.courses.list(),
        apiService.categories.list(),
      ]);
      setCourses(allCourses);
      setCategories(allCategories);

      // Endpoints autenticados - se cargan independientemente
      try {
        const allEnrollments = await apiService.enrollments.list();
        setEnrollments(allEnrollments);
      } catch (e) {
        console.error("Fallo al cargar inscripciones:", e);
      }

      try {
        const allWishlist = await apiService.wishlist.list();
        setWishlist(allWishlist);
      } catch (e) {
        console.error("Fallo al cargar wishlist:", e);
      }

      try {
        const allUsers = await apiService.users.list();
        setUsers(allUsers);
      } catch {
        // Lista de usuarios solo disponible para admins
      }
    } catch (err) {
      console.error("Fallo al sincronizar datos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCatId === null || c.category === selectedCatId;
    return matchesSearch && matchesCategory;
  });

  const isEnrolled = (courseId: number) => {
    return enrollments.some((e) => {
      const cId = typeof e.course === 'object' ? (e.course as any)?.id : Number(e.course);
      return cId === Number(courseId);
    });
  };

  const getWishlistItem = (courseId: number) => {
    return wishlist.find((w) => w.course === courseId);
  };

  const getTeacherAvatar = (teacherId?: number) => {
    if (!teacherId) return null;
    const found = users.find((u) => u.id === teacherId);
    return found?.avatar || null;
  };

  const handleToggleWishlist = async (course: Course) => {
    const item = getWishlistItem(course.id);
    try {
      if (item) {
        await apiService.wishlist.destroy(item.id);
        setWishlist((prev) => prev.filter((w) => w.id !== item.id));
      } else {
        const added = await apiService.wishlist.create(course.id);
        setWishlist((prev) => [...prev, added]);
      }
    } catch (err) {
      console.error("Fallo en la acción de wishlist:", err);
    }
  };

  const handleEnroll = async (courseId: number) => {
    setEnrollLoading(true);
    setEnrollError("");
    setEnrollSuccess("");
    try {
      const enr = await apiService.enrollments.create(courseId);
      setEnrollments((prev) => [...prev, enr]);
      setEnrollSuccess("¡Inscripción realizada con éxito! Ya tienes acceso al aula.");
    } catch (err: any) {
      console.error("Inscripción fallida / Respuesta:", err?.response);

      if (err.response?.status === 401 || err.response?.data?.code === 'token_not_valid') {
        setEnrollError("Tu sesión ha expirado o el token no es válido. Por favor, vuelve a iniciar sesión para continuar.");
        return;
      }

      const rawData = err.response?.data;
      let errorMsg = "";
      if (typeof rawData === "string") {
        errorMsg = rawData;
      } else if (rawData?.mensaje) {
        errorMsg = rawData.mensaje;
      } else if (rawData?.detail) {
        errorMsg = typeof rawData.detail === "string" ? rawData.detail : rawData.detail?.detail || "Sin autorización";
      } else if (rawData?.message) {
        errorMsg = rawData.message;
      } else if (Array.isArray(rawData?.non_field_errors)) {
        errorMsg = rawData.non_field_errors.join(", ");
      } else if (Array.isArray(rawData?.course)) {
        errorMsg = rawData.course.join(", ");
      } else {
        errorMsg = "No se pudo procesar la solicitud de inscripción.";
      }

      const isAlreadyEnrolledError =
        err.response?.status === 400 ||
        err.response?.status === 409 ||
        /already|unique|único|inscrito|existe/i.test(errorMsg);

      if (isAlreadyEnrolledError) {
        const syntheticEnrollment: Enrollment = {
          id: Date.now(),
          course: courseId,
          student: 0,
          enrolled_at: new Date().toISOString(),
          is_completed: false
        };
        setEnrollments((prev) => {
          const exists = prev.some((e) => {
            const cId = typeof e.course === 'object' ? (e.course as any)?.id : Number(e.course);
            return cId === Number(courseId);
          });
          return exists ? prev : [...prev, syntheticEnrollment];
        });
        setEnrollSuccess("¡Ya te encuentras inscrito en este curso! Puedes acceder al aula.");
      } else {
        setEnrollError(errorMsg || "No se pudo completar la solicitud de inscripción.");
      }
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleOpenCourse = async (course: Course) => {
    setSelectedCourse(course);
    setIsReviewLoading(true);
    setNewComment("");
    setNewRating(5);
    setReviewError("");
    setEnrollError("");
    setEnrollSuccess("");
    try {
      const reviewsList = await apiService.reviews.list({ course: course.id });
      setCourseReviews(reviewsList);
    } catch (err) {
      console.error("Fallo al cargar reseñas:", err);
    } finally {
      setIsReviewLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setReviewError("");
    try {
      const added = await apiService.reviews.create({
        course: selectedCourse.id,
        rating: newRating,
        comment: newComment
      });
      setCourseReviews((prev) => [added, ...prev]);
      setNewComment("");
    } catch (err: any) {
      console.error("Fallo al crear reseña:", err);
      setReviewError(
        err.response?.data?.detail || 
        "No se pudo guardar la reseña. Asegúrate de estar inscrito."
      );
    }
  };

  return (
    <div className="space-y-6 fade-in font-mono">
      {/* Buscador */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-grotesk text-3xl uppercase tracking-wider text-cream">
            REPOSITORIO DE CURSOS
          </h1>
          <p className="text-[10px] text-cream/50 uppercase tracking-widest">
            Busca y conéctate a los túneles de conocimiento base
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cream/35">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar credenciales..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-cream placeholder-white/20 text-xs focus:outline-none focus:border-neon transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categorías */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar border-b border-white/5">
        <button
          onClick={() => setSelectedCatId(null)}
          className={`px-4 py-1.5 rounded-full text-[10px] font-grotesk tracking-wider uppercase border transition-all cursor-pointer ${
            selectedCatId === null
              ? "bg-neon text-[#010828] border-neon font-bold"
              : "bg-white/[0.03] text-cream/70 border-white/5 hover:border-white/20"
          }`}
        >
          Todas las categorías
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCatId(cat.id)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-grotesk tracking-wider uppercase border transition-all cursor-pointer whitespace-nowrap ${
              selectedCatId === cat.id
                ? "bg-neon text-[#010828] border-neon font-bold"
                : "bg-white/[0.03] text-cream/70 border-white/5 hover:border-white/20"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid de Cursos */}
      {isLoading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-neon" />
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const wishlisted = !!getWishlistItem(course.id);
            const teacherAvatar = getTeacherAvatar(course.teacher);
            
            return (
              <div
                key={course.id}
                className="liquid-glass rounded-[28px] p-5 border border-white/5 flex flex-col justify-between hover-scale"
              >
                <div>
                  {/* Imagen del Curso / Thumbnail */}
                  <div className="w-full h-40 rounded-[20px] bg-white/[0.02] border border-white/5 relative overflow-hidden flex items-center justify-center mb-4">
                    {course.thumbnail_url || course.thumbnail || course.image ? (
                      <img
                        src={course.thumbnail_url || course.thumbnail || course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Award className="h-8 w-8 text-neon/30 mx-auto mb-2" />
                        <span className="text-[9px] text-cream/40 uppercase tracking-widest">
                          PROTOCOLO BASE CODEACADEMY
                        </span>
                      </div>
                    )}

                    {/* Wishlist */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWishlist(course);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#02092c]/75 border border-white/10 flex items-center justify-center text-cream hover:text-neon transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`h-4 w-4 ${wishlisted ? "fill-neon text-neon" : "text-cream/70"}`}
                      />
                    </button>

                    {/* Nivel */}
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[8px] font-mono tracking-widest bg-[#02092c]/85 text-cream border border-white/10 rounded uppercase">
                      {course.level}
                    </span>
                  </div>

                  {/* Títulos e info */}
                  <h3 className="font-grotesk text-lg text-cream uppercase tracking-wider line-clamp-1 mb-1">
                    {course.title}
                  </h3>
                  
                  {/* Profesor con Foto */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                      {teacherAvatar ? (
                        <img src={teacherAvatar} alt={course.teacher_name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="h-3 w-3 text-cream/40" />
                      )}
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-cream/60 truncate max-w-[170px]">
                      {course.teacher_name || "Instructor CodeAcademy"}
                    </span>
                  </div>

                  <p className="text-[10px] text-cream/60 uppercase leading-normal line-clamp-3 mb-4">
                    {course.description}
                  </p>
                </div>

                {/* Pie de tarjeta */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs font-grotesk tracking-widest text-neon">
                    {course.price && parseFloat(course.price) > 0 ? `$${course.price}` : "GRATUITO"}
                  </span>

                  <button
                    onClick={() => handleOpenCourse(course)}
                    className="px-4 py-1.5 bg-white/5 border border-white/10 hover:border-neon hover:text-neon rounded-lg text-[10px] uppercase font-grotesk tracking-wider cursor-pointer transition-colors"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="liquid-glass rounded-[24px] p-12 text-center border border-white/5">
          <p className="text-sm text-cream/50 uppercase">No hay estructuras de conocimiento compiladas en los filtros.</p>
        </div>
      )}

      {/* Modal de Detalle de Cursos */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm">
          <div className="liquid-glass rounded-[32px] w-full max-w-[760px] max-h-[85vh] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Cabecera de Modal */}
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#02092c]/50">
              <span className="text-[10px] tracking-widest uppercase text-cream/50">
                Parámetros de Conexión del Curso
              </span>
              <button
                onClick={() => setSelectedCourse(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-cream/70 hover:text-cream cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-6 overflow-y-auto no-scrollbar flex-grow space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Imagen en modal */}
                <div className="md:col-span-1 h-36 md:h-full rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden flex items-center justify-center">
                  {selectedCourse.thumbnail_url || selectedCourse.thumbnail || selectedCourse.image ? (
                    <img
                      src={selectedCourse.thumbnail_url || selectedCourse.thumbnail || selectedCourse.image}
                      alt={selectedCourse.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Award className="h-12 w-12 text-neon/30" />
                  )}
                </div>

                {/* Resumen */}
                <div className="md:col-span-2 space-y-3">
                  <span className="inline-block px-2.5 py-0.5 text-[9px] font-mono tracking-widest bg-neon/10 border border-neon/30 text-neon rounded uppercase">
                    {selectedCourse.level}
                  </span>
                  <h2 className="font-grotesk text-2xl text-cream uppercase tracking-wider leading-tight">
                    {selectedCourse.title}
                  </h2>
                  
                  {/* Profesor con Foto en Modal */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                      {getTeacherAvatar(selectedCourse.teacher) ? (
                        <img src={getTeacherAvatar(selectedCourse.teacher)!} alt={selectedCourse.teacher_name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-cream/40" />
                      )}
                    </div>
                    <div className="text-[10px] text-cream/50 uppercase">
                      <span>Profesor: {selectedCourse.teacher_name || "Instructor CodeAcademy"}</span>
                      <span className="block mt-0.5">Acceso: {selectedCourse.price && parseFloat(selectedCourse.price) > 0 ? `$${selectedCourse.price}` : "Gratuito"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Directivas */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-grotesk uppercase tracking-wider text-neon">
                  Directivas Temáticas del Curso
                </h4>
                <p className="text-xs text-cream/80 uppercase leading-relaxed">
                  {selectedCourse.description}
                </p>
              </div>

              {/* Error / Éxito de Inscripción */}
              {enrollError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-2.5 rounded-xl uppercase font-mono">
                  {enrollError}
                </div>
              )}
              {enrollSuccess && (
                <div className="bg-neon/10 border border-neon/30 text-neon text-xs px-4 py-2.5 rounded-xl uppercase font-mono flex items-center justify-between gap-2">
                  <span>{enrollSuccess}</span>
                  <Link
                    to="/dashboard/learning"
                    state={{ selectedCourseId: selectedCourse.id }}
                    className="px-3.5 py-1.5 bg-neon text-[#010828] text-[10px] font-bold rounded-lg uppercase font-grotesk tracking-wider hover:scale-105 transition-all whitespace-nowrap"
                  >
                    Ir al Aula &rarr;
                  </Link>
                </div>
              )}

              {/* Botón de Inscripción */}
              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-xs uppercase text-cream/70 font-mono">
                  {isEnrolled(selectedCourse.id)
                    ? "Tu conexión a este túnel está activa y funcional."
                    : "Establece enlace de nodo para comenzar aprendizaje."}
                </span>

                {isEnrolled(selectedCourse.id) ? (
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs uppercase font-grotesk tracking-wider text-neon flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Aula Conectada
                    </span>
                    <Link
                      to="/dashboard/learning"
                      state={{ selectedCourseId: selectedCourse.id }}
                      className="px-4 py-2 bg-neon text-[#010828] rounded-xl text-xs font-bold font-grotesk tracking-wider uppercase hover:scale-105 transition-all"
                    >
                      Ir al Aula
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnroll(selectedCourse.id)}
                    disabled={enrollLoading}
                    className="px-5 py-2.5 bg-neon text-[#010828] text-xs uppercase font-grotesk tracking-wider font-bold rounded-xl hover:scale-105 hover:bg-neon/90 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {enrollLoading ? (
                      <Loader2 className="animate-spin h-3.5 w-3.5" />
                    ) : (
                      "INICIAR INSCRIPCIÓN"
                    )}
                  </button>
                )}
              </div>

              {/* Reseñas */}
              <div className="space-y-4 border-t border-white/5 pt-6">
                <h3 className="font-grotesk text-base uppercase tracking-wider text-cream flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-neon" /> Bitácora de Reseñas ({courseReviews.length})
                </h3>

                {isEnrolled(selectedCourse.id) ? (
                  <form onSubmit={handleSubmitReview} className="space-y-3 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                    <span className="text-[10px] text-cream/60 uppercase tracking-wider block">
                      Transmitir Señal de Calificación
                    </span>
                    
                    {reviewError && (
                      <div className="text-[10px] text-red-400 uppercase bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                        {reviewError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-cream/50 hover:text-neon cursor-pointer transition-colors"
                        >
                          <Star
                            className={`h-4.5 w-4.5 ${star <= newRating ? "text-neon fill-neon" : "text-cream/30"}`}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3 items-end">
                      <textarea
                        required
                        placeholder="Escribe comentarios de la clase..."
                        className="flex-grow bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream placeholder-white/20 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon h-16 uppercase resize-none"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-neon text-[#010828] font-grotesk text-[10px] uppercase font-bold tracking-wider rounded-xl hover:bg-neon/90 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Transmitir
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl text-[10px] uppercase text-cream/40 text-center">
                    Debes inscribirte al curso para enviar retroalimentación.
                  </div>
                )}

                {/* Listado de Reseñas */}
                {isReviewLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-neon" />
                  </div>
                ) : courseReviews.length > 0 ? (
                  <div className="space-y-3">
                    {courseReviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-grotesk uppercase text-cream/80">
                            {rev.student_name || `Explorador Ref #${rev.student}`}
                          </span>
                          <div className="flex text-neon">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < rev.rating ? "fill-neon text-neon" : "text-cream/20"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-cream/60 mt-1.5 uppercase leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[10px] text-cream/40 uppercase">
                    No se han registrado reportes de valoración aún.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
