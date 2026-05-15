import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Gift, Share2 } from "lucide-react";
import { getAnimationClasses } from "@/lib/animations";

interface AddOnPackage {
  icon: React.ReactNode;
  title: string;
  description: string;
  price: string;
  highlight?: boolean;
}

export default function AddOns() {
  const addOnPackages: AddOnPackage[] = [
    {
      icon: <MessageSquare className="h-5 w-5 text-primary" />,
      title: "Paquete de Mensajes Premium",
      description: "Acceso a 100 mensajes personalizados con IA para cualquier ocasión. Exprésate de forma única y sorprende a tus seres queridos.",
      price: "4.99€",
      highlight: true
    },
    {
      icon: <Gift className="h-5 w-5 text-primary" />,
      title: "Paquete de Regalos Exclusivos",
      description: "Lista de 50 regalos únicos recomendados por IA según personalidad y gustos. Encuentra el regalo perfecto con estas sugerencias exclusivas.",
      price: "7.99€"
    },
    {
      icon: <Share2 className="h-5 w-5 text-primary" />,
      title: "Integración con WhatsApp Premium",
      description: "Notificaciones y mensajes enviados directamente a WhatsApp en tiempo real. Mantente conectado y nunca olvides una fecha importante.",
      price: "2.99€/mes"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className={getAnimationClasses({ 
            variant: "slide-up",
            className: "text-3xl sm:text-4xl font-bold"
          })}>
            Complementos Exclusivos
          </h2>
          <p className={getAnimationClasses({ 
            variant: "slide-up",
            delay: "short",
            className: "mt-4 text-xl text-muted-foreground"
          })}>
            Mejora tu experiencia con estos paquetes adicionales diseñados 
            para potenciar tus celebraciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {addOnPackages.map((pack, index) => (
            <div 
              key={pack.title}
              className={getAnimationClasses({ 
                variant: "fade-in", 
                delay: index === 0 ? "none" : index === 1 ? "short" : "medium" 
              })}
            >
              <Card className={`h-full flex flex-col ${pack.highlight ? 'border-primary shadow-md' : ''}`}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {pack.icon}
                    </div>
                    <CardTitle className="text-lg">{pack.title}</CardTitle>
                  </div>
                  <CardDescription>{pack.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-2xl font-bold text-center my-4 text-primary">
                    {pack.price}
                    {pack.price.includes('/mes') && <span className="text-sm text-muted-foreground ml-1">por mes</span>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant={pack.highlight ? "default" : "secondary"} className="w-full">
                    Añadir a mi plan
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Los complementos están disponibles para todos los planes. 
            Puedes añadirlos o cancelarlos en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  );
} 