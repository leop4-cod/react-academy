import { useEffect, useState } from "react";
import { Loader2, Plus, CornerDownRight, ChevronLeft, ArrowRight } from "lucide-react";
import { apiService } from "../../../../infrastructure/http/api-service";
import type { DiscussionForum, ForumPost, ForumComment } from "../../../../infrastructure/http/api-service";

export default function Forums() {
  const [forums, setForums] = useState<DiscussionForum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de selección
  const [selectedForum, setSelectedForum] = useState<DiscussionForum | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  // Formularios de Creación
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");

  const loadForums = async () => {
    setIsLoading(true);
    try {
      const list = await apiService.forums.list();
      setForums(list);
    } catch (err) {
      console.error("Fallo al cargar foros:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForums();
  }, []);

  const handleSelectForum = async (forum: DiscussionForum) => {
    setSelectedForum(forum);
    setSelectedPost(null);
    setPosts([]);
    setIsPostsLoading(true);
    try {
      const list = await apiService.forums.posts.list({ forum: forum.id });
      setPosts(list);
    } catch (err) {
      console.error("Fallo al cargar publicaciones:", err);
    } finally {
      setIsPostsLoading(false);
    }
  };

  const handleSelectPost = async (post: ForumPost) => {
    setSelectedPost(post);
    setComments([]);
    setIsCommentsLoading(true);
    try {
      const list = await apiService.forums.comments.list({ post: post.id });
      setComments(list);
    } catch (err) {
      console.error("Fallo al cargar comentarios:", err);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForum) return;
    try {
      const created = await apiService.forums.posts.create({
        forum: selectedForum.id,
        title: newPostTitle,
        content: newPostContent
      });
      setPosts((prev) => [created, ...prev]);
      setNewPostTitle("");
      setNewPostContent("");
    } catch (err) {
      console.error("Fallo al crear publicación:", err);
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;
    try {
      const created = await apiService.forums.comments.create({
        post: selectedPost.id,
        content: newCommentContent
      });
      setComments((prev) => [...prev, created]);
      setNewCommentContent("");
    } catch (err) {
      console.error("Fallo al crear comentario:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-neon" />
      </div>
    );
  }

  // Vista de publicaciones de un Foro
  if (selectedForum) {
    return (
      <div className="space-y-6 fade-in font-mono text-cream">
        
        {/* Cabecera superior */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <button
            onClick={() => setSelectedForum(null)}
            className="flex items-center gap-2 text-xs font-grotesk tracking-wider uppercase text-cream/70 hover:text-neon transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Volver a los Foros
          </button>
          
          <span className="text-[10px] tracking-widest text-cream/40 uppercase">
            SALA DE DISCUSIÓN ACTIVA
          </span>
        </div>

        {/* Info del foro */}
        <div>
          <span className="text-[9px] text-neon uppercase tracking-widest">
            CATEGORÍA / FORO DE DISCUSIÓN
          </span>
          <h1 className="font-grotesk text-2xl text-cream uppercase mt-0.5">
            {selectedForum.title}
          </h1>
          <p className="text-[11px] text-cream/60 uppercase tracking-wide mt-1">
            {selectedForum.description}
          </p>
        </div>

        {/* Grid de Discusión */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Lado izquierdo: Publicar + Historial de Temas */}
          <div className="space-y-6">
            
            {/* Formulario Crear Tema */}
            <form onSubmit={handleCreatePost} className="liquid-glass rounded-2xl p-5 border border-white/5 space-y-4">
              <h3 className="font-grotesk text-xs text-neon uppercase tracking-widest flex items-center gap-2">
                <Plus className="h-4 w-4" /> Abrir Nuevo Hilo de Discusión
              </h3>

              <div className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Título del Tema..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <textarea
                  required
                  placeholder="Detalla tu propuesta o consulta..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-cream focus:outline-none focus:border-neon h-24 uppercase resize-none"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-neon text-[#010828] font-grotesk text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neon/90 transition-colors cursor-pointer"
              >
                Transmitir Hilo
              </button>
            </form>

            {/* Listado de temas */}
            <div className="space-y-3">
              <h3 className="font-grotesk text-sm uppercase tracking-wider text-cream/60">
                Hilos de Discusión Recientes
              </h3>

              <div className="space-y-2.5 max-h-[400px] overflow-y-auto no-scrollbar">
                {isPostsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-neon" />
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => handleSelectPost(post)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center gap-4 ${
                        selectedPost?.id === post.id
                          ? "bg-white/10 border-neon"
                          : "bg-white/[0.01] border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[8px] text-cream/40 uppercase">
                          <span>{post.author_name || "Explorador"}</span>
                          <span>&bull;</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-grotesk text-xs uppercase text-cream tracking-wide">
                          {post.title}
                        </h4>
                        <p className="text-[10px] text-cream/60 line-clamp-1 uppercase leading-normal">
                          {post.content}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 text-cream/30 flex-shrink-0" />
                    </button>
                  ))
                ) : (
                  <div className="liquid-glass rounded-2xl p-8 text-center text-xs uppercase text-cream/40 border border-white/5">
                    Sin discusiones abiertas. Sé el primero en iniciar un tema.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Lado derecho: Comentarios del Tema Seleccionado */}
          <div>
            {selectedPost ? (
              <div className="liquid-glass rounded-3xl p-5 border border-white/5 h-full flex flex-col justify-between min-h-[460px]">
                <div className="space-y-4">
                  {/* Cabecera del tema */}
                  <div className="pb-4 border-b border-white/5">
                    <div className="flex items-center justify-between text-[9px] text-neon uppercase tracking-widest mb-1.5">
                      <span>Hilo: #{selectedPost.id}</span>
                      <span>Por: {selectedPost.author_name || "Explorador"}</span>
                    </div>
                    <h3 className="font-grotesk text-sm uppercase text-cream tracking-wide">
                      {selectedPost.title}
                    </h3>
                    <p className="text-xs text-cream/70 uppercase leading-relaxed mt-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      {selectedPost.content}
                    </p>
                  </div>

                  {/* Listado de comentarios */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                    {isCommentsLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-neon" />
                      </div>
                    ) : comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex gap-3.5">
                          <CornerDownRight className="h-4 w-4 text-neon flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[8px] text-cream/40 uppercase">
                              <span className="font-bold">{comment.author_name || "Comentarista"}</span>
                              <span>&bull;</span>
                              <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[10px] text-cream/70 uppercase leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-[10px] uppercase text-cream/40">
                        No hay comentarios en este hilo.
                      </div>
                    )}
                  </div>
                </div>

                {/* Formulario Comentar */}
                <form onSubmit={handleCreateComment} className="flex gap-2.5 pt-4 border-t border-white/5">
                  <input
                    type="text"
                    required
                    placeholder="Escribe un comentario..."
                    className="flex-grow bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-xs text-cream focus:outline-none focus:border-neon uppercase"
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-neon text-[#010828] font-grotesk text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-neon/90 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Comentar
                  </button>
                </form>
              </div>
            ) : (
              <div className="liquid-glass rounded-3xl border border-white/5 h-full min-h-[460px] flex items-center justify-center p-8 text-center text-xs uppercase text-cream/40">
                Selecciona una discusión del listado de temas para ver comentarios.
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // Listado de Foros Disponibles
  return (
    <div className="space-y-6 fade-in font-mono text-cream">
      <div>
        <h1 className="font-grotesk text-3xl uppercase tracking-wider text-cream">
          SALA DE DEBATE COMUNITARIA
        </h1>
        <p className="text-[10px] text-cream/50 uppercase tracking-widest">
          Conéctate a los canales de discusión de la academia
        </p>
      </div>

      {forums.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forums.map((forum) => (
            <div
              key={forum.id}
              className="liquid-glass rounded-[28px] p-6 border border-white/5 flex flex-col justify-between hover-scale"
            >
              <div>
                <span className="text-[8px] bg-neon/15 border border-neon/30 text-neon px-2.5 py-0.5 uppercase tracking-widest rounded-full font-bold">
                  Canal de Discusión
                </span>
                <h3 className="font-grotesk text-xl text-cream uppercase mt-4 tracking-wider">
                  {forum.title}
                </h3>
                <p className="text-xs text-cream/60 uppercase mt-2 leading-relaxed">
                  {forum.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => handleSelectForum(forum)}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 hover:border-neon hover:text-neon text-[10px] uppercase font-grotesk tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  Conectar Canal
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="liquid-glass rounded-[24px] p-16 text-center border border-white/5">
          <p className="text-sm text-cream/50 uppercase">No hay canales de discusión registrados en este nodo.</p>
        </div>
      )}
    </div>
  );
}
