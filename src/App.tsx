import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./presentation/pages/Public/Home";
import Login from "./presentation/pages/Auth/Login";
import Register from "./presentation/pages/Auth/Register";
import RecoverPassword from "./presentation/pages/Auth/RecoverPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        {/* Aquí irán las rutas privadas después */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
