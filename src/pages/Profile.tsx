import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import supabase from "@/lib/supabase";
import { getUserId } from "@/scripts/getUserId";

const profileSchema = z.object({
  name: z.string().optional(),
  website: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
});

const securitySchema = z.object({
  currentPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  newPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  confirmPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;

export default function Profile() {
  const { user } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");

  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  const copyToClipboard = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 3000);
    }
  };

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.user_metadata?.name || "",
      website: user?.user_metadata?.website || "",
    },
  });

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const getInitials = () => {
    if (!user || !user.email) return "??";
    
    const email = user.email;
    const parts = email.split('@');
    return parts[0].substring(0, 2).toUpperCase();
  };

  async function onProfileSubmit(values: ProfileFormValues) {
    try {
      setSecurityMessage("");
      setProfileMessage("");

      const { error } = await supabase.auth.updateUser({
        data: {
          name: values.name,
          website: values.website,
        },
      });

      if (error) {
        setProfileMessage(error.message);
        return;
      }

      setProfileMessage("Perfil actualizado correctamente");
    } catch (err) {
      setProfileMessage("Ocurrió un error al actualizar el perfil");
      console.error(err);
    }
  }

  async function onSecuritySubmit(values: SecurityFormValues) {
    try {
      setSecurityMessage("");
      setProfileMessage("");

      const { error: passwordError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (passwordError) {
        setSecurityMessage(passwordError.message);
        return;
      }

      setSecurityMessage("Contraseña actualizada correctamente");
      securityForm.reset();
    } catch (err) {
      setSecurityMessage("Ocurrió un error al actualizar la contraseña");
      console.error(err);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Perfil de Usuario</h1>

        <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <div className="space-y-4">
            <Card>
              <CardContent className="flex flex-col items-center p-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt="Avatar" />
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{user.user_metadata?.name || user.email}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ID de Usuario</CardTitle>
                <CardDescription>Este es tu ID único en la base de datos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <code className="bg-muted p-2 rounded overflow-x-auto max-w-[300px]">
                    {userId || "Cargando..."}
                  </code>
                  <Button 
                    variant="outline" 
                    onClick={copyToClipboard}
                    disabled={!userId}
                  >
                    {copiedToClipboard ? "¡Copiado!" : "Copiar ID"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Usa este ID para referencias en la base de datos de Supabase.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración de la Cuenta</CardTitle>
                <CardDescription>Administra la configuración de tu cuenta y cambia tu contraseña</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile" className="space-y-4 py-4">
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input placeholder="Tu nombre" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sitio Web</FormLabel>
                              <FormControl>
                                <Input placeholder="https://tusitioweb.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit">Guardar Cambios</Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-4 py-4">
                    <Form {...securityForm}>
                      <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                        <FormField
                          control={securityForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contraseña Actual</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="********" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={securityForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nueva Contraseña</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="********" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={securityForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar Contraseña</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="********" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit">Actualizar Contraseña</Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>

                {profileMessage && (
                  <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{profileMessage}</AlertDescription>
                  </Alert>
                )}

                {securityMessage && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{securityMessage}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 