import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import Home from "./presentation/pages/Public/Home";
import Login from "./presentation/pages/Auth/Login";
import Register from "./presentation/pages/Auth/Register";
import RecoverPassword from "./presentation/pages/Auth/RecoverPassword";
import ResetPassword from "./presentation/pages/Auth/ResetPassword";
import NotFound from "./presentation/pages/Public/NotFound";
import DashboardLayout from "./presentation/pages/Dashboard/DashboardLayout";
import { useAuthStore } from "./presentation/store/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RootRedirect() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || searchParams.get("uidb64");
  const token = searchParams.get("token");

  if (uid && token) {
    return <Navigate to={`/reset-password?uid=${uid}&token=${token}`} replace />;
  }

  return <Home />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/password-reset/confirm/:uid/:token" element={<ResetPassword />} />
        <Route path="/auth/password-reset-confirm/:uid/:token" element={<ResetPassword />} />
        <Route path="/404" element={<NotFound />} />
        
        {/* Private Dashboard Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all route to NotFound */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
