import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Gift,
  MoreHorizontal,
  Phone,
  Mail,
  Star,
  User,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ContactProps {
  id: number | string;
  name: string;
  image?: string;
  email?: string;
  phone?: string;
  birthdate?: Date;
  relationship?: string;
  relationshipLevel?: number; // 1-5
  className?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onViewEvents?: () => void;
  onViewGifts?: () => void;
  onSendMessage?: () => void;
}

export default function ContactCard({
  name,
  image,
  email,
  phone,
  birthdate,
  relationship,
  relationshipLevel = 3,
  className,
  onDelete,
  onEdit,
  onViewEvents,
  onViewGifts,
  onSendMessage,
}: ContactProps) {
  const formattedBirthdate = birthdate
    ? new Intl.DateTimeFormat("es", {
        day: "numeric",
        month: "long",
      }).format(birthdate)
    : null;

  const daysUntilBirthday = birthdate
    ? (() => {
        const today = new Date();
        const nextBirthday = new Date(
          today.getFullYear(),
          birthdate.getMonth(),
          birthdate.getDate()
        );
        if (nextBirthday < today) {
          nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        const diffTime = nextBirthday.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      })()
    : null;

  return (
    <div
      className={cn(
        "glass-card rounded-xl overflow-hidden transition-all duration-300",
        className
      )}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {image ? (
              <img
                src={image}
                alt={name}
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-subtle"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shadow-subtle">
                <User size={20} className="text-secondary-foreground" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-lg">{name}</h3>
              {relationship && (
                <p className="text-xs text-muted-foreground">{relationship}</p>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="flex mt-1">
                  {Array(5)
                    .fill(0)
                    .map((_, idx) => (
                      <Star
                        key={idx}
                        size={14}
                        className={cn(
                          "mr-0.5",
                          idx < relationshipLevel
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/40"
                        )}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>Editar contacto</DropdownMenuItem>
              )}
              {onViewEvents && (
                <DropdownMenuItem onClick={onViewEvents}>Ver eventos</DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-2">
          {email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-muted-foreground" />
              <span className="truncate">{email}</span>
            </div>
          )}

          {phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-muted-foreground" />
              <span>{phone}</span>
            </div>
          )}

          {birthdate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-muted-foreground" />
              <span>
                {formattedBirthdate}
                {daysUntilBirthday !== null && daysUntilBirthday <= 30 && (
                  <span className="ml-2 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                    {daysUntilBirthday === 0
                      ? "¡Hoy!"
                      : daysUntilBirthday === 1
                      ? "¡Mañana!"
                      : `En ${daysUntilBirthday} días`}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t flex divide-x">
        <Button
          variant="ghost"
          className="flex-1 rounded-none h-10 text-xs"
          onClick={onViewGifts}
        >
          <Gift size={14} className="mr-1" />
          <span className="hidden sm:inline">Regalos</span>
        </Button>
        <Button
          variant="ghost"
          className="flex-1 rounded-none h-10 text-xs"
          onClick={onViewEvents}
        >
          <Calendar size={14} className="mr-1" />
          <span className="hidden sm:inline">Eventos</span>
        </Button>
        <Button
          variant="ghost"
          className="flex-1 rounded-none h-10 text-xs"
          onClick={onSendMessage}
        >
          <Mail size={14} className="mr-1" />
          <span className="hidden sm:inline">Mensaje</span>
        </Button>
      </div>
    </div>
  );
}
