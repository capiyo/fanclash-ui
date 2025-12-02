import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { HeroSection } from "@/components/home/HeroSection";
import { PostsFeed } from "@/components/home/PostsFeed";
import { FixturesList } from "@/components/home/FixturesList";
import { MessageSquare, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <main className="pt-16 lg:pl-16">
        <div className="max-w-7xl mx-auto px-1 py-1">
          {/* Hero Section */}
          <HeroSection />
          
          {/* Mobile tabs */}
          <div className="lg:hidden mt-8">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full bg-secondary/30 p-1">
                <TabsTrigger 
                  value="posts" 
                  className="flex-1 gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <MessageSquare className="h-4 w-4" />
                  Posts
                </TabsTrigger>
                <TabsTrigger 
                  value="fixtures" 
                  className="flex-1 gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Calendar className="h-4 w-4" />
                  Fixtures
                </TabsTrigger>
              </TabsList>
              <TabsContent value="posts" className="mt-4">
                <PostsFeed />
              </TabsContent>
              <TabsContent value="fixtures" className="mt-4">
                <FixturesList />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop split view */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8 mt-8">
            {/* Posts column */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Community Posts</h2>
              </div>
              <PostsFeed />
            </section>

            {/* Fixtures column */}
            <section>
              <FixturesList />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
