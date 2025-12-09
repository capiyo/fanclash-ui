import { 
  Heart, MessageCircle, Share2, Swords, Eye, Wallet, Coins, 
  CheckCircle, UserPlus, DollarSign, ShieldCheck, AlertCircle,
  Search, Home, BarChart3, Plus, ArrowUpDown, Loader2, Bookmark,
  MoreVertical, XCircle, LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface PledgeData {
  amount: number;
  away_team: string;
  home_team: string;
  selection: string;
  fan: string;
  starter_id: string;
  username: string;
  phone: string;
  time: string;
  _id?: string;
  created_at?: string;
  odds?: {
    home_win?: string;
    away_win?: string;
    draw?: string;
  };
  status?: 'active' | 'matched' | 'completed' | 'cancelled';
  potential_payout?: number;
  match_time?: string;
  sport_type?: string;
  league?: string;
}

interface UserData {
  id: string;
  user_id?: string;
  username: string;
  phone: string;
  balance: number;
  clubFan?: string;
  countryFan?: string;
  nickname?: string;
  numberOfBets?: number;
}

const PledgeCard = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [pledges, setPledges] = useState<PledgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'matched'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'payout'>('date');
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const API_BASE_URL = 'https://fanclash-api.onrender.com';

  const { toast } = useToast();

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      console.log("🔍 LOADING USER FROM LOCALSTORAGE...");
      const userString = localStorage.getItem('userProfile');
      
      if (userString) {
        try {
          const user = JSON.parse(userString);
          console.log("👤 USER LOADED:", {
            id: user.id,
            user_id: user.user_id,
            username: user.username,
            phone: user.phone
          });
          setCurrentUser(user);
        } catch (error) {
          console.log("❌ ERROR PARSING USER:", error);
        }
      } else {
        console.log("❌ NO USER IN LOCALSTORAGE");
      }
    };

    loadUser();
  }, []);

  // Load pledges
  useEffect(() => {
    const loadPledges = async () => {
      try {
        setLoading(true);
        console.log("📡 FETCHING PLEDGES...");
        
        const response = await fetch(`${API_BASE_URL}/api/pledges`);
        if (!response.ok) throw new Error("Failed to fetch pledges");
        
        const data = await response.json();
        console.log("✅ PLEDGES LOADED:", data.length, "items");
        
        // Format pledges data
        const formattedPledges = data.map((item: any) => ({
          _id: item._id || item.id,
          amount: item.amount || 0,
          home_team: item.home_team || "Home Team",
          away_team: item.away_team || "Away Team",
          selection: item.selection || "home_team",
          fan: item.fan || "User",
          starter_id: item.starter_id || "",
          username: item.username || "Unknown",
          phone: item.phone || "",
          time: item.time || new Date().toISOString(),
          created_at: item.created_at || new Date().toISOString(),
          odds: item.odds || { home_win: "2.00", away_win: "2.00", draw: "3.50" },
          status: item.status || 'active',
          potential_payout: item.potential_payout || item.amount * 2,
          sport_type: item.sport_type || 'Football',
          league: item.league || 'Premier League',
          match_time: item.match_time || new Date().toISOString()
        }));
        
        setPledges(formattedPledges);
      } catch (err) {
        console.error("🚨 ERROR LOADING PLEDGES:", err);
        setError("Failed to load P2P bets");
      } finally {
        setLoading(false);
      }
    };

    loadPledges();
  }, []);

  // Demo login
  const handleDemoLogin = () => {
    console.log("🎮 DEMO LOGIN CLICKED");
    const demoUser: UserData = {
      id: "user_1765280845190_cmzb4bk6z",
      user_id: "user_1765280845190_cmzb4bk6z",
      username: "Capiyo",
      phone: "254704306867",
      balance: 100,
      clubFan: "Man u",
      countryFan: "France",
      nickname: "Red devils",
      numberOfBets: 0
    };
    
    localStorage.setItem('userProfile', JSON.stringify(demoUser));
    setCurrentUser(demoUser);
    
    console.log("✅ DEMO USER SET:", demoUser);
    
    toast({
      title: "Demo Mode Activated",
      description: "You're now logged in as Capiyo",
      className: "bg-emerald-500/20 border-emerald-500 text-emerald-500"
    });
  };

  // Logout
  const handleLogout = () => {
    console.log("🚪 LOGGING OUT...");
    localStorage.removeItem('userProfile');
    setCurrentUser(null);
    console.log("✅ USER LOGGED OUT");
    
    toast({
      title: "Logged Out",
      description: "You have been logged out",
      className: "bg-gray-800 border-gray-700 text-gray-300"
    });
  };

  // Filter and sort pledges
  const filteredPledges = pledges.filter(pledge => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return pledge.home_team.toLowerCase().includes(searchLower) ||
             pledge.away_team.toLowerCase().includes(searchLower) ||
             pledge.username.toLowerCase().includes(searchLower);
    }
    
    if (activeFilter === 'available') return pledge.status === 'active';
    if (activeFilter === 'matched') return pledge.status === 'matched';
    return true;
  });

  const sortedPledges = [...filteredPledges].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    } else if (sortBy === 'amount') {
      return b.amount - a.amount;
    } else {
      return (b.potential_payout || 0) - (a.potential_payout || 0);
    }
  });

  // Login prompt component
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Swords className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">P2P Betting Arena</h1>
          <p className="text-gray-400">Login to challenge fans and win</p>
        </div>
        
        <div className="w-full max-w-sm space-y-4">
          <Button
            onClick={handleDemoLogin}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Login with Demo Account
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Click to login with demo account
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Swords className="w-4 h-4" />
              </div>
              <span className="text-base font-bold truncate">P2P Bets</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-400 hover:text-emerald-500"
              >
                <Search className="w-4 h-4" />
              </Button>
              
              {currentUser && (
                <div className="px-2 py-1.5 bg-gray-900/50 rounded-lg border border-emerald-500/20">
                  <div className="text-xs font-bold text-emerald-400">
                    Ksh {currentUser.balance?.toLocaleString() || '0'}
                  </div>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <LogIn className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search bets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-800 rounded-full text-sm text-white placeholder-gray-500"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-144px)] overflow-y-auto pb-16">
        {/* Filters */}
        <div className="p-3 border-b border-gray-800/50 bg-black">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">P2P Challenges</h1>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              {sortedPledges.filter(p => p.status === 'active').length} Open
            </Badge>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
              size="sm"
              className={cn(
                "rounded-full text-xs flex-shrink-0",
                activeFilter === 'all' 
                  ? "bg-emerald-500 text-white" 
                  : "border-gray-800 text-gray-400"
              )}
            >
              All Bets
            </Button>
            <Button
              variant={activeFilter === 'available' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('available')}
              size="sm"
              className={cn(
                "rounded-full text-xs flex-shrink-0",
                activeFilter === 'available' 
                  ? "bg-emerald-500 text-white" 
                  : "border-gray-800 text-gray-400"
              )}
            >
              Available
            </Button>
            <Button
              variant={activeFilter === 'matched' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('matched')}
              size="sm"
              className={cn(
                "rounded-full text-xs flex-shrink-0",
                activeFilter === 'matched' 
                  ? "bg-emerald-500 text-white" 
                  : "border-gray-800 text-gray-400"
              )}
            >
              Matched
            </Button>
          </div>
        </div>

        {/* Pledges List */}
        <div className="p-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <XCircle className="w-14 h-14 text-red-500 mx-auto mb-3" />
              <p className="text-gray-400">{error}</p>
            </div>
          ) : sortedPledges.length === 0 ? (
            <div className="text-center py-16">
              <Swords className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
              <p className="text-gray-400">No bets found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPledges.map((pledge, index) => (
                <P2PBetCard 
                  key={pledge._id || index}
                  pledge={pledge}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-gray-800/50 z-40">
        <div className="px-2 py-2">
          <div className="flex justify-around items-center">
            {[
              { icon: Home, label: 'Home' },
              { icon: Swords, label: 'P2P' },
              { icon: BarChart3, label: 'Stats' },
              { icon: Wallet, label: 'Wallet' }
            ].map((item, idx) => (
              <Button key={idx} variant="ghost" className="text-gray-400 hover:text-emerald-500 p-2">
                <div className="flex flex-col items-center">
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">{item.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// P2P Bet Card Component
interface P2PBetCardProps {
  pledge: PledgeData;
  currentUser: UserData;
}

function P2PBetCard({ pledge, currentUser }: P2PBetCardProps) {
  const [isBetting, setIsBetting] = useState(false);
  const { toast } = useToast();

  // Log IDs for debugging
  useEffect(() => {
    console.log("🎯 PLEDGE CARD DEBUG:");
    console.log("👤 Current User ID:", currentUser.id);
    console.log("👤 Current User USER_ID:", currentUser.user_id);
    console.log("📋 Pledge Starter ID:", pledge.starter_id);
    console.log("🔍 Comparison:", {
      idMatch: currentUser.id === pledge.starter_id,
      userIdMatch: currentUser.user_id === pledge.starter_id,
      isStarter: currentUser.id === pledge.starter_id || currentUser.user_id === pledge.starter_id
    });
  }, [pledge, currentUser]);

  // Check if current user is the bet starter
  const isCurrentUserStarter = currentUser.id === pledge.starter_id || 
                              currentUser.user_id === pledge.starter_id;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Time TBD";
    }
  };

  const acceptBet = () => {
    console.log("🎯 ACCEPT BET CLICKED");
    console.log("👤 User is starter?", isCurrentUserStarter);
    
    if (isCurrentUserStarter) {
      toast({
        title: "Cannot Accept Your Own Bet",
        description: "You cannot accept your own P2P challenge",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Bet Accepted",
      description: "Processing your bet...",
      className: "bg-emerald-500/20 border-emerald-500 text-emerald-500"
    });
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-900/30 to-black/30 rounded-xl border border-gray-800/50 p-3">
      {/* Debug Info - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-2 p-2 bg-black/50 rounded text-xs font-mono">
          <div className="text-emerald-400">Debug Info:</div>
          <div>User ID: {currentUser.id}</div>
          <div>Starter ID: {pledge.starter_id}</div>
          <div className={isCurrentUserStarter ? 'text-red-400' : 'text-emerald-400'}>
            Is Starter: {isCurrentUserStarter ? 'YES' : 'NO'}
          </div>
        </div>
      )}
      
      {/* Bet Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
            {pledge.league || 'P2P Challenge'}
          </Badge>
          <Badge className={`text-[10px] ${
            pledge.status === 'active' 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'bg-yellow-500/10 text-yellow-400'
          }`}>
            {pledge.status === 'active' ? 'OPEN' : 'MATCHED'}
          </Badge>
        </div>
        <div className="text-[10px] text-gray-400">
          {formatDate(pledge.match_time || pledge.created_at || '')}
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar className="w-8 h-8 border border-emerald-500/30">
          <AvatarFallback className="bg-gradient-to-br from-gray-900 to-black text-xs">
            {pledge.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-white">{pledge.username}</span>
            <CheckCircle className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
              {pledge.fan}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-1.5 rounded-full border border-gray-800 text-gray-400"
        >
          <UserPlus className="w-3 h-3" />
        </Button>
      </div>

      {/* Match Info */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black border border-emerald-500/30 flex items-center justify-center mx-auto mb-1">
              <span className="font-bold text-emerald-300 text-xs">
                {pledge.home_team.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-300">{pledge.home_team}</p>
          </div>
          
          <div className="px-1">
            <div className="bg-gray-900 rounded-full p-1.5 w-8 h-8 flex items-center justify-center border border-gray-800">
              <Swords className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          <div className="text-center flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black border border-emerald-500/30 flex items-center justify-center mx-auto mb-1">
              <span className="font-bold text-emerald-300 text-xs">
                {pledge.away_team.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-300">{pledge.away_team}</p>
          </div>
        </div>
      </div>

      {/* Bet Details */}
      <div className="bg-gray-900/30 rounded-lg p-2.5 mb-3 border border-gray-800/50">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-1.5 rounded-lg">
              <Coins className="w-3 h-3 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Stake</p>
              <p className="text-xs font-bold text-white">Ksh {pledge.amount.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500">Potential Win</p>
            <p className="text-xs font-bold text-emerald-400">
              Ksh {(pledge.potential_payout || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ACCEPT BUTTON - HIDDEN IF USER IS STARTER */}
      {(() => {
        console.log("🎯 RENDERING BUTTON FOR PLEDGE:", pledge._id);
        console.log("   isCurrentUserStarter:", isCurrentUserStarter);
        console.log("   pledge.status:", pledge.status);
        console.log("   Should show button?:", !isCurrentUserStarter && pledge.status === 'active');
        
        if (!isCurrentUserStarter && pledge.status === 'active') {
          return (
            <>
              {!isBetting ? (
                <Button
                  onClick={() => setIsBetting(true)}
                  className="w-full bg-emerald-500/10 text-white rounded-lg font-bold py-2.5 
                    border border-emerald-500/30 hover:bg-emerald-500/20"
                >
                  <Swords className="w-4 h-4 mr-2" />
                  Accept Challenge
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={acceptBet}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2.5"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Place Bet
                  </Button>
                  <Button
                    onClick={() => setIsBetting(false)}
                    className="w-full border-gray-800 text-gray-400"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </>
          );
        } else {
          return (
            <div className="text-center p-2.5 border border-gray-800/30 rounded-lg bg-gray-900/20">
              <div className="flex items-center justify-center gap-1.5 text-gray-400">
                {isCurrentUserStarter ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">Your bet - waiting for challengers</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">
                      {pledge.status === 'matched' ? 'Bet already matched' : 'Bet not available'}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        }
      })()}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-800/30">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="p-1 text-gray-400">
            <Heart className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1 text-gray-400">
            <MessageCircle className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1 text-gray-400">
            <Share2 className="w-3 h-3" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400 p-1">
          <Bookmark className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export default PledgeCard;