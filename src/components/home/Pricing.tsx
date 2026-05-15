
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAnimationClasses } from "@/lib/animations";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  discount?: string;
  features: PricingFeature[];
  popular?: boolean;
  cta: string;
}

export default function Pricing() {
  const [pricingPeriod, setPricingPeriod] = useState<"monthly" | "annual">("monthly");
  
  const pricingTiers: PricingTier[] = [
    {
      name: "Básico",
      description: "Perfecto para usuarios individuales",
      monthlyPrice: 5.99,
      annualPrice: 59.88, // 4.99 x 12
      features: [
        { text: "Hasta 20 contactos", included: true },
        { text: "Recordatorios de fechas importantes", included: true },
        { text: "Mensajes predefinidos", included: true },
        { text: "Ideas básicas de regalos", included: true },
        { text: "Soporte por email", included: true },
        { text: "Personalización avanzada de contactos", included: false },
        { text: "Generación de mensajes con IA", included: false },
        { text: "Integración con redes sociales", included: false },
      ],
      cta: "Comenzar gratis"
    },
    {
      name: "Estándar",
      description: "Ideal para familias organizadas",
      monthlyPrice: 9.99,
      annualPrice: 95.88, // 7.99 x 12
      discount: "Ahorra 20%",
      features: [
        { text: "Hasta 100 contactos", included: true },
        { text: "Recordatorios de fechas importantes", included: true },
        { text: "Mensajes predefinidos", included: true },
        { text: "Ideas avanzadas de regalos", included: true },
        { text: "Soporte prioritario", included: true },
        { text: "Personalización avanzada de contactos", included: true },
        { text: "Generación de mensajes con IA", included: true },
        { text: "Integración con redes sociales", included: false },
      ],
      popular: true,
      cta: "Prueba 14 días gratis"
    },
    {
      name: "Premium",
      description: "Para usuarios exigentes",
      monthlyPrice: 14.99,
      annualPrice: 143.88, // 11.99 x 12
      discount: "Ahorra 20%",
      features: [
        { text: "Contactos ilimitados", included: true },
        { text: "Recordatorios de fechas importantes", included: true },
        { text: "Mensajes predefinidos", included: true },
        { text: "Recomendaciones premium de regalos", included: true },
        { text: "Soporte VIP 24/7", included: true },
        { text: "Personalización avanzada de contactos", included: true },
        { text: "Generación avanzada de mensajes con IA", included: true },
        { text: "Integración con redes sociales", included: true },
      ],
      cta: "Prueba 14 días gratis"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className={getAnimationClasses({ 
            variant: "slide-up",
            className: "text-3xl sm:text-4xl font-bold"
          })}>
            Planes adaptados a ti
          </h2>
          <p className={getAnimationClasses({ 
            variant: "slide-up",
            delay: "short",
            className: "mt-4 text-xl text-muted-foreground"
          })}>
            Elige el plan que mejor se adapte a tus necesidades y comienza a
            disfrutar de todas las ventajas de CUMPLE.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <Tabs 
            defaultValue="monthly" 
            value={pricingPeriod}
            onValueChange={(v) => setPricingPeriod(v as "monthly" | "annual")}
            className="w-full max-w-md"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="monthly">Mensual</TabsTrigger>
              <TabsTrigger value="annual">
                Anual
                <Badge className="ml-2 bg-primary/20 text-primary border-none">Ahorra 20%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <div 
              key={tier.name}
              className={getAnimationClasses({ 
                variant: "fade-in", 
                delay: index === 0 ? "none" : index === 1 ? "short" : "medium" 
              })}
            >
              <Card className={cn(
                "h-full flex flex-col transition-all duration-300",
                tier.popular && "border-primary shadow-lg relative scale-[1.02] z-10"
              )}>
                {tier.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      <span>Más popular</span>
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      {pricingPeriod === "monthly" 
                        ? `${tier.monthlyPrice.toFixed(2)}€` 
                        : `${tier.annualPrice.toFixed(2)}€`}
                    </span>
                    <span className="text-muted-foreground">
                      {pricingPeriod === "monthly" ? "/mes" : "/año"}
                    </span>
                    {tier.discount && pricingPeriod === "annual" && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-primary">
                          {tier.discount}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        {feature.included ? (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <span className={cn(
                          "text-sm",
                          feature.included ? "" : "text-muted-foreground"
                        )}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={cn("w-full", 
                      tier.popular ? "bg-primary" : "bg-secondary"
                    )}
                    size="lg"
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="text-muted-foreground">
            Todos los planes incluyen una prueba gratuita de 14 días. No necesitas 
            tarjeta de crédito para comenzar. Puedes cancelar en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  );
}
