import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Mail, User, Calendar, ShieldCheck } from "lucide-react";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container py-8">
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const copyId = () => {
    navigator.clipboard.writeText(String(user.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const initials = (user.full_name || user.username || user.email || "??")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedJoinDate = new Date(user.created_at).toLocaleDateString(
    "es-ES",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Perfil de Usuario</h1>

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">
                {user.full_name || user.username}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              {user.is_active && (
                <Badge variant="outline" className="mt-3 gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                  Cuenta activa
                </Badge>
              )}
              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={() => signOut()}
              >
                Cerrar sesión
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información de la cuenta</CardTitle>
                <CardDescription>
                  Estos son los datos asociados a tu cuenta en CUMPLE.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nombre de usuario</p>
                    <p className="text-sm text-muted-foreground">
                      {user.username}
                    </p>
                  </div>
                </div>

                {user.full_name && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nombre completo</p>
                      <p className="text-sm text-muted-foreground">
                        {user.full_name}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Correo electrónico</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Miembro desde</p>
                    <p className="text-sm text-muted-foreground">
                      {formattedJoinDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ID de usuario</CardTitle>
                <CardDescription>
                  Identificador único en la base de datos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <code className="bg-muted px-3 py-2 rounded text-sm">
                    {user.id}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyId}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertDescription>
                La edición de perfil y el cambio de contraseña estarán
                disponibles próximamente. Por ahora, contacta con soporte si
                necesitas actualizar tus datos.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
