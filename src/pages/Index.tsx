import { useState,useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { HeroSection } from "@/components/home/HeroSection";
import { PostsFeed } from "@/components/home/PostsFeed";
import { FixturesList } from "@/components/home/FixturesList";
import { MessageSquare, Calendar,CircleDotDashed,FileCheck  } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Posts from "@/components/Footer/Posts";
import PledgeCard from "@/components/Footer/PledgeCard";
import Fixtures from "@/components/Footer/Fixtures";
import AddPostModal from "@/components/Footer/AddPostalModal";
import { useSelector } from "react-redux";
import { RootState } from "@/components/ReduxPages/store";
import { useAppDispatch } from "@/components/ReduxPages/store";
import { setLaydata } from "@/components/ReduxPages/slices/overlaySlice";


const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);
    const overlay = useSelector((state: RootState) => state.laydata.overlay);
    const [message, setMessage] = useState<string>("");
      const [username, setUsername] = useState<string>("");
      const [userId, setUserId] = useState<string>(""); 
      const [phone,setPhone]=useState("")
      const [caption, setCaption] = useState<string>("");
      const[isOpen,setisOpen]=useState(false)
      const dispatch=useAppDispatch()
    console.log(overlay)


    const changeLayData=()=>{
       dispatch(setLaydata(""));
      
    }



    useEffect(() => {
        try {
          const userString = localStorage.getItem("user");
          if (userString) {
            const user = JSON.parse(userString);
              setUsername(user.username || "");
            setPhone(user.phone || "");
            setUserId(user.id || "");
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
        if(overlay==="addpost"){
          setisOpen(true)

        }
        else{
          setisOpen(false)
        }



      }, [overlay]);
    

  


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
                  posts
                </TabsTrigger>


                <TabsTrigger 
                  value="fixtures" 
                  className="flex-1 gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Calendar className="h-4 w-4" />
                  fixtures
                </TabsTrigger>


                <TabsTrigger 
                  value="pledges" 
                  className="flex-1 gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <FileCheck className="h-4 w-4" />
                  pledges
                </TabsTrigger>
              </TabsList>
              <TabsContent value="posts" className="mt-1">
                <Posts/>
              </TabsContent>
              <TabsContent value="fixtures" className="mt-1">
                <Fixtures />
              </TabsContent>
              <TabsContent value="pledges" className="mt-1">
                <PledgeCard/>
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
         <AddPostModal      
         isOpen={isOpen} 
        onClose={changeLayData}   />
      </main>
    </div>
  );
};

export default Index;
