
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactList from "@/components/contacts/ContactList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAnimationClasses } from "@/lib/animations";

const Contacts = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 bg-secondary/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          {/* Page header */}
          <div className="mb-8">
            <h1 className={getAnimationClasses({ 
              variant: "slide-up", 
              className: "text-3xl font-bold tracking-tight" 
            })}>
              Contactos
            </h1>
            <p className={getAnimationClasses({ 
              variant: "slide-up", 
              delay: "short",
              className: "text-muted-foreground mt-1" 
            })}>
              Gestiona tus contactos y añade sus fechas importantes.
            </p>
          </div>
          
          {/* Contacts content */}
          <Tabs defaultValue="all" className={getAnimationClasses({ variant: "fade-in", delay: "medium" })}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="favorites">Favoritos</TabsTrigger>
              <TabsTrigger value="family">Familia</TabsTrigger>
              <TabsTrigger value="friends">Amigos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <ContactList />
            </TabsContent>
            
            <TabsContent value="favorites">
              <ContactList />
            </TabsContent>
            
            <TabsContent value="family">
              <ContactList />
            </TabsContent>
            
            <TabsContent value="friends">
              <ContactList />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contacts;
