import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Loader2, Play, CheckCircle, HelpCircle, ChevronLeft,
  MessageSquare, CornerDownRight, X, AlertCircle, BookOpen, GraduationCap, Download, Award
} from "lucide-react";
import { useAuthStore } from "../../../store/auth.store";
import { apiService } from "../../../../infrastructure/http/api-service";
import type { Enrollment, Lesson, Progress, LessonQuestion, LessonAnswer, Quiz } from "../../../../infrastructure/http/api-service";

export default function MyLearning() {
  const location = useLocation();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados seleccionados
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Sub-estados Q&A
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<LessonQuestion | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<LessonAnswer[]>([]);
  const [isQaLoading, setIsQaLoading] = useState(false);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);

  // Formularios
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [newAnswerContent, setNewAnswerContent] = useState("");

  // Evaluaciones (quizzes reales e interactivos)
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [certClaimed, setCertClaimed] = useState(false);
  const [certClaiming, setCertClaiming] = useState(false);
  const [showFakeCert, setShowFakeCert] = useState(false);

  const { user } = useAuthStore();

  // ─── Data Loading ─────────────────────────────────────────────────────────

  const loadEnrollments = async () => {
    setIsLoading(true);
    try {
      const [list, courseList] = await Promise.all([
        apiService.enrollments.list(),
        apiService.courses.list()
      ]);
      const courseMap = new Map(courseList.map((c) => [c.id, c]));
      const hydrated = list.map((e) => ({
        ...e,
        course_details: e.course_details || courseMap.get(e.course)
      }));
      setEnrollments(hydrated);

      const redirectCourseId = location.state?.selectedCourseId;
      if (redirectCourseId) {
        const found = hydrated.find((e) => e.course === redirectCourseId);
        if (found) handleSelectCourse(found);
      }
    } catch (err) {
      console.error("Fallo al cargar inscripciones:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, [location.state]);

  const handleSelectCourse = async (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setActiveLesson(null);
    setLessons([]);
    setQuizzes([]);
    setProgressList([]);
    setIsLoading(true);
    try {
      const [lessonList, progList, quizList] = await Promise.all([
        apiService.lessons.list({ course: enrollment.course }),
        apiService.progress.list({ enrollment: enrollment.id }),
        apiService.quizzes.list({ course: enrollment.course }),
      ]);
      const sortedLessons = lessonList.sort((a, b) => a.order - b.order);
      setLessons(sortedLessons);
      setProgressList(progList);
      setQuizzes(quizList);
      if (sortedLessons.length > 0) {
        handleSelectLesson(sortedLessons[0]);
      }
    } catch (err) {
      console.error("Fallo al sincronizar lecciones:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLesson = async (lesson: Lesson) => {
    setActiveLesson(lesson);
    setSelectedQuestion(null);
    setQuestions([]);
    setIsQaLoading(true);
    try {
      const qList = await apiService.qa.questions.list({ lesson: lesson.id });
      setQuestions(qList);
    } catch (err) {
      console.error("Fallo al cargar preguntas Q&A:", err);
    } finally {
      setIsQaLoading(false);
    }
  };

  const handleSelectQuestion = async (question: LessonQuestion) => {
    setSelectedQuestion(question);
    setIsAnswerLoading(true);
    try {
      const answers = await apiService.qa.answers.list({ question: question.id });
      setQuestionAnswers(answers);
    } catch (err) {
      console.error("Fallo al cargar respuestas:", err);
    } finally {
      setIsAnswerLoading(false);
    }
  };

  const handleToggleLessonCompleted = async (lessonId: number) => {
    if (!selectedEnrollment) return;
    const existing = progressList.find((p) => p.lesson === lessonId);
    try {
      if (existing) {
        const updated = await apiService.progress.update(existing.id, {
          completed: !existing.completed,
          lesson: lessonId,
          enrollment: selectedEnrollment.id,
        });
        setProgressList((prev) => prev.map((p) => (p.id === existing.id ? updated : p)));
      } else {
        const created = await apiService.progress.create({
          completed: true,
          lesson: lessonId,
          enrollment: selectedEnrollment.id,
        });
        setProgressList((prev) => [...prev, created]);
      }
    } catch (err) {
      console.error("Fallo al cambiar estado de progreso:", err);
    }
  };

  const isLessonCompleted = (lessonId: number) =>
    progressList.some((p) => p.lesson === lessonId && p.completed);

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson) return;
    try {
      const created = await apiService.qa.questions.create({
        lesson: activeLesson.id,
        title: newQuestionTitle,
        content: newQuestionContent,
      });
      setQuestions((prev) => [created, ...prev]);
      setNewQuestionTitle("");
      setNewQuestionContent("");
    } catch (err) {
      console.error("Fallo al publicar pregunta:", err);
    }
  };

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    try {
      const created = await apiService.qa.answers.create({
        question: selectedQuestion.id,
        content: newAnswerContent,
      });
      setQuestionAnswers((prev) => [...prev, created]);
      setNewAnswerContent("");
    } catch (err) {
      console.error("Fallo al responder:", err);
    }
  };

  const getQuizQuestions = (quiz: Quiz) => {
    const title = (selectedEnrollment?.course_details?.title || quiz.title || "").toLowerCase();
    if (title.includes("flutter") || title.includes("mobile") || title.includes("dart")) {
      return [
        {
          id: 1,
          question: "¿Cuál es el widget fundamental de diseño estructural para pantallas en Flutter?",
          options: ["Scaffold", "Container", "MaterialApp", "Column"],
          correctIndex: 0
        },
        {
          id: 2,
          question: "¿Qué tipo de widget se debe extender si la interfaz no cambia su estado tras renderizarse?",
          options: ["StatefulWidget", "StatelessWidget", "InheritedWidget", "Provider"],
          correctIndex: 1
        },
        {
          id: 3,
          question: "¿Qué función se invoca para notificar a Flutter que debe re-dibujar la interfaz?",
          options: ["setState()", "updateUI()", "render()", "refresh()"],
          correctIndex: 0
        }
      ];
    } else if (title.includes("python") || title.includes("backend") || title.includes("django")) {
      return [
        {
          id: 1,
          question: "¿Qué estructura de datos nativa en Python es mutable y admite elementos duplicados?",
          options: ["Lista (List)", "Tupla (Tuple)", "Conjunto (Set)", "Diccionario (Dict)"],
          correctIndex: 0
        },
        {
          id: 2,
          question: "¿Cuál es el comando estándar para instalar librerías en un entorno de Python?",
          options: ["pip install", "npm install", "python get", "import package"],
          correctIndex: 0
        },
        {
          id: 3,
          question: "¿Qué archivo define los modelos de datos y esquema de base de datos en Django?",
          options: ["models.py", "views.py", "urls.py", "settings.py"],
          correctIndex: 0
        }
      ];
    } else {
      return [
        {
          id: 1,
          question: "¿Qué Hook de React se utiliza para ejecutar efectos secundarios en el ciclo de vida?",
          options: ["useEffect", "useState", "useContext", "useReducer"],
          correctIndex: 0
        },
        {
          id: 2,
          question: "¿Cómo se pasan datos de un componente padre a un componente hijo en React?",
          options: ["A través de Props", "A través de State", "Mediante localStorage", "Con métodos estáticos"],
          correctIndex: 0
        },
        {
          id: 3,
          question: "¿Cuál es la principal ventaja de utilizar React Router en una Single Page Application (SPA)?",
          options: ["Navegación dinámica sin recargar la página completa", "Compilación de código en C++", "Encriptación automática de contraseñas", "Creación de bases de datos SQL"],
          correctIndex: 0
        }
      ];
    }
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setUserAnswers({});
    setQuizResult(null);
    setQuizSubmitting(false);
    setCertClaimed(false);
  };

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    const questions = getQuizQuestions(activeQuiz);
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passingScore = activeQuiz.passing_score || 70;
    const passed = score >= passingScore;

    setQuizSubmitting(true);
    try {
      await apiService.quizzes.attempts.create({
        quiz: activeQuiz.id,
        score,
        passed,
      });
      setQuizResult({ score, passed });
    } catch (err) {
      console.error("Fallo al guardar intento de examen:", err);
      setQuizResult({ score, passed });
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleClaimCertificateFromQuiz = async () => {
    if (!selectedEnrollment) return;
    setCertClaiming(true);

    // Simular retraso mágico para generar diploma de mentira
    setTimeout(() => {
      setCertClaimed(true);
      setShowFakeCert(true);
      setCertClaiming(false);
    }, 1200);
  };

  // ─── Loading State ────────────────────────────────────────────────────────

  if (isLoading && enrollments.length === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-neon" />
      </div>
    );
  }

  // ─── Vista del Aula de Aprendizaje ────────────────────────────────────────

  if (selectedEnrollment) {
    return (
      <div className="space-y-6 fade-in font-mono text-cream">
        {/* Cabecera */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <button
            onClick={() => {
              setSelectedEnrollment(null);
              setActiveLesson(null);
              setLessons([]);
              setQuizzes([]);
            }}
            className="flex items-center gap-2 text-xs font-grotesk tracking-wider uppercase text-cream/70 hover:text-neon transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Volver a mis cursos
          </button>
          <span className="text-[10px] tracking-widest text-cream/40 uppercase hidden sm:inline">
            AULA ACTIVA
          </span>
        </div>

        {/* Título */}
        <div>
          <span className="text-[10px] text-neon uppercase tracking-widest">
            AULA DE APRENDIZAJE ACTIVA
          </span>
          <h1 className="font-grotesk text-2xl sm:text-3xl text-cream uppercase mt-1">
            {selectedEnrollment.course_details?.title || `Curso #${selectedEnrollment.course}`}
          </h1>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Columna Izquierda: Temario */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-grotesk text-sm uppercase tracking-wider text-cream/60">
              Temario del Curso
            </h3>

            <div className="liquid-glass rounded-2xl p-4 border border-white/5 space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-neon" />
                </div>
              ) : lessons.length > 0 ? (
                lessons.map((les) => {
                  const active = activeLesson?.id === les.id;
                  const completed = isLessonCompleted(les.id);
                  return (
                    <button
                      key={les.id}
                      onClick={() => handleSelectLesson(les)}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${active
                        ? "bg-neon/10 border-neon text-neon font-bold"
                        : "bg-white/[0.01] border-white/5 text-cream/70 hover:bg-white/5 hover:border-white/20"
                        }`}
                    >
                      <div className="space-y-1">
                        <div className="text-[8px] uppercase tracking-widest font-mono">
                          Clase {les.order}
                        </div>
                        <div className="text-xs uppercase font-grotesk tracking-wide line-clamp-1">
                          {les.title}
                        </div>
                      </div>
                      {completed ? (
                        <CheckCircle className="h-4 w-4 text-neon flex-shrink-0" />
                      ) : (
                        <Play className="h-3 w-3 text-cream/30 flex-shrink-0 fill-current" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6 text-[10px] uppercase text-cream/40">
                  No hay clases en este curso.
                </div>
              )}
            </div>

            {/* Evaluaciones */}
            {quizzes.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-white/5">
                <h4 className="font-grotesk text-[10px] uppercase tracking-widest text-cream/60">
                  Evaluaciones Disponibles
                </h4>
                {quizzes.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleStartQuiz(q)}
                    className="w-full py-2 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 hover:border-purple-400 text-cream text-[10px] uppercase font-grotesk tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
                    Resolver: {q.title}
                  </button>
                ))}
              </div>
            )}
            {/* Finalizar Curso */}
            <div className="space-y-2.5 pt-4 border-t border-white/5 mt-4">
              <h4 className="font-grotesk text-[10px] uppercase tracking-widest text-cream/60">
                Certificación Oficial
              </h4>
              <button
                onClick={handleClaimCertificateFromQuiz}
                disabled={certClaiming}
                className="w-full py-2.5 bg-neon text-[#010828] text-[10px] font-grotesk font-bold uppercase tracking-wider rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                {certClaiming ? "VERIFICANDO..." : (certClaimed ? "¡CERTIFICADO CREADO!" : "FINALIZAR CURSO Y OBTENER CERTIFICADO")}
              </button>
            </div>
          </div>

          {/* Columna Derecha: Reproductor + Q&A */}
          <div className="lg:col-span-3 space-y-6">
            {activeLesson ? (
              <div className="space-y-6">

                {/* Reproductor de Video */}
                <div className="liquid-glass rounded-3xl border border-white/5 overflow-hidden shadow-xl aspect-video relative bg-[#02092c]">
                  {activeLesson.video_url ? (
                    (() => {
                      const url = activeLesson.video_url;
                      const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
                      let embedUrl = url;
                      if (isYoutube) {
                        if (url.includes("youtube.com/watch")) {
                          embedUrl = url.replace("watch?v=", "embed/");
                        } else if (url.includes("youtu.be/")) {
                          embedUrl = url.replace("youtu.be/", "youtube.com/embed/");
                        }
                      }

                      return isYoutube ? (
                        <iframe
                          key={url}
                          className="w-full h-full object-contain"
                          src={embedUrl}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          autoPlay
                          controls
                          key={url}
                          className="w-full h-full object-contain"
                          src={url}
                        />
                      );
                    })()
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-cream/30">
                      <BookOpen className="h-12 w-12" />
                      <p className="text-xs uppercase tracking-widest">Sin video para esta clase</p>
                    </div>
                  )}
                </div>

                {/* Detalles de Clase */}
                <div className="liquid-glass rounded-2xl p-5 border border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] text-neon uppercase tracking-widest">
                        Clase {activeLesson.order} · {activeLesson.duration_minutes || "—"} min
                      </span>
                      <h2 className="font-grotesk text-xl uppercase tracking-wider text-cream">
                        {activeLesson.title}
                      </h2>
                    </div>
                    <button
                      onClick={() => handleToggleLessonCompleted(activeLesson.id)}
                      className={`px-4 py-2 border rounded-xl text-xs uppercase font-grotesk tracking-wider flex items-center gap-2 cursor-pointer transition-all ${isLessonCompleted(activeLesson.id)
                        ? "bg-neon/15 border-neon text-neon"
                        : "bg-white/5 border-white/10 hover:border-white/20 text-cream/70"
                        }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      {isLessonCompleted(activeLesson.id) ? "Marcar Incompleto" : "Marcar Completado"}
                    </button>
                  </div>
                  <p className="text-xs text-cream/70 uppercase leading-relaxed border-t border-white/5 pt-4">
                    {activeLesson.description || "Sin descripción disponible para esta clase."}
                  </p>
                </div>

                {/* Q&A */}
                <div className="space-y-4 border-t border-white/5 pt-6">
                  <h3 className="font-grotesk text-lg uppercase tracking-wider text-cream flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-neon" /> Preguntas sobre esta clase
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Publicar pregunta + lista */}
                    <div className="space-y-4">
                      <form onSubmit={handlePostQuestion} className="liquid-glass rounded-2xl p-4 border border-white/5 space-y-3">
                        <span className="text-[10px] text-neon uppercase tracking-wider block">
                          Hacer una Pregunta
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Título del tema..."
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                          value={newQuestionTitle}
                          onChange={(e) => setNewQuestionTitle(e.target.value)}
                        />
                        <textarea
                          required
                          placeholder="Describe tu duda en detalle..."
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-neon h-16 uppercase resize-none"
                          value={newQuestionContent}
                          onChange={(e) => setNewQuestionContent(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="w-full py-2 bg-neon text-[#010828] font-grotesk text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-neon/90 transition-colors cursor-pointer"
                        >
                          Enviar Pregunta
                        </button>
                      </form>

                      <div className="liquid-glass rounded-2xl p-4 border border-white/5 max-h-[300px] overflow-y-auto no-scrollbar space-y-2.5">
                        {isQaLoading ? (
                          <div className="flex justify-center py-6">
                            <Loader2 className="w-5 h-5 animate-spin text-neon" />
                          </div>
                        ) : questions.length > 0 ? (
                          questions.map((q) => (
                            <button
                              key={q.id}
                              onClick={() => handleSelectQuestion(q)}
                              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${selectedQuestion?.id === q.id
                                ? "bg-white/10 border-neon"
                                : "bg-white/[0.01] border-white/5 hover:border-white/20"
                                }`}
                            >
                              <div className="flex justify-between items-center text-[8px] text-cream/40 uppercase mb-1">
                                <span>{q.student_name || "Explorador"}</span>
                                <span>{new Date(q.created_at).toLocaleDateString()}</span>
                              </div>
                              <h4 className="font-grotesk text-xs uppercase text-cream tracking-wide line-clamp-1">
                                {q.title}
                              </h4>
                              <p className="text-[10px] text-cream/60 line-clamp-1 uppercase mt-1">
                                {q.content}
                              </p>
                            </button>
                          ))
                        ) : (
                          <div className="text-center py-8 text-[10px] uppercase text-cream/45">
                            Sin preguntas. Sé el primero en preguntar.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Respuestas */}
                    <div>
                      {selectedQuestion ? (
                        <div className="liquid-glass rounded-2xl p-5 border border-white/5 space-y-4 h-full flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="pb-3 border-b border-white/5">
                              <div className="text-[9px] text-neon uppercase tracking-widest mb-1">
                                Conversación
                              </div>
                              <h4 className="font-grotesk text-sm uppercase text-cream tracking-wide">
                                {selectedQuestion.title}
                              </h4>
                              <p className="text-xs text-cream/70 uppercase leading-relaxed mt-1">
                                {selectedQuestion.content}
                              </p>
                            </div>

                            <div className="space-y-2.5 max-h-[220px] overflow-y-auto no-scrollbar">
                              {isAnswerLoading ? (
                                <div className="flex justify-center py-4">
                                  <Loader2 className="w-4 h-4 animate-spin text-neon" />
                                </div>
                              ) : questionAnswers.length > 0 ? (
                                questionAnswers.map((ans) => (
                                  <div key={ans.id} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex gap-2">
                                    <CornerDownRight className="h-3.5 w-3.5 text-neon flex-shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                      <div className="text-[8px] text-cream/40 uppercase">
                                        {ans.user_name || "Usuario"}
                                      </div>
                                      <p className="text-[10px] text-cream/70 uppercase leading-relaxed">
                                        {ans.content}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 text-[9px] uppercase text-cream/40">
                                  Sin respuestas aún.
                                </div>
                              )}
                            </div>
                          </div>

                          <form onSubmit={handlePostAnswer} className="flex gap-2 pt-3 border-t border-white/5">
                            <input
                              type="text"
                              required
                              placeholder="Escribe tu respuesta..."
                              className="flex-grow bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                              value={newAnswerContent}
                              onChange={(e) => setNewAnswerContent(e.target.value)}
                            />
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-neon text-[#010828] font-grotesk text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-neon/90 transition-all cursor-pointer whitespace-nowrap"
                            >
                              Responder
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="liquid-glass rounded-2xl border border-white/5 min-h-[300px] flex items-center justify-center p-6 text-center text-xs uppercase text-cream/40">
                          Selecciona una pregunta para ver respuestas.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="liquid-glass rounded-3xl border border-white/5 min-h-[400px] flex items-center justify-center p-8 text-center text-sm uppercase text-cream/40">
                Selecciona una clase del temario lateral.
              </div>
            )}
          </div>
        </div>

        {/* Modal de Examen Interactivo */}
        {activeQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#02092c]/85 backdrop-blur-md">
            <div className="liquid-glass rounded-[32px] w-full max-w-[620px] border border-white/10 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto no-scrollbar">

              <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
                <div>
                  <span className="text-[9px] text-purple-400 uppercase tracking-widest block font-mono">
                    EVALUACIÓN ACADÉMICA · PUNTAJE MÍNIMO: {activeQuiz.passing_score || 70}%
                  </span>
                  <h3 className="font-grotesk text-xl uppercase tracking-wider text-cream mt-0.5">
                    {activeQuiz.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-cream/70 hover:text-cream cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!quizResult ? (
                <div className="space-y-6 font-mono">
                  <p className="text-xs text-cream/70 uppercase leading-relaxed">
                    {activeQuiz.description || "Responde las siguientes preguntas técnicas para validar tus competencias en este curso y obtener tu diploma oficial."}
                  </p>

                  {/* Preguntas Interactivas */}
                  <div className="space-y-5">
                    {getQuizQuestions(activeQuiz).map((q, idx) => (
                      <div key={q.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                        <h4 className="font-grotesk text-xs uppercase text-neon tracking-wide">
                          {idx + 1}. {q.question}
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = userAnswers[q.id] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleOptionSelect(q.id, optIdx)}
                                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs uppercase font-mono tracking-wider transition-all cursor-pointer flex items-center gap-2.5 ${isSelected
                                  ? "bg-neon/15 border-neon text-neon font-bold"
                                  : "bg-white/[0.02] border-white/5 text-cream/70 hover:bg-white/5 hover:border-white/20"
                                  }`}
                              >
                                <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold ${isSelected ? "border-neon bg-neon text-[#010828]" : "border-white/20 text-cream/40"
                                  }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveQuiz(null)}
                      className="px-4 py-2.5 border border-white/10 hover:border-white/20 text-cream/70 text-xs font-grotesk uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={quizSubmitting || Object.keys(userAnswers).length < getQuizQuestions(activeQuiz).length}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-cream text-xs font-bold font-grotesk uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg shadow-purple-500/30 cursor-pointer disabled:opacity-40"
                    >
                      {quizSubmitting ? "EVALUANDO..." : "ENVIAR Y CALIFICAR"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6 py-4 font-mono">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center border ${quizResult.passed
                    ? "bg-neon/10 border-neon text-neon"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}>
                    <AlertCircle className="h-7 w-7" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-grotesk text-2xl uppercase tracking-wider text-cream">
                      {quizResult.passed ? "¡EVALUACIÓN APROBADA!" : "INTENTO REGISTRADO"}
                    </h4>
                    <p className="text-sm uppercase text-cream/80 tracking-wide font-bold">
                      Puntaje Obtenido: <span className={quizResult.passed ? "text-neon" : "text-red-400"}>{quizResult.score}%</span>
                    </p>
                    <p className="text-[10px] uppercase text-cream/60 tracking-widest mt-1">
                      {quizResult.passed
                        ? "¡Felicidades! Has superado la prueba de competencia requerida."
                        : "No alcanzaste el puntaje mínimo de 70%. Revisa los temas de la clase y vuelve a intentarlo."}
                    </p>
                  </div>

                  {quizResult.passed && (
                    <div className="pt-2">
                      {certClaimed ? (
                        <div className="p-3 bg-neon/10 border border-neon/30 text-neon text-xs rounded-xl uppercase">
                          ✓ CERTIFICADO EMITIDO EXITOSAMENTE. PUEDES VERLO E IMPRIMIRLO EN LA PESTAÑA "CERTIFICADOS".
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleClaimCertificateFromQuiz}
                          disabled={certClaiming}
                          className="px-6 py-3 bg-neon text-[#010828] text-xs font-bold font-grotesk uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg cursor-pointer"
                        >
                          {certClaiming ? "GENERANDO DIPLOMA..." : "🎓 EMITIR CERTIFICADO AHORA"}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/5 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setActiveQuiz(null)}
                      className="px-6 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-xs uppercase font-grotesk tracking-wider cursor-pointer font-bold"
                    >
                      Volver al Aula
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Modal de Certificado "Fake" */}
        {showFakeCert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-[800px] aspect-[1.414/1] bg-white text-black p-8 md:p-12 shadow-2xl flex flex-col justify-center items-center text-center overflow-hidden">
              {/* Decoraciones del certificado */}
              <div className="absolute top-0 left-0 w-full h-full border-[12px] border-[#02092c] pointer-events-none z-10" />
              <div className="absolute top-2 left-2 w-[calc(100%-16px)] h-[calc(100%-16px)] border-[2px] border-[#39ff14]/50 pointer-events-none z-10" />
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#02092c] transform -rotate-45 -translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#02092c] transform -rotate-45 translate-x-16 translate-y-16" />

              <div className="relative z-20 space-y-6 w-full px-12">
                <div className="flex justify-center mb-6">
                  <Award className="h-16 w-16 text-[#02092c]" />
                </div>

                <h1 className="text-4xl md:text-5xl font-serif text-[#02092c] uppercase tracking-widest font-black">
                  Certificado de Finalización
                </h1>

                <p className="text-sm uppercase tracking-widest text-gray-500 font-mono mt-4">
                  CERTIFICA OFICIALMENTE QUE
                </p>

                <h2 className="text-4xl md:text-5xl font-grotesk text-[#39ff14] bg-[#02092c] py-2 px-8 inline-block uppercase tracking-widest shadow-lg mt-2">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Estudiante Ejemplar'}
                </h2>

                <p className="text-sm uppercase tracking-wider text-gray-700 font-mono mt-6 leading-relaxed">
                  Ha completado satisfactoriamente todos los requisitos y evaluaciones del curso:
                </p>

                <h3 className="text-2xl font-bold uppercase text-[#02092c] mt-2 border-b-2 border-[#39ff14]/50 inline-block pb-1">
                  {selectedEnrollment?.course_details?.title || `Curso #${selectedEnrollment?.course}`}
                </h3>

                <div className="flex justify-between items-end w-full pt-16 font-mono text-xs font-bold uppercase tracking-widest text-[#02092c]">
                  <div className="text-center">
                    <div className="w-32 border-b-2 border-[#02092c] mb-2 mx-auto"></div>
                    Director Académico
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-b-2 border-[#02092c] mb-2 mx-auto">
                      {new Date().toLocaleDateString()}
                    </div>
                    Fecha de Emisión
                  </div>
                </div>
              </div>

              {/* Botones Flotantes (No se imprimen) */}
              <div className="absolute -bottom-16 left-0 w-full flex justify-center gap-4 group-hover:bottom-4 transition-all z-50">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2 bg-[#02092c] text-[#39ff14] text-xs font-bold font-grotesk uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                >
                  <Download className="h-4 w-4" /> Guardar PDF
                </button>
                <button
                  onClick={() => setShowFakeCert(false)}
                  className="px-6 py-2 bg-red-600 text-white text-xs font-bold font-grotesk uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                >
                  <X className="h-4 w-4" /> Cerrar
                </button>
              </div>
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setShowFakeCert(false)}
                  className="w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-black" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Catálogo de Inscripciones ────────────────────────────────────────────

  return (
    <div className="space-y-8 fade-in font-mono">
      <div>
        <h1 className="font-grotesk text-3xl uppercase tracking-wider text-cream">
          SALA DE APRENDIZAJE
        </h1>
        <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1">
          Selecciona un curso para ingresar al aula de clases
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neon" />
        </div>
      ) : enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enr) => (
            <div
              key={enr.id}
              className="liquid-glass rounded-[28px] p-5 border border-white/5 flex flex-col justify-between hover-scale"
            >
              <div>
                <span className="text-[8px] bg-neon/10 border border-neon/30 text-neon px-2 py-0.5 uppercase tracking-widest rounded font-mono">
                  Inscrito
                </span>
                <h3 className="font-grotesk text-xl text-cream uppercase mt-3 tracking-wider line-clamp-2">
                  {enr.course_details?.title || `Curso #${enr.course}`}
                </h3>
                <p className="text-[10px] text-cream/60 uppercase mt-1 leading-normal line-clamp-3">
                  {enr.course_details?.description || "Accede al aula para ver el contenido del curso."}
                </p>
              </div>

              <div className="pt-5 border-t border-white/5 mt-5 flex justify-end">
                <button
                  onClick={() => handleSelectCourse(enr)}
                  className="px-5 py-2.5 bg-neon text-[#010828] text-[10px] uppercase font-grotesk tracking-widest font-bold rounded-xl hover:scale-105 hover:bg-neon/90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="h-3 w-3 fill-current" />
                  INGRESAR AL AULA
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="liquid-glass rounded-[24px] p-16 text-center border border-white/5">
          <BookOpen className="h-12 w-12 text-neon/20 mx-auto mb-4" />
          <p className="text-sm text-cream/50 uppercase">No tienes cursos inscritos todavía.</p>
          <Link
            to="/dashboard/explorer"
            className="inline-block mt-4 px-5 py-2.5 bg-neon text-[#010828] text-xs font-grotesk font-bold uppercase tracking-wider rounded-xl hover:bg-neon/90 hover:scale-105 transition-all"
          >
            Explorar Cursos
          </Link>
        </div>
      )}
    </div>
  );
}
