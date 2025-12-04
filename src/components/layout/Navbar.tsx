import { Bell, Search, Menu, User, Wallet } from "lucide-react";
import { FanclshLogo } from "@/components/icons/FanclshLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { PenSquare, FileEdit, PencilLine, SquarePen } from "lucide-react";
import AddPostModal from "../Footer/AddPostalModal";
import { useAppDispatch } from '../ReduxPages/store';
import { setLaydata } from "../ReduxPages/slices/overlaySlice";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [openPost, setpost] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState("");
  const dispatch = useAppDispatch();
  
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

  const handleModal = (value: string) => {
    setIsModalOpen(true);
    
    // If user is logged in (has userId)
    if (userId) {
      // If the button is "login" or "account" button, show account
      if (value === "login" || value === "account") {
        dispatch(setLaydata("account"));
        console.log("User logged in, showing account:", username, userId);
      }
      // If it's the addpost button, show addpost
      else if (value === "addpost") {
        dispatch(setLaydata("addpost"));
        console.log("User logged in, showing addpost");
      }
      // For any other value, show that value
      else {
        dispatch(setLaydata(value));
      }
    }
    // If user is NOT logged in
    else {
      // Show login modal for login/account buttons
      if (value === "login" || value === "account") {
        dispatch(setLaydata("login"));
        console.log("User not logged in, showing login");
      }
      // Show login for addpost button too (user must be logged in to post)
      else if (value === "addpost") {
        dispatch(setLaydata("login"));
        console.log("User not logged in, must login to add post");
      }
      // For other cases, show the requested value
      else {
        dispatch(setLaydata(value));
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/90 backdrop-blur-xl border-b border-border/30">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <FanclshLogo size={36} />
            <span className="font-display font-bold text-xl tracking-wider text-gradient hidden sm:block">
              fanclash
            </span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <PenSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {/* Search input removed for brevity */}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Add Post Button - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => handleModal('addpost')}
          >
            <PenSquare className="h-5 w-5" />
          </Button>

          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 border-primary/50 text-primary hover:bg-primary/10"
          >
            <Wallet className="h-4 w-4" />
            <span>$250.00</span>
          </Button>

          {/* User/Login Button */}
          <Button
            onClick={() => handleModal("login")}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
