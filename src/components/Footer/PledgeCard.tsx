import { 
  Heart, MessageCircle, Share2, Zap, Users, Calendar, Trophy, 
  Sparkles, UserPlus, Eye, TrendingUp, Wallet, Bell, Target, Crown, 
  ShieldCheck, Coins, Award, BarChart3, Swords, AlertCircle, Phone,
  Timer, TrendingDown, XCircle, CheckCircle, Plus, MapPin, Building2,
  MoreVertical, Search, Home, Filter, ArrowUpDown, Loader2, Bookmark,
  DollarSign, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  _id?: string | any;
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

  // Fetch current user from backend
  const fetchCurrentUser = async () => {
    try {
      const userString = localStorage.getItem("userProfile");
      if (!userString) return null;

      const localUser = JSON.parse(userString);
      if (!localUser.id) return null;

      // Try to fetch from backend
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profiles/${localUser.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const backendUser = await response.json();
          
          const userData: UserData = {
            id: backendUser.user_id || localUser.id,
            username: backendUser.username || localUser.username || "",
            phone: backendUser.phone || localUser.phone || "",
            balance: backendUser.balance || localUser.balance || 0,
            clubFan: backendUser.club_fan || localUser.clubFan,
            countryFan: backendUser.country_fan || localUser.countryFan,
            nickname: backendUser.nickname || localUser.nickname,
            numberOfBets: backendUser.number_of_bets || localUser.numberOfBets
          };

          localStorage.setItem("userProfile", JSON.stringify({
            ...localUser,
            ...userData
          }));

          return userData;
        }
      } catch (error) {
        console.log("Using local user data instead");
      }

      // Fallback to local data
      return {
        id: localUser.id,
        username: localUser.username || "",
        phone: localUser.phone || "",
        balance: localUser.balance || 0
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadUserAndPledges = async () => {
      try {
        setLoading(true);
        
        const user = await fetchCurrentUser();
        setCurrentUser(user);
        
        if (!user) {
          toast({
            title: "Profile Required",
            description: "Create a profile to view P2P bets",
            variant: "destructive"
          });
        }

        const data = await fetchPledges();
        setPledges(data);
        
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load P2P bets");
        toast({
          title: "Connection Error",
          description: "Unable to fetch betting opportunities",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserAndPledges();
  }, []);

  async function fetchPledges(): Promise<PledgeData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pledges`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return formatPledgesData(data);
      
    } catch (error) {
      console.error("Failed to fetch P2P bets:", error);
      return generateMockPledges();
    }
  }

  function formatPledgesData(data: any[]): PledgeData[] {
    return data.map(item => ({
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
      odds: item.odds || {
        home_win: (Math.random() * 4 + 1.2).toFixed(2),
        away_win: (Math.random() * 4 + 1.2).toFixed(2),
        draw: (Math.random() * 4 + 1.2).toFixed(2)
      },
      status: item.status || 'active',
      potential_payout: item.potential_payout || item.amount * (Math.random() * 3 + 1.5),
      sport_type: item.sport_type || 'Football',
      league: item.league || 'Premier League',
      match_time: item.match_time || new Date(Date.now() + Math.random() * 86400000).toISOString()
    }));
  }

  function generateMockPledges(): PledgeData[] {
    const mockPledges = [
      {
        amount: 500,
        home_team: "Arsenal",
        away_team: "Man United",
        selection: "home_team",
        fan: "Gunners",
        starter_id: "starter_001",
        username: "GunnerFan",
        phone: "0712345678",
        time: new Date().toISOString(),
        _id: "mock_001"
      },
      {
        amount: 1000,
        home_team: "Liverpool",
        away_team: "Chelsea",
        selection: "away_team",
        fan: "Blues",
        starter_id: "starter_002",
        username: "ChelseaFan",
        phone: "0723456789",
        time: new Date().toISOString(),
        _id: "mock_002"
      },
      {
        amount: 2500,
        home_team: "Man City",
        away_team: "Tottenham",
        selection: "draw",
        fan: "Citizens",
        starter_id: "starter_003",
        username: "Cityzen",
        phone: "0734567890",
        time: new Date().toISOString(),
        _id: "mock_003"
      },
      {
        amount: 750,
        home_team: "Real Madrid",
        away_team: "Barcelona",
        selection: "home_team",
        fan: "Madridista",
        starter_id: "starter_004",
        username: "RM_Fan",
        phone: "0745678901",
        time: new Date().toISOString(),
        _id: "mock_004"
      },
      {
        amount: 1500,
        home_team: "Bayern Munich",
        away_team: "Dortmund",
        selection: "away_team",
        fan: "Borussia",
        starter_id: "starter_005",
        username: "BVB_Fan",
        phone: "0756789012",
        time: new Date().toISOString(),
        _id: "mock_005"
      }
    ];
    
    return formatPledgesData(mockPledges);
  }

  const filteredPledges = pledges.filter(pledge => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!pledge.home_team.toLowerCase().includes(searchLower) &&
          !pledge.away_team.toLowerCase().includes(searchLower) &&
          !pledge.username.toLowerCase().includes(searchLower)) {
        return false;
      }
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
    } else if (sortBy === 'payout') {
      return (b.potential_payout || 0) - (a.potential_payout || 0);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Mobile Header - Fixed */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Swords className="w-4 h-4" />
              </div>
              <span className="text-base font-bold truncate">P2P Bets</span>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-400 hover:text-emerald-500"
              >
                <Search className="w-4 h-4" />
              </Button>
              
              {/* User Balance */}
              {currentUser && (
                <div className="px-2 py-1.5 bg-gray-900/50 rounded-lg border border-emerald-500/20">
                  <div className="text-xs font-bold text-emerald-400">
                    Ksh {currentUser.balance?.toLocaleString() || '0'}
                  </div>
                </div>
              )}
              
              {/* Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-400 hover:text-emerald-500"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
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
                    className="pl-10 bg-gray-900/50 border-gray-800 rounded-full text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="h-[calc(100vh-144px)] overflow-y-auto pb-16">
        {/* Mobile Filters & Stats */}
        <div className="p-3 border-b border-gray-800/50 bg-black">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">P2P Challenges</h1>
            
            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">
                  {filteredPledges.length}
                </span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs px-2 py-0.5">
                {sortedPledges.filter(p => p.status === 'active').length} Open
              </Badge>
            </div>
          </div>

          {/* Filter Buttons - Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
              size="sm"
              className={cn(
                "rounded-full whitespace-nowrap text-xs flex-shrink-0",
                activeFilter === 'all' 
                  ? "bg-emerald-500 text-white border-emerald-500" 
                  : "border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500"
              )}
            >
              All Bets
            </Button>
            <Button
              variant={activeFilter === 'available' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('available')}
              size="sm"
              className={cn(
                "rounded-full whitespace-nowrap text-xs flex-shrink-0",
                activeFilter === 'available' 
                  ? "bg-emerald-500 text-white border-emerald-500" 
                  : "border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500"
              )}
            >
              Available
            </Button>
            <Button
              variant={activeFilter === 'matched' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('matched')}
              size="sm"
              className={cn(
                "rounded-full whitespace-nowrap text-xs flex-shrink-0",
                activeFilter === 'matched' 
                  ? "bg-emerald-500 text-white border-emerald-500" 
                  : "border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500"
              )}
            >
              Matched
            </Button>
            
            {/* Sort Options */}
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === 'date' ? 'amount' : sortBy === 'amount' ? 'payout' : 'date')}
                className="rounded-full border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 text-xs"
              >
                <ArrowUpDown className="w-3 h-3 mr-1" />
                Sort
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                <div className="text-emerald-400 text-sm">Loading P2P bets...</div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-500/30">
                <XCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-400 mb-2">Connection Error</h3>
              <p className="text-gray-400 text-sm mb-3">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                size="sm"
                className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPledges.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                    <Swords className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-400 mb-1">No bets found</h3>
                  <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                  <Button className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Bet
                  </Button>
                </div>
              ) : (
                sortedPledges.map((pledge, index) => (
                  <motion.div
                    key={pledge._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <P2PBetCard 
                      pledge={pledge} 
                      currentUser={currentUser}
                      refreshUserData={() => fetchCurrentUser().then(user => setCurrentUser(user))}
                    />
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800/50 z-40">
        <div className="px-2 py-2">
          <div className="flex justify-around items-center">
            <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group p-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">Home</span>
              </div>
            </Button>
            
            <Button variant="ghost" className="text-emerald-400 group p-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Swords className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">P2P</span>
              </div>
            </Button>
            
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-12 h-12 shadow-xl shadow-emerald-500/30 relative -top-3">
              <Plus className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group p-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">Stats</span>
              </div>
            </Button>
            
            <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group p-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">Wallet</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface P2PBetCardProps {
  pledge: PledgeData;
  currentUser: UserData | null;
  refreshUserData: () => void;
}

function P2PBetCard({ pledge, currentUser, refreshUserData }: P2PBetCardProps) {
  const [betAgainstAmount, setBetAgainstAmount] = useState("");
  const [betAgainstOption, setBetAgainstOption] = useState("");
  const [isBetting, setIsBetting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 20);
  const [commentCount, setCommentCount] = useState(Math.floor(Math.random() * 20) + 5);
  const { toast } = useToast();
  
  const isCurrentUserStarter = currentUser?.id === pledge.starter_id;

  const getOppositeOptions = () => {
    const options = [];
    if (pledge.selection !== "home_team") options.push({ 
      value: "home_team", 
      label: `${pledge.home_team} Win`, 
      odds: pledge.odds?.home_win || "2.00" 
    });
    if (pledge.selection !== "away_team") options.push({ 
      value: "away_team", 
      label: `${pledge.away_team} Win`, 
      odds: pledge.odds?.away_win || "2.00" 
    });
    if (pledge.selection !== "draw") options.push({ 
      value: "draw", 
      label: "Draw", 
      odds: pledge.odds?.draw || "3.50" 
    });
    return options;
  };

  const oppositeOptions = getOppositeOptions();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      if (diffHours <= 24) {
        return `Today ${date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`;
      } else if (diffHours <= 48) {
        return `Tomorrow ${date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`;
      }
      
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

  const acceptBet = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to place a bet",
        variant: "destructive"
      });
      return;
    }

    if (!betAgainstAmount || !betAgainstOption) {
      toast({
        title: "Incomplete Bet",
        description: "Select your prediction and enter stake",
        variant: "destructive"
      });
      return;
    }

    const betAmount = Number(betAgainstAmount);
    
    if (betAmount <= 0 || isNaN(betAmount)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive"
      });
      return;
    }

    if (betAmount > currentUser.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You need Ksh ${betAmount} but have Ksh ${currentUser.balance}`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Show loading
      toast({
        title: "Processing Bet...",
        description: "Creating bet match",
        className: "bg-blue-500/20 border-blue-500 text-blue-500"
      });

      // 1. Deduct from user's balance
      const newBalance = currentUser.balance - betAmount;
      
      const updateBalanceResponse = await fetch(`https://fanclash-api.onrender.com/api/profile/update-balance`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          balance: newBalance
        }),
      });

      if (!updateBalanceResponse.ok) {
        throw new Error("Balance update failed");
      }

      // 2. Update local state
      const updatedUser = { ...currentUser, balance: newBalance };
      localStorage.setItem("userProfile", JSON.stringify(updatedUser));
      refreshUserData();

      // 3. Create bet match
      let finisherTeam = "";
      if (betAgainstOption === "home_team") {
        finisherTeam = pledge.home_team;
      } else if (betAgainstOption === "away_team") {
        finisherTeam = pledge.away_team;
      } else {
        finisherTeam = "draw";
      }

      const betData = {
        starter_id: pledge.starter_id,
        starter_username: pledge.username,
        starter_selection: pledge.selection,
        starter_amount: pledge.amount,
        starter_team: pledge.selection === "home_team" ? pledge.home_team : 
                     pledge.selection === "away_team" ? pledge.away_team : "draw",
        
        finisher_id: currentUser.id,
        finisher_username: currentUser.username,
        finisher_selection: betAgainstOption,
        finisher_amount: betAmount,
        finisher_team: finisherTeam,
        
        home_team: pledge.home_team,
        away_team: pledge.away_team,
        
        total_pot: pledge.amount + betAmount,
        status: "matched",
        
        odds: pledge.odds || {
          home_win: "2.00",
          away_win: "2.00",
          draw: "3.50"
        }
      };

      // 4. Create bet
      const createBetResponse = await fetch(`https://fanclash-api.onrender.com/api/bets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betData),
      });

      if (!createBetResponse.ok) {
        // Refund if failed
        await fetch(`https://fanclash-api.onrender.com/api/profile/update-balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser.id,
            balance: currentUser.balance
          }),
        });
        
        refreshUserData();
        throw new Error("Bet creation failed");
      }

      // 5. Update pledge status
      if (pledge._id) {
        await fetch(`https://fanclash-api.onrender.com/api/pledges/${pledge._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'matched' }),
        });
      }

      // 6. Success
      toast({
        title: "✅ Bet Accepted!",
        description: `Matched Ksh ${betAmount} with ${pledge.username}`,
        className: "bg-emerald-500/20 border-emerald-500 text-emerald-500",
        duration: 5000
      });

      // Reset and reload
      setBetAgainstAmount("");
      setBetAgainstOption("");
      setIsBetting(false);

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error("Error placing bet:", error);
      toast({
        title: "Bet Failed",
        description: error.message || "Unable to place bet",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-900/30 to-black/30 
      rounded-xl border border-gray-800/50 p-3 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
      
      {/* Mobile Bet Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 max-w-[120px]">
            <span className="text-[10px] font-medium text-emerald-400 truncate">
              {pledge.league || 'P2P Challenge'}
            </span>
          </div>
          <div className={`px-1.5 py-0.5 rounded-full border text-[10px] font-medium ${
            pledge.status === 'active' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
          }`}>
            {pledge.status === 'active' ? 'OPEN' : 'MATCHED'}
          </div>
        </div>
        <div className="text-[10px] text-gray-400">
          {formatDate(pledge.match_time || pledge.created_at || '')}
        </div>
      </div>

      {/* User Info Row */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar className="w-8 h-8 border border-emerald-500/30">
          <AvatarFallback className="bg-gradient-to-br from-gray-900 to-black text-xs font-bold">
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
            <span className="text-[10px] text-gray-500">·</span>
            <span className="text-[10px] text-gray-400">
              {pledge.numberOfBets || Math.floor(Math.random() * 50) + 5} bets
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFollowing(!isFollowing)}
          className={cn(
            "p-1.5 rounded-full border",
            isFollowing 
              ? "border-emerald-500/30 text-emerald-500" 
              : "border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500"
          )}
        >
          <UserPlus className="w-3 h-3" />
        </Button>
      </div>

      {/* Match Info - Mobile Optimized */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="text-center flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black border border-emerald-500/30 flex items-center justify-center mx-auto mb-1">
              <span className="font-bold text-emerald-300 text-xs">
                {pledge.home_team.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-300 truncate px-1">{pledge.home_team}</p>
              {pledge.selection === "home_team" ? (
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    Ksh {pledge.amount.toLocaleString()}
                  </span>
                </div>
              ) : (
                <p className="text-[10px] text-emerald-300 mt-0.5">
                  {pledge.odds?.home_win} odds
                </p>
              )}
            </div>
          </div>

          {/* VS */}
          <div className="px-1">
            <div className="bg-gray-900 rounded-full p-1.5 w-8 h-8 flex items-center justify-center border border-gray-800">
              <Swords className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-[9px] text-gray-500 text-center mt-1">
              {formatDate(pledge.match_time || '')}
            </div>
          </div>

          {/* Away Team */}
          <div className="text-center flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black border border-emerald-500/30 flex items-center justify-center mx-auto mb-1">
              <span className="font-bold text-emerald-300 text-xs">
                {pledge.away_team.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-300 truncate px-1">{pledge.away_team}</p>
              {pledge.selection === "away_team" ? (
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    Ksh {pledge.amount.toLocaleString()}
                  </span>
                </div>
              ) : (
                <p className="text-[10px] text-emerald-300 mt-0.5">
                  {pledge.odds?.away_win} odds
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Draw Option */}
        {pledge.selection === "draw" && (
          <div className="mt-2 text-center">
            <div className="inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-[10px] text-emerald-400 font-bold">
                Ksh {pledge.amount.toLocaleString()} on Draw
              </span>
            </div>
            <p className="text-[10px] text-emerald-300 mt-0.5">
              {pledge.odds?.draw} odds
            </p>
          </div>
        )}
      </div>

      {/* Bet Details Card */}
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

      {/* Accept Bet Button / Bet Form */}
      {currentUser && !isCurrentUserStarter && pledge.status === 'active' ? (
        <>
          {!isBetting ? (
            <Button
              onClick={() => setIsBetting(true)}
              className="w-full bg-emerald-500/10 text-white rounded-lg font-bold py-2.5 
                shadow-lg shadow-emerald-500/20 border border-emerald-500/30 
                hover:bg-emerald-500/20 transition-colors text-sm"
            >
              <Swords className="w-4 h-4 mr-2" />
              Accept Challenge
            </Button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2 overflow-hidden"
            >
              {/* Prediction Selection */}
              <div>
                <p className="text-[11px] text-white mb-2 font-medium">YOUR PREDICTION</p>
                <div className="space-y-1.5">
                  {oppositeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={betAgainstOption === option.value ? "default" : "outline"}
                      onClick={() => setBetAgainstOption(option.value)}
                      className={cn(
                        "w-full justify-between rounded-lg px-3 py-2 text-xs",
                        betAgainstOption === option.value
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "border-gray-800 text-gray-300 hover:text-white hover:border-emerald-500 bg-gray-900/50"
                      )}
                    >
                      <span className="font-medium">{option.label}</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-400 text-xs font-bold">{option.odds}</span>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Stake Input */}
              <div>
                <p className="text-[11px] text-white font-medium mb-2">YOUR STAKE (Ksh)</p>
                <div className="flex gap-1">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
                    <input
                      type="number"
                      value={betAgainstAmount}
                      onChange={(e) => setBetAgainstAmount(e.target.value)}
                      placeholder="Enter amount..."
                      className="w-full pl-8 pr-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg 
                        text-white placeholder-gray-500 text-xs focus:outline-none 
                        focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/40"
                      min="1"
                      max={currentUser?.balance || 0}
                    />
                  </div>
                  <Button
                    onClick={() => setBetAgainstAmount(pledge.amount.toString())}
                    className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 text-xs px-3"
                  >
                    Match
                  </Button>
                </div>
                
                {/* Quick Stake Buttons */}
                <div className="grid grid-cols-4 gap-1 mt-1.5">
                  {["100", "500", "1000", pledge.amount.toString()].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAgainstAmount(amount.replace('K', '000'))}
                      className="rounded-lg border-gray-800 text-gray-400 hover:text-emerald-500 
                        hover:border-emerald-500 text-[10px] py-1.5 bg-gray-900/30"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
                
                {/* Balance Info */}
                {currentUser && (
                  <div className="mt-1.5 text-[10px] text-gray-400 flex items-center justify-between">
                    <span>Available: Ksh {currentUser.balance.toLocaleString()}</span>
                    {betAgainstAmount && (
                      <span className={Number(betAgainstAmount) > currentUser.balance ? "text-red-400" : "text-emerald-400"}>
                        Left: Ksh {(currentUser.balance - Number(betAgainstAmount)).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={acceptBet}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2.5 
                    shadow-lg shadow-emerald-500/20 border border-emerald-500/30 text-sm"
                  disabled={!betAgainstOption || !betAgainstAmount}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  PLACE BET
                </Button>
                <Button
                  onClick={() => setIsBetting(false)}
                  className="border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 
                    rounded-lg bg-gray-900/50 text-sm px-4"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <div className="text-center p-2.5 border border-gray-800/30 rounded-lg bg-gray-900/20">
          <div className="flex items-center justify-center gap-1.5 text-gray-400">
            {!currentUser ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">Login to accept bets</span>
              </>
            ) : isCurrentUserStarter ? (
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
      )}

      {/* Mobile Actions Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-800/30">
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsLiked(!isLiked);
              setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
            }}
            className={cn(
              "p-1 text-gray-400 hover:text-pink-500",
              isLiked && "text-pink-500"
            )}
          >
            <Heart className={cn(
              "w-3 h-3",
              isLiked && "fill-pink-500"
            )} />
            <span className="text-[10px] ml-0.5">{likeCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommentCount(prev => prev + 1)}
            className="p-1 text-gray-400 hover:text-emerald-500"
          >
            <MessageCircle className="w-3 h-3" />
            <span className="text-[10px] ml-0.5">{commentCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-gray-400 hover:text-emerald-500"
          >
            <Share2 className="w-3 h-3" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-emerald-500 p-1"
        >
          <Bookmark className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export default PledgeCard;