import { useState } from "react";
import { Link, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { 
  LayoutDashboard, Search, BookOpen, MessageSquare, Award, Settings, Database, 
  LogOut, Menu, X, User as UserIcon, Bell, ShieldAlert
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";

// Subviews
import Overview from "./Views/Overview";
import CoursesExplorer from "./Views/CoursesExplorer";
import MyLearning from "./Views/MyLearning";
import Forums from "./Views/Forums";
import AcademicRecords from "./Views/AcademicRecords";
import ProfileSettings from "./Views/ProfileSettings";
import ManagementPanel from "./Views/ManagementPanel";

// Protección de rutas para admins y profesores
function ManagementRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuthStore();
  const isTeacher = user?.role === 'teacher' || user?.is_teacher || isAdmin;
  
  if (!isTeacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 p-8">
        <ShieldAlert className="h-16 w-16 text-red-400/60" />
        <h2 className="font-grotesk text-2xl uppercase tracking-wider text-cream/80">Acceso Restringido</h2>
        <p className="font-mono text-xs uppercase tracking-wider text-cream/40 max-w-sm">
          Esta sección es exclusiva para administradores del sistema. Contacta al equipo de CodeAcademy si necesitas acceso.
        </p>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 bg-white/5 border border-white/10 text-cream/70 text-xs font-grotesk uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
        >
          Volver al Panel
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  interface NavLinkItem {
    path: string;
    label: string;
    icon: React.ComponentType<any>;
    exact?: boolean;
    adminOnly?: boolean;
  }

  // Navlinks base - visibles para todos los usuarios autenticados
  const baseNavLinks: NavLinkItem[] = [
    { path: "/dashboard", label: "General", icon: LayoutDashboard, exact: true },
    { path: "/dashboard/explorer", label: "Explorador", icon: Search },
    { path: "/dashboard/learning", label: "Mi Aprendizaje", icon: BookOpen },
    { path: "/dashboard/forums", label: "Foros", icon: MessageSquare },
    { path: "/dashboard/records", label: "Certificados", icon: Award },
    { path: "/dashboard/profile", label: "Configuración", icon: Settings },
  ];

  // "Consola CRUD" visible para administradores y profesores
  const isTeacher = user?.role === 'teacher' || user?.is_teacher || isAdmin;
  const adminNavLinks: NavLinkItem[] = isTeacher
    ? [{ path: "/dashboard/management", label: "Consola Admin", icon: Database, adminOnly: true }]
    : [];

  const navLinks = [...baseNavLinks, ...adminNavLinks];

  const getPageTitle = () => {
    const active = navLinks.find(link => {
      if (link.exact) return location.pathname === link.path;
      return location.pathname.startsWith(link.path);
    });
    return active ? active.label : "ACADEMY HUB";
  };

  return (
    <div className="relative min-h-screen bg-[#02092c] text-cream flex font-mono">
      {/* Texture Overlay */}
      <div className="texture-overlay" />

      {/* 1. Sidebar - Escritorio */}
      <aside className="hidden lg:flex w-72 flex-col justify-between p-6 border-r border-white/5 bg-[#02092c]/50 relative z-20">
        <div className="space-y-8">
          {/* Logo */}
          <Link to="/" className="font-grotesk text-xl tracking-widest text-cream uppercase hover:text-neon transition-colors block">
            CODEACADEMY
          </Link>

          {/* Tarjeta de usuario */}
          <div className="liquid-glass rounded-2xl p-4 border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              {user?.avatar || user?.avatar_url ? (
                <img src={user.avatar || user.avatar_url} alt={user.first_name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="h-5 w-5 text-cream/40" />
              )}
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-grotesk text-xs uppercase text-cream tracking-wider truncate">
                {user?.first_name || "Explorador"} {user?.last_name || "CodeAcademy"}
              </h4>
              <span className={`inline-block mt-0.5 px-2 py-0.5 text-[8px] rounded uppercase font-bold tracking-widest font-mono border ${
                isAdmin
                  ? "bg-red-500/10 border-red-400/30 text-red-300"
                  : "bg-neon/10 border-neon/30 text-neon"
              }`}>
                {isAdmin ? "ADMIN" : (user?.role === 'teacher' ? 'PROFESOR' : 'ESTUDIANTE')}
              </span>
            </div>
          </div>

          {/* Enlaces de navegación */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const active = link.exact 
                ? location.pathname === link.path 
                : location.pathname.startsWith(link.path);
              const Icon = link.icon;
              const isAdminLink = "adminOnly" in link && link.adminOnly;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-xs uppercase font-grotesk tracking-widest transition-all ${
                    active
                      ? isAdminLink
                        ? "bg-red-500/20 text-red-300 border-red-400/30 font-bold"
                        : "bg-neon text-[#010828] border-neon font-bold"
                      : isAdminLink
                        ? "bg-transparent border-transparent text-red-400/60 hover:bg-red-500/10 hover:text-red-300"
                        : "bg-transparent border-transparent text-cream/70 hover:bg-white/5 hover:text-cream"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Cierre de sesión */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 hover:border-red-500/30 text-red-400 rounded-xl text-xs uppercase font-grotesk tracking-widest transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Terminal
        </button>
      </aside>

      {/* 2. Área de contenido principal */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen relative z-10">
        
        {/* Encabezado Móvil */}
        <header className="lg:hidden px-4 py-4 bg-[#02092c]/70 border-b border-white/5 flex justify-between items-center relative z-30">
          <Link to="/" className="font-grotesk text-sm uppercase tracking-widest">
            CODEACADEMY
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-cream/80 hover:text-cream hover:border-neon transition-all"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Encabezado Escritorio */}
        <header className="hidden lg:flex px-8 py-5 bg-[#02092c]/20 border-b border-white/5 justify-between items-center relative z-20">
          <h2 className="font-grotesk text-xl uppercase tracking-widest text-cream">
            {getPageTitle()}
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Alertas */}
            <Link
              to="/dashboard"
              className="p-2 bg-white/5 border border-white/10 hover:border-neon rounded-xl text-cream/70 hover:text-neon transition-colors"
            >
              <Bell className="h-4.5 w-4.5" />
            </Link>

            {/* Ajustes */}
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] uppercase font-grotesk tracking-wider"
            >
              <UserIcon className="h-4 w-4 text-cream/60" />
              Ajustes
            </Link>
          </div>
        </header>

        {/* Contenido dinámico */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/explorer" element={<CoursesExplorer />} />
            <Route path="/learning" element={<MyLearning />} />
            <Route path="/forums" element={<Forums />} />
            <Route path="/records" element={<AcademicRecords />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route
              path="/management"
              element={
                <ManagementRoute>
                  <ManagementPanel />
                </ManagementRoute>
              }
            />
            {/* Catch-all dentro del dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* 3. Menú móvil (Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#02092c]/95 backdrop-blur-md flex flex-col justify-between p-6 animate-in fade-in duration-200">
          <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex justify-between items-center">
              <span className="font-grotesk text-base uppercase tracking-widest text-cream">
                CODEACADEMY TERMINAL
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-cream/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Detalles de usuario */}
            <div className="liquid-glass rounded-2xl p-4 border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                {user?.avatar || user?.avatar_url ? (
                  <img src={user.avatar || user.avatar_url} alt={user.first_name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="h-4.5 w-4.5 text-cream/40" />
                )}
              </div>
              <div>
                <h4 className="font-grotesk text-xs uppercase text-cream tracking-wider">
                  {user?.first_name || "Explorador"}
                </h4>
                <span className={`inline-block mt-0.5 px-2 py-0.5 text-[7px] rounded uppercase font-bold tracking-widest border ${
                  isAdmin ? "bg-red-500/10 border-red-400/30 text-red-300" : "bg-neon/10 border-neon/30 text-neon"
                }`}>
                  {isAdmin ? "ADMIN" : (user?.role === 'teacher' ? 'PROFESOR' : 'ESTUDIANTE')}
                </span>
              </div>
            </div>

            {/* Enlaces de navegación */}
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const active = link.exact 
                  ? location.pathname === link.path 
                  : location.pathname.startsWith(link.path);
                const Icon = link.icon;
                const isAdminLink = "adminOnly" in link && link.adminOnly;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs uppercase font-grotesk tracking-widest transition-all ${
                      active
                        ? isAdminLink
                          ? "bg-red-500/20 text-red-300 border-red-400/30 font-bold"
                          : "bg-neon text-[#010828] border-neon font-bold"
                        : isAdminLink
                          ? "bg-transparent border-transparent text-red-400/60 hover:bg-red-500/10 hover:text-red-300"
                          : "bg-transparent border-transparent text-cream/70 hover:bg-white/5 hover:text-cream"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Cierre de sesión */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs uppercase font-grotesk tracking-widest transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            Cerrar Terminal
          </button>
        </div>
      )}
    </div>
  );
}
