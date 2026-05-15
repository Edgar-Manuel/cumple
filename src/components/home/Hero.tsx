
import { Button } from "@/components/ui/button";
import { Calendar, Gift, MessageSquare, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getAnimationClasses } from "@/lib/animations";

export default function Hero() {
  return (
    <div className="relative overflow-hidden pt-24 md:pt-32 pb-16 md:pb-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" aria-hidden="true" />
      
      {/* Hero content */}
      <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className={getAnimationClasses({ variant: "fade-in" })}>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                <Sparkles size={14} className="mr-1" />
                Gestión Inteligente de Celebraciones
              </span>
            </div>
            
            <h1 className={getAnimationClasses({ 
              variant: "slide-up", 
              className: "mt-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-balance"
            })}>
              Nunca olvides un <span className="text-primary">momento especial</span>
            </h1>
            
            <p className={getAnimationClasses({ 
              variant: "slide-up", 
              delay: "short",
              className: "mt-6 text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0"
            })}>
              CUMPLE combina inteligencia artificial y automatización para ayudarte a gestionar eventos, 
              personalizar mensajes y encontrar el regalo perfecto para cada ocasión.
            </p>
            
            <div className={getAnimationClasses({ 
              variant: "slide-up", 
              delay: "medium",
              className: "mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            })}>
              <Button asChild size="lg" className="font-medium shadow-subtle">
                <Link to="/dashboard">Comenzar gratis</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-medium">
                <Link to="/">Ver demostración</Link>
              </Button>
            </div>
            
            <div className={getAnimationClasses({ 
              variant: "fade-in", 
              delay: "long",
              className: "mt-8 text-sm text-muted-foreground"
            })}>
              No requiere tarjeta de crédito · Cancela cuando quieras
            </div>
          </div>
          
          {/* Hero image/illustration */}
          <div className={getAnimationClasses({ 
            variant: "fade-in", 
            delay: "medium",
            className: "relative lg:pl-10"
          })}>
            <div className="relative mx-auto max-w-[500px]">
              <div className="glass-card rounded-2xl p-2 sm:p-4 shadow-elevation-2">
                <div className="relative aspect-[3/2] bg-secondary/50 rounded-lg overflow-hidden flex items-center justify-center">
                  {/* Placeholder for hero image */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                    <div className="grid grid-cols-3 gap-6 p-8">
                      <div className="glass-morphism rounded-xl p-4 aspect-square flex items-center justify-center animate-float">
                        <Calendar className="h-10 w-10 text-primary" />
                      </div>
                      <div className="glass-morphism rounded-xl p-4 aspect-square flex items-center justify-center animate-float animation-delay-300">
                        <Gift className="h-10 w-10 text-primary" />
                      </div>
                      <div className="glass-morphism rounded-xl p-4 aspect-square flex items-center justify-center animate-float animation-delay-600">
                        <MessageSquare className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="rounded-md h-2 bg-primary/20 w-2/3 animate-pulse-subtle"></div>
                  <div className="rounded-md h-2 bg-primary/10 w-1/3 animate-pulse-subtle animation-delay-300"></div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -right-6 -top-6 glass-morphism p-4 rounded-xl shadow-elevation-1 animate-float">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute -left-6 bottom-1/3 glass-morphism p-3 rounded-xl shadow-elevation-1 animate-float animation-delay-300">
                <Gift className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
