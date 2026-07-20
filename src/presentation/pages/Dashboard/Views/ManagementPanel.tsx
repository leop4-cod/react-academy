import { useEffect, useState } from "react";
import { Loader2, Plus, Edit2, Trash2, BookOpen, Layers, Tag as TagIcon, Users, CheckSquare, Upload, Play, User as UserIcon } from "lucide-react";
import { apiService } from "../../../../infrastructure/http/api-service";
import type { Course, Lesson, Category, Subcategory, Tag, Quiz, User } from "../../../../infrastructure/http/api-service";

type ActiveTab = "courses" | "lessons" | "quizzes" | "categories" | "subcategories" | "tags" | "users";

export default function ManagementPanel() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getUserRole = (u: User) => {
    if (u.email === 'admin@codeacademy.com') return 'admin';
    if (u.is_teacher) return 'teacher';
    return 'student';
  };

  // Modales y formularios de edición
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [coursePrice, setCoursePrice] = useState("0.00");
  const [courseLevel, setCourseLevel] = useState("beginner");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseSubcategory, setCourseSubcategory] = useState("");
  const [courseTeacher, setCourseTeacher] = useState("");
  const [courseTags, setCourseTags] = useState<number[]>([]);
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [courseSaveLoading, setCourseSaveLoading] = useState(false);
  const [courseError, setCourseError] = useState("");

  // Lecciones modal
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState(15);
  const [lessonOrder, setLessonOrder] = useState(1);
  const [lessonCourseId, setLessonCourseId] = useState("");
  const [lessonSaveLoading, setLessonSaveLoading] = useState(false);

  // CRUD simple de Categorías/Etiquetas/Exámenes
  const [simpleModalOpen, setSimpleModalOpen] = useState(false);
  const [simpleModalType, setSimpleModalType] = useState<"category" | "subcategory" | "tag" | "quiz" | null>(null);
  const [simpleName, setSimpleName] = useState("");
  const [simpleDesc, setSimpleDesc] = useState("");
  const [simplePassingScore, setSimplePassingScore] = useState(70);
  const [simpleParentId, setSimpleParentId] = useState("");
  const [simpleCourseId, setSimpleCourseId] = useState("");
  const [simpleSaveLoading, setSimpleSaveLoading] = useState(false);

  const syncData = async () => {
    setIsLoading(true);
    try {
      const [
        courseList, lessonList, quizList, catList, subcatList, tagList, userList
      ] = await Promise.all([
        apiService.courses.list(),
        apiService.lessons.list(),
        apiService.quizzes.list(),
        apiService.categories.list(),
        apiService.subcategories.list(),
        apiService.tags.list(),
        apiService.users.list()
      ]);
      setCourses(courseList);
      setLessons(lessonList);
      setQuizzes(quizList);
      setCategories(catList);
      setSubcategories(subcatList);
      setTags(tagList);
      setUsers(userList);
    } catch (err) {
      console.error("Fallo de sincronización administrativa:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  // --- CRUD DE CURSOS ---
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseTitle("");
    setCourseDescription("");
    setCoursePrice("0.00");
    setCourseLevel("beginner");
    setCourseCategory(categories[0]?.id.toString() || "");
    setCourseSubcategory(subcategories[0]?.id.toString() || "");
    setCourseTeacher(users[0]?.id.toString() || "");
    setCourseTags([]);
    setCourseImageFile(null);
    setCourseError("");
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseTitle(course.title);
    setCourseDescription(course.description);
    setCoursePrice(course.price);
    setCourseLevel(course.level);
    setCourseCategory(course.category?.toString() || "");
    setCourseSubcategory(course.subcategory?.toString() || "");
    setCourseTeacher(course.teacher?.toString() || "");
    setCourseTags(course.tags || []);
    setCourseImageFile(null);
    setCourseError("");
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseSaveLoading(true);
    setCourseError("");
    try {
      const payload: Partial<Course> = {
        title: courseTitle,
        description: courseDescription,
        price: coursePrice,
        level: courseLevel,
        category: courseCategory ? parseInt(courseCategory) : undefined,
        subcategory: courseSubcategory ? parseInt(courseSubcategory) : undefined,
        teacher: courseTeacher ? parseInt(courseTeacher) : undefined,
        tags: courseTags
      };

      let savedCourse: Course;
      if (editingCourse) {
        savedCourse = await apiService.courses.update(editingCourse.id, payload);
      } else {
        savedCourse = await apiService.courses.create(payload);
      }

      // Si hay un archivo seleccionado, subirlo con las claves soportadas por la API
      if (courseImageFile) {
        const formData = new FormData();
        formData.append("image", courseImageFile);
        formData.append("thumbnail", courseImageFile);
        formData.append("file", courseImageFile);
        await apiService.courses.uploadImage(savedCourse.id, formData);
      }

      setCourseModalOpen(false);
      await syncData();
    } catch (err: any) {
      console.error("Fallo al guardar curso:", err);
      const errorDetail =
        err.response?.data?.detail ||
        err.response?.data?.image?.[0] ||
        err.response?.data?.thumbnail?.[0] ||
        "No se pudo guardar la información o la foto del curso. Revisa los datos.";
      setCourseError(errorDetail);
    } finally {
      setCourseSaveLoading(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este curso y todos sus componentes?")) return;
    try {
      await apiService.courses.destroy(id);
      await syncData();
    } catch (err) {
      console.error("Error al eliminar curso:", err);
    }
  };

  // --- CRUD DE LECCIONES ---
  const handleOpenAddLesson = () => {
    setEditingLesson(null);
    setLessonTitle("");
    setLessonDescription("");
    setLessonVideoUrl("");
    setLessonDuration(15);
    setLessonOrder(lessons.length + 1);
    setLessonCourseId(courses[0]?.id.toString() || "");
    setLessonModalOpen(true);
  };

  const handleOpenEditLesson = (les: Lesson) => {
    setEditingLesson(les);
    setLessonTitle(les.title);
    setLessonDescription(les.description || "");
    setLessonVideoUrl(les.video_url || "");
    setLessonDuration(les.duration_minutes || 15);
    setLessonOrder(les.order);
    setLessonCourseId(les.course.toString());
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setLessonSaveLoading(true);
    try {
      const payload: Partial<Lesson> = {
        title: lessonTitle,
        description: lessonDescription,
        video_url: lessonVideoUrl || undefined,
        duration_minutes: lessonDuration,
        order: lessonOrder,
        course: parseInt(lessonCourseId)
      };

      if (editingLesson) {
        await apiService.lessons.update(editingLesson.id, payload);
      } else {
        await apiService.lessons.create(payload);
      }
      setLessonModalOpen(false);
      await syncData();
    } catch (err) {
      console.error("Error al guardar clase:", err);
    } finally {
      setLessonSaveLoading(false);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm("¿Deseas purgar esta lección del servidor?")) return;
    try {
      await apiService.lessons.destroy(id);
      await syncData();
    } catch (err) {
      console.error("Error al eliminar lección:", err);
    }
  };

  // --- CRUD SIMPLE (Categorías, Subcategorías, Etiquetas, Evaluaciones) ---
  const handleOpenAddSimple = (type: "category" | "subcategory" | "tag" | "quiz") => {
    setSimpleModalType(type);
    setSimpleName("");
    setSimpleDesc("");
    setSimplePassingScore(70);
    setSimpleParentId(categories[0]?.id.toString() || "");
    setSimpleCourseId(courses[0]?.id.toString() || "");
    setSimpleModalOpen(true);
  };

  const handleSaveSimple = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimpleSaveLoading(true);
    try {
      if (simpleModalType === "category") {
        await apiService.categories.create({
          name: simpleName,
          description: simpleDesc,
          slug: simpleName.toLowerCase().replace(/\s+/g, "-")
        });
      } else if (simpleModalType === "subcategory") {
        await apiService.subcategories.create({
          name: simpleName,
          description: simpleDesc,
          category: parseInt(simpleParentId),
          slug: simpleName.toLowerCase().replace(/\s+/g, "-")
        });
      } else if (simpleModalType === "tag") {
        await apiService.tags.create({
          name: simpleName,
          slug: simpleName.toLowerCase().replace(/\s+/g, "-")
        });
      } else if (simpleModalType === "quiz") {
        await apiService.quizzes.create({
          title: simpleName,
          description: simpleDesc,
          passing_score: simplePassingScore,
          course: parseInt(simpleCourseId)
        });
      }
      setSimpleModalOpen(false);
      await syncData();
    } catch (err) {
      console.error("Fallo al guardar entidad:", err);
    } finally {
      setSimpleSaveLoading(false);
    }
  };

  const handleDeleteSimple = async (id: number, type: "category" | "subcategory" | "tag" | "quiz") => {
    if (!confirm(`¿Eliminar permanentemente este registro de ${type}?`)) return;
    try {
      if (type === "category") await apiService.categories.destroy(id);
      if (type === "subcategory") await apiService.subcategories.destroy(id);
      if (type === "tag") await apiService.tags.destroy(id);
      if (type === "quiz") await apiService.quizzes.destroy(id);
      await syncData();
    } catch (err) {
      console.error("Error al borrar registro:", err);
    }
  };

  // --- FILTROS DE ROL ---
  const handleRoleChange = async (userId: number, currentRole: string) => {
    if (currentRole === "admin") {
      alert("El rol de Administrador Principal no puede ser modificado.");
      return;
    }
    const nextRole = currentRole === "student" ? "teacher" : "student";
    if (!confirm(`¿Cambiar rol del usuario a ${nextRole.toUpperCase()}?`)) return;
    try {
      await apiService.users.updateRole(userId, nextRole);
      await syncData();
    } catch (err) {
      console.error("Fallo al cambiar rol:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-neon" />
      </div>
    );
  }

  const tabs = [
    { id: "courses", label: "Cursos", icon: BookOpen, count: courses.length },
    { id: "lessons", label: "Clases", icon: Play, count: lessons.length },
    { id: "quizzes", label: "Evaluaciones", icon: CheckSquare, count: quizzes.length },
    { id: "categories", label: "Categorías", icon: Layers, count: categories.length },
    { id: "subcategories", label: "Subcategorías", icon: Layers, count: subcategories.length },
    { id: "tags", label: "Etiquetas", icon: TagIcon, count: tags.length },
    { id: "users", label: "Usuarios", icon: Users, count: users.length }
  ];

  return (
    <div className="space-y-6 fade-in font-mono text-cream">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-grotesk text-3xl uppercase tracking-wider text-cream">
            CONSOLA DE ADMINISTRACIÓN
          </h1>
          <p className="text-[10px] text-cream/50 uppercase tracking-widest">
            Control maestro de bases de datos para cursos y usuarios
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-wrap gap-2">
          {activeTab === "courses" && (
            <button
              onClick={handleOpenAddCourse}
              className="px-4 py-2 bg-neon text-[#010828] text-xs font-grotesk font-bold uppercase tracking-wider rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Crear Curso
            </button>
          )}
          {activeTab === "lessons" && (
            <button
              onClick={handleOpenAddLesson}
              className="px-4 py-2 bg-neon text-[#010828] text-xs font-grotesk font-bold uppercase tracking-wider rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Añadir Clase
            </button>
          )}
          {["quizzes", "categories", "subcategories", "tags"].includes(activeTab) && (
            <button
              onClick={() => handleOpenAddSimple(activeTab.slice(0, -1) as any)}
              className="px-4 py-2 bg-neon text-[#010828] text-xs font-grotesk font-bold uppercase tracking-wider rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Agregar {activeTab.slice(0, -1).toUpperCase()}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-white/5">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as ActiveTab)}
              className={`px-4 py-2 rounded-xl text-[10px] uppercase font-grotesk tracking-widest border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                active
                  ? "bg-neon text-[#010828] border-neon font-bold"
                  : "bg-white/[0.02] border-white/5 text-cream/70 hover:border-white/20"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label} ({t.count})
            </button>
          );
        })}
      </div>

      {/* CONTENIDO DE TAB: CURSOS */}
      {activeTab === "courses" && (
        <div className="liquid-glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream/80 uppercase">
              <thead className="bg-white/[0.02] text-[10px] text-neon border-b border-white/5">
                <tr>
                  <th className="p-4">Imagen</th>
                  <th className="p-4">Título</th>
                  <th className="p-4">Nivel</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4">Profesor</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-white/[0.01]">
                    <td className="p-4">
                      <div className="w-12 h-10 rounded bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center">
                        {course.thumbnail_url || course.thumbnail || course.image ? (
                          <img src={course.thumbnail_url || course.thumbnail || course.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[7px] text-cream/30">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-cream truncate max-w-xs">{course.title}</td>
                    <td className="p-4">{course.level}</td>
                    <td className="p-4 text-neon">${course.price}</td>
                    <td className="p-4">{course.teacher_name || "Instructor CodeAcademy"}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditCourse(course)}
                        className="p-1 bg-white/5 hover:bg-neon hover:text-[#010828] border border-white/10 rounded cursor-pointer transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENIDO DE TAB: CLASES */}
      {activeTab === "lessons" && (
        <div className="liquid-glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream/80 uppercase">
              <thead className="bg-white/[0.02] text-[10px] text-neon border-b border-white/5">
                <tr>
                  <th className="p-4">Orden</th>
                  <th className="p-4">Título</th>
                  <th className="p-4">Curso ID</th>
                  <th className="p-4">Duración</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lessons.map((les) => (
                  <tr key={les.id} className="hover:bg-white/[0.01]">
                    <td className="p-4 font-bold">{les.order}</td>
                    <td className="p-4 text-cream truncate max-w-xs">{les.title}</td>
                    <td className="p-4">C-{les.course}</td>
                    <td className="p-4">{les.duration_minutes || 15} Min</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditLesson(les)}
                        className="p-1 bg-white/5 hover:bg-neon hover:text-[#010828] border border-white/10 rounded cursor-pointer transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(les.id)}
                        className="p-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENIDO DE TAB: EVALUACIONES */}
      {activeTab === "quizzes" && (
        <div className="liquid-glass rounded-2xl border border-white/5 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((q) => (
            <div key={q.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-grotesk text-xs uppercase text-cream tracking-wide">{q.title}</h4>
                <div className="text-[9px] text-cream/50 mt-1 uppercase font-mono">
                  <span>Curso ID: C-{q.course}</span> &bull; <span>Aprobación: {q.passing_score}%</span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteSimple(q.id, "quiz")}
                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded cursor-pointer transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB GENERAL SIMPLE (CATEGORÍAS / SUB / ETIQUETAS) */}
      {["categories", "subcategories", "tags"].includes(activeTab) && (
        <div className="liquid-glass rounded-2xl border border-white/5 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTab === "categories" && categories.map((c) => (
            <div key={c.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-grotesk text-xs uppercase text-cream tracking-wide">{c.name}</h4>
                <span className="text-[9px] text-cream/40 font-mono">SLUG: {c.slug}</span>
              </div>
              <button
                onClick={() => handleDeleteSimple(c.id, "category")}
                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {activeTab === "subcategories" && subcategories.map((s) => (
            <div key={s.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-grotesk text-xs uppercase text-cream tracking-wide">{s.name}</h4>
                <span className="text-[9px] text-cream/40 font-mono">Padre ID: {s.category}</span>
              </div>
              <button
                onClick={() => handleDeleteSimple(s.id, "subcategory")}
                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {activeTab === "tags" && tags.map((t) => (
            <div key={t.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-grotesk text-xs uppercase text-cream tracking-wide">{t.name}</h4>
                <span className="text-[9px] text-cream/40 font-mono">SLUG: {t.slug}</span>
              </div>
              <button
                onClick={() => handleDeleteSimple(t.id, "tag")}
                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CONTENIDO DE TAB: USUARIOS */}
      {activeTab === "users" && (
        <div className="liquid-glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream/80 uppercase">
              <thead className="bg-white/[0.02] text-[10px] text-neon border-b border-white/5">
                <tr>
                  <th className="p-4">Avatar</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Correo</th>
                  <th className="p-4">Rol Activo</th>
                  <th className="p-4 text-right">Promover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.01]">
                    <td className="p-4">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="h-4.5 w-4.5 text-cream/40" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-cream">{user.first_name} {user.last_name}</td>
                    <td className="p-4 font-mono">{user.email}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 text-[8px] bg-neon/10 border border-neon/30 text-neon rounded font-bold">
                        {getUserRole(user)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRoleChange(user.id, getUserRole(user))}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 hover:border-neon hover:text-neon rounded text-[9px] uppercase font-grotesk tracking-wider cursor-pointer"
                      >
                        Rotar Rol
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL CURSO (AGREGAR/EDITAR) --- */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm">
          <form onSubmit={handleSaveCourse} className="liquid-glass rounded-[32px] w-full max-w-[560px] border border-white/10 p-6 md:p-8 space-y-5 animate-in fade-in zoom-in duration-200">
            <h3 className="font-grotesk text-base text-cream uppercase tracking-widest pb-3 border-b border-white/5">
              {editingCourse ? "Editar Parámetros de Curso" : "Compilar Nuevo Curso"}
            </h3>

            {courseError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-2.5 rounded-xl uppercase font-mono">
                {courseError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-cream/60">Título</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Curso de C++"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-cream/60">Precio ($)</label>
                <input
                  type="text"
                  required
                  placeholder="29.99"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon"
                  value={coursePrice}
                  onChange={(e) => setCoursePrice(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-cream/60">Descripción</label>
              <textarea
                required
                placeholder="Detalles sobre las competencias y temario..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon h-20 uppercase resize-none"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-cream/60">Nivel</label>
                <select
                  className="w-full bg-[#02092c] border border-white/10 rounded-xl px-2 py-2 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                  value={courseLevel}
                  onChange={(e) => setCourseLevel(e.target.value)}
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-cream/60">Profesor</label>
                <select
                  className="w-full bg-[#02092c] border border-white/10 rounded-xl px-2 py-2 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                  value={courseTeacher}
                  onChange={(e) => setCourseTeacher(e.target.value)}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-cream/60">Categoría</label>
                <select
                  className="w-full bg-[#02092c] border border-white/10 rounded-xl px-2 py-2 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sube Foto de Curso */}
            <div className="space-y-1.5 border-t border-white/5 pt-4">
              <label className="block text-[9px] uppercase tracking-wider text-neon flex items-center gap-1">
                <Upload className="h-3 w-3" /> Foto del Curso / Thumbnail
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="course-image-upload"
                  onChange={(e) => setCourseImageFile(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="course-image-upload"
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:border-neon text-[10px] uppercase font-grotesk tracking-wider rounded-xl cursor-pointer transition-colors whitespace-nowrap"
                >
                  Seleccionar Imagen
                </label>
                <span className="text-[10px] text-cream/50 truncate uppercase">
                  {courseImageFile ? courseImageFile.name : "Sin imagen seleccionada (se usará el loop de video)"}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCourseModalOpen(false)}
                className="px-4 py-2 border border-white/10 text-cream/70 text-xs font-grotesk uppercase rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={courseSaveLoading}
                className="px-5 py-2 bg-neon text-[#010828] text-xs font-bold font-grotesk uppercase rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {courseSaveLoading && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL CLASE --- */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm">
          <form onSubmit={handleSaveLesson} className="liquid-glass rounded-[32px] w-full max-w-[500px] border border-white/10 p-6 md:p-8 space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="font-grotesk text-base text-cream uppercase tracking-widest pb-3 border-b border-white/5">
              {editingLesson ? "Editar Parámetros de Clase" : "Compilar Nueva Clase"}
            </h3>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-cream/60">Título de la Clase</label>
              <input
                type="text"
                required
                placeholder="ej. Componentes Funcionales"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-cream/60">Descripción de la Clase</label>
              <textarea
                required
                placeholder="Detalle de temas..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon h-20 uppercase resize-none"
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-cream/60">Curso Destino</label>
                <select
                  className="w-full bg-[#02092c] border border-white/10 rounded-xl px-2 py-2 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                  value={lessonCourseId}
                  onChange={(e) => setLessonCourseId(e.target.value)}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-cream/60">Orden</label>
                <input
                  type="number"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon"
                  value={lessonOrder}
                  onChange={(e) => setLessonOrder(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-cream/60">Duración (Min)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-cream/60">URL del Video (Opcional)</label>
              <input
                type="text"
                placeholder="https://servidor.mp4"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon"
                value={lessonVideoUrl}
                onChange={(e) => setLessonVideoUrl(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="px-4 py-2 border border-white/10 text-cream/70 text-xs font-grotesk uppercase rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={lessonSaveLoading}
                className="px-5 py-2 bg-neon text-[#010828] text-xs font-bold font-grotesk uppercase rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {lessonSaveLoading && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL SIMPLE (GENÉRICO) --- */}
      {simpleModalOpen && simpleModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm">
          <form onSubmit={handleSaveSimple} className="liquid-glass rounded-[32px] w-full max-w-[460px] border border-white/10 p-6 md:p-8 space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="font-grotesk text-base text-cream uppercase tracking-widest pb-3 border-b border-white/5">
              Compilar {simpleModalType.toUpperCase()}
            </h3>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-cream/60">Nombre / Título</label>
              <input
                type="text"
                required
                placeholder="Identificador del registro..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                value={simpleName}
                onChange={(e) => setSimpleName(e.target.value)}
              />
            </div>

            {simpleModalType !== "tag" && (
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-cream/60">Descripción</label>
                <textarea
                  required
                  placeholder="Detalles..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon h-20 uppercase resize-none"
                  value={simpleDesc}
                  onChange={(e) => setSimpleDesc(e.target.value)}
                />
              </div>
            )}

            {simpleModalType === "subcategory" && (
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-cream/60">Categoría Padre</label>
                <select
                  className="w-full bg-[#02092c] border border-white/10 rounded-xl px-2 py-2 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                  value={simpleParentId}
                  onChange={(e) => setSimpleParentId(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {simpleModalType === "quiz" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-cream/60">Curso Vinculado</label>
                  <select
                    className="w-full bg-[#02092c] border border-white/10 rounded-xl px-2 py-2 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                    value={simpleCourseId}
                    onChange={(e) => setSimpleCourseId(e.target.value)}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-cream/60">Mínimo Aprobación (%)</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon"
                    value={simplePassingScore}
                    onChange={(e) => setSimplePassingScore(parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSimpleModalOpen(false)}
                className="px-4 py-2 border border-white/10 text-cream/70 text-xs font-grotesk uppercase rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={simpleSaveLoading}
                className="px-5 py-2 bg-neon text-[#010828] text-xs font-bold font-grotesk uppercase rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {simpleSaveLoading && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
