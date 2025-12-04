import { 
  MapPin, Clock, DollarSign, Building2, Heart, MessageCircle, 
  Share2, Zap, Users, Calendar, Trophy, Sparkles, UserPlus, 
  Eye, TrendingUp, Wallet, Bell, Target, Crown, ShieldCheck,
  Coins, Award, BarChart3, Lock, Gavel, Percent, Timer 
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
  starter_id: string; // This is already included
}

const Fixtures = () => {
  const [myId, setMyId] = useState("");
  const [myName, setMyname] = useState("");
  const [phone, setPhone] = useState("");
  const [fixtures, setFixtures] = useState<FixtureProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userBalance, setUserBalance] = useState(1250.75);
  const API_BASE_URL = 'https://fanclash-api.onrender.com/api/games';
  const[starter_id,setStaterId]=useState("")

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

  useEffect(() => {
    const token = localStorage.getItem("user");
    if (token) {
      try {
        const user = JSON.parse(token);
        if (user) {
          setMyId(user.id || user._id || "");
          setMyname(user.username || user.userName || "");
          setPhone(user.phone || "");
        }
      } catch (err) {
        console.error("Error parsing user token:", err);
      }
    }
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
      {/* Twitter Header with Green Accents */}
      
      

      {/* Main Feed */}
      <div className="max-w-2xl mx-auto">
        {/* Post New Bet Card */}
        <div className="border-b border-gray-800 border-opacity-50 p-4 bg-gray-900/20 backdrop-blur-sm">
          <div className="flex space-x-4">
            <Avatar className="w-12 h-12 border border-gray-800 ring-1 ring-gray-700/50">
              <AvatarImage src={teamAvatars.user1} />
              <AvatarFallback className="bg-gradient-to-br from-gray-900 to-gray-800">
                You
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

        {/* Fixtures Feed */}
        <div className="divide-y divide-gray-800/50">
          {fixtures.map((fixture, index) => (
            <div key={index} className="hover:bg-gray-900/30 transition-colors duration-200">
              <MatchCard 
                fixture={fixture} 
                teamAvatars={teamAvatars} 
                mockBettors={mockBettors}
                userData={{ id: myId, name: myName, phone: phone }}
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

      {/* Bottom Navigation - Twitter style with green */}
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
  userData: { id: string; name: string; phone: string };
}

function MatchCard({ fixture, teamAvatars, mockBettors, userData }: MatchCardProps) {
  const [selectedBet, setSelectedBet] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100) + 50);
  const [commentCount, setCommentCount] = useState(Math.floor(Math.random() * 30) + 10);
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

    try {
      if (!userData.id || !userData.name) {
        toast({
          title: "Authentication Error",
          description: "Please login first",
          variant: "destructive"
        });
        return;
      }

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

      // Prepare pledge data - INCLUDING STARTER_ID
      const pledgeData: PledgeData = {
        username: userData.name,
        phone: userData.phone,
        selection: selection,
        amount: parseFloat(betAmount),
        fan: "user",
        home_team: fixture.home_team,
        away_team: fixture.away_team,
        starter_id: userData.id, // This is already included in your interface
      };

      console.log("📤 Sending bet to API:", pledgeData);

      const response = await fetch(`https://fanclash-api.onrender.com/api/pledges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pledgeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Bet placed successfully:", result);

      const selectedTeam = selectedBet === "homeTeam" ? fixture.home_team : 
                          selectedBet === "awayTeam" ? fixture.away_team : "Draw";
      
      toast({
        title: "🎯 Bet Placed!",
        description: `₿${betAmount} on ${selectedTeam}`,
        className: "bg-emerald-500/20 border-emerald-500 text-emerald-500"
      });
      
      setBetAmount("");
      setSelectedBet("");
    } catch (error) {
      console.error("❌ Error placing bet:", error);
      toast({
        title: "Bet Failed",
        description: error instanceof Error ? error.message : "Unable to place bet",
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
                />
              </div>
              <Button
                onClick={handleBetPlacement}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 font-bold shadow-lg shadow-emerald-500/20 border border-emerald-500/30"
                disabled={!betAmount}
              >
                Place Bet
              </Button>
            </div>
            
            {/* Quick Stake Buttons */}
            <div className="flex space-x-2 mt-3">
              {["10", "50", "100", "500"].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(amount)}
                  className="flex-1 rounded-full border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 text-xs py-2 bg-gray-900/50"
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