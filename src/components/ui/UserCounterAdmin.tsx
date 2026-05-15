import { useState } from "react";
import { useUserCount } from "@/hooks/useUserCount";
import { incrementUserCount, resetUserCount } from "@/services/userCountService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Componente administrativo para controlar el contador de usuarios
 * Solo para propósitos de prueba/demostración
 */
export function UserCounterAdmin() {
  const count = useUserCount();
  const [showConfirm, setShowConfirm] = useState(false);
  
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-lg">Control de Contador de Usuarios</CardTitle>
        <CardDescription>Solo para propósitos de prueba</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground mb-1">Usuarios actuales:</p>
          <p className="text-4xl font-bold">{count}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            onClick={() => incrementUserCount()}
            className="w-full"
          >
            Incrementar contador (+1)
          </Button>
          
          {!showConfirm ? (
            <Button 
              variant="destructive" 
              onClick={() => setShowConfirm(true)}
              className="w-full"
            >
              Resetear contador
            </Button>
          ) : (
            <div className="flex flex-col gap-2 border border-destructive/50 rounded-md p-2">
              <p className="text-xs text-center text-muted-foreground">¿Seguro que quieres resetear el contador a 0?</p>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    resetUserCount();
                    setShowConfirm(false);
                  }}
                  className="w-full text-xs"
                >
                  Sí, resetear
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirm(false)}
                  className="w-full text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        Esta herramienta es solo para demostración.
      </CardFooter>
    </Card>
  );
} 