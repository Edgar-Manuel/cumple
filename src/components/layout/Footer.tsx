
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t mt-auto">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="inline-block">
              <img 
                src="/lovable-uploads/b1ce8971-2f4a-4077-a957-7b23539b1035.png" 
                alt="CUMPLE Logo" 
                className="h-12 mb-2"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Gestión inteligente de celebraciones y eventos especiales.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Características</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Precios</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Tutorial</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Compañía</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Acerca de</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Contacto</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Privacidad</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Términos</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} CUMPLE. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Twitter
              </Link>
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Instagram
              </Link>
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
