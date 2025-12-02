import { 
  MapPin, Clock, DollarSign, Building2, ThumbsUp, Eye, MessageSquare, 
  Heart, Share2, Zap, TrendingUp, Calendar, Trophy, Users, Sparkles, Target, 
  UserPlus, Flame, Crown, Star, ShieldCheck, Swords, AlertCircle, 
  Coins, Award, Wallet, TrendingDown, Users2, Bell, CheckCircle, XCircle, 
  BarChart3, Lock, Unlock, Gavel, Scale, Percent, Timer, Plus, Phone 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PledgeCardProps {
  away_team: string;
  home_team: string;
  date: string;
  draw: string;
  away_win: string;
  home_win: string;
  league: string;
}

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
      console.log("Fetching P2P bets from:", API_BASE_URL);
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
      
      console.log("P2P bets data received:", enhancedData);
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
    <div className="h-screen bg-background overflow-y-auto">
      {/* Header with User Balance - Same structure as your Posts component */}
      <div className="max-w-2xl mx-auto pt-4 px-4">
       
      

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-sm mb-1">Total Bets</p>
            <p className="text-foreground text-2xl font-bold">{pledges.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-sm mb-1">Available</p>
            <p className="text-primary text-2xl font-bold">
              {pledges.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-sm mb-1">Total Value</p>
            <p className="text-foreground text-2xl font-bold">
              ₿{pledges.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Cards Container - Same structure as your Posts component */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          {filteredPledges.map((pledge, key) => (
            <div key={key} className="w-full">
              <P2PBettingCard pledge={pledge} teamAvatars={teamAvatars} />
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-card border-b border-border p-10">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-2 border-primary/10 rounded-full animate-ping"></div>
              </div>
              <p className="text-primary text-lg font-bold mb-3">Loading P2P betting opportunities...</p>
              <p className="text-muted-foreground text-sm">Finding the best bets against other players</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-card border-b border-border p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="text-destructive text-lg font-bold mb-2">Connection Failed</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
                <Button
                  variant="outline"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notify Me
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPledges.length === 0 && !error && (
          <div className="bg-card border-b border-border p-10">
            <div className="text-center">
              <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-primary/5 flex items-center justify-center">
                <Swords className="w-14 h-14 text-primary" />
              </div>
              <h3 className="text-foreground text-2xl font-bold mb-3">No P2P Bets Available</h3>
              <p className="text-muted-foreground text-lg mb-8">Be the first to create a peer-to-peer bet!</p>
              <div className="flex gap-4 justify-center">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-sm">
                  <Plus className="w-5 h-5 mr-2" />
                  Create P2P Bet
                </Button>
                <Button 
                  variant="outline" 
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary px-8 py-6 text-lg"
                >
                  <Timer className="w-5 h-5 mr-2" />
                  Set Reminder
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function P2PBettingCard({ pledge, teamAvatars }: { pledge: PledgeData; teamAvatars: any }) {
  const [isHovered, setIsHovered] = useState(false);
  const [betAgainstAmount, setBetAgainstAmount] = useState("");
  const [betAgainstOption, setBetAgainstOption] = useState("");
  const [isBetting, setIsBetting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
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
      console.log("Sending P2P counter bet:", betData);
      const response = await fetch(`https://fanclash-api.onrender.com/api/pledges/bet-against`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast({
        title: "⚔️ BET ACCEPTED! ⚔️",
        description: `You're now betting ₿${betAgainstAmount} against ${pledge.username}`,
        className: "bg-primary text-primary-foreground"
      });
      
      setBetAgainstAmount("");
      setBetAgainstOption("");
      setIsBetting(false);
      
    } catch (error) {
      console.error("Error accepting bet:", error);
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

  const getTeamAvatar = (teamName: string) => {
    const teams = [teamAvatars.team1, teamAvatars.team2, teamAvatars.team3];
    return teams[teamName.length % teams.length];
  };

  const calculatePotentialWin = (amount: string, odds: string) => {
    if (!amount || !odds) return "0.00";
    return (parseFloat(amount) * parseFloat(odds)).toFixed(2);
  };

  const getRiskLevel = (odds: string) => {
    const oddNum = parseFloat(odds);
    if (oddNum < 2.0) return { label: "LOW", color: "text-primary" };
    if (oddNum < 4.0) return { label: "MEDIUM", color: "text-warning" };
    return { label: "HIGH", color: "text-destructive" };
  };

  return (
    <div
      className="relative group cursor-pointer w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "relative transition-all duration-300 w-full",
        isHovered ? "scale-[1.02]" : "scale-100"
      )}>
        {isHovered && (
          <div className="absolute inset-0 bg-primary/5 rounded-xl blur-xl -z-10"></div>
        )}
        
        {/* Main Card - Full width within max-w-2xl container */}
        <div className="relative bg-card backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 w-full min-h-[420px] h-auto border-b border-border">
          {/* Top Status Bar */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1 rounded-t-xl",
            pledge.status === 'active' 
              ? "bg-primary" 
              : pledge.status === 'matched'
              ? "bg-warning"
              : "bg-muted"
          )}></div>
          
          <div className="pb-2 pt-6 px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary text-xs px-4 py-1.5 rounded-full flex items-center gap-2">
                  <Crown className="w-3 h-3 text-primary" />
                  {pledge.sport_type?.toUpperCase() || "SPORTS BET"}
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground text-xs bg-secondary px-3 py-1.5 rounded-full">
                  <Timer className="w-3 h-3 text-primary" />
                  <span>{formatDate(pledge.match_time || pledge.created_at || "")}</span>
                </div>
              </div>
              <Badge className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold",
                pledge.status === 'active'
                  ? "bg-primary/10 text-primary"
                  : "bg-warning/10 text-warning"
              )}>
                {pledge.status === 'active' ? "OPEN" : "MATCHED"}
              </Badge>
            </div>

            {/* Bettor Profile - Full width section */}
            <div className="flex items-center justify-between mb-6 bg-secondary rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-14 h-14 border-2 border-primary shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                      {pledge.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <p className="text-foreground text-base font-bold">{pledge.username}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-primary" />
                      <span className="text-primary text-xs">Win Rate: 68%</span>
                    </div>
                    <div className="w-1 h-1 bg-border rounded-full"></div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-3 h-3 text-primary" />
                      <span className="text-primary text-xs">Bets: 124</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFollowing(!isFollowing)}
                className={`h-8 px-3 rounded-lg ${
                  isFollowing
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>

            {/* Matchup Display - Full width layout */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-between">
                {/* Home Team */}
                <div className={cn(
                  "text-center p-4 rounded-xl transition-all duration-300 flex-1",
                  existingSelection === "homeTeam" 
                    ? "bg-primary/10 shadow-sm" 
                    : "bg-secondary group-hover:border-primary/50"
                )}>
                  <Avatar className="w-16 h-16 border-2 border-primary/30 mx-auto mb-3 shadow-sm">
                    <AvatarImage src={getTeamAvatar(pledge.home_team)} />
                    <AvatarFallback className="bg-secondary text-foreground text-base font-bold">
                      {pledge.home_team.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-bold text-foreground mb-1">{pledge.home_team}</p>
                  <p className="text-primary text-xs">Odds: {pledge.odds?.home_win || "2.00"}</p>
                  {existingSelection === "homeTeam" && (
                    <div className="mt-2">
                      <Badge className="bg-primary/10 text-primary text-xs px-2 py-0.5">
                        <Target className="w-2.5 h-2.5 mr-1" />
                        Betting On
                      </Badge>
                    </div>
                  )}
                </div>

                {/* VS Center */}
                <div className="flex flex-col items-center mx-4">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shadow-sm mb-3">
                    <Swords className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs font-bold mb-1">VS</p>
                    <div className="bg-primary/10 px-3 py-1 rounded-lg">
                      <p className="text-primary text-xs">P2P BET</p>
                    </div>
                  </div>
                </div>

                {/* Away Team */}
                <div className={cn(
                  "text-center p-4 rounded-xl transition-all duration-300 flex-1",
                  existingSelection === "awayTeam" 
                    ? "bg-primary/10 shadow-sm" 
                    : "bg-secondary group-hover:border-primary/50"
                )}>
                  <Avatar className="w-16 h-16 border-2 border-primary/30 mx-auto mb-3 shadow-sm">
                    <AvatarImage src={getTeamAvatar(pledge.away_team)} />
                    <AvatarFallback className="bg-secondary text-foreground text-base font-bold">
                      {pledge.away_team.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-bold text-foreground mb-1">{pledge.away_team}</p>
                  <p className="text-primary text-xs">Odds: {pledge.odds?.away_win || "2.00"}</p>
                  {existingSelection === "awayTeam" && (
                    <div className="mt-2">
                      <Badge className="bg-primary/10 text-primary text-xs px-2 py-0.5">
                        <Target className="w-2.5 h-2.5 mr-1" />
                        Betting On
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Draw Option */}
              <div className="flex justify-center mt-4">
                <div className={cn(
                  "px-5 py-2.5 rounded-xl min-w-[120px] transition-all duration-300",
                  existingSelection === "draw"
                    ? "bg-primary/10 shadow-sm" 
                    : "bg-secondary"
                )}>
                  <p className="text-sm font-bold text-foreground mb-1">Draw</p>
                  <p className="text-primary text-xs">Odds: {pledge.odds?.draw || "3.50"}</p>
                  {existingSelection === "draw" && (
                    <div className="mt-2">
                      <Badge className="bg-primary/10 text-primary text-xs px-2 py-0.5">
                        <Target className="w-2.5 h-2.5 mr-1" />
                        Betting On
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-5 px-6">
            {/* P2P Bet Against Section */}
            <div className="bg-secondary rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-foreground text-sm font-bold">Bet Against {pledge.username}</p>
                    <p className="text-muted-foreground text-xs">Current Stake: ₿{pledge.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary text-xs">Potential Pot</p>
                  <p className="text-foreground text-lg font-bold">₿{(pledge.potential_payout || 0).toFixed(2)}</p>
                </div>
              </div>
              
              {!isBetting ? (
                <Button
                  onClick={() => setIsBetting(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-300 h-12 font-bold"
                >
                  <Swords className="w-5 h-5 mr-2" />
                  ACCEPT THIS P2P BET
                </Button>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Select Counter Prediction */}
                  <div>
                    <label className="text-foreground text-sm font-bold mb-3 block">
                      SELECT YOUR PREDICTION
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {oppositeOptions.map((option) => {
                        const risk = getRiskLevel(option.odds);
                        return (
                          <Button
                            key={option.value}
                            variant={betAgainstOption === option.value ? "default" : "outline"}
                            onClick={() => setBetAgainstOption(option.value)}
                            className={cn(
                              "h-12 justify-between transition-all duration-300 group",
                              betAgainstOption === option.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm font-medium">{option.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-bold ${risk.color}`}>
                                {option.odds} odds
                              </span>
                              <Badge className="bg-secondary text-muted-foreground text-xs">
                                {risk.label} RISK
                              </Badge>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enter Stake Amount */}
                  <div>
                    <label className="text-foreground text-sm font-bold mb-3 block">
                      ENTER YOUR STAKE (₿)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={betAgainstAmount}
                        onChange={(e) => setBetAgainstAmount(e.target.value)}
                        placeholder="Enter stake amount..."
                        className="flex-1 bg-background rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-base"
                      />
                      <Button
                        onClick={() => setBetAgainstAmount(pledge.amount.toString())}
                        variant="outline"
                        className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                      >
                        Match
                      </Button>
                    </div>
                    
                    {/* Quick Stake Buttons */}
                    <div className="flex gap-2 mt-3">
                      {["100", "500", "1000", pledge.amount.toString()].map((quickAmount) => (
                        <Button
                          key={quickAmount}
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAgainstAmount(quickAmount)}
                          className="flex-1 text-sm h-9 bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 shadow-sm transition-all duration-200"
                        >
                          ₿{quickAmount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Potential Win & Action */}
                  {betAgainstAmount && betAgainstOption && (
                    <div className="bg-primary/5 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-primary text-xs font-bold mb-1">POTENTIAL WIN</p>
                          <p className="text-foreground text-2xl font-bold">
                            ₿{calculatePotentialWin(betAgainstAmount, 
                              oppositeOptions.find(o => o.value === betAgainstOption)?.odds || "1.00")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground text-xs">Stake: ₿{betAgainstAmount}</p>
                          <p className="text-primary text-xs">
                            Odds: {oppositeOptions.find(o => o.value === betAgainstOption)?.odds}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={sendBetAgainst}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-12 font-bold"
                      disabled={!betAgainstOption || !betAgainstAmount}
                    >
                      <Scale className="w-5 h-5 mr-2" />
                      PLACE COUNTER BET
                    </Button>
                    <Button
                      onClick={() => {
                        setIsBetting(false);
                        setBetAgainstAmount("");
                        setBetAgainstOption("");
                      }}
                      variant="outline"
                      className="text-muted-foreground hover:text-foreground hover:bg-secondary h-12"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center bg-secondary rounded-lg p-3 shadow-sm">
                <p className="text-muted-foreground text-xs font-bold mb-1">INITIAL STAKE</p>
                <div className="flex items-center justify-center gap-2">
                  <Coins className="w-4 h-4 text-primary" />
                  <p className="text-foreground text-lg font-bold">₿{pledge.amount}</p>
                </div>
              </div>
              <div className="text-center bg-secondary rounded-lg p-3 shadow-sm">
                <p className="text-muted-foreground text-xs font-bold mb-1">CONTACT</p>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <p className="text-foreground text-sm font-medium">{pledge.phone}</p>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  P2P SECURED
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PledgeCard;