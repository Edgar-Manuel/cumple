
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const NavLink = ({ 
  to, 
  children, 
  className 
}: { 
  to: string; 
  children: React.ReactNode; 
  className?: string; 
}) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "relative px-3 py-2 text-sm font-medium transition-colors",
        isActive 
          ? "text-foreground" 
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform-gpu transition-all duration-300 ease-spring" />
      )}
    </Link>
  );
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-background/80 backdrop-blur-sm shadow-subtle py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/b1ce8971-2f4a-4077-a957-7b23539b1035.png" 
            alt="CUMPLE Logo" 
            className="h-14 md:h-16"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/events">Eventos</NavLink>
          <NavLink to="/contacts">Contactos</NavLink>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="font-medium transition-all duration-300"
          >
            Iniciar Sesión
          </Button>
          <Button 
            className="font-medium shadow-button transition-all duration-300"
          >
            Registrarse
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "md:hidden absolute w-full bg-background/95 backdrop-blur-md transition-all duration-300 ease-spring border-b",
          mobileMenuOpen 
            ? "top-full opacity-100 visible" 
            : "-top-[30rem] opacity-0 invisible"
        )}
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col space-y-6">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="px-3 py-2 text-foreground font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link 
              to="/dashboard" 
              className="px-3 py-2 text-foreground font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/events" 
              className="px-3 py-2 text-foreground font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Eventos
            </Link>
            <Link 
              to="/contacts" 
              className="px-3 py-2 text-foreground font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contactos
            </Link>
          </nav>
          <div className="flex flex-col space-y-3">
            <Button 
              variant="outline" 
              className="w-full font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Iniciar Sesión
            </Button>
            <Button 
              className="w-full font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
