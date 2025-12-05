import { 
  MapPin, Clock, DollarSign, Building2, Heart, MessageCircle, 
  Share2, Zap, Users, Calendar, Trophy, Sparkles, UserPlus, 
  Eye, TrendingUp, Wallet, Bell, Target, Crown, ShieldCheck,
  Coins, Award, BarChart3, Lock, Gavel, Percent, Timer, Loader2
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

const Fixtures = () => {
  const [userData, setUserData] = useState<UserDataFromBackend | null>(null);
  const [fixtures, setFixtures] = useState<FixtureProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState("");
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

  const mockBettors = [
    { name: "Alex", avatar: teamAvatars.user1, bet: "₿50", team: "HOME", won: true },
    { name: "Sarah", avatar: teamAvatars.user2, bet: "₿120", team: "AWAY", won: false },
    { name: "Mike", avatar: teamAvatars.user3, bet: "₿75", team: "DRAW", won: true }
  ];

  // Fetch user from backend using phone number
  const fetchUserFromBackend = async (): Promise<UserDataFromBackend | null> => {
    try {
      // First, get phone from localStorage
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
      
      // Clean phone and try different formats
      const cleanPhone = localPhone.replace(/\D/g, '');
      
      const phoneFormats = [];
      phoneFormats.push(cleanPhone);
      
      if (cleanPhone.startsWith('0')) {
        phoneFormats.push(cleanPhone.substring(1));
      }
      
      if (cleanPhone.length === 9) {
        phoneFormats.push('254' + cleanPhone);
      } else if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
        phoneFormats.push('254' + cleanPhone.substring(1));
      }
      
      console.log('Fetching user from backend with phone formats:', phoneFormats);
      
      // Try each phone format
      for (const phoneFormat of phoneFormats) {
        try {
          const response = await fetch(`${API_PROFILE_URL}/profile/phone/${phoneFormat}`);
          
          if (response.ok) {
            const backendUser = await response.json();
            console.log('✅ Found user in backend:', backendUser);
            
            const userData: UserDataFromBackend = {
              user_id: backendUser.user_id,
              username: backendUser.username || '',
              phone: localPhone, // Keep local format
              balance: backendUser.balance || 0,
              nickname: backendUser.nickname || '',
              club_fan: backendUser.club_fan || '',
              country_fan: backendUser.country_fan || '',
              number_of_bets: backendUser.number_of_bets || 0
            };
            
            // Update localStorage with backend data
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
    // Load user from backend first
    const loadUser = async () => {
      setUserLoading(true);
      try {
        const backendUser = await fetchUserFromBackend();
        setUserData(backendUser);
        
        // If no user found, check if we have minimal data in localStorage
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      {/* User Balance Display */}
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4 p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Available Balance</div>
              {userLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                  <span className="text-emerald-400 text-sm">Loading...</span>
                </div>
              ) : (
                <div className="text-emerald-400 font-bold text-lg">
                  Ksh {userData?.balance?.toLocaleString() || '0.00'}
                </div>
              )}
            </div>
          </div>
          
          {userData?.username && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Welcome back</div>
              <div className="text-white font-medium">{userData.username}</div>
            </div>
          )}
        </div>
      </div>

      {/* Post New Bet Card */}
      <div className="max-w-2xl mx-auto p-4">
        <div className="border-b border-gray-800 border-opacity-50 p-4 bg-gray-900/20 backdrop-blur-sm rounded-xl">
          <div className="flex space-x-4">
            <Avatar className="w-12 h-12 border border-gray-800 ring-1 ring-gray-700/50">
              <AvatarImage src={teamAvatars.user1} />
              <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800">
                {userData?.username?.substring(0, 2).toUpperCase() || 'Yo'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea 
                placeholder="What's your betting analysis? #SportsBetting" 
                className="w-full bg-transparent text-sm placeholder-gray-600 focus:outline-none resize-none mb-4"
                rows={2}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-gray-500">
                  <Button variant="ghost" size="sm" className="hover:text-emerald-500 hover:bg-gray-800/50 rounded-full p-2">
                    <Calendar className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:text-emerald-500 hover:bg-gray-800/50 rounded-full p-2">
                    <DollarSign className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:text-emerald-500 hover:bg-gray-800/50 rounded-full p-2">
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 font-bold shadow-lg shadow-emerald-500/20">
                  Post Bet
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixtures Feed */}
      <div className="max-w-2xl mx-auto">
        <div className="divide-y divide-gray-800/50">
          {fixtures.map((fixture, index) => (
            <div key={index} className="hover:bg-gray-900/30 transition-colors duration-200">
              <MatchCard 
                fixture={fixture} 
                teamAvatars={teamAvatars} 
                mockBettors={mockBettors}
                userData={userData}
                setUserData={setUserData}
              />
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center border-b border-gray-800/50">
            <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-gray-800 border-t-emerald-500"></div>
            <p className="mt-4 text-gray-500">Loading live odds...</p>
            <p className="text-sm text-gray-600 mt-2">Fetching the best betting opportunities</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-8 text-center border-b border-gray-800/50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Zap className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-red-500 font-bold mb-2">Connection Failed</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 shadow-lg shadow-emerald-500/20">
              Retry Connection
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800/50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center group-hover:bg-emerald-500/10">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs">For You</span>
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
              <Zap className="w-6 h-6" />
            </Button>
            
            <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center group-hover:bg-emerald-500/10">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs">Community</span>
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
  teamAvatars: any;
  mockBettors: any[];
  userData: UserDataFromBackend | null;
  setUserData: React.Dispatch<React.SetStateAction<UserDataFromBackend | null>>;
}

function MatchCard({ fixture, teamAvatars, mockBettors, userData, setUserData }: MatchCardProps) {
  const [selectedBet, setSelectedBet] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100) + 50);
  const [commentCount, setCommentCount] = useState(Math.floor(Math.random() * 30) + 10);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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
    
    // Validate bet amount
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

      // Check if user has sufficient balance
      if (userData.balance < betAmountNum) {
        toast({
          title: "Insufficient Balance",
          description: `You need Ksh ${betAmountNum} but only have Ksh ${userData.balance}`,
          variant: "destructive"
        });
        return;
      }

      setIsProcessing(true);

      // Map frontend selection to backend format
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

      // Prepare pledge data
      const pledgeData: PledgeData = {
        username: userData.username,
        phone: userData.phone,
        selection: selection,
        amount: betAmountNum,
        fan: "user",
        home_team: fixture.home_team,
        away_team: fixture.away_team,
        starter_id: userData.user_id, // Use backend user_id
      };

      console.log("📤 Placing bet with data:", pledgeData);

      // 1. First, place the bet
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

      // 2. Calculate new balance
      const newBalance = userData.balance - betAmountNum;
      
      // 3. Update balance on backend
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
        console.log("✅ Balance updated on backend:", updatedUser);
        
        // Update local state and localStorage
        const updatedUserData = {
          ...userData,
          balance: updatedUser.balance || newBalance
        };
        
        setUserData(updatedUserData);
        localStorage.setItem('userProfile', JSON.stringify(updatedUserData));
        
        // Show success message
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Time TBD";
    }
  };

  const getTeamAvatar = (teamName: string) => {
    const teams = [teamAvatars.team1, teamAvatars.team2, teamAvatars.team3];
    return teams[teamName.length % teams.length];
  };

  return (
    <div className="border-b border-gray-800/50 p-4 hover:bg-gray-900/30 transition-colors duration-200">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10 border border-gray-800 ring-1 ring-gray-700/50">
            <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800">
              <Trophy className="w-4 h-4 text-emerald-500" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 text-sm font-bold">{fixture.league}</span>
              <span className="text-gray-600 text-sm">·</span>
              <span className="text-gray-500 text-sm">{formatDate(fixture.date)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <span>Live Match</span>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-gray-600">·</span>
              <span className="text-emerald-400 text-xs">Odds Boost Active</span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-emerald-500 hover:bg-gray-800/50 rounded-full p-2"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Teams & Odds */}
      <div className="ml-13 mb-4">
        <div className="flex items-center justify-between mb-6">
          {/* Home Team */}
          <div className="text-center flex-1">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Avatar className="w-14 h-14 border border-gray-700 ring-1 ring-gray-600/30">
                <AvatarImage src={getTeamAvatar(fixture.home_team)} />
                <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800 font-bold">
                  {fixture.home_team.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-bold">{fixture.home_team}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>Home</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-emerald-400 font-bold">{fixture.home_win}</span>
                </div>
              </div>
            </div>
            <Button
              variant={selectedBet === "homeTeam" ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-full rounded-full font-bold transition-all duration-200",
                selectedBet === "homeTeam" 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
                  : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-emerald-500 bg-gray-900/50"
              )}
              onClick={() => setSelectedBet("homeTeam")}
            >
              Bet Home
            </Button>
          </div>

          <div className="px-6">
            <div className="bg-gray-900 rounded-full px-4 py-2 border border-gray-800">
              <span className="font-bold text-gray-300 text-sm">VS</span>
            </div>
          </div>

          {/* Away Team */}
          <div className="text-center flex-1">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="text-right">
                <p className="text-sm font-bold">{fixture.away_team}</p>
                <div className="flex items-center justify-end space-x-2 text-sm text-gray-400">
                  <span className="text-emerald-400 font-bold">{fixture.away_win}</span>
                  <span className="text-gray-600">·</span>
                  <span>Away</span>
                </div>
              </div>
              <Avatar className="w-14 h-14 border border-gray-700 ring-1 ring-gray-600/30">
                <AvatarImage src={getTeamAvatar(fixture.away_team)} />
                <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800 font-bold">
                  {fixture.away_team.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button
              variant={selectedBet === "awayTeam" ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-full rounded-full font-bold transition-all duration-200",
                selectedBet === "awayTeam" 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
                  : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-emerald-500 bg-gray-900/50"
              )}
              onClick={() => setSelectedBet("awayTeam")}
            >
              Bet Away
            </Button>
          </div>
        </div>

        {/* Draw Option */}
        <div className="mb-6">
          <Button
            variant={selectedBet === "draw" ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-full rounded-full font-bold transition-all duration-200",
              selectedBet === "draw" 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20" 
                : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-emerald-500 bg-gray-900/50"
            )}
            onClick={() => setSelectedBet("draw")}
          >
            <span className="mr-2">Bet Draw</span>
            <span className="text-emerald-400 font-bold">{fixture.draw}</span>
          </Button>
        </div>

        {/* Bet Amount Input */}
        {selectedBet && (
          <div className="mb-6 animate-in fade-in duration-300">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter stake amount..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-full px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                  disabled={isProcessing}
                />
              </div>
              <Button
                onClick={handleBetPlacement}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 font-bold shadow-lg shadow-emerald-500/20 border border-emerald-500/30"
                disabled={!betAmount || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Bet'
                )}
              </Button>
            </div>
            
            {/* Current Balance Display */}
            {userData && (
              <div className="mt-3 text-sm text-gray-400 flex items-center justify-between">
                <span>Available: Ksh {userData.balance.toLocaleString()}</span>
                {betAmount && (
                  <span className={Number(betAmount) > userData.balance ? "text-red-400" : "text-emerald-400"}>
                    After bet: Ksh {(userData.balance - Number(betAmount)).toLocaleString()}
                  </span>
                )}
              </div>
            )}
            
            {/* Quick Stake Buttons */}
            <div className="flex space-x-2 mt-3">
              {["10", "50", "100", "500"].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(amount)}
                  className="flex-1 rounded-full border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 text-xs py-2 bg-gray-900/50"
                  disabled={isProcessing}
                >
                  ₿{amount}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Bettors */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {mockBettors.slice(0, 3).map((bettor, index) => (
                <Avatar key={index} className="w-8 h-8 border-2 border-gray-900 ring-1 ring-gray-800">
                  <AvatarImage src={bettor.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800 text-xs">
                    {bettor.name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-gray-400">
              +{mockBettors.length} bets placed
            </span>
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm">2.1K</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-400">Live</span>
            </div>
          </div>
        </div>

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
              "flex items-center space-x-2 text-gray-400 hover:text-pink-500 group rounded-full px-3",
              isLiked && "text-pink-500"
            )}
          >
            <Heart className={cn(
              "w-5 h-5 transition-all duration-200 group-hover:scale-110",
              isLiked && "fill-pink-500"
            )} />
            <span className="text-sm">{likeCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommentCount(prev => prev + 1)}
            className="flex items-center space-x-2 text-gray-400 hover:text-emerald-500 group rounded-full px-3"
          >
            <MessageCircle className="w-5 h-5 transition-all duration-200 group-hover:scale-110" />
            <span className="text-sm">{commentCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFollowing(!isFollowing)}
            className={cn(
              "flex items-center space-x-2 rounded-full px-3 transition-all duration-200",
              isFollowing 
                ? "text-emerald-500" 
                : "text-gray-400 hover:text-emerald-500"
            )}
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110" />
            <span className="text-sm">{isFollowing ? "Following" : "Follow"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-gray-400 hover:text-emerald-500 group rounded-full px-3"
          >
            <Share2 className="w-5 h-5 transition-all duration-200 group-hover:scale-110" />
            <span className="text-sm">Share</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Fixtures;