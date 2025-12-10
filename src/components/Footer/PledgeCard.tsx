import { 
  Heart, MessageCircle, Share2, Swords, Eye, Wallet, Coins, 
  CheckCircle, UserPlus, DollarSign, ShieldCheck, AlertCircle,
  Search, Home, BarChart3, Plus, ArrowUpDown, Loader2, Bookmark,
  MoreVertical, XCircle, LogIn, ChevronDown, Filter, Trophy, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

interface BetData {
  _id?: string;
  // Pledge info
  pledge_id: string;
  
  // Starter info
  starter_id: string;
  starter_username: string;
  starter_selection: string;
  starter_amount: number;
  starter_team: string;
  
  // Finisher info
  finisher_id: string;
  finisher_username: string;
  finisher_selection: string;
  finisher_amount: number;
  finisher_team: string;
  
  // Match info
  home_team: string;
  away_team: string;
  match_time: string;
  league: string;
  sport_type?: string;
  
  // Bet details
  total_pot: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  
  // Winner info
  winner_id?: string;
  winner_username?: string;
  winning_selection?: string;
  
  // Timestamps
  created_at: string;
}

const PledgeCard = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [pledges, setPledges] = useState<PledgeData[]>([]);
  const [userBets, setUserBets] = useState<BetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBets, setLoadingBets] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'matched'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'payout'>('date');
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showBets, setShowBets] = useState(false);
  const API_BASE_URL = 'https://fanclash-api.onrender.com';

  const { toast } = useToast();

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      const userString = localStorage.getItem('userProfile');
      
      if (userString) {
        try {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        } catch (error) {
          console.error("Error parsing user:", error);
        }
      }
    };

    loadUser();
  }, []);

  // Load pledges
  useEffect(() => {
    const loadPledges = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/api/pledges`);
        if (!response.ok) throw new Error("Failed to fetch pledges");
        
        const data = await response.json();
        
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
        console.error("Error loading pledges:", err);
        setError("Failed to load P2P bets");
      } finally {
        setLoading(false);
      }
    };

    loadPledges();
  }, []);

  // Load user's active bets
  const loadUserBets = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoadingBets(true);
      const userId = currentUser.id || currentUser.user_id;
      
      const response = await fetch(`${API_BASE_URL}/api/bets/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user bets");
      
      const data = await response.json();
      setUserBets(data.filter((bet: BetData) => bet.status === 'active'));
    } catch (err) {
      console.error("Error loading user bets:", err);
      toast({
        title: "Error",
        description: "Failed to load your bets",
        variant: "destructive"
      });
    } finally {
      setLoadingBets(false);
    }
  };

  // Demo login
  const handleDemoLogin = () => {
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
    
    toast({
      title: "Demo Mode Activated",
      description: "You're now logged in as Capiyo",
      className: "bg-emerald-500/20 border-emerald-500 text-emerald-500"
    });
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    setCurrentUser(null);
    
    toast({
      title: "Logged Out",
      description: "You have been logged out",
      className: "bg-gray-800 border-gray-700 text-gray-300"
    });
  };

  // Complete a bet
  const handleCompleteBet = async (betId: string, winningSelection: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bets/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betId, winningSelection }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to complete bet");
      }

      const result = await response.json();
      
      // Refresh user bets and pledges
      loadUserBets();
      
      toast({
        title: "✅ Bet Completed!",
        description: `Winner: ${result.bet.winner_username}`,
        className: "bg-emerald-500/20 border-emerald-500 text-emerald-500",
        duration: 3000
      });

    } catch (error: any) {
      console.error("Error completing bet:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 3000
      });
    }
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
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowBets(true);
                  loadUserBets();
                }}
                className="p-2 text-gray-400 hover:text-emerald-500"
              >
                <Trophy className="w-4 h-4" />
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
                    placeholder="Search teams or users..."
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
      <div className="h-[calc(100vh-144px)]">
        {/* Filters Section */}
        <div className="p-3 border-b border-gray-800/50 bg-black sticky top-[73px] z-40">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">P2P Challenges</h1>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              {sortedPledges.filter(p => p.status === 'active').length} Open
            </Badge>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
            
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs flex-shrink-0 border-gray-800 text-gray-400"
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Sort
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white">
                <DropdownMenuItem 
                  onClick={() => setSortBy('date')}
                  className={cn("text-xs", sortBy === 'date' && "text-emerald-400")}
                >
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy('amount')}
                  className={cn("text-xs", sortBy === 'amount' && "text-emerald-400")}
                >
                  Highest Stake
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy('payout')}
                  className={cn("text-xs", sortBy === 'payout' && "text-emerald-400")}
                >
                  Highest Payout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Scrollable Pledges List */}
        <ScrollArea className="h-[calc(100vh-200px)]">
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
                <p className="text-gray-400 mb-4">No bets found</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter('all');
                  }}
                  className="border-gray-800 text-gray-400 text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {sortedPledges.map((pledge, index) => (
                  <motion.div
                    key={pledge._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <P2PBetCard 
                      pledge={pledge}
                      currentUser={currentUser}
                      refreshPledges={() => window.location.reload()}
                      onCompleteBet={handleCompleteBet}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Active Bets Dialog */}
      <Dialog open={showBets} onOpenChange={setShowBets}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-500" />
              Your Active Bets
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage and complete your ongoing bets
            </DialogDescription>
          </DialogHeader>
          
          {loadingBets ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : userBets.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No active bets found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {userBets.map((bet) => (
                <ActiveBetCard 
                  key={bet._id} 
                  bet={bet} 
                  currentUser={currentUser}
                  onComplete={handleCompleteBet}
                />
              ))}
            </div>
          )}
          
          <DialogFooter>
            <Button
              onClick={() => setShowBets(false)}
              className="w-full border-gray-800 text-gray-400"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Button 
                key={idx} 
                variant="ghost" 
                className="text-gray-400 hover:text-emerald-500 p-2 flex-1"
              >
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
  refreshPledges: () => void;
  onCompleteBet: (betId: string, winningSelection: string) => Promise<void>;
}

function P2PBetCard({ pledge, currentUser, refreshPledges, onCompleteBet }: P2PBetCardProps) {
  const [isBetting, setIsBetting] = useState(false);
  const [betAmount, setBetAmount] = useState("");
  const [betSelection, setBetSelection] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const API_BASE_URL = 'https://fanclash-api.onrender.com';

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

  const getOppositeSelection = () => {
    if (pledge.selection === "home_team") return "away_team";
    if (pledge.selection === "away_team") return "home_team";
    return "draw";
  };

  const acceptBet = async () => {
    if (!betAmount || !betSelection) {
      toast({
        title: "Incomplete Bet",
        description: "Select your prediction and enter stake",
        variant: "destructive"
      });
      return;
    }

    const amount = Number(betAmount);
    
    if (amount <= 0 || isNaN(amount)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive"
      });
      return;
    }

    if (amount > (currentUser?.balance || 0)) {
      toast({
        title: "Insufficient Balance",
        description: `You need Ksh ${amount} but have Ksh ${currentUser?.balance || 0}`,
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Prepare bet data to send to backend
      const betData = {
        // Pledge info
        pledge_id: pledge._id,
        
        // Starter info (original bet creator)
        starter_id: pledge.starter_id,
        starter_username: pledge.username,
        starter_selection: pledge.selection,
        starter_amount: pledge.amount,
        starter_team: pledge.selection === "home_team" ? pledge.home_team : 
                     pledge.selection === "away_team" ? pledge.away_team : "draw",
        
        // Finisher info (current user accepting the bet)
        finisher_id: currentUser.id || currentUser.user_id,
        finisher_username: currentUser.username,
        finisher_selection: betSelection,
        finisher_amount: amount,
        finisher_team: betSelection === "home_team" ? pledge.home_team : 
                      betSelection === "away_team" ? pledge.away_team : "draw",
        
        // Match info
        home_team: pledge.home_team,
        away_team: pledge.away_team,
        match_time: pledge.match_time || pledge.created_at,
        league: pledge.league,
        sport_type: pledge.sport_type,
        
        // Bet details
        total_pot: pledge.amount + amount,
        status: "active", // bet is now active/matched
        
        // Winner info (to be set when match completes)
        winner_id: null,
        winner_username: null,
        winning_selection: null,
        
        // Odds
        odds: pledge.odds || {
          home_win: "2.00",
          away_win: "2.00",
          draw: "3.50"
        }
      };

      console.log("📤 Sending bet data:", betData);

      // 1. First update user balance (deduct bet amount)
      const updateBalanceResponse = await fetch(`${API_BASE_URL}/api/profile/update-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id || currentUser.user_id,
          balance: (currentUser.balance || 0) - amount
        }),
      });

      if (!updateBalanceResponse.ok) {
        throw new Error("Failed to update balance");
      }

      // 2. Create the bet record
      const createBetResponse = await fetch(`${API_BASE_URL}/api/bets/create_bets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData),
      });

      if (!createBetResponse.ok) {
        // Refund if bet creation fails
        await fetch(`${API_BASE_URL}/api/profile/update-balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser.id || currentUser.user_id,
            balance: currentUser.balance
          }),
        });
        throw new Error("Failed to create bet");
      }

      // 3. Update pledge status to 'matched'
      if (pledge._id) {
        await fetch(`${API_BASE_URL}/api/pledges/${pledge._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'matched' }),
        });
      }

      // Update local user balance
      const updatedUser = { 
        ...currentUser, 
        balance: (currentUser.balance || 0) - amount 
      };
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      
      toast({
        title: "✅ Bet Accepted!",
        description: `You've matched Ksh ${amount} with ${pledge.username}`,
        className: "bg-emerald-500/20 border-emerald-500 text-emerald-500",
        duration: 3000
      });

      // Reset and refresh
      setIsBetting(false);
      setBetAmount("");
      setBetSelection("");
      
      setTimeout(() => {
        refreshPledges();
      }, 1500);

    } catch (error: any) {
      console.error("Error placing bet:", error);
      toast({
        title: "Bet Failed",
        description: error.message || "Unable to place bet",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectionLabel = (selection: string) => {
    if (selection === "home_team") return `${pledge.home_team} Win`;
    if (selection === "away_team") return `${pledge.away_team} Win`;
    return "Draw";
  };

  const oppositeSelection = getOppositeSelection();

  return (
    <div className="w-full bg-gradient-to-br from-gray-900/30 to-black/30 rounded-xl border border-gray-800/50 p-3">
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
            {pledge.selection === "home_team" && (
              <p className="text-[10px] text-emerald-400 mt-1">
                Ksh {pledge.amount.toLocaleString()}
              </p>
            )}
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
            {pledge.selection === "away_team" && (
              <p className="text-[10px] text-emerald-400 mt-1">
                Ksh {pledge.amount.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {pledge.selection === "draw" && (
          <div className="text-center mt-2">
            <p className="text-[10px] text-emerald-400">
              Ksh {pledge.amount.toLocaleString()} on Draw
            </p>
          </div>
        )}
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
      {!isCurrentUserStarter && pledge.status === 'active' ? (
        <>
          {!isBetting ? (
            <Button
              onClick={() => setIsBetting(true)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold py-2.5"
            >
              <Swords className="w-4 h-4 mr-2" />
              Accept Challenge
            </Button>
          ) : (
            <div className="space-y-3">
              {/* Selection */}
              <div>
                <p className="text-[11px] text-white mb-2">Your Prediction</p>
                <Button
                  onClick={() => setBetSelection(oppositeSelection)}
                  className={cn(
                    "w-full justify-between",
                    betSelection === oppositeSelection 
                      ? "bg-emerald-500 text-white" 
                      : "bg-gray-900/50 text-gray-300"
                  )}
                >
                  <span>{getSelectionLabel(oppositeSelection)}</span>
                  <span className="text-emerald-400 text-xs">
                    {pledge.odds?.[oppositeSelection as keyof typeof pledge.odds] || "2.00"}
                  </span>
                </Button>
              </div>

              {/* Amount */}
              <div>
                <p className="text-[11px] text-white mb-2">Your Stake (Ksh)</p>
                <div className="flex gap-1">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      placeholder="Enter amount..."
                      className="w-full pl-8 pr-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-xs"
                      min="1"
                      max={currentUser?.balance || 0}
                    />
                  </div>
                  <Button
                    onClick={() => setBetAmount(pledge.amount.toString())}
                    className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs px-3"
                  >
                    Match
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Available: Ksh {currentUser.balance.toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={acceptBet}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2.5"
                  disabled={loading || !betAmount || !betSelection}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Place Bet
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setIsBetting(false)}
                  className="border-gray-800 text-gray-400 rounded-lg px-4"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
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
      )}

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

// Active Bet Card Component
interface ActiveBetCardProps {
  bet: BetData;
  currentUser: UserData;
  onComplete: (betId: string, winningSelection: string) => Promise<void>;
}

function ActiveBetCard({ bet, currentUser, onComplete }: ActiveBetCardProps) {
  const [loading, setLoading] = useState(false);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const { toast } = useToast();

  const isStarter = currentUser.id === bet.starter_id || 
                    currentUser.user_id === bet.starter_id;

  const opponent = isStarter 
    ? { username: bet.finisher_username, selection: bet.finisher_selection }
    : { username: bet.starter_username, selection: bet.starter_selection };

  const handleWinnerSelection = async (winningSelection: string) => {
    setLoading(true);
    try {
      await onComplete(bet._id!, winningSelection);
      setShowWinnerDialog(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-sm">{bet.home_team} vs {bet.away_team}</h4>
          <p className="text-xs text-gray-400">{bet.league}</p>
        </div>
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">
          Active
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500">Your Bet</p>
          <p className="text-sm font-bold">
            {isStarter ? bet.starter_selection : bet.finisher_selection}
          </p>
          <p className="text-xs text-emerald-400">
            Ksh {isStarter ? bet.starter_amount.toLocaleString() : bet.finisher_amount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Opponent</p>
          <p className="text-sm font-bold">{opponent.username}</p>
          <p className="text-xs text-gray-400">
            Bet: {opponent.selection === 'home_team' ? bet.home_team : 
                  opponent.selection === 'away_team' ? bet.away_team : 'Draw'}
          </p>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded p-2 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Total Pot:</span>
          <span className="font-bold text-emerald-400">Ksh {bet.total_pot.toLocaleString()}</span>
        </div>
      </div>

      <Button
        onClick={() => setShowWinnerDialog(true)}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm py-2"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Trophy className="w-4 h-4 mr-2" />
        )}
        Complete Bet
      </Button>

      {/* Winner Selection Dialog */}
      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Select Match Result</DialogTitle>
            <DialogDescription className="text-gray-400">
              Who won the match?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Button
              onClick={() => handleWinnerSelection('home_team')}
              className="w-full justify-between bg-gray-800 hover:bg-gray-700"
            >
              <span>{bet.home_team} Win</span>
            </Button>
            <Button
              onClick={() => handleWinnerSelection('away_team')}
              className="w-full justify-between bg-gray-800 hover:bg-gray-700"
            >
              <span>{bet.away_team} Win</span>
            </Button>
            <Button
              onClick={() => handleWinnerSelection('draw')}
              className="w-full justify-between bg-gray-800 hover:bg-gray-700"
            >
              <span>Draw</span>
            </Button>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => setShowWinnerDialog(false)}
              className="border-gray-800 text-gray-400"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PledgeCard;