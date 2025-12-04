import { Bell, Search, Menu, User, Wallet, ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";
import { FanclshLogo } from "@/components/icons/FanclshLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect, useRef } from "react";
import { PenSquare } from "lucide-react";
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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleModal = (value: string) => {
    if (userId) {
      if (value === "login" || value === "account") {
        // Toggle dropdown instead of setting overlay
        setShowProfileDropdown(!showProfileDropdown);
      } else if (value === "addpost") {
        dispatch(setLaydata("addpost"));
        setShowProfileDropdown(false);
      } else {
        dispatch(setLaydata(""));
        setShowProfileDropdown(false);
      }
    } else {
      if (value === "login" || value === "account") {
        dispatch(setLaydata("login"));
      } else if (value === "addpost") {
        dispatch(setLaydata("login"));
      } else {
        dispatch(setLaydata(""));
      }
      setShowProfileDropdown(false);
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Reset state
    setUsername("");
    setPhone("");
    setUserId("");
    
    // Close dropdown
    setShowProfileDropdown(false);
    
    // Optionally dispatch an action to reset user state in Redux
    // dispatch(logoutUser());
    
    // Show login modal
    dispatch(setLaydata("login"));
    
    console.log("User logged out");
  };

  const handleProfileClick = () => {
    // Navigate to user profile page or open profile overlay
    dispatch(setLaydata("profile"));
    setShowProfileDropdown(false);
  };

  const handleSettingsClick = () => {
    // Navigate to settings page or open settings overlay
    dispatch(setLaydata("settings"));
    setShowProfileDropdown(false);
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

          {/* User/Login Button with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              onClick={() => handleModal("login")}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <User className="h-5 w-5" />
              {userId && username && (
                <>
                  <span className="hidden sm:inline text-sm font-medium">
                    {username}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </>
              )}
            </Button>
            
            {/* Profile Dropdown */}
            {userId && showProfileDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-background shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-border">
                  <div className="font-medium text-foreground">{username}</div>
                  <div className="text-sm text-muted-foreground truncate">{phone}</div>
                </div>
                
                <div className="py-1">
                  <Button
                    variant="ghost"
                    onClick={handleProfileClick}
                    className="w-full justify-start px-3 py-2 h-auto hover:bg-accent"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Your Profile
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleSettingsClick}
                    className="w-full justify-start px-3 py-2 h-auto hover:bg-accent"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start px-3 py-2 h-auto hover:bg-destructive/10 hover:text-destructive text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};