import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventList from "@/components/events/EventList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAnimationClasses } from "@/lib/animations";

const Events = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 bg-secondary/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className={getAnimationClasses({ 
              variant: "slide-up", 
              className: "text-3xl font-bold tracking-tight" 
            })}>
              Eventos
            </h1>
            <p className={getAnimationClasses({ 
              variant: "slide-up", 
              delay: "short",
              className: "text-muted-foreground mt-1" 
            })}>
              Gestiona todos tus eventos y celebraciones importantes.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className={getAnimationClasses({ variant: "fade-in", delay: "medium" })}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="birthdays">Cumpleaños</TabsTrigger>
              <TabsTrigger value="anniversaries">Aniversarios</TabsTrigger>
              <TabsTrigger value="other">Otros</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <EventList categoryFilter={null} />
            </TabsContent>
            
            <TabsContent value="birthdays">
              <EventList categoryFilter="birthday" />
            </TabsContent>
            
            <TabsContent value="anniversaries">
              <EventList categoryFilter="anniversary" />
            </TabsContent>
            
            <TabsContent value="other">
              <EventList categoryFilter="other" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Events;
