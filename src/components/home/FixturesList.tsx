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

const FixturesList = () => {
  const [userData, setUserData] = useState<UserDataFromBackend | null>(null);
  const [fixtures, setFixtures] = useState<FixtureProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'odds' | 'league'>('date');
  const [searchQuery, setSearchQuery] = useState("");
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
    <div className="h-full w-[700px] bg-black text-white font-sans overflow-hidden">
      {/* Desktop Header */}
      <div className="hidden lg:block sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">battlte ground</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="ghost" className="text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </Button>
                <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search matches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-800 rounded-full text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                />
              </div>
              
              {/* User Balance */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 rounded-lg border border-emerald-500/20">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs text-emerald-300">Balance</div>
                  <div className="text-sm font-bold text-emerald-400">
                    {userLoading ? "..." : `Ksh ${userData?.balance?.toLocaleString() || '0'}`}
                  </div>
                </div>
              </div>
              
              {/* User Avatar */}
              <Avatar className="w-10 h-10 border-2 border-emerald-500/30">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                  {userData?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full">
        {/* Filters & Stats Row */}
        <div className="p-4 border-b border-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Live Matches</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">2.4K watching</span>
              </div>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
                8 Live
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
              className={cn(
                "rounded-full",
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
              className={cn(
                "rounded-full",
                activeFilter === 'live' 
                  ? "bg-red-500 text-white border-red-500" 
                  : "border-gray-800 text-gray-400 hover:text-red-500 hover:border-red-500"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Live Now
              </div>
            </Button>
            <Button
              variant={activeFilter === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('upcoming')}
              className={cn(
                "rounded-full",
                activeFilter === 'upcoming' 
                  ? "bg-blue-500 text-white border-blue-500" 
                  : "border-gray-800 text-gray-400 hover:text-blue-500 hover:border-blue-500"
              )}
            >
              Upcoming
            </Button>
          </div>
        </div>

        {/* Scrollable 2-Column Grid Container - FIXED */}
        <div className="h-[calc(100vh-180px)] overflow-y-auto">
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                  <div className="text-emerald-400">Loading matches...</div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                  <Zap className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-400 mb-2">{error}</h3>
                <Button 
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Retry
                </Button>
              </div>
            ) : (
              // FIXED: Changed to auto-fit grid with responsive breakpoints
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {sortedFixtures.length === 0 ? (
                  <div className="col-span-2 text-center py-20">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                      <Trophy className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-400 mb-2">No matches found</h3>
                    <p className="text-gray-400">Try adjusting your filters or check back later</p>
                  </div>
                ) : (
                  sortedFixtures.map((fixture, index) => (
                    <motion.div
                      key={fixture._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="w-full"
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
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800/50 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            <Button variant="ghost" className="text-emerald-400 group">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center bg-emerald-500/10">
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-xs">Home</span>
              </div>
            </Button>
            
            <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center group-hover:bg-emerald-500/10">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs">Trending</span>
              </div>
            </Button>
            
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-14 h-14 shadow-xl shadow-emerald-500/30 relative -top-4">
              <Trophy className="w-6 h-6" />
            </Button>
            
            <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center group-hover:bg-emerald-500/10">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs">Bets</span>
              </div>
            </Button>
            
            <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center group-hover:bg-emerald-500/10">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-xs">Wallet</span>
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
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      if (diffHours <= 2 && diffHours >= -2) {
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
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
          title: "🎯 Bet Placed Successfully!",
          description: `Ksh ${betAmount} on ${selectedTeam}. New balance: Ksh ${updatedUserData.balance.toLocaleString()}`,
          className: "bg-emerald-500/20 border-emerald-500 text-emerald-500",
          duration: 4000
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
    <div className="w-[320px] bg-gradient-to-br from-gray-900/30 to-black/30 
      rounded-xl border border-gray-800/50 p-4 backdrop-blur-sm hover:border-emerald-500/30 transition-all group">
      
      {/* Match Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 max-w-[120px]">
            <span className="text-xs font-medium text-emerald-400 truncate">
              {fixture.league}
            </span>
          </div>
          {isLive && (
            <div className="bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-red-400">LIVE</span>
              </div>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-400">
          {formatDate(fixture.date)}
        </div>
      </div>

      {/* Teams */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="text-center w-2/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-1 group-hover:border-emerald-500/50 transition-colors">
              <span className="font-bold text-emerald-300 text-sm">
                {fixture.home_team.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate">{fixture.home_team}</p>
          </div>

          {/* VS */}
          <div className="px-2">
            <div className="bg-gray-900 rounded-full p-1 w-8 h-8 flex items-center justify-center border border-gray-800">
              <span className="font-bold text-gray-300 text-xs">VS</span>
            </div>
          </div>

          {/* Away Team */}
          <div className="text-center w-2/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-1 group-hover:border-emerald-500/50 transition-colors">
              <span className="font-bold text-emerald-300 text-sm">
                {fixture.away_team.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate">{fixture.away_team}</p>
          </div>
        </div>
      </div>

      {/* Odds */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant={selectedBet === "homeTeam" ? "default" : "outline"}
            onClick={() => setSelectedBet("homeTeam")}
            className={cn(
              "rounded-lg font-medium py-2 transition-all w-full",
              selectedBet === "homeTeam" 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
                : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-white bg-gray-900/30"
            )}
          >
            <div className="text-center w-full">
              <div className="text-[10px]">1</div>
              <div className="text-sm font-bold text-emerald-400">{fixture.home_win}</div>
            </div>
          </Button>

          <Button
            variant={selectedBet === "draw" ? "default" : "outline"}
            onClick={() => setSelectedBet("draw")}
            className={cn(
              "rounded-lg font-medium py-2 transition-all w-full",
              selectedBet === "draw" 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
                : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-white bg-gray-900/30"
            )}
          >
            <div className="text-center w-full">
              <div className="text-[10px]">X</div>
              <div className="text-sm font-bold text-emerald-400">{fixture.draw}</div>
            </div>
          </Button>

          <Button
            variant={selectedBet === "awayTeam" ? "default" : "outline"}
            onClick={() => setSelectedBet("awayTeam")}
            className={cn(
              "rounded-lg font-medium py-2 transition-all w-full",
              selectedBet === "awayTeam" 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
                : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-white bg-gray-900/30"
            )}
          >
            <div className="text-center w-full">
              <div className="text-[10px]">2</div>
              <div className="text-sm font-bold text-emerald-400">{fixture.away_win}</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Bet Amount Input - Only show when bet is selected */}
      {selectedBet && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-3 overflow-hidden"
        >
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Stake..."
              className="w-full pl-8 pr-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/40"
              disabled={isProcessing}
            />
          </div>
          
          {/* Quick Stake Buttons */}
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {["100", "500", "1K", "5K"].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(amount.replace('K', '000'))}
                className="rounded-lg border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 text-[10px] py-1 bg-gray-900/30"
                disabled={isProcessing}
              >
                {amount}
              </Button>
            ))}
          </div>
          
          {/* Bet Button */}
          <Button
            onClick={handleBetPlacement}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 mt-2 text-xs font-bold"
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
            <div className="mt-2 text-[10px] text-gray-400 flex items-center justify-between">
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

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800/30">
        <div className="flex items-center gap-1">
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
            <span className="text-[10px] ml-1">{likeCount}</span>
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

export default FixturesList;