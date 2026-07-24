import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./presentation/pages/Public/Home";
import Login from "./presentation/pages/Auth/Login";
import Register from "./presentation/pages/Auth/Register";
import RecoverPassword from "./presentation/pages/Auth/RecoverPassword";
import ResetPassword from "./presentation/pages/Auth/ResetPassword";
import DashboardLayout from "./presentation/pages/Dashboard/DashboardLayout";
import { useAuthStore } from "./presentation/store/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Private Dashboard Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
