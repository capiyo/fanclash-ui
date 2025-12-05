import { 
  MapPin, Clock, DollarSign, Building2, Heart, MessageCircle, 
  Share2, Zap, Users, Calendar, Trophy, Sparkles, UserPlus, 
  Eye, TrendingUp, Wallet, Bell, Target, Crown, ShieldCheck,
  Coins, Award, BarChart3, Lock, Gavel, Percent, Timer, Loader2,
  Filter, Search, ChevronDown, TrendingDown, ArrowUpDown, MoreVertical,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const FixturesD = () => {
  const [userData, setUserData] = useState<UserDataFromBackend | null>(null);
  const [fixtures, setFixtures] = useState<FixtureProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'odds' | 'popularity'>('date');
  const API_BASE_URL = 'https://fanclash-api.onrender.com/api/games';
  const API_PROFILE_URL = 'https://fanclash-api.onrender.com/api/profile';

  const { toast } = useToast();

  const teamAvatars = {
    team1: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=100&h=100&fit=crop",
    team2: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=100&h=100&fit=crop",
    team3: "https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?w=100&h=100&fit=crop",
    user1: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    user2: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
    user3: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  };

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

  // Filter fixtures based on active filter
  const filteredFixtures = fixtures.filter(fixture => {
    if (activeFilter === 'live') {
      const matchDate = new Date(fixture.date);
      const now = new Date();
      const diffHours = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours >= -2 && diffHours <= 2; // Matches within 2 hours of now
    } else if (activeFilter === 'upcoming') {
      const matchDate = new Date(fixture.date);
      return matchDate > new Date();
    }
    return true;
  });

  // Sort fixtures
  const sortedFixtures = [...filteredFixtures].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'odds') {
      return Math.max(parseFloat(b.home_win), parseFloat(b.away_win), parseFloat(b.draw)) - 
             Math.max(parseFloat(a.home_win), parseFloat(a.away_win), parseFloat(a.draw));
    }
    return 0; // For popularity, you might want to add a popularity field
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans hidden lg:block">
      <div className="flex h-screen">
        {/* Left Sidebar - Fixed */}
        <div className="w-64 border-r border-gray-800/50 p-4 overflow-y-auto">
          {/* User Profile Card */}
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl p-4 border border-gray-800/50 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12 border-2 border-emerald-500/30">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                  {userData?.username?.substring(0, 2).toUpperCase() || 'FC'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">{userData?.username || 'Guest User'}</h3>
                <p className="text-xs text-gray-400">@{userData?.username?.toLowerCase().replace(/\s+/g, '') || 'guest'}</p>
              </div>
            </div>
            
            {/* Balance */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Balance</span>
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Ksh {userData?.balance?.toLocaleString() || '0.00'}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">+24.5% this week</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gray-900/30 text-center">
                <div className="text-sm font-bold text-white">42</div>
                <div className="text-xs text-gray-400">Bets</div>
              </div>
              <div className="p-2 rounded-lg bg-gray-900/30 text-center">
                <div className="text-sm font-bold text-emerald-400">68%</div>
                <div className="text-xs text-gray-400">Win Rate</div>
              </div>
            </div>
            
            <Button className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 text-sm py-2">
              <Coins className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
          </div>
          
          {/* Quick Filters */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">QUICK FILTERS</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost"
                onClick={() => setActiveFilter('all')}
                className={cn(
                  "w-full justify-start text-sm",
                  activeFilter === 'all' 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Trophy className="w-4 h-4 mr-2" />
                All Matches
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setActiveFilter('live')}
                className={cn(
                  "w-full justify-start text-sm",
                  activeFilter === 'live' 
                    ? "bg-red-500/10 text-red-400 border-red-500/30" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Zap className="w-4 h-4 mr-2" />
                Live Now
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setActiveFilter('upcoming')}
                className={cn(
                  "w-full justify-start text-sm",
                  activeFilter === 'upcoming' 
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming
              </Button>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">SORT BY</h3>
            <div className="space-y-2">
              {[
                { key: 'date', label: 'Date', icon: Calendar },
                { key: 'odds', label: 'Best Odds', icon: TrendingUp },
                { key: 'popularity', label: 'Popularity', icon: TrendingDown }
              ].map((item) => (
                <Button 
                  key={item.key}
                  variant="ghost"
                  onClick={() => setSortBy(item.key as any)}
                  className={cn(
                    "w-full justify-start text-sm",
                    sortBy === item.key 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Top Leagues */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">TOP LEAGUES</h3>
            <div className="space-y-2">
              {['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'UEFA'].map((league) => (
                <div key={league} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-900/30 cursor-pointer">
                  <span className="text-sm text-gray-300">{league}</span>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    42
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area - 2 Column Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Live Matches & Odds</h1>
              <p className="text-sm text-gray-500 mt-1">Bet on your favorite teams with real-time odds</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search matches..."
                  className="pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/40 w-64"
                />
              </div>
              <Button variant="outline" className="border-gray-800 text-gray-400 hover:text-white hover:border-gray-700">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* 2 Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedFixtures.map((fixture, index) => (
              <div key={fixture._id || index} className="animate-in fade-in duration-300">
                <MatchCard 
                  fixture={fixture} 
                  teamAvatars={teamAvatars}
                  userData={userData}
                  setUserData={setUserData}
                />
              </div>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="col-span-2 p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-gray-800 border-t-emerald-500"></div>
              <p className="mt-4 text-gray-500">Loading live matches...</p>
              <p className="text-sm text-gray-600 mt-2">Fetching the best betting opportunities</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="col-span-2 p-8 text-center border border-gray-800/50 rounded-xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <Zap className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-red-500 font-bold mb-2">Connection Failed</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 shadow-lg shadow-emerald-500/20"
                onClick={() => window.location.reload()}
              >
                Retry Connection
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && sortedFixtures.length === 0 && !error && (
            <div className="col-span-2 p-12 text-center border border-gray-800/50 rounded-xl">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Trophy className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">No Matches Available</h3>
              <p className="text-gray-500 mb-6">Check back later for upcoming fixtures</p>
            </div>
          )}

          {/* Info Footer */}
          <div className="mt-8 pt-6 border-t border-gray-800/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">1,248</div>
                <div className="text-sm text-gray-500">Active Bets Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">68.3%</div>
                <div className="text-sm text-gray-500">Average Win Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">42</div>
                <div className="text-sm text-gray-500">Live Matches</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MatchCardProps {
  fixture: FixtureProps;
  teamAvatars: any;
  userData: UserDataFromBackend | null;
  setUserData: React.Dispatch<React.SetStateAction<UserDataFromBackend | null>>;
}

function MatchCard({ fixture, teamAvatars, userData, setUserData }: MatchCardProps) {
  const [selectedBet, setSelectedBet] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100) + 50);
  const [commentCount, setCommentCount] = useState(Math.floor(Math.random() * 30) + 10);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const getTeamAvatar = (teamName: string) => {
    const teams = [teamAvatars.team1, teamAvatars.team2, teamAvatars.team3];
    return teams[teamName.length % teams.length];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      if (diffHours <= 2 && diffHours >= -2) {
        return "LIVE NOW";
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Time TBD";
    }
  };

  const isLive = formatDate(fixture.date) === "LIVE NOW";

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

      console.log("📤 Placing bet with data:", pledgeData);

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
      console.log("✅ Bet placed successfully:", betResult);

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

  return (
    <div className="bg-gradient-to-br from-gray-900/30 to-black/30 rounded-xl border border-gray-800/50 p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
      {/* Match Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isLive ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded-full border border-red-500/20">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              LIVE
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
              <Calendar className="w-3 h-3" />
              {formatDate(fixture.date)}
            </div>
          )}
          <span className="text-xs text-gray-500">·</span>
          <span className="text-sm text-emerald-400 font-medium">{fixture.league}</span>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Teams Section */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="text-center w-1/3">
            <Avatar className="w-16 h-16 border border-gray-700 ring-1 ring-gray-600/30 mx-auto mb-2">
              <AvatarImage src={getTeamAvatar(fixture.home_team)} />
              <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800 font-bold">
                {fixture.home_team.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-bold text-white truncate">{fixture.home_team}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <HomeIcon className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">Home</span>
            </div>
          </div>

          {/* VS */}
          <div className="px-4">
            <div className="text-center">
              <div className="bg-gray-900 rounded-full p-2 w-12 h-12 mx-auto mb-2 border border-gray-800 flex items-center justify-center">
                <span className="font-bold text-gray-300 text-sm">VS</span>
              </div>
              {isLive && (
                <div className="text-xs text-red-400 animate-pulse">LIVE</div>
              )}
            </div>
          </div>

          {/* Away Team */}
          <div className="text-center w-1/3">
            <Avatar className="w-16 h-16 border border-gray-700 ring-1 ring-gray-600/30 mx-auto mb-2">
              <AvatarImage src={getTeamAvatar(fixture.away_team)} />
              <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800 font-bold">
                {fixture.away_team.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-bold text-white truncate">{fixture.away_team}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <AwayIcon className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">Away</span>
            </div>
          </div>
        </div>
      </div>

      {/* Odds Section */}
      <div className="mb-5">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={selectedBet === "homeTeam" ? "default" : "outline"}
            onClick={() => setSelectedBet("homeTeam")}
            className={cn(
              "rounded-lg font-medium py-3",
              selectedBet === "homeTeam" 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-white bg-gray-900/30"
            )}
          >
            <div className="text-center w-full">
              <div className="text-sm">Home</div>
              <div className="text-lg font-bold">{fixture.home_win}</div>
            </div>
          </Button>

          <Button
            variant={selectedBet === "draw" ? "default" : "outline"}
            onClick={() => setSelectedBet("draw")}
            className={cn(
              "rounded-lg font-medium py-3",
              selectedBet === "draw" 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20" 
                : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-white bg-gray-900/30"
            )}
          >
            <div className="text-center w-full">
              <div className="text-sm">Draw</div>
              <div className="text-lg font-bold">{fixture.draw}</div>
            </div>
          </Button>

          <Button
            variant={selectedBet === "awayTeam" ? "default" : "outline"}
            onClick={() => setSelectedBet("awayTeam")}
            className={cn(
              "rounded-lg font-medium py-3",
              selectedBet === "awayTeam" 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-white bg-gray-900/30"
            )}
          >
            <div className="text-center w-full">
              <div className="text-sm">Away</div>
              <div className="text-lg font-bold">{fixture.away_win}</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Bet Amount Input */}
      {selectedBet && (
        <div className="mb-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter stake..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/40"
                disabled={isProcessing}
              />
            </div>
            <Button
              onClick={handleBetPlacement}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-3 font-bold shadow-lg shadow-emerald-500/20 border border-emerald-500/30"
              disabled={!betAmount || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Bet Now'
              )}
            </Button>
          </div>
          
          {/* Quick Stake Buttons */}
          <div className="flex gap-2 mt-3">
            {["100", "500", "1000", "5000"].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(amount)}
                className="flex-1 rounded-lg border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 text-xs py-2 bg-gray-900/30"
                disabled={isProcessing}
              >
                Ksh {amount}
              </Button>
            ))}
          </div>
          
          {/* Balance Info */}
          {userData && (
            <div className="mt-3 text-sm text-gray-400 flex items-center justify-between">
              <span>Balance: Ksh {userData.balance.toLocaleString()}</span>
              {betAmount && (
                <span className={Number(betAmount) > userData.balance ? "text-red-400" : "text-emerald-400"}>
                  New: Ksh {(userData.balance - Number(betAmount)).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-gray-800/50 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
          }}
          className={cn(
            "flex items-center gap-2 text-gray-400 hover:text-pink-500 p-2",
            isLiked && "text-pink-500"
          )}
        >
          <Heart className={cn(
            "w-4 h-4",
            isLiked && "fill-pink-500"
          )} />
          <span className="text-xs">{likeCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCommentCount(prev => prev + 1)}
          className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 p-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{commentCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFollowing(!isFollowing)}
          className={cn(
            "flex items-center gap-2 text-gray-400 hover:text-emerald-500 p-2",
            isFollowing && "text-emerald-500"
          )}
        >
          <UserPlus className="w-4 h-4" />
          <span className="text-xs">{isFollowing ? "Following" : "Follow"}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 p-2"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-xs">Share</span>
        </Button>
      </div>
    </div>
  );
}

// Helper icons
function HomeIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function AwayIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 19l-7-7 7-7" />
      <path d="M22 12H2" />
    </svg>
  );
}

export default FixturesD;