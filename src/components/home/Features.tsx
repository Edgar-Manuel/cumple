
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Gift, 
  MessageSquare, 
  Share2, 
  Star, 
  Shield, 
  BrainCircuit
} from "lucide-react";
import { getAnimationClasses } from "@/lib/animations";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn(
      "glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-elevation-2 hover:scale-[1.02] border border-white/30",
      className
    )}>
      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <div className="py-20 bg-secondary/30">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className={getAnimationClasses({ 
            variant: "slide-up",
            className: "text-3xl sm:text-4xl font-bold"
          })}>
            Todo lo que necesitas para tus celebraciones
          </h2>
          <p className={getAnimationClasses({ 
            variant: "slide-up",
            delay: "short",
            className: "mt-4 text-xl text-muted-foreground"
          })}>
            Deja que la inteligencia artificial se encargue de recordar fechas, 
            generar mensajes personalizados y sugerir el regalo perfecto.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className={getAnimationClasses({ variant: "fade-in", delay: "none" })}>
            <FeatureCard
              icon={<Calendar size={24} />}
              title="Gestión de Eventos"
              description="Calendario interactivo con alertas personalizadas y recordatorios para nunca olvidar una fecha importante."
            />
          </div>
          
          <div className={getAnimationClasses({ variant: "fade-in", delay: "short" })}>
            <FeatureCard
              icon={<BrainCircuit size={24} />}
              title="Agentes Inteligentes"
              description="Tecnología de IA que aprende tus preferencias para ofrecer recomendaciones cada vez más personalizadas."
            />
          </div>
          
          <div className={getAnimationClasses({ variant: "fade-in", delay: "medium" })}>
            <FeatureCard
              icon={<MessageSquare size={24} />}
              title="Mensajes Personalizados"
              description="Generación automática de mensajes con el tono perfecto para cada ocasión y persona."
            />
          </div>
          
          <div className={getAnimationClasses({ variant: "fade-in", delay: "short" })}>
            <FeatureCard
              icon={<Gift size={24} />}
              title="Recomendación de Regalos"
              description="Sugerencias inteligentes basadas en intereses, historial y preferencias de cada contacto."
            />
          </div>
          
          <div className={getAnimationClasses({ variant: "fade-in", delay: "medium" })}>
            <FeatureCard
              icon={<Share2 size={24} />}
              title="Automatización Social"
              description="Publica felicitaciones automáticamente en redes sociales en el momento preciso."
            />
          </div>
          
          <div className={getAnimationClasses({ variant: "fade-in", delay: "long" })}>
            <FeatureCard
              icon={<Shield size={24} />}
              title="Seguridad y Privacidad"
              description="Protección de datos con cifrado avanzado y cumplimiento GDPR para tu tranquilidad."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
