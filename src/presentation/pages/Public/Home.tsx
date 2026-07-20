import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Twitter, Github, ChevronRight, Loader2, BookOpen, User as UserIcon } from "lucide-react";
import { apiService } from "../../../infrastructure/http/api-service";
import type { Course, User } from "../../../infrastructure/http/api-service";
import { useAuthStore } from "../../store/auth.store";

// No public fallbacks - strictly database courses

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        let courseList: Course[] = [];
        try {
          courseList = await apiService.courses.list();
          setCourses(courseList);
        } catch (e) {
          console.error("Fallo al listar cursos:", e);
          setCourses([]);
        }

        try {
          const catList = await apiService.categories.list();
          setCategoriesCount(catList.length);
        } catch (e) {
          console.error("Fallo al listar categorías:", e);
        }

        try {
          const userList = await apiService.users.list();
          setUsers(userList);
        } catch (e) {
          console.warn("Fallo al listar usuarios (no autenticado):", e);
        }
      } catch (err) {
        console.error("Fallo al sincronizar datos iniciales:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Busca el avatar del profesor en la lista de usuarios
  const getTeacherAvatar = (teacherId?: number) => {
    if (!teacherId) return null;
    const found = users.find((u) => u.id === teacherId);
    return found?.avatar || null;
  };

  return (
    <div className="relative min-h-screen bg-[#02092c] text-cream overflow-hidden">
      {/* Texture Overlay */}
      <div className="texture-overlay" />

      {/* SECCIÓN 1: HERO (Pantalla Completa) */}
      <section className="relative w-full min-h-screen flex flex-col justify-between rounded-b-[32px] overflow-hidden z-10">
        {/* Video de fondo */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4"
        />
        
        {/* Capa de transparencia azul oscura */}
        <div className="absolute inset-0 bg-[#02092c]/55 z-0" />

        {/* Encabezado superior y Navegación */}
        <header className="relative z-10 w-full max-w-[1831px] mx-auto px-4 md:px-8 lg:px-12 pt-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="font-grotesk text-base tracking-widest hover:text-neon transition-colors uppercase">
            CODEACADEMY
          </Link>

          {/* Navegación con efecto de vidrio líquido */}
          <nav className="hidden lg:block liquid-glass rounded-[28px] px-[52px] py-[24px]">
            <ul className="flex gap-[40px] items-center">
              <li>
                <a href="#" className="font-grotesk text-[13px] tracking-widest text-cream uppercase hover:text-neon transition-all">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#courses" className="font-grotesk text-[13px] tracking-widest text-cream uppercase hover:text-neon transition-all">
                  Cursos
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="font-grotesk text-[13px] tracking-widest text-cream uppercase hover:text-neon transition-all">
                  Panel
                </Link>
              </li>
              <li>
                <a href="#about" className="font-grotesk text-[13px] tracking-widest text-cream uppercase hover:text-neon transition-all">
                  Nosotros
                </a>
              </li>
              <li>
                <a href="#cta" className="font-grotesk text-[13px] tracking-widest text-cream uppercase hover:text-neon transition-all">
                  Señales
                </a>
              </li>
            </ul>
          </nav>

          {/* Acceso de Usuarios */}
          <div>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="font-grotesk text-sm uppercase tracking-widest text-cream hover:text-neon transition-all"
            >
              {isAuthenticated ? "PANEL DE CONTROL" : "ACCEDER"}
            </Link>
          </div>
        </header>

        {/* Contenido del Hero */}
        <div className="relative z-10 w-full max-w-[1831px] mx-auto px-4 md:px-8 lg:px-12 flex-grow flex items-center">
          <div className="relative max-w-[820px] lg:ml-32 select-none">
            {/* Título en Anton */}
            <h1 className="font-grotesk text-4xl sm:text-6xl md:text-[75px] lg:text-[90px] leading-[1.05] md:leading-[1] uppercase tracking-wider text-cream">
              MÁS ALLÁ DEL<br />
              CÓDIGO Y SUS<br />
              LÍMITES
            </h1>
          </div>
        </div>

        {/* Stack de redes sociales en Escritorio */}
        <div className="hidden lg:flex absolute right-12 top-1/3 flex-col gap-4 z-20">
          <a
            href="mailto:codeacademy.noreply1@gmail.com"
            className="w-[56px] h-[56px] flex items-center justify-center liquid-glass rounded-[1rem] hover:bg-white/10 transition-colors"
          >
            <Mail className="h-5 w-5 text-cream" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="w-[56px] h-[56px] flex items-center justify-center liquid-glass rounded-[1rem] hover:bg-white/10 transition-colors"
          >
            <Twitter className="h-5 w-5 text-cream" />
          </a>
          <a
            href="https://github.com/leop4-cod/react-academy"
            target="_blank"
            rel="noreferrer"
            className="w-[56px] h-[56px] flex items-center justify-center liquid-glass rounded-[1rem] hover:bg-white/10 transition-colors"
          >
            <Github className="h-5 w-5 text-cream" />
          </a>
        </div>

        {/* Stack de redes sociales en Móvil */}
        <div className="flex lg:hidden justify-center gap-6 pb-12 relative z-20">
          <a
            href="mailto:codeacademy.noreply1@gmail.com"
            className="w-[48px] h-[48px] flex items-center justify-center liquid-glass rounded-[1rem] hover:bg-white/10 transition-colors"
          >
            <Mail className="h-4 w-4 text-cream" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="w-[48px] h-[48px] flex items-center justify-center liquid-glass rounded-[1rem] hover:bg-white/10 transition-colors"
          >
            <Twitter className="h-4 w-4 text-cream" />
          </a>
          <a
            href="https://github.com/leop4-cod/react-academy"
            target="_blank"
            rel="noreferrer"
            className="w-[48px] h-[48px] flex items-center justify-center liquid-glass rounded-[1rem] hover:bg-white/10 transition-colors"
          >
            <Github className="h-4 w-4 text-cream" />
          </a>
        </div>
      </section>

      {/* SECCIÓN 2: NOSOTROS / INTRODUCCIÓN */}
      <section id="about" className="relative w-full min-h-screen flex flex-col justify-center py-16 md:py-24 z-10">
        {/* Video de fondo */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_151551_992053d1-3d3e-4b8c-abac-45f22158f411.mp4"
        />
        {/* Capa de transparencia */}
        <div className="absolute inset-0 bg-[#02092c]/70 z-0" />

        <div className="relative z-10 w-full max-w-[1831px] mx-auto px-4 md:px-8 lg:px-12">
          {/* Fila superior: Título a la izquierda, Descripción a la derecha */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 lg:mb-32">
            <div className="select-none">
              <h2 className="font-grotesk text-[38px] sm:text-[50px] lg:text-[60px] leading-[1] uppercase tracking-wider text-cream">
                BIENVENIDO A<br />
                CODEACADEMY
              </h2>
              <p className="text-xs font-mono text-neon uppercase tracking-widest mt-2">
                Academia de Desarrollo Web & Programación
              </p>
            </div>

            <div className="max-w-[266px]">
              <p className="font-mono text-xs sm:text-sm uppercase tracking-wider leading-relaxed text-cream select-none">
                UN CAMPUS DIGITAL DISEÑADO PARA POTENCIAR TU APRENDIZAJE EN LÓGICA, DESARROLLO Y DISEÑO.
              </p>
            </div>
          </div>

          {/* Fila inferior: Columnas de datos reales de base de datos */}
          <div className="flex justify-between items-start pt-12 border-t border-white/5">
            {/* Columna izquierda */}
            <div className="flex flex-col gap-6 max-w-sm">
              <p className="font-mono text-xs uppercase tracking-wider text-cream/70 leading-relaxed">
                ENSEÑAMOS TECNOLOGÍAS DIGITALES MODERNAS. YA SEAS PROFESOR O ESTUDIANTE, NUESTRA PLATAFORMA ESTÁ DISEÑADA PARA EXPANDIR TUS HABILIDADES.
              </p>
              <p className="font-mono text-xs uppercase tracking-wider text-cream/70 leading-relaxed">
                POTENCIA TU PERFIL CREANDO Y COMPLETANDO CURSOS CONECTADOS EN TIEMPO REAL.
              </p>
            </div>

            {/* Columna derecha */}
            <div className="hidden lg:flex flex-col gap-6 max-w-sm">
              <p className="font-mono text-xs uppercase tracking-wider text-cream/70 leading-relaxed">
                RUTAS DE APRENDIZAJE: {categoriesCount > 0 ? categoriesCount : 4} CATEGORÍAS ACADÉMICAS DISPONIBLES.
              </p>
              <p className="font-mono text-xs uppercase tracking-wider text-cream/70 leading-relaxed">
                CERTIFICADOS DE FINALIZACIÓN EMITIDOS AL COMPLETAR CADA CURSO EN CODEACADEMY.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: CATÁLOGO DE CURSOS */}
      <section id="courses" className="relative w-full py-20 bg-[#02092c] z-10 border-t border-b border-white/5">
        <div className="w-full max-w-[1831px] mx-auto px-4 md:px-8 lg:px-12">
          {/* Fila superior de título */}
          <div className="flex justify-between items-end gap-6 mb-16">
            <div>
              <h2 className="font-grotesk text-3xl sm:text-5xl lg:text-[60px] leading-[1.05] uppercase tracking-wider text-cream">
                EXPLORA NUESTROS<br />
                <span className="text-neon">CURSOS</span> DESTACADOS
              </h2>
            </div>

            {/* Botón Ver Todos */}
            <Link to="/login" className="group flex flex-col items-start focus:outline-none">
              <div className="flex items-center gap-3">
                <span className="font-grotesk text-2xl sm:text-4xl lg:text-[60px] uppercase text-cream leading-none">
                  VER
                </span>
                <span className="flex flex-col font-grotesk text-[10px] sm:text-xs tracking-widest text-cream/70 uppercase leading-tight justify-center">
                  <span>TODOS LOS</span>
                  <span>CURSOS</span>
                </span>
              </div>
              <div className="h-[4px] sm:h-[6px] lg:h-[8px] bg-neon w-full mt-2 transition-transform duration-300 group-hover:scale-x-110 origin-left" />
            </Link>
          </div>

          {/* Cargador de Cursos */}
          {isLoading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-neon" />
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const teacherAvatar = getTeacherAvatar(course.teacher);
                
                return (
                  <div
                    key={course.id}
                    className="liquid-glass rounded-[32px] p-[18px] border border-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between hover-scale"
                  >
                    {/* Bloque multimedia (Foto/Video) */}
                    <div className="relative w-full pb-[100%] rounded-[24px] overflow-hidden bg-[#02092c] mb-6">
                      
                      {/* Si el curso tiene foto/thumbnail la mostramos; si no, un gradiente oscuro y limpio */}
                      {course.thumbnail_url || course.thumbnail || course.image ? (
                        <img
                          src={course.thumbnail_url || course.thumbnail || course.image}
                          alt={course.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f5e]/30 to-[#02092c]/90 border border-white/5 flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-neon/30" />
                        </div>
                      )}
                      
                      {/* Capa gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#02092c]/95 via-transparent to-[#02092c]/30 z-10" />

                      {/* Detalles del curso sobre la foto/video */}
                      <div className="absolute inset-x-5 bottom-6 z-20">
                        <div className="flex justify-between items-center mb-3">
                          <span className="inline-block px-2.5 py-1 text-[9px] font-mono tracking-widest bg-neon/10 border border-neon/30 text-neon rounded-full uppercase">
                            {course.level || "CORE BASE"}
                          </span>
                        </div>
                        <h3 className="font-grotesk text-xl sm:text-2xl uppercase tracking-wider text-cream leading-tight mb-2">
                          {course.title}
                        </h3>
                        <p className="font-mono text-[10px] text-cream/70 leading-normal uppercase line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    {/* Fila de metadatos inferior */}
                    <div className="liquid-glass rounded-[20px] px-5 py-4 border border-white/5 flex items-center justify-between">
                      {/* Profesor info (con foto si existe) */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                          {teacherAvatar ? (
                            <img src={teacherAvatar} alt={course.teacher_name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="h-4 w-4 text-cream/40" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-cream/50 uppercase tracking-widest">
                            Profesor
                          </span>
                          <span className="text-[10px] font-grotesk tracking-wide text-cream uppercase mt-0.5 max-w-[110px] truncate">
                            {course.teacher_name || "Instructor CodeAcademy"}
                          </span>
                        </div>
                      </div>

                      {/* Precio y Botón */}
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] text-cream/50 uppercase tracking-widest">
                            Precio
                          </span>
                          <span className="text-xs font-grotesk text-neon uppercase mt-0.5">
                            {course.price && parseFloat(course.price) > 0 ? `$${course.price}` : "Gratis"}
                          </span>
                        </div>
                        
                        <Link
                          to={`/login`}
                          className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-[#b724ff] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-purple-500/35 hover:scale-110 active:scale-95 transition-all"
                        >
                          <ChevronRight className="h-4.5 w-4.5 text-cream" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="liquid-glass rounded-[24px] p-12 text-center border border-white/5">
              <p className="text-sm text-cream/50 uppercase">No hay cursos registrados en la academia actualmente.</p>
              {isAuthenticated ? (
                <Link
                  to="/dashboard/management"
                  className="inline-block mt-4 px-5 py-2.5 bg-neon text-[#010828] text-xs font-grotesk font-bold uppercase tracking-wider rounded-xl hover:bg-neon/90 hover:scale-105 transition-all"
                >
                  Ir a Consola CRUD para Agregar
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-block mt-4 px-5 py-2.5 bg-neon text-[#010828] text-xs font-grotesk font-bold uppercase tracking-wider rounded-xl hover:bg-neon/90 hover:scale-105 transition-all"
                >
                  Iniciar Sesión para Agregar
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN 4: CTA / REGÍSTRATE */}
      <section id="cta" className="relative w-full z-10 bg-[#02092c] overflow-hidden">
        {/* Video de fondo */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto block opacity-85 z-0"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055729_72d66327-b59e-4ae9-bb70-de6ccb5ecdb0.mp4"
        />

        {/* Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02092c] via-transparent to-transparent z-10" />

        {/* Contenido alineado a la derecha */}
        <div className="absolute inset-0 z-20 flex items-center justify-end px-4 md:px-8 lg:px-12 lg:pr-[20%] lg:pl-[15%] select-none">
          <div className="text-right max-w-xl">
            {/* Título */}
            <h2 className="font-grotesk text-lg sm:text-4xl lg:text-[60px] leading-[1.05] uppercase tracking-wider text-cream">
              <span className="block mb-4 sm:mb-8 text-neon">ÚNETE A NOSOTROS.</span>
              APRENDE A TU RITMO.<br />
              DESARROLLA TU FUTURO.<br />
              IMPULSA TU CARRERA.
            </h2>
          </div>
        </div>

        {/* Enlace a redes sociales abajo a la izquierda */}
        <div className="absolute left-[8%] bottom-[8%] sm:bottom-[12%] lg:bottom-[15%] z-20 flex flex-col">
          <div className="liquid-glass rounded-[0.5rem] sm:rounded-[1.25rem] border border-white/5 flex flex-col overflow-hidden">
            <a
              href="mailto:codeacademy.noreply1@gmail.com"
              className="w-[12vw] sm:w-[14.375rem] md:w-[10.78125rem] lg:w-[16.77rem] h-[12vw] sm:h-[4.5rem] flex items-center justify-center border-b border-white/10 hover:bg-white/10 transition-all text-cream hover:text-neon"
            >
              <Mail className="h-[4vw] sm:h-5 w-[4vw] sm:w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-[12vw] sm:w-[14.375rem] md:w-[10.78125rem] lg:w-[16.77rem] h-[12vw] sm:h-[4.5rem] flex items-center justify-center border-b border-white/10 hover:bg-white/10 transition-all text-cream hover:text-neon"
            >
              <Twitter className="h-[4vw] sm:h-5 w-[4vw] sm:w-5" />
            </a>
            <a
              href="https://github.com/leop4-cod/react-academy"
              target="_blank"
              rel="noreferrer"
              className="w-[12vw] sm:w-[14.375rem] md:w-[10.78125rem] lg:w-[16.77rem] h-[12vw] sm:h-[4.5rem] flex items-center justify-center hover:bg-white/10 transition-all text-cream hover:text-neon"
            >
              <Github className="h-[4vw] sm:h-5 w-[4vw] sm:w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full py-12 bg-[#02092c] border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-4 text-cream/50 text-[10px] sm:text-xs tracking-widest uppercase">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-neon" />
            <span className="font-grotesk text-sm text-cream tracking-widest">CODEACADEMY</span>
          </div>
          &copy; {new Date().getFullYear()} CODEACADEMY. TODOS LOS DERECHOS RESERVADOS.
        </div>
      </footer>
    </div>
  );
}
