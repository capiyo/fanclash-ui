import { Bell, Search, Menu, User, Wallet, ChevronDown, LogOut, Settings, User as UserIcon, Plus } from "lucide-react";
import { FanclshLogo } from "@/components/icons/FanclshLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect, useRef } from "react";
import { useAppDispatch } from '../ReduxPages/store';
import { setLaydata } from "../ReduxPages/slices/overlaySlice";
import { Flame } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState("");
  const [balance, setBalance] = useState(1250.50);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
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
        setShowProfileDropdown(!showProfileDropdown);
      } else if (value === "addpost") {
        dispatch(setLaydata("addpost"));
        setShowProfileDropdown(false);
      } else {
        dispatch(setLaydata(""));
        setShowProfileDropdown(false);
      }
    } else {
      if (value === "login" || value === "account" || value === "addpost") {
        dispatch(setLaydata("login"));
      } else {
        dispatch(setLaydata(""));
      }
      setShowProfileDropdown(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUsername("");
    setPhone("");
    setUserId("");
    setShowProfileDropdown(false);
    dispatch(setLaydata("login"));
  };

  const handleProfileClick = () => {
    dispatch(setLaydata("profile"));
    setShowProfileDropdown(false);
  };

  const handleSettingsClick = () => {
    dispatch(setLaydata("settings"));
    setShowProfileDropdown(false);
  };

  const handleAddFunds = () => {
    dispatch(setLaydata("addfunds"));
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-r from-[#0A0A0A] to-[#111111] border-b border-emerald-500/20 shadow-lg shadow-black/50">
      <div className="h-full px-3 sm:px-4 flex items-center justify-between max-w-[1600px] mx-auto">
        {/* Left section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-400 hover:text-white hover:bg-emerald-500/10"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.href = '/'}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-md opacity-0 group-hover:opacity-70 transition-opacity rounded-full" />
              <FanclshLogo size={36} className="relative z-10" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
              fanclash
            </span>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block relative ml-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <Input
                type="text"
                placeholder="Search teams, users, matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500 hover:text-white"
                  onClick={() => setSearchQuery("")}
                >
                  <span className="text-xs">✕</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Center - Quick Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-1">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-emerald-500/10 px-3 py-2 rounded-lg transition-all"
          >
            <span className="text-sm font-medium">Football</span>
          </Button>
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-emerald-500/10 px-3 py-2 rounded-lg transition-all"
          >
            <span className="text-sm font-medium">Basketball</span>
          </Button>
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-emerald-500/10 px-3 py-2 rounded-lg transition-all"
          >
            <span className="text-sm font-medium">Tennis</span>
          </Button>
          <div className="w-px h-6 bg-gray-800 mx-2" />
          <Button
            variant="ghost"
            className="text-emerald-400 hover:text-white hover:bg-emerald-500/10 px-3 py-2 rounded-lg transition-all"
          >
            <Flame className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Live</span>
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full animate-pulse">8</span>
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-400 hover:text-white hover:bg-emerald-500/10"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Create Post Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-400 hover:text-white hover:bg-emerald-500/10"
            onClick={() => handleModal('addpost')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-sm opacity-0 hover:opacity-100 transition-opacity" />
            <Plus className="h-5 w-5 relative z-10" />
          </Button>

          <ThemeToggle />

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-400 hover:text-white hover:bg-emerald-500/10"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full ring-2 ring-black" />
          </Button>

          {/* Balance Card */}
          <Button
            variant="outline"
            onClick={handleAddFunds}
            className="hidden sm:flex items-center gap-2 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-400 rounded-full px-4 py-2 transition-all group"
          >
            <Wallet className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="font-bold">${balance.toFixed(2)}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 rounded-full text-emerald-400">+2.4%</span>
          </Button>

          {/* User/Profile Section */}
          <div className="relative" ref={dropdownRef}>
            <Button
              onClick={() => handleModal("login")}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-emerald-500/10 flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-all group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-0 group-hover:opacity-70 transition-opacity" />
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <User className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>
                {userId && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black" />}
              </div>

              {userId && username && (
                <>
                  <span className="hidden sm:inline text-sm font-medium text-white">
                    {username.length > 10 ? `${username.slice(0, 8)}...` : username}
                  </span>
                  <ChevronDown className={`hidden sm:block h-4 w-4 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </>
              )}
            </Button>

            {/* Profile Dropdown */}
            {userId && showProfileDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-emerald-500/20 bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] shadow-2xl shadow-black/50 z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="p-4 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5">
                  <div className="font-semibold text-white">{username}</div>
                  <div className="text-sm text-gray-400 mt-1 truncate">{phone || 'No phone'}</div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="px-2 py-1 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/30">
                      Level 7
                    </span>
                    <span className="px-2 py-1 bg-purple-500/10 rounded-full text-purple-400 border border-purple-500/30">
                      248 XP
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Button
                    variant="ghost"
                    onClick={handleProfileClick}
                    className="w-full justify-start px-4 py-3 h-auto hover:bg-emerald-500/10 rounded-none text-gray-300 hover:text-white"
                  >
                    <UserIcon className="h-4 w-4 mr-3 text-emerald-400" />
                    Your Profile
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleSettingsClick}
                    className="w-full justify-start px-4 py-3 h-auto hover:bg-emerald-500/10 rounded-none text-gray-300 hover:text-white"
                  >
                    <Settings className="h-4 w-4 mr-3 text-emerald-400" />
                    Settings
                  </Button>

                  <div className="border-t border-emerald-500/20 my-1" />

                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start px-4 py-3 h-auto hover:bg-red-500/10 rounded-none text-gray-300 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4 mr-3 text-red-400" />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div
          ref={searchRef}
          className="md:hidden absolute top-16 left-0 right-0 p-3 bg-[#0A0A0A] border-b border-emerald-500/20 animate-in slide-in-from-top-1 duration-200"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              autoFocus
            />
          </div>
        </div>
      )}
    </nav>
  );
};

// Add missing Flame import
