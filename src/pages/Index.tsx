import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { HeroSection } from "@/components/home/HeroSection";
import  PostsFeed  from "@/components/home/PostsFeed";
import  FixturesList  from "@/components/home/FixturesList";
import { MessageSquare, Calendar, CircleDotDashed, FileCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Posts from "@/components/Footer/PostsMobile";
import PledgeCard from "@/components/Footer/PledgeCard";
import Fixtures from "@/components/Footer/Fixtures";
import AddPostModal from "@/components/Footer/AddPostalModal";
import { useSelector } from "react-redux";
import { RootState } from "@/components/ReduxPages/store";
import { useAppDispatch } from "@/components/ReduxPages/store";
import { setLaydata } from "@/components/ReduxPages/slices/overlaySlice";
import { LoginModal } from "@/components/Footer/LoginModal";
import { UserProfileModal } from "@/components/Footer/UserProfileModal";
import PostsMobile from "@/components/Footer/PostsMobile";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const overlay = useSelector((state: RootState) => state.laydata.overlay);
  const [message, setMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [caption, setCaption] = useState<string>("");
  const [postisOpen, setPostOpen] = useState(false);
  const [loginOpen, setLoging] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false); // Fixed: Added state for account modal
  const dispatch = useAppDispatch();
  const [currentUser, setCurrentUser] = useState(null);

  console.log("Current overlay:", overlay);

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
    // Reset all modal states first
    setPostOpen(false);
    setLoging(false);
    setAccountOpen(false);

    // Set the appropriate modal based on overlay value
    switch (overlay) {
      case "addpost":
        setPostOpen(true);
        break;
      case "login":
        setLoging(true);
        break;
      case "account":
        setAccountOpen(true);
        break;
      case "profile":
        setAccountOpen(true); // Or create a separate profile modal if needed
        break;
      case "settings":
        // Handle settings modal if you have one
        break;
      default:
        // All modals closed
        break;
    }
  }, [overlay]);

  return (
    <div className="h-screen bg-background  overflow-hidden">
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
                <PostsMobile/>
              </TabsContent>
              <TabsContent value="fixtures" className="mt-1">
                <Fixtures />
              </TabsContent>
              <TabsContent value="pledges" className="mt-1">
                <PledgeCard />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop split view */}
          <div className="hidden lg:flex flex-row mt-8">
            {/* Posts column */}
            <div className="flex" >
              <PostsFeed />
            </div>

            {/* Fixtures column */}
            <div >
              <FixturesList/>
            </div>
          </div>

          
        </div>

        {/* Modals */}
        <AddPostModal isOpen={postisOpen} onClose={changeLayData} />

        <LoginModal isOpen={loginOpen} onClose={changeLayData} />

        {/* User Profile/Account Modal - Only show when accountOpen is true */}
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