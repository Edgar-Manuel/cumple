import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Events from "@/pages/Events";
import Contacts from "@/pages/Contacts";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Gifts from "@/pages/Gifts";
import EventGifts from "@/pages/EventGifts";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      
      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/gifts" element={<Gifts />} />
        <Route path="/gifts/event/:eventId" element={<EventGifts />} />
      </Route>
      
      {/* Ruta de captura para páginas no encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
} 