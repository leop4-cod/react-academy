import { BookOpen, Code2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCourses } from "../../../infrastructure/adapters/axios-course.repository";
import type { Course } from "../../../infrastructure/adapters/axios-course.repository";

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">LEOPOLDO PEREZ</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-50 opacity-50"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10 text-center fade-in">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              Domina el código, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                construye el futuro
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Aprende programación con proyectos reales, retroalimentación constante y una comunidad de desarrolladores impulsando tu carrera al siguiente nivel.
            </p>
            <div className="flex justify-center gap-4">
              <a href="#catalogo" className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium text-lg hover:bg-blue-700 hover:shadow-lg transition-all hover-scale">
                Explorar Cursos
              </a>
              <Link to="/login" className="bg-white text-slate-700 border border-slate-200 px-8 py-3 rounded-full font-medium text-lg hover:bg-slate-50 hover:border-slate-300 transition-all hover-scale shadow-sm">
                Acceso Estudiantes
              </Link>
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <section id="catalogo" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Catálogo de Cursos</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Diseñados por expertos en la industria para llevarte desde los fundamentos hasta el dominio absoluto.
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow hover-scale flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 overflow-hidden">
                      {course.thumbnail_url ? (
                         <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                         <Code2 className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                    <p className="text-slate-600 mb-6 flex-grow">{course.description || "Sin descripción"}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {course.level || "N/A"}
                      </span>
                      <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                        Ver Detalles &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-500">No hay cursos disponibles por el momento.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-bold text-slate-900">LEOPOLDO PEREZ</span>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} LEOPOLDO PEREZ. Todos los derechos reservados.
          </p>
          <p className="text-slate-400 text-xs mt-2 font-medium tracking-wide">
            Autor: LEOPOLDO PEREZ
          </p>
        </div>
      </footer>
    </div>
  );
}
