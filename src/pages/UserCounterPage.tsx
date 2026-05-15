import React from "react";
import { UserCounterAdmin } from "@/components/ui/UserCounterAdmin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserCounterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/" className="flex items-center gap-1">
              <ArrowLeft size={16} />
              Volver al inicio
            </Link>
          </Button>
        </div>
      
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">Administración del Contador de Usuarios</h1>
            <p className="text-muted-foreground">
              Esta página permite ver y modificar el contador de usuarios activos 
              para propósitos de demostración.
            </p>
          </div>
          
          <div className="flex justify-center my-8">
            <UserCounterAdmin />
          </div>
          
          <div className="bg-muted/30 rounded-lg p-6 mt-12">
            <h2 className="font-semibold mb-4">¿Cómo funciona el contador?</h2>
            <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
              <li>El contador de usuarios se incrementa automáticamente cuando un usuario se registra.</li>
              <li>El contador se almacena en localStorage y se mantiene entre sesiones.</li>
              <li>Todos los componentes que muestran el contador se actualizan en tiempo real.</li>
              <li>Esta página de administración es solo para propósitos de demostración.</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 