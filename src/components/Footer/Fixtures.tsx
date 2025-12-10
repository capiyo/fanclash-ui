import { 
  MapPin, Clock, DollarSign, Building2, Heart, MessageCircle, 
  Share2, Zap, Users, Calendar, Trophy, Sparkles, UserPlus, 
  Eye, TrendingUp, Wallet, Bell, Target, Crown, ShieldCheck,
  Coins, Award, BarChart3, Lock, Gavel, Percent, Timer, Loader2,
  Filter, Search, ArrowUpDown, MoreVertical, Home, TrendingDown,
  Bookmark, Settings, ChevronRight, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface FixtureProps {
  away_team: string;
  home_team: string;
  date: string;
  draw: string;
  away_win: string;
  home_win: string;
  league: string;
  _id?: string;
}

interface PledgeData {
  username: string;
  phone: string;
  selection: string;
  amount: number;
  fan: string;
  home_team: string;
  away_team: string;
  starter_id: string;
}

interface UserDataFromBackend {
  user_id: string;
  username: string;
  phone: string;
  balance: number;
  nickname?: string;
  club_fan?: string;
  country_fan?: string;
  number_of_bets?: number;
}

const Fixtures = () => {
  const [userData, setUserData] = useState<UserDataFromBackend | null>(null);
  const [fixtures, setFixtures] = useState<FixtureProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'odds' | 'league'>('date');
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const API_BASE_URL = 'https://fanclash-api.onrender.com/api/games';
  const API_PROFILE_URL = 'https://fanclash-api.onrender.com/api/profile';

  const { toast } = useToast();

  // Fetch user from backend
  const fetchUserFromBackend = async (): Promise<UserDataFromBackend | null> => {
    try {
      const saved = localStorage.getItem('userProfile');
      let localPhone = '';
      
      if (saved) {
        try {
          const localData = JSON.parse(saved);
          localPhone = localData.phone || '';
        } catch (error) {
          console.log('Error parsing local data:', error);
        }
      }
      
      if (!localPhone) return null;
      
      const cleanPhone = localPhone.replace(/\D/g, '');
      const phoneFormats = [cleanPhone];
      
      if (cleanPhone.startsWith('0')) {
        phoneFormats.push(cleanPhone.substring(1));
      }
      
      if (cleanPhone.length === 9) {
        phoneFormats.push('254' + cleanPhone);
      } else if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
        phoneFormats.push('254' + cleanPhone.substring(1));
      }
      
      for (const phoneFormat of phoneFormats) {
        try {
          const response = await fetch(`${API_PROFILE_URL}/profile/phone/${phoneFormat}`);
          
          if (response.ok) {
            const backendUser = await response.json();
            
            const userData: UserDataFromBackend = {
              user_id: backendUser.user_id,
              username: backendUser.username || '',
              phone: localPhone,
              balance: backendUser.balance || 0,
              nickname: backendUser.nickname || '',
              club_fan: backendUser.club_fan || '',
              country_fan: backendUser.country_fan || '',
              number_of_bets: backendUser.number_of_bets || 0
            };
            
            localStorage.setItem('userProfile', JSON.stringify(userData));
            return userData;
          }
        } catch (error) {
          console.log(`Phone format ${phoneFormat} not found:`, error);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user from backend:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      setUserLoading(true);
      try {
        const backendUser = await fetchUserFromBackend();
        setUserData(backendUser);
        
        if (!backendUser) {
          const saved = localStorage.getItem('userProfile');
          if (saved) {
            try {
              const localData = JSON.parse(saved);
              setUserData({
                user_id: localData.user_id || '',
                username: localData.username || '',
                phone: localData.phone || '',
                balance: localData.balance || 0
              });
            } catch (error) {
              console.log('No valid user data found');
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setUserLoading(false);
      }
    };
    
    loadUser();
  }, []);

  useEffect(() => {
    const getFixtures = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchFixtures();
        setFixtures(data);
      } catch (err) {
        console.error("Error fetching fixtures:", err);
        setError("Failed to load matches");
        toast({
          title: "Connection Error",
          description: "Unable to fetch live matches",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    getFixtures();
  }, []);

  async function fetchFixtures(): Promise<FixtureProps[]> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      throw error;
    }
  }

  // Filter and sort fixtures
  const filteredFixtures = fixtures.filter(fixture => {
    const matchDate = new Date(fixture.date);
    const now = new Date();
    const diffHours = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!fixture.home_team.toLowerCase().includes(searchLower) &&
          !fixture.away_team.toLowerCase().includes(searchLower) &&
          !fixture.league.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    if (activeFilter === 'live') {
      return diffHours >= -2 && diffHours <= 2;
    } else if (activeFilter === 'upcoming') {
      return matchDate > now;
    }
    return true;
  });

  const sortedFixtures = [...filteredFixtures].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'odds') {
      const maxOddsA = Math.max(parseFloat(a.home_win), parseFloat(a.away_win), parseFloat(a.draw));
      const maxOddsB = Math.max(parseFloat(b.home_win), parseFloat(b.away_win), parseFloat(b.draw));
      return maxOddsB - maxOddsA;
    } else if (sortBy === 'league') {
      return a.league.localeCompare(b.league);
    }
    return 0;
  });

  return (
    <div className="h-screen flex flex-col bg-black text-white font-sans overflow-hidden">
      {/* Mobile Header - Fixed */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800/50 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-base font-bold truncate">battlte ground</span>
            </div>
            
            {/* Mobile Header Actions */}
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
              
              {/* User Balance - Compact */}
              <div className="px-2 py-1.5 bg-gray-900/50 rounded-lg border border-emerald-500/20">
                <div className="text-xs font-bold text-emerald-400">
                  {userLoading ? "..." : `Ksh ${userData?.balance?.toLocaleString() || '0'}`}
                </div>
              </div>
              
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
          
          {/* Mobile Search Bar - Conditionally Rendered */}
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
                    placeholder="Search matches..."
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

      {/* Mobile Filters & Stats - Fixed */}
      <div className="flex-shrink-0 border-b border-gray-800/50">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">Live Matches</h1>
            
            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">2.4K</span>
              </div>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-2 py-0.5">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-1"></div>
                8 Live
              </Badge>
            </div>
          </div>

          {/* Filter Buttons - Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-3 px-3">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
              size="sm"
              className={cn(
                "rounded-full whitespace-nowrap text-xs",
                activeFilter === 'all' 
                  ? "bg-emerald-500 text-white border-emerald-500" 
                  : "border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500"
              )}
            >
              All Matches
            </Button>
            <Button
              variant={activeFilter === 'live' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('live')}
              size="sm"
              className={cn(
                "rounded-full whitespace-nowrap text-xs",
                activeFilter === 'live' 
                  ? "bg-red-500 text-white border-red-500" 
                  : "border-gray-800 text-gray-400 hover:text-red-500 hover:border-red-500"
              )}
            >
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                Live
              </div>
            </Button>
            <Button
              variant={activeFilter === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('upcoming')}
              size="sm"
              className={cn(
                "rounded-full whitespace-nowrap text-xs",
                activeFilter === 'upcoming' 
                  ? "bg-blue-500 text-white border-blue-500" 
                  : "border-gray-800 text-gray-400 hover:text-blue-500 hover:border-blue-500"
              )}
            >
              Upcoming
            </Button>
            
            {/* Sort Options */}
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === 'date' ? 'odds' : 'date')}
                className="rounded-full border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 text-xs"
              >
                <ArrowUpDown className="w-3 h-3 mr-1" />
                Sort
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 text-xs"
              >
                <Filter className="w-3 h-3 mr-1" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="p-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                <div className="text-emerald-400 text-sm">Loading matches...</div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-500/30">
                <Zap className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-400 mb-2">{error}</h3>
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
              {sortedFixtures.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                    <Trophy className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-400 mb-1">No matches found</h3>
                  <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                sortedFixtures.map((fixture, index) => (
                  <motion.div
                    key={fixture._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MatchCard 
                      fixture={fixture} 
                      userData={userData}
                      setUserData={setUserData}
                    />
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800/50 z-40 flex-shrink-0">
        <div className="px-2 py-2">
          <div className="flex justify-around items-center">
            <Button variant="ghost" className="text-emerald-400 group p-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">Home</span>
              </div>
            </Button>
            
            <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group p-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">Trending</span>
              </div>
            </Button>
            
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-12 h-12 shadow-xl shadow-emerald-500/30 relative -top-3">
              <Trophy className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group p-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">Bets</span>
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

interface MatchCardProps {
  fixture: FixtureProps;
  userData: UserDataFromBackend | null;
  setUserData: React.Dispatch<React.SetStateAction<UserDataFromBackend | null>>;
}

function MatchCard({ fixture, userData, setUserData }: MatchCardProps) {
  const [selectedBet, setSelectedBet] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 20);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      if (diffHours <= 2 && diffHours >= -2) {
        return (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-medium text-xs">LIVE</span>
          </div>
        );
      }
      
      if (date > now) {
        return `In ${diffHours}h`;
      }
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "TBD";
    }
  };

  const handleBetPlacement = async () => {
    if (!selectedBet || !betAmount) {
      toast({
        title: "Incomplete Bet",
        description: "Select outcome and enter stake",
        variant: "destructive"
      });
      return;
    }

    const betAmountNum = Number(betAmount);
    
    if (betAmountNum <= 0 || isNaN(betAmountNum)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!userData?.user_id || !userData?.username) {
        toast({
          title: "Authentication Error",
          description: "Please complete your profile first",
          variant: "destructive"
        });
        return;
      }

      if (userData.balance < betAmountNum) {
        toast({
          title: "Insufficient Balance",
          description: `You need Ksh ${betAmountNum} but only have Ksh ${userData.balance}`,
          variant: "destructive"
        });
        return;
      }

      setIsProcessing(true);

      let selection: string;
      switch (selectedBet) {
        case "homeTeam":
          selection = "home_team";
          break;
        case "awayTeam":
          selection = "away_team";
          break;
        case "draw":
          selection = "draw";
          break;
        default:
          selection = "draw";
      }

      const pledgeData: PledgeData = {
        username: userData.username,
        phone: userData.phone,
        selection: selection,
        amount: betAmountNum,
        fan: "user",
        home_team: fixture.home_team,
        away_team: fixture.away_team,
        starter_id: userData.user_id,
      };

      // Place bet
      const betResponse = await fetch(`https://fanclash-api.onrender.com/api/pledges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pledgeData),
      });

      if (!betResponse.ok) {
        const errorData = await betResponse.json();
        throw new Error(errorData.error || `HTTP error! status: ${betResponse.status}`);
      }

      const betResult = await betResponse.json();

      // Update balance
      const newBalance = userData.balance - betAmountNum;
      
      const updateResponse = await fetch(`https://fanclash-api.onrender.com/api/profile/update-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.user_id,
          balance: newBalance
        }),
      });

      if (updateResponse.ok) {
        const updatedUser = await updateResponse.json();
        
        // Update local state
        const updatedUserData = {
          ...userData,
          balance: updatedUser.balance || newBalance
        };
        
        setUserData(updatedUserData);
        localStorage.setItem('userProfile', JSON.stringify(updatedUserData));
        
        // Show success
        const selectedTeam = selectedBet === "homeTeam" ? fixture.home_team : 
                            selectedBet === "awayTeam" ? fixture.away_team : "Draw";
        
        toast({
          title: "🎯 Bet Placed!",
          description: `Ksh ${betAmount} on ${selectedTeam}`,
          className: "bg-emerald-500/20 border-emerald-500 text-emerald-500",
          duration: 3000
        });
        
        // Reset form
        setBetAmount("");
        setSelectedBet("");
      } else {
        throw new Error("Failed to update balance after bet placement");
      }

    } catch (error) {
      console.error("❌ Error placing bet:", error);
      toast({
        title: "Bet Failed",
        description: error instanceof Error ? error.message : "Unable to place bet",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isLive = formatDate(fixture.date)?.props?.children?.[1] === "LIVE";

  return (
    <div className="w-full bg-gradient-to-br from-gray-900/30 to-black/30 
      rounded-xl border border-gray-800/50 p-3 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
      
      {/* Mobile Match Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 max-w-[100px]">
            <span className="text-[10px] font-medium text-emerald-400 truncate">
              {fixture.league}
            </span>
          </div>
          {isLive && (
            <div className="bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-medium text-red-400">LIVE</span>
              </div>
            </div>
          )}
        </div>
        <div className="text-[10px] text-gray-400">
          {formatDate(fixture.date)}
        </div>
      </div>

      {/* Mobile Teams Row */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="text-center flex-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-900 to-black border border-emerald-500/30 flex items-center justify-center mx-auto mb-1">
              <span className="font-bold text-emerald-300 text-xs">
                {fixture.home_team.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate px-1">{fixture.home_team}</p>
          </div>

          {/* VS */}
          <div className="px-1">
            <div className="bg-gray-900 rounded-full p-1 w-6 h-6 flex items-center justify-center border border-gray-800">
              <span className="font-bold text-gray-300 text-[10px]">VS</span>
            </div>
          </div>

          {/* Away Team */}
          <div className="text-center flex-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-900 to-black border border-emerald-500/30 flex items-center justify-center mx-auto mb-1">
              <span className="font-bold text-emerald-300 text-xs">
                {fixture.away_team.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate px-1">{fixture.away_team}</p>
          </div>
        </div>
      </div>

      {/* Mobile Odds Buttons */}
      <div className="mb-3">
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant={selectedBet === "homeTeam" ? "default" : "outline"}
            onClick={() => setSelectedBet("homeTeam")}
            size="sm"
            className={cn(
              "rounded-lg font-medium py-1.5 h-auto min-h-[40px] transition-all",
              selectedBet === "homeTeam" 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500" 
                : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-white bg-gray-900/30"
            )}
          >
            <div className="flex flex-col items-center">
              <div className="text-[9px]">1</div>
              <div className="text-xs font-bold text-emerald-400">{fixture.home_win}</div>
            </div>
          </Button>

          <Button
            variant={selectedBet === "draw" ? "default" : "outline"}
            onClick={() => setSelectedBet("draw")}
            size="sm"
            className={cn(
              "rounded-lg font-medium py-1.5 h-auto min-h-[40px] transition-all",
              selectedBet === "draw" 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500" 
                : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-white bg-gray-900/30"
            )}
          >
            <div className="flex flex-col items-center">
              <div className="text-[9px]">X</div>
              <div className="text-xs font-bold text-emerald-400">{fixture.draw}</div>
            </div>
          </Button>

          <Button
            variant={selectedBet === "awayTeam" ? "default" : "outline"}
            onClick={() => setSelectedBet("awayTeam")}
            size="sm"
            className={cn(
              "rounded-lg font-medium py-1.5 h-auto min-h-[40px] transition-all",
              selectedBet === "awayTeam" 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500" 
                : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-white bg-gray-900/30"
            )}
          >
            <div className="flex flex-col items-center">
              <div className="text-[9px]">2</div>
              <div className="text-xs font-bold text-emerald-400">{fixture.away_win}</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Bet Amount Input - Only show when bet is selected */}
      {selectedBet && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-2 overflow-hidden"
        >
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Stake amount..."
              className="w-full pl-8 pr-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/40"
              disabled={isProcessing}
            />
          </div>
          
          {/* Quick Stake Buttons */}
          <div className="grid grid-cols-4 gap-1 mt-1.5">
            {["100", "500", "1K", "5K"].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(amount.replace('K', '000'))}
                className="rounded-lg border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 text-[10px] py-0.5 bg-gray-900/30"
                disabled={isProcessing}
              >
                {amount}
              </Button>
            ))}
          </div>
          
          {/* Bet Button */}
          <Button
            onClick={handleBetPlacement}
            size="sm"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 mt-1.5 text-xs font-bold"
            disabled={!betAmount || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin mx-auto" />
            ) : (
              `Bet Ksh ${betAmount || '...'}`
            )}
          </Button>
          
          {/* Balance Info */}
          {userData && (
            <div className="mt-1.5 text-[10px] text-gray-400 flex items-center justify-between">
              <span>Bal: Ksh {userData.balance.toLocaleString()}</span>
              {betAmount && (
                <span className={Number(betAmount) > userData.balance ? "text-red-400" : "text-emerald-400"}>
                  Left: Ksh {(userData.balance - Number(betAmount)).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Mobile Actions */}
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
            className="p-1 text-gray-400 hover:text-emerald-500"
          >
            <MessageCircle className="w-3 h-3" />
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

export default Fixtures;