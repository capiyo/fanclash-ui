import { 
  Home, 
  Trophy, 
  Users, 
  TrendingUp, 
  Wallet, 
  Settings, 
  HelpCircle,
  Flame,
  Calendar,
  Award,
  MessageSquare,
  Bell,
  Hash,
  Bookmark,
  User,
  Zap,
  Search,
  MoreHorizontal,
  Plus,
  Sparkles,
  Target,
  Crown,
  X,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "Home", active: true, notification: 0 },
  { icon: Hash, label: "Explore", active: false, notification: 12 },
  { icon: Bell, label: "Notifications", active: false, notification: 3 },
  { icon: MessageSquare, label: "Messages", active: false, notification: 7 },
  { icon: Bookmark, label: "Bookmarks", active: false, notification: 0 },
  { icon: Users, label: "Communities", active: false, notification: 0 },
  { icon: Award, label: "Premium", active: false, notification: 0 },
  { icon: User, label: "Profile", active: false, notification: 0 },
  { icon: MoreHorizontal, label: "More", active: false, notification: 0 },
];

const trendingItems = [
  { icon: Flame, label: "Hot Bets", count: 42, trending: "up" },
  { icon: Trophy, label: "Live Matches", count: 8, trending: "live" },
  { icon: TrendingUp, label: "Trending", count: 156, trending: "up" },
  { icon: Calendar, label: "Upcoming", count: 23, trending: "new" },
  { icon: Target, label: "Predictions", count: 89, trending: "hot" },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [userBalance, setUserBalance] = useState(1250.75);
  const [currentTime, setCurrentTime] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Format current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePost = () => {
    console.log("Create new post");
  };

  // Compact sidebar for mobile
  const sidebarWidth = isMobile ? "w-64" : "w-72";

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Mobile toggle button */}
      {isMobile && !isOpen && (
        <button
          onClick={() => onClose()}
          className="fixed bottom-4 left-4 z-40 lg:hidden p-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isMobile ? (isOpen ? 0 : -280) : 0,
          opacity: isMobile ? (isOpen ? 1 : 0) : 1
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50",
          sidebarWidth,
          "bg-[#0A0A0A] border-r border-gray-800/50",
          "lg:block lg:translate-x-0 lg:opacity-100",
          isMobile && isOpen ? "block" : "hidden"
        )}
        style={{ 
          background: "linear-gradient(180deg, #0A0A0A 0%, #111111 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "inset -1px 0 0 rgba(255,255,255,0.1)"
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Search - Compact */}
          <div className="p-3 border-b border-gray-800/50">
            <div className="flex items-center justify-between mb-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur opacity-50 rounded-full" />
                  <div className="relative bg-gradient-to-br from-gray-900 to-black p-1.5 rounded-lg border border-gray-800">
                    <Trophy className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    FanClash
                  </h1>
                  <p className="text-[10px] text-gray-500">Sports • Betting</p>
                </div>
              </motion.div>
              
              {/* Close button for mobile */}
              {isMobile && (
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 rounded-full bg-gray-900/50 border border-gray-800"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
            
            {/* Time indicator - compact */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                {currentTime}
              </div>
              <div className="text-[10px] text-gray-500 flex items-center gap-1">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Online</span>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-900/50 border border-gray-800 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all"
              />
            </div>
          </div>

          {/* Main Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto py-3 px-2">
            <div className="space-y-0.5">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ 
                    scale: 1.01,
                    x: 2,
                    backgroundColor: "rgba(16, 185, 129, 0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all duration-150 relative group",
                    "text-gray-300 hover:text-white",
                    "text-xs", // Smaller text
                    item.active 
                      ? "bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-l border-emerald-400"
                      : "hover:bg-gray-900/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1.5 rounded-md transition-all duration-150",
                      item.active 
                        ? "bg-emerald-500/20" 
                        : "bg-gray-900 group-hover:bg-emerald-500/10"
                    )}>
                      <item.icon className={cn(
                        "h-3.5 w-3.5 transition-all duration-150",
                        item.active 
                          ? "text-emerald-400" 
                          : "text-gray-500 group-hover:text-emerald-400"
                      )} />
                    </div>
                    <span className={cn(
                      "font-medium transition-all duration-150 truncate",
                      item.active ? "text-emerald-400" : "group-hover:text-white"
                    )}>
                      {item.label}
                    </span>
                  </div>
                  
                  {item.notification > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "px-1.5 py-0.5 text-[10px] font-bold rounded-full min-w-[18px] text-center",
                        item.active 
                          ? "bg-emerald-500 text-white" 
                          : "bg-red-500/20 text-red-400"
                      )}
                    >
                      {item.notification}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Post Button - Compact */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePost}
              className="mt-4 w-full py-2.5 text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-1.5 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <Plus className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10">New Bet</span>
            </motion.button>

            {/* Trending Section - Compact */}
            <div className="mt-6 px-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trending</h3>
                <Zap className="h-3 w-3 text-yellow-500" />
              </div>
              
              <div className="space-y-1.5">
                {trendingItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 + 0.2 }}
                    whileHover={{ 
                      scale: 1.01,
                      backgroundColor: "rgba(255,255,255,0.02)"
                    }}
                    className="p-2 rounded-lg border border-gray-800/50 hover:border-emerald-500/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded-md",
                          item.trending === "up" ? "bg-emerald-500/10" :
                          item.trending === "live" ? "bg-red-500/10" :
                          item.trending === "hot" ? "bg-orange-500/10" :
                          "bg-blue-500/10"
                        )}>
                          <item.icon className={cn(
                            "h-3 w-3",
                            item.trending === "up" ? "text-emerald-400" :
                            item.trending === "live" ? "text-red-400" :
                            item.trending === "hot" ? "text-orange-400" :
                            "text-blue-400"
                          )} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors truncate">
                            {item.label}
                          </p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {item.trending === "up" && (
                              <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
                            )}
                            {item.trending === "live" && (
                              <div className="flex items-center gap-0.5">
                                <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                              </div>
                            )}
                            <span className="text-[10px] text-gray-500">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        item.trending === "up" ? "bg-emerald-500/20 text-emerald-400" :
                        item.trending === "live" ? "bg-red-500/20 text-red-400" :
                        item.trending === "hot" ? "bg-orange-500/20 text-orange-400" :
                        "bg-blue-500/20 text-blue-400"
                      )}>
                        {item.trending === "up" ? "+" :
                         item.trending === "live" ? "LIVE" :
                         item.trending === "new" ? "NEW" : "HOT"}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </nav>

          {/* User Profile & Stats - Compact */}
          <div className="border-t border-gray-800/50 p-3">
            {/* Balance Card - Compact */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="mb-3 p-3 rounded-lg bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs text-gray-400">Balance</span>
                </div>
                <div className="flex items-center gap-0.5 text-[10px]">
                  <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
                  <span className="text-emerald-400">+24%</span>
                </div>
              </div>
              <div className="text-lg font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Ksh {userBalance.toLocaleString()}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-2 w-full py-1.5 text-xs bg-emerald-500/10 text-emerald-400 font-medium rounded-md border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
              >
                Add Funds
              </motion.button>
            </motion.div>

            {/* Profile Footer - Ultra Compact */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      <User className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white truncate max-w-[100px]">
                    JohnDoe
                  </p>
                  <p className="text-[10px] text-gray-500 truncate max-w-[100px]">
                    @johndoe_bets
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="p-1.5 rounded-full bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-gray-400" />
                </motion.button>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-1">
                  <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-400">42</span>
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[10px] font-bold text-blue-400">68%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Compact Sidebar for Large Screens (Collapsed State) */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 w-16">
        <div className="flex flex-col h-full bg-[#0A0A0A] border-r border-gray-800/50 py-4 px-2">
          {/* Logo - Compact */}
          <div className="flex justify-center mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
              <Trophy className="h-5 w-5 text-emerald-400" />
            </div>
          </div>

          {/* Compact Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.slice(0, 5).map((item) => (
              <button
                key={item.label}
                className="relative w-full p-2.5 rounded-lg hover:bg-gray-900/50 transition-colors group"
                title={item.label}
              >
                <div className={cn(
                  "p-1.5 rounded-md mx-auto",
                  item.active 
                    ? "bg-emerald-500/20" 
                    : "bg-gray-900 group-hover:bg-emerald-500/10"
                )}>
                  <item.icon className={cn(
                    "h-4 w-4 mx-auto",
                    item.active 
                      ? "text-emerald-400" 
                      : "text-gray-500 group-hover:text-emerald-400"
                  )} />
                </div>
                {item.notification > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="space-y-2">
            <button className="w-full p-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
              <Plus className="h-4 w-4 mx-auto" />
            </button>
            <button className="w-full p-2.5 rounded-lg hover:bg-gray-900/50 transition-colors">
              <Settings className="h-4 w-4 text-gray-400 mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};