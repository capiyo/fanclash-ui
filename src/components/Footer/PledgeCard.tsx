import { 
  Heart, MessageCircle, Share2, Zap, Users, Calendar, Trophy, 
  Sparkles, UserPlus, Eye, TrendingUp, Wallet, Bell, Target, Crown, 
  ShieldCheck, Coins, Award, BarChart3, Swords, AlertCircle, Phone,
  Timer, TrendingDown, XCircle, CheckCircle, Plus, MapPin, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const API_BASE_URL = 'https://fanclash-api.onrender.com';

  const { toast } = useToast();

  const teamAvatars = {
    team1: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=100&h=100&fit=crop",
    team2: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=100&h=100&fit=crop",
    team3: "https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?w=100&h=100&fit=crop",
    user1: "https://images.unsplash.com/phone-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    user2: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
    user3: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  };

  // Fetch current user from backend
  const fetchCurrentUser = async () => {
    try {
      // First check localStorage for user ID
      const userString = localStorage.getItem("userProfile");
      if (!userString) {
        console.log("No user profile in localStorage");
        return null;
      }

      const localUser = JSON.parse(userString);
      if (!localUser.id) {
        console.log("No user ID in localStorage");
        return null;
      }

      // Fetch user data from backend
      const response = await fetch(`${API_BASE_URL}/api/users/profiles/${localUser.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.warn("Failed to fetch user from backend, using local data");
        return {
          id: localUser.id,
          username: localUser.username || "",
          phone: localUser.phone || "",
          balance: localUser.balance || 0
        };
      }

      const backendUser = await response.json();
      console.log("Backend user data:", backendUser);

      // Format user data from backend
      const userData: UserData = {
        id: backendUser.user_id || backendUser.id || localUser.id,
        username: backendUser.username || localUser.username || "",
        phone: backendUser.phone || localUser.phone || "",
        balance: backendUser.balance || localUser.balance || 0,
        clubFan: backendUser.club_fan || localUser.clubFan,
        countryFan: backendUser.country_fan || localUser.countryFan,
        nickname: backendUser.nickname || localUser.nickname,
        numberOfBets: backendUser.number_of_bets || localUser.numberOfBets
      };

      // Update localStorage with backend data
      localStorage.setItem("userProfile", JSON.stringify({
        ...localUser,
        ...userData
      }));

      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadUserAndPledges = async () => {
      try {
        setLoading(true);
        
        // Load user first
        const user = await fetchCurrentUser();
        setCurrentUser(user);
        
        if (!user) {
          toast({
            title: "Please Setup Profile",
            description: "You need to create a profile to view bets",
            variant: "destructive"
          });
        }

        // Then load pledges
        const data = await fetchPledges();
        setPledges(data);
        
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data");
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
        // Try alternative endpoint
        const altResponse = await fetch(`${API_BASE_URL}/pledges`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!altResponse.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await altResponse.json();
        return formatPledgesData(data);
      }
      
      const data = await response.json();
      return formatPledgesData(data);
      
    } catch (error) {
      console.error("Failed to fetch P2P bets:", error);
      
      // Fallback to mock data
      return generateMockPledges();
    }
  }

  function formatPledgesData(data: any[]): PledgeData[] {
    return data.map(item => ({
      _id: item._id || item.id,
      amount: item.amount || item.starter_amount || 0,
      home_team: item.home_team || "Home Team",
      away_team: item.away_team || "Away Team",
      selection: item.selection || item.starter_selection || "home_team",
      fan: item.fan || item.starter_username || "User",
      starter_id: item.starter_id || item.user_id || "",
      username: item.username || item.starter_username || "Unknown",
      phone: item.phone || "",
      time: item.time || item.created_at || new Date().toISOString(),
      created_at: item.created_at || new Date().toISOString(),
      odds: item.odds || {
        home_win: (Math.random() * 4 + 1.2).toFixed(2),
        away_win: (Math.random() * 4 + 1.2).toFixed(2),
        draw: (Math.random() * 4 + 1.2).toFixed(2)
      },
      status: item.status || 'active',
      potential_payout: item.potential_payout || item.amount * (Math.random() * 3 + 1.5),
      sport_type: item.sport_type || ['Football', 'Basketball', 'Tennis', 'Cricket'][Math.floor(Math.random() * 4)],
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
      }
    ];
    
    return formatPledgesData(mockPledges);
  }

  const filteredPledges = pledges.filter(pledge => {
    if (activeFilter === 'available') return pledge.status === 'active';
    if (activeFilter === 'matched') return pledge.status === 'matched';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      {/* User Balance Bar */}
      {currentUser && (
        <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800/50 py-2 px-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-400">Balance:</span>
              <span className="text-emerald-400 font-bold text-sm">
                Ksh {currentUser.balance.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-emerald-500 text-xs">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{currentUser.username}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex space-x-2 mb-6">
          <Button
            variant={activeFilter === 'all' ? "default" : "outline"}
            onClick={() => setActiveFilter('all')}
            className={cn(
              "rounded-full",
              activeFilter === 'all' 
                ? "bg-emerald-500 text-white border-emerald-500" 
                : "border-gray-800 text-gray-400"
            )}
          >
            All Bets
          </Button>
          <Button
            variant={activeFilter === 'available' ? "default" : "outline"}
            onClick={() => setActiveFilter('available')}
            className={cn(
              "rounded-full",
              activeFilter === 'available' 
                ? "bg-emerald-500 text-white border-emerald-500" 
                : "border-gray-800 text-gray-400"
            )}
          >
            Available
          </Button>
          <Button
            variant={activeFilter === 'matched' ? "default" : "outline"}
            onClick={() => setActiveFilter('matched')}
            className={cn(
              "rounded-full",
              activeFilter === 'matched' 
                ? "bg-emerald-500 text-white border-emerald-500" 
                : "border-gray-800 text-gray-400"
            )}
          >
            Matched
          </Button>
        </div>
      </div>

      {/* Main Feed */}
      <div className="max-w-2xl mx-auto">
        {/* P2P Bets Feed */}
        <div className="divide-y divide-gray-800/50">
          {filteredPledges.map((pledge, index) => (
            <div key={index} className="hover:bg-gray-900/30 transition-colors duration-200">
              <P2PBettingCard 
                pledge={pledge} 
                teamAvatars={teamAvatars} 
                currentUser={currentUser}
                refreshUserData={() => fetchCurrentUser().then(user => setCurrentUser(user))}
              />
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center border-b border-gray-800/50">
            <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-gray-800 border-t-emerald-500"></div>
            <p className="mt-4 text-gray-500">Loading P2P bets...</p>
            <p className="text-sm text-gray-600 mt-2">Finding the best betting opportunities</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 text-center border-b border-gray-800/50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <XCircle className="w-8 h-8 text-red-500" />
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
        {!loading && filteredPledges.length === 0 && !error && (
          <div className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Swords className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">No P2P Bets Available</h3>
            <p className="text-gray-500 mb-6">Start the first peer-to-peer bet challenge!</p>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 shadow-lg shadow-emerald-500/20">
              <Plus className="w-5 h-5 mr-2" />
              Create P2P Bet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface P2PBettingCardProps {
  pledge: PledgeData;
  teamAvatars: any;
  currentUser: UserData | null;
  refreshUserData: () => void;
}

function P2PBettingCard({ pledge, teamAvatars, currentUser, refreshUserData }: P2PBettingCardProps) {
  const [betAgainstAmount, setBetAgainstAmount] = useState("");
  const [betAgainstOption, setBetAgainstOption] = useState("");
  const [isBetting, setIsBetting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 20);
  const [commentCount, setCommentCount] = useState(Math.floor(Math.random() * 20) + 5);
  const { toast } = useToast();
  
  // Check if current user is the starter
  const isCurrentUserStarter = currentUser?.id === pledge.starter_id;
  
  const existingSelection = pledge.selection;

  const getOppositeOptions = () => {
    const options = [];
    if (existingSelection !== "home_team") options.push({ 
      value: "home_team", 
      label: `${pledge.home_team} Win`, 
      odds: pledge.odds?.home_win || "2.00" 
    });
    if (existingSelection !== "away_team") options.push({ 
      value: "away_team", 
      label: `${pledge.away_team} Win`, 
      odds: pledge.odds?.away_win || "2.00" 
    });
    if (existingSelection !== "draw") options.push({ 
      value: "draw", 
      label: "Draw", 
      odds: pledge.odds?.draw || "3.50" 
    });
    return options;
  };

  const oppositeOptions = getOppositeOptions();

  const acceptBet = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
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
    
    // Validate bet amount
    if (betAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive"
      });
      return;
    }

    // Check if user has enough balance
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
        description: "Deducting amount and creating bet",
        className: "bg-blue-500/20 border-blue-500 text-blue-500"
      });

      // 1. First deduct from user's balance
      const newBalance = currentUser.balance - betAmount;
      
      const updateBalanceResponse = await fetch(`https://fanclash-api.onrender.com/update-balance`, {
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
        const errorText = await updateBalanceResponse.text();
        throw new Error(`Balance update failed: ${errorText}`);
      }

      // 2. Update local state immediately
      const updatedUser = {
        ...currentUser,
        balance: newBalance
      };
      
      // Update localStorage
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      localStorage.setItem("userProfile", JSON.stringify({
        ...userProfile,
        balance: newBalance
      }));
      
      // Trigger parent to refresh user data
      refreshUserData();

      // 3. Now create the bet match
      let finisherTeam = "";
      if (betAgainstOption === "home_team") {
        finisherTeam = pledge.home_team;
      } else if (betAgainstOption === "away_team") {
        finisherTeam = pledge.away_team;
      } else {
        finisherTeam = "draw";
      }

      const betData = {
        // Starter info (from pledge)
        starter_id: pledge.starter_id,
        starter_username: pledge.username,
        starter_selection: pledge.selection,
        starter_amount: pledge.amount,
        starter_team: pledge.selection === "home_team" ? pledge.home_team : 
                     pledge.selection === "away_team" ? pledge.away_team : "draw",
        
        // Finisher info (current user)
        finisher_id: currentUser.id,
        finisher_username: currentUser.username,
        finisher_selection: betAgainstOption,
        finisher_amount: betAmount,
        finisher_team: finisherTeam,
        
        // Match details
        home_team: pledge.home_team,
        away_team: pledge.away_team,
        
        // Bet details
        total_pot: pledge.amount + betAmount,
        status: "matched",
        
        // Odds
        odds: pledge.odds || {
          home_win: "2.00",
          away_win: "2.00",
          draw: "3.50"
        }
      };

      // 4. Create the bet on backend
      const createBetResponse = await fetch(`https://fanclash-api.onrender.com/api/bets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betData),
      });

      if (!createBetResponse.ok) {
        const errorText = await createBetResponse.text();
        console.error("Bet creation failed:", errorText);
        
        // Refund the balance if bet creation failed
        await fetch(`https://fanclash-api.onrender.com/update-balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser.id,
            balance: currentUser.balance // Refund original balance
          }),
        });
        
        // Refresh user data to show refund
        refreshUserData();
        
        throw new Error(`Bet creation failed: ${errorText}`);
      }

      const betResult = await createBetResponse.json();
      console.log("Bet created successfully:", betResult);

      // 5. Update the pledge status to matched
      if (pledge._id) {
        try {
          await fetch(`https://fanclash-api.onrender.com/api/pledges/${pledge._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'matched' }),
          });
        } catch (pledgeError) {
          console.warn("Could not update pledge status:", pledgeError);
        }
      }

      // 6. Show success message
      toast({
        title: "✅ Bet Placed Successfully!",
        description: `Ksh ${betAmount} deducted. Bet matched with ${pledge.username}`,
        className: "bg-emerald-500/20 border-emerald-500 text-emerald-500",
        duration: 5000
      });

      // 7. Reset form
      setBetAgainstAmount("");
      setBetAgainstOption("");
      setIsBetting(false);

      // 8. Reload page after delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error: any) {
      console.error("Error placing bet:", error);
      toast({
        title: "Bet Placement Failed",
        description: error.message || "Unable to place bet. Please try again.",
        variant: "destructive",
        duration: 5000
      });
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

  return (
    <div className="p-2 transition-colors duration-200">
      {/* Header with User Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10 border border-gray-800 ring-1 ring-gray-700/50">
            <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800 font-bold">
              {pledge.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm hover:underline cursor-pointer">{pledge.username}</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-sm">{formatDate(pledge.created_at || "")}</span>
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {pledge.fan}
              </span>
              <span className="text-gray-600 text-xs">·</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                pledge.status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-yellow-500/10 text-yellow-400'
              }`}>
                {pledge.status === 'active' ? 'Open Bet' : 'Matched'}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFollowing(!isFollowing)}
          className={cn(
            "rounded-full border hover:bg-gray-800/50",
            isFollowing 
              ? "border-emerald-500/30 text-emerald-500" 
              : "border-gray-800 text-gray-400 hover:text-emerald-500"
          )}
        >
          <UserPlus className="w-4 h-4" />
        </Button>
      </div>

      {/* Match Info */}
      <div className="ml-13 mb-4">
        <div className="flex items-center justify-between backdrop-blur-sm rounded-xl p-4 mb-4 border border-gray-800/50">
          
          {/* Home Team */}
          <div className="text-center">
            <Avatar className="w-14 h-14 border border-gray-700 mx-auto mb-2 ring-1 ring-gray-600/30">
              <AvatarImage src={teamAvatars.team1} />
              <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800 font-bold">
                {pledge.home_team.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Home Team Selection Logic */}
            {pledge.selection === "home_team" ? (
              <div>
                <p className="text-sm text-emerald-400 font-semibold">{pledge.home_team}</p>
                <p className="text-emerald-300 text-sm">ksh. {pledge.amount.toLocaleString()} </p>
                <p className="text-emerald-300 text-sm">{pledge.odds?.home_win} odds</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-300">{pledge.home_team}</p>
                <p className="text-emerald-300 text-sm">{pledge.odds?.home_win} odds</p>
              </div>
            )}
          </div>
          
          {/* VS Section */}
          <div className="text-center px-4">
            <div className="bg-gray-900 rounded-full p-2 mb-2 border border-gray-800">
              <Swords className="w-6 h-6 text-emerald-500 mx-auto" />
            </div>
            <div className="text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Timer className="w-3 h-3" />
                <span>{formatDate(pledge.match_time || "")}</span>
              </div>
              <div className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">
                challenge this battle
              </div>
            </div>
          </div>
          
          {/* Away Team */}
          <div className="text-center">
            <Avatar className="w-14 h-14 border border-gray-700 mx-auto mb-2 ring-1 ring-gray-600/30">
              <AvatarImage src={teamAvatars.team2} />
              <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800">
                {pledge.away_team.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Away Team Selection Logic */}
            {pledge.selection === "away_team" ? (
              <div>
                <p className="text-sm text-emerald-400 font-semibold">{pledge.away_team}</p>
                <p className="text-emerald-300 text-sm">ksh. {pledge.amount.toLocaleString()} </p>
                <p className="text-emerald-300 text-sm">{pledge.odds?.away_win} odds</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-300">{pledge.away_team}</p>
                <p className="text-emerald-300 text-sm">{pledge.odds?.away_win} odds</p>
              </div>
            )}
          </div>
        </div>

        {/* Bet Details */}
        <div className="mb-4">
          <div className="flex items-center justify-between rounded-lg p-3 mb-3 border border-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Coins className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">stake</p>
                <p className="text-white">ksh. {pledge.amount.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs">pot size</p>
              <p className="text-emerald-400">ksh. {(pledge.potential_payout || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Hide Accept Bet button if current user is the starter or doesn't exist */}
        {currentUser && !isCurrentUserStarter && pledge.status === 'active' ? (
          <>
            {!isBetting ? (
              <Button
                onClick={() => setIsBetting(true)}
                className="w-full bg-emerald-500/10 text-white rounded-full font-bold py-3 shadow-lg shadow-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
              >
                <Swords className="w-5 h-5 mr-2" />
                Accept Bet
              </Button>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Prediction Selection */}
                <div>
                  <p className="text-white mb-3 text-sm">SELECT YOUR PREDICTION</p>
                  <div className="space-y-2">
                    {oppositeOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={betAgainstOption === option.value ? "default" : "outline"}
                        onClick={() => setBetAgainstOption(option.value)}
                        className={cn(
                          "w-full justify-between rounded-full px-4 py-3",
                          betAgainstOption === option.value
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "border-gray-800 text-gray-300 hover:text-white hover:border-emerald-500 bg-gray-900/50"
                        )}
                      >
                        <span className="text-sm font-medium">{option.label}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 text-sm font-bold">{option.odds} odds</span>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Stake Input */}
                <div>
                  <p className="text-white font-bold mb-3 text-sm">ENTER YOUR STAKE (Ksh)</p>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={betAgainstAmount}
                      onChange={(e) => setBetAgainstAmount(e.target.value)}
                      placeholder="Enter amount..."
                      className="flex-1 bg-gray-900 border border-gray-800 rounded-full px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                      min="1"
                      max={currentUser?.balance || 0}
                    />
                    <Button
                      onClick={() => setBetAgainstAmount(pledge.amount.toString())}
                      className="bg-gray-800 hover:bg-gray-700 text-white rounded-full border border-gray-700"
                    >
                      Match
                    </Button>
                  </div>
                  
                  {/* Quick Stake Buttons */}
                  <div className="flex space-x-2 mt-3">
                    {["100", "500", "1000", pledge.amount.toString()].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAgainstAmount(amount)}
                        className="flex-1 rounded-full border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 text-xs py-2 bg-gray-900/50"
                      >
                        Ksh{amount}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Balance Info */}
                  {currentUser && (
                    <div className="mt-2 text-xs text-gray-400">
                      Available: Ksh {currentUser.balance.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <Button
                    onClick={acceptBet}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full py-3 shadow-lg shadow-emerald-500/20 border border-emerald-500/30"
                    disabled={!betAgainstOption || !betAgainstAmount || !currentUser}
                  >
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    PLACE BET
                  </Button>
                  <Button
                    onClick={() => setIsBetting(false)}
                    className="border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 rounded-full bg-gray-900/50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          // Show message if user is the starter or bet is not active
          <div className="text-center p-4 border border-gray-800/50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              {!currentUser ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">Please login to accept bets</span>
                </>
              ) : isCurrentUserStarter ? (
                <>
                  <Eye className="w-5 h-5" />
                  <span className="text-sm">This is your bet - waiting for challengers</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">
                    {pledge.status === 'matched' ? 'Bet already matched' : 'Bet not available'}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
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
          className="flex items-center space-x-2 text-gray-400 hover:text-emerald-500 group rounded-full px-3"
        >
          <Share2 className="w-5 h-5 transition-all duration-200 group-hover:scale-110" />
          <span className="text-sm">Share</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-emerald-500 rounded-full p-2"
        >
          <Coins className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

export default PledgeCard;