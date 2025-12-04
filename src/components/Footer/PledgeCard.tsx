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
}

interface BetAgainstData {
  amount: number;
  against_selection: string;
  against_amount: number;
  against_username: string;
  pledge_id: string;
}

const PledgeCard = () => {
  const [myId, setMyId] = useState("");
  const [myName, setMyname] = useState("");
  const [pledges, setPledges] = useState<PledgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'matched'>('all');
  const [userBalance, setUserBalance] = useState(1250.75);
  const API_BASE_URL = 'https://fanclash-api.onrender.com/api/pledges';

  const { toast } = useToast();

  const teamAvatars = {
    team1: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=100&h=100&fit=crop",
    team2: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=100&h=100&fit=crop",
    team3: "https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?w=100&h=100&fit=crop",
    user1: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    user2: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
    user3: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  };

  useEffect(() => {
    const token = localStorage.getItem("user");
    if (token) {
      try {
        const user = JSON.parse(token);
        if (user) {
          setMyId(user._id);
          setMyname(user.userName);
        }
      } catch (err) {
        console.error("Error parsing user token:", err);
      }
    }
  }, []);

  useEffect(() => {
    const getPledges = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchPledges();
        setPledges(data);
      } catch (err) {
        console.error("Error fetching pledges:", err);
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
    getPledges();
  }, []);

  async function fetchPledges(): Promise<PledgeData[]> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data: PledgeData[] = await response.json();
      const enhancedData = data.map(pledge => ({
        ...pledge,
        status: pledge.status || 'active',
        potential_payout: pledge.amount * (Math.random() * 3 + 1.5),
        sport_type: ['Football', 'Basketball', 'Tennis', 'Cricket'][Math.floor(Math.random() * 4)],
        match_time: new Date(Date.now() + Math.random() * 86400000).toISOString(),
        odds: pledge.odds || {
          home_win: (Math.random() * 4 + 1.2).toFixed(2),
          away_win: (Math.random() * 4 + 1.2).toFixed(2),
          draw: (Math.random() * 4 + 1.2).toFixed(2)
        }
      }));
      
      return enhancedData;
    } catch (error) {
      console.error("Failed to fetch P2P bets:", error);
      throw error;
    }
  }

  const filteredPledges = pledges.filter(pledge => {
    if (activeFilter === 'available') return pledge.status === 'active';
    if (activeFilter === 'matched') return pledge.status === 'matched';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      {/* X Header - Twitter-inspired with green accents */}
     

      {/* Stats Bar */}
     

      {/* Main Feed */}
      <div className="max-w-2xl mx-auto">
        {/* Compose Tweet-like Bet */}
        

        {/* P2P Bets Feed */}
        <div className="divide-y divide-gray-800/50">
          {filteredPledges.map((pledge, index) => (
            <div key={index} className="hover:bg-gray-900/30 transition-colors duration-200">
              <P2PBettingCard 
                pledge={pledge} 
                teamAvatars={teamAvatars} 
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
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 shadow-lg shadow-emerald-500/20">
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

      {/* Bottom Navigation - Twitter style with green */}
    
      </div>
    
  );
};

function P2PBettingCard({ pledge, teamAvatars }: { pledge: PledgeData; teamAvatars: any }) {
  const [betAgainstAmount, setBetAgainstAmount] = useState("");
  const [betAgainstOption, setBetAgainstOption] = useState("");
  const [isBetting, setIsBetting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 20);
  const [commentCount, setCommentCount] = useState(Math.floor(Math.random() * 20) + 5);
  const { toast } = useToast();
  
  const existingSelection = pledge.selection;
  
  const getOppositeOptions = () => {
    const options = [];
    if (existingSelection !== "homeTeam") options.push({ 
      value: "homeTeam", 
      label: `${pledge.home_team} Win`, 
      odds: pledge.odds?.home_win || "2.00" 
    });
    if (existingSelection !== "awayTeam") options.push({ 
      value: "awayTeam", 
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

  const sendBetAgainst = async () => {
    if (!betAgainstAmount || !betAgainstOption) {
      toast({
        title: "Incomplete Bet",
        description: "Select your prediction and enter stake",
        variant: "destructive"
      });
      return;
    }

    const betData: BetAgainstData = {
      amount: Number(betAgainstAmount),
      against_selection: betAgainstOption,
      against_amount: Number(betAgainstAmount),
      against_username: "Current User",
      pledge_id: pledge._id || ""
    };

    try {
      const response = await fetch(`https://fanclash-api.onrender.com/api/pledges/bet-against`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData),
      });

      if (!response.ok) throw new Error("Bet placement failed");

      toast({
        title: "⚔️ Bet Accepted!",
        description: `You're betting ₿${betAgainstAmount} against ${pledge.username}`,
        className: "bg-emerald-500/20 border-emerald-500 text-emerald-500"
      });
      
      setBetAgainstAmount("");
      setBetAgainstOption("");
      setIsBetting(false);
      
    } catch (error) {
      toast({
        title: "Bet Failed",
        description: "Unable to place counter bet",
        variant: "destructive"
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
    <div className="border-b border-gray-800/50 p-4 hover:bg-gray-900/30 transition-colors duration-200">
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
              <span className=" text-sm hover:underline cursor-pointer">{pledge.username}</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-sm">{formatDate(pledge.created_at || "")}</span>
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {pledge.sport_type?.toUpperCase()}
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
        <div className="flex items-center justify-between  backdrop-blur-sm rounded-xl p-4 mb-4 border border-gray-800/50">
          <div className="text-center">
            <Avatar className="w-14 h-14 border border-gray-700 mx-auto mb-2 ring-1 ring-gray-600/30">
              <AvatarImage src={teamAvatars.team1} />
              <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800 font-bold">
                {pledge.home_team.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-sm">{pledge.home_team}</p>
            <p className="text-emerald-200 text-sm">{pledge.odds?.home_win} odds</p>
           
          </div>
          
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
                P2P CHALLENGE
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Avatar className="w-14 h-14 border border-gray-700 mx-auto mb-2 ring-1 ring-gray-600/30">
              <AvatarImage src={teamAvatars.team2} />
              <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800 font-bold">
                {pledge.away_team.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-bold">{pledge.away_team}</p>
            <p className="text-emerald-400 text-sm">{pledge.odds?.away_win} odds</p>
          </div>
        </div>

        {/* Bet Details */}
        <div className="mb-4">
          <div className="flex items-center justify-between  rounded-lg p-3 mb-3 border border-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Coins className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">STAKE</p>
                <p className="text-white font-bold">₿{pledge.amount}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs">POT SIZE</p>
              <p className="text-emerald-400 font-bold">₿{(pledge.potential_payout || 0).toFixed(2)}</p>
            </div>
          </div>
          
          {/* Current Bet */}
          <div className="bg-gray-900/50 rounded-lg p-3 mb-4 border border-gray-800/50">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold">
                Betting on: {existingSelection === "homeTeam" ? pledge.home_team : 
                            existingSelection === "awayTeam" ? pledge.away_team : "Draw"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Phone className="w-3 h-3" />
              <span>{pledge.phone}</span>
            </div>
          </div>
        </div>

        {/* Accept Bet Button */}
        {!isBetting ? (
          <Button
            onClick={() => setIsBetting(true)}
            className="w-full bg-gradient-to-r from-emerald-200 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full font-bold py-3 shadow-lg shadow-emerald-500/20 border border-emerald-500/30"
          >
            <Swords className="w-5 h-5 mr-2" />
            ACCEPT THIS BET
          </Button>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Prediction Selection */}
            <div>
              <p className="text-white font-bold mb-3 text-sm">SELECT YOUR PREDICTION</p>
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
              <p className="text-white font-bold mb-3 text-sm">ENTER YOUR STAKE (₿)</p>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={betAgainstAmount}
                  onChange={(e) => setBetAgainstAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-full px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
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
                    ₿{amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <Button
                onClick={sendBetAgainst}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold py-3 shadow-lg shadow-emerald-500/20 border border-emerald-500/30"
                disabled={!betAgainstOption || !betAgainstAmount}
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
      </div>

      {/* Action Buttons - Twitter Style */}
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