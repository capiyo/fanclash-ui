import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import PostsFeed from "@/components/home/PostsFeed";
import FixturesList from "@/components/home/FixturesList";
import { Sidebar } from "@/components/layout/Sidebar";
import { MessageSquare, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PledgeCard from "@/components/Footer/PledgeCard";
import Fixtures from "@/components/Footer/Fixtures";
import AddPostModal from "@/components/Footer/AddPostalModal";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { RootState } from "@/components/ReduxPages/store";
import { useAppDispatch } from "@/components/ReduxPages/store";
import { setLaydata } from "@/components/ReduxPages/slices/overlaySlice";
import { LoginModal } from "@/components/Footer/LoginModal";
import { UserProfileModal } from "@/components/Footer/UserProfileModal";
import { Sword } from "lucide-react"; // Import Sword icon for fighting

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const overlay = useSelector((state: RootState) => state.laydata.overlay);
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [postisOpen, setPostOpen] = useState(false);
  const [loginOpen, setLoging] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const dispatch = useAppDispatch();

  const changeLayData = () => {
    dispatch(setLaydata(""));
  };

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
  }, []);

  // Update modal states based on Redux overlay
  useEffect(() => {
    setPostOpen(false);
    setLoging(false);
    setAccountOpen(false);

    switch (overlay) {
      case "addpost":
        setPostOpen(true);
        break;
      case "login":
        setLoging(true);
        break;
      case "account":
      case "profile":
        setAccountOpen(true);
        break;
      default:
        break;
    }
  }, [overlay]);

  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content - Add margin-left for desktop to account for sidebar */}
      <main className={cn(
        "pt-14 h-[calc(100vh-3.5rem)] overflow-hidden transition-all duration-300",
        "lg:ml-72"
      )}>
        <div className="h-full max-w-[1600px] mx-auto px-4 md:px-6 flex flex-col">
          {/* Hero Section */}
          <div className="py-2 flex-shrink-0">
            <HeroSection />
          </div>

          {/* Mobile view with tabs at bottom */}
          <div className="lg:hidden flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="posts" className="flex-1 flex flex-col">
              <TabsContent value="posts" className="flex-1 overflow-hidden mt-0">
                <div className="h-full overflow-y-auto pr-1 custom-scrollbar pb-16">
                  <PostsFeed />
                </div>
              </TabsContent>
              <TabsContent value="fixtures" className="flex-1 overflow-hidden mt-0">
                <div className="h-full overflow-y-auto pr-1 custom-scrollbar pb-16">
                  <FixturesList />
                </div>
              </TabsContent>

              {/* TabsList at bottom */}
              <TabsList className="w-full bg-gray-900/90 p-1 rounded-xl border border-gray-800/50 fixed bottom-4 left-0 right-0 mx-auto max-w-[calc(100%-2rem)] z-50 backdrop-blur-lg">
                <TabsTrigger
                  value="posts"
                  className="flex-1 gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 rounded-lg py-3"
                >
                  <MessageSquare className="h-5 w-5" />
                  feed
                </TabsTrigger>
                <TabsTrigger
                  value="fixtures"
                  className="flex-1 gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 rounded-lg py-3"
                >
                  <Sword className="h-5 w-5" /> {/* Fighting icon */}
                  clash
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Desktop split view */}
          <div className="hidden lg:flex h-[calc(100vh-10rem)] gap-4 py-2">
            {/* Posts column */}
            <div className="w-[55%] h-full overflow-hidden">
              <div className="h-full overflow-y-auto pr-3 custom-scrollbar">
                <PostsFeed />
              </div>
            </div>

            {/* Fixtures column */}
            <div className="w-[45%] h-full overflow-hidden">
              <div className="h-full overflow-y-auto pl-2 custom-scrollbar">
                <FixturesList />
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AddPostModal isOpen={postisOpen} onClose={changeLayData} />
        <LoginModal isOpen={loginOpen} onClose={changeLayData} />
        {accountOpen && (
          <UserProfileModal
            isOpen={accountOpen}
            onClose={changeLayData}
            username={username}
            phone={phone}
            userId={userId}
          />
        )}
      </main>
    </div>
  );
};

export default Index;