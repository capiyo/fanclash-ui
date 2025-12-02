import { MapPin, Clock, DollarSign, Building2, ThumbsUp, Eye, MessageSquare, 
  Heart, Share2, Zap, TrendingUp, Calendar, Trophy, Users, Sparkles, Target, 
  UserPlus, Flame, Crown, Star, ShieldCheck, Swords, TargetIcon, AlertCircle, 
  Coins, Award, Wallet, TrendingDown, Users2, Bell, CheckCircle, XCircle, 
  BarChart3, Lock, Unlock, Gavel, Scale, Percent, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
}

interface BetData {
  amount: number;
  away_team: string;
  home_team: string;
  selection: string;
  fan: string;
  username: string;
  phone: string;
}

const Fixtures = () => {
  const [myId, setMyId] = useState("");
  const [myName, setMyname] = useState("");
  const [workerEmail, setWorkerEmail] = useState("");
  const [fixtures, setFixtures] = useState<FixtureProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userBalance, setUserBalance] = useState(1250.75);
  const API_BASE_URL = 'https://fanclash-api.onrender.com/api/games';

  const { toast } = useToast();

  // Team avatar images
  const teamAvatars = {
    team1: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=100&h=100&fit=crop",
    team2: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=100&h=100&fit=crop",
    team3: "https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?w=100&h=100&fit=crop",
    user1: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    user2: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
    user3: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  };

  // Mock users for betting activity
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
          setMyId(user._id);
          setMyname(user.userName);
          setWorkerEmail(user.userEmail);
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
      console.log("Fetching matches from:", API_BASE_URL);
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: FixtureProps[] = await response.json();
      console.log("Matches data received:", data);
      return data;
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      throw error;
    }
  }

  return (
    <div className="h-screen bg-background text-foreground ">
        {/* User Balance & Quick Stats */}   
       

        

      {/* Error State */}
      {error && (
        <div className="mx-auto text-center py-1">
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/30">
              <TrendingDown className="w-10 h-10 text-destructive" />
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
                className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notify Me
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Matches Container */}
      <div className="max-w-[900px] mx-auto">
        <div className="h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-secondary pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1">
            {fixtures.map((fixture, key) => (
              <div key={key} className="w-full transform transition-transform duration-300 hover:scale-[1.02]">
                <MatchCard fixture={fixture} teamAvatars={teamAvatars} mockBettors={mockBettors} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-[900px] mx-auto text-center py-16">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-sm"></div>
            <div className="absolute inset-0 w-20 h-20 border-2 border-primary/10 rounded-full animate-ping"></div>
          </div>
          <p className="text-primary text-lg font-bold bg-primary/5 inline-block px-6 py-3 rounded-xl border border-primary/10">
            Loading live odds...
          </p>
          <p className="text-muted-foreground text-sm mt-3">Fetching best betting opportunities</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && fixtures.length === 0 && !error && (
        <div className="max-w-[900px] mx-auto text-center py-16">
          <div className="bg-card border border-border rounded-xl p-10 shadow-sm">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            <p className="text-foreground text-xl font-bold mb-3">No matches available</p>
            <p className="text-muted-foreground text-sm mb-6">New betting opportunities coming soon</p>
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function MatchCard({ fixture, teamAvatars, mockBettors }: { fixture: FixtureProps; teamAvatars: any; mockBettors: any[] }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedBet, setSelectedBet] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100) + 50);
  const [commentCount, setCommentCount] = useState(Math.floor(Math.random() * 30) + 10);
  const [followerCount, setFollowerCount] = useState(Math.floor(Math.random() * 500) + 200);
  const { toast } = useToast();
  const local_BASE_URL = 'https://fanclash-api.onrender.com';

  const handleBetPlacement = async () => {
    if (!selectedBet || !betAmount) {
      toast({
        title: "Incomplete Bet",
        description: "Select outcome and enter stake",
        variant: "destructive"
      });
      return;
    }

    const selectedTeam = selectedBet === "homeTeam" ? fixture.home_team : 
                        selectedBet === "awayTeam" ? fixture.away_team : "Draw";
    
    // Simulate bet placement
    toast({
      title: "🎯 BET CONFIRMED! 🎯",
      description: `₿${betAmount} on ${selectedTeam} @ ${getSelectedOdds()} odds`,
      className: "bg-primary text-primary-foreground border-none"
    });
    
    // Reset form
    setBetAmount("");
    setSelectedBet("");
  };

  const handleTeamSelect = (option: string) => {
    setSelectedBet(option);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    toast({
      title: isLiked ? "💔 Removed from favorites" : "❤️ Added to favorites!",
      variant: "default"
    });
  };

  const handleComment = () => {
    toast({
      title: "💬 Opening betting discussion...",
      variant: "default"
    });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
    toast({
      title: isFollowing ? "👋 Unfollowed match" : "✅ Tracking this match!",
      variant: "default"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTeamAvatar = (teamName: string) => {
    const teams = [teamAvatars.team1, teamAvatars.team2, teamAvatars.team3];
    return teams[teamName.length % teams.length];
  };

  const getSelectedOdds = () => {
    switch (selectedBet) {
      case "homeTeam":
        return fixture.home_win;
      case "awayTeam":
        return fixture.away_win;
      case "draw":
        return fixture.draw;
      default:
        return "0.00";
    }
  };

  const calculatePayout = () => {
    if (!betAmount || !selectedBet) return "0.00";
    const odds = parseFloat(getSelectedOdds());
    const stake = parseFloat(betAmount);
    return (stake * odds).toFixed(2);
  };

  const getRiskColor = (odds: string) => {
    const oddNum = parseFloat(odds);
    if (oddNum < 2.0) return "text-primary"; // Low risk
    if (oddNum < 4.0) return "text-warning"; // Medium risk
    return "text-destructive"; // High risk
  };

  return (
    <div
      className="relative group cursor-pointer w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow Effect on Hover */}
      <div className={cn(
        "relative transition-all duration-300 w-full",
        isHovered ? "scale-[1.02]" : "scale-100"
      )}>
        {isHovered && (
          <div className="absolute inset-0 bg-primary/5 rounded-xl blur-xl -z-10"></div>
        )}
        
        {/* Main Betting Card */}
        <Card className="relative bg-card backdrop-blur-sm border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 w-full min-h-[420px] h-auto">
          {/* Top Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-xl"></div>
          
          <CardHeader className="pb-2 pt-6 px-6">
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-primary/10 text-primary border border-primary/30 text-xs px-4 py-1.5 rounded-full flex items-center gap-2">
                <Crown className="w-3 h-3 text-primary" />
                {fixture.league.toUpperCase()}
                <div className="w-1 h-1 bg-primary rounded-full animate-pulse ml-1"></div>
              </Badge>
              <div className="flex items-center gap-2 text-muted-foreground text-xs bg-secondary px-3 py-1.5 rounded-full border border-border">
                <Calendar className="w-3 h-3 text-primary" />
                <span>{formatDate(fixture.date)}</span>
              </div>
            </div>

            {/* Teams & Odds Section */}
            <div className="text-center">
              <div className="flex items-center justify-between mb-4">
                {/* Home Team */}
                <div 
                  className="text-center flex-1 cursor-pointer transition-all duration-300 group/team"
                  onClick={() => handleTeamSelect("homeTeam")}
                >
                  <div className={cn(
                    "relative p-4 rounded-2xl transition-all duration-300 border-2",
                    selectedBet === "homeTeam" 
                      ? "bg-primary/10 border-primary shadow-sm" 
                      : "border-border hover:border-primary/50 hover:bg-secondary group-hover/team:scale-105"
                  )}>
                    <div className="relative">
                      <Avatar className={cn(
                        "w-16 h-16 border-2 mx-auto mb-3 transition-all duration-300 shadow-sm",
                        selectedBet === "homeTeam" 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-border group-hover/team:border-primary/30 bg-secondary"
                      )}>
                        <AvatarImage src={getTeamAvatar(fixture.home_team)} />
                        <AvatarFallback className="bg-secondary text-foreground text-base font-bold">
                          {fixture.home_team.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {selectedBet === "homeTeam" && (
                        <div className="absolute -top-2 -right-2">
                          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-sm ring-2 ring-background">
                            <ShieldCheck className="w-3 h-3 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm truncate leading-tight transition-colors duration-300 font-bold mb-1",
                      selectedBet === "homeTeam" ? "text-foreground" : "text-foreground"
                    )}>
                      {fixture.home_team}
                    </p>
                    <p className={cn(
                      "text-xl transition-colors duration-300 font-bold",
                      selectedBet === "homeTeam" ? "text-primary" : getRiskColor(fixture.home_win)
                    )}>
                      {fixture.home_win}
                    </p>
                  </div>
                </div>

                {/* VS & Draw */}
                <div className="flex flex-col items-center mx-4">
                  <div className="w-12 h-12 rounded-full bg-secondary border-2 border-border flex items-center justify-center shadow-sm mb-3">
                    <span className="text-primary text-sm font-bold">VS</span>
                  </div>
                  <div 
                    className={cn(
                      "cursor-pointer transition-all duration-300 rounded-xl px-4 py-3 min-w-[80px] border-2 font-bold",
                      selectedBet === "draw" 
                        ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105" 
                        : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-primary/50 hover:scale-105 shadow-sm"
                    )}
                    onClick={() => handleTeamSelect("draw")}
                  >
                    <p className="text-xs mb-1">DRAW</p>
                    <p className={cn("text-sm", getRiskColor(fixture.draw))}>{fixture.draw}</p>
                  </div>
                </div>

                {/* Away Team */}
                <div 
                  className="text-center flex-1 cursor-pointer transition-all duration-300 group/team"
                  onClick={() => handleTeamSelect("awayTeam")}
                >
                  <div className={cn(
                    "relative p-4 rounded-2xl transition-all duration-300 border-2",
                    selectedBet === "awayTeam" 
                      ? "bg-primary/10 border-primary shadow-sm" 
                      : "border-border hover:border-primary/50 hover:bg-secondary group-hover/team:scale-105"
                  )}>
                    <div className="relative">
                      <Avatar className={cn(
                        "w-16 h-16 border-2 mx-auto mb-3 transition-all duration-300 shadow-sm",
                        selectedBet === "awayTeam" 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-border group-hover/team:border-primary/30 bg-secondary"
                      )}>
                        <AvatarImage src={getTeamAvatar(fixture.away_team)} />
                        <AvatarFallback className="bg-secondary text-foreground text-base font-bold">
                          {fixture.away_team.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {selectedBet === "awayTeam" && (
                        <div className="absolute -top-2 -right-2">
                          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-sm ring-2 ring-background">
                            <ShieldCheck className="w-3 h-3 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm truncate leading-tight transition-colors duration-300 font-bold mb-1",
                      selectedBet === "awayTeam" ? "text-foreground" : "text-foreground"
                    )}>
                      {fixture.away_team}
                    </p>
                    <p className={cn(
                      "text-xl transition-colors duration-300 font-bold",
                      selectedBet === "awayTeam" ? "text-primary" : getRiskColor(fixture.away_win)
                    )}>
                      {fixture.away_win}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pb-5 px-6">
            {/* Selection Badge */}
            {selectedBet && (
              <div className="flex justify-center">
                <div className="bg-primary text-primary-foreground rounded-full px-5 py-2.5 flex items-center gap-2 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                  <p className="text-sm font-bold">
                    {selectedBet === "homeTeam" 
                      ? `${fixture.home_team.substring(0, 12)}` 
                      : selectedBet === "awayTeam" 
                      ? `${fixture.away_team.substring(0, 12)}` 
                      : "DRAW"}
                  </p>
                  <div className="w-1 h-1 bg-primary-foreground/50 rounded-full"></div>
                  <p className="text-sm font-bold">{getSelectedOdds()} ODDS</p>
                </div>
              </div>
            )}

            {/* Bet Amount Input */}
            {selectedBet && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <label className="text-foreground text-sm font-bold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  ENTER STAKE (₿)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="flex-1 bg-background border border-input rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base"
                  />
                  <Button
                    onClick={() => setBetAmount("")}
                    variant="outline"
                    size="sm"
                    className="h-12 px-4 text-muted-foreground hover:text-foreground hover:bg-secondary border-border"
                  >
                    Clear
                  </Button>
                </div>
                
                {/* Quick Stake Buttons */}
                <div className="flex gap-2">
                  {["10", "50", "100", "500"].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount(quickAmount)}
                      className="flex-1 text-sm h-9 bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80 hover:border-primary/50 shadow-sm transition-all duration-200"
                    >
                      ₿{quickAmount}
                    </Button>
                  ))}
                </div>

                {/* Potential Win Calculation */}
                {betAmount && (
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-primary text-xs font-bold mb-1">POTENTIAL WIN</p>
                        <p className="text-foreground text-2xl font-bold">₿{calculatePayout()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">Stake: ₿{betAmount}</p>
                        <p className="text-primary text-xs">Odds: {getSelectedOdds()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Target className="w-3 h-3 text-primary" />
                      <p className="text-primary text-xs">Risk: {parseFloat(getSelectedOdds()) < 2.0 ? "LOW" : parseFloat(getSelectedOdds()) < 4.0 ? "MEDIUM" : "HIGH"}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent Bettors */}
            <div className="flex justify-between items-center bg-secondary rounded-xl p-3 border border-border">
              <div className="flex -space-x-3">
                {mockBettors.map((bettor, index) => (
                  <div key={index} className="relative">
                    <Avatar className="w-9 h-9 border-2 border-background shadow-sm">
                      <AvatarImage src={bettor.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        {bettor.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {bettor.won && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border border-background"></div>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                +{mockBettors.length} bets placed
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-all duration-300 h-9 px-4 rounded-lg border shadow-sm ${
                  isLiked 
                    ? "bg-destructive/10 text-destructive border-destructive/30" 
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border-border"
                }`}
              >
                <Heart 
                  className={`h-4 w-4 transition-all duration-300 ${
                    isLiked ? "fill-destructive text-destructive" : ""
                  }`} 
                />
                <span className="text-xs font-bold">{likeCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleComment}
                className="flex items-center space-x-2 bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border transition-all duration-300 h-9 px-4 rounded-lg shadow-sm"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs font-bold">{commentCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleFollow}
                className={`flex items-center space-x-2 transition-all duration-300 h-9 px-4 rounded-lg border shadow-sm ${
                  isFollowing
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border-border"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span className="text-xs font-bold">{followerCount}</span>
              </Button>
            </div>

            {/* Place Bet Button */}
            <div className="pt-2">
              <Button
                onClick={handleBetPlacement}
                className={cn(
                  "w-full transition-all duration-300 text-sm h-12 shadow-sm hover:shadow-md font-bold relative overflow-hidden group",
                  selectedBet && betAmount
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground ring-2 ring-primary/30" 
                    : selectedBet
                    ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                    : "bg-secondary text-muted-foreground border border-border hover:text-foreground cursor-not-allowed"
                )}
                disabled={!selectedBet || !betAmount}
              >
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                <Zap className="w-5 h-5 mr-2" />
                {!selectedBet ? "SELECT BET" : !betAmount ? "ENTER STAKE" : `PLACE BET - ₿${betAmount}`}
              </Button>
            </div>

            {/* Match Stats */}
            <div className="flex justify-center gap-6 pt-2">
              <div className="text-center">
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-secondary px-3 py-2 rounded-lg border border-border">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-bold">2.1K</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-secondary px-3 py-2 rounded-lg border border-border">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs font-bold">Share Bet</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-secondary px-3 py-2 rounded-lg border border-border">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold">Stats</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Fixtures;