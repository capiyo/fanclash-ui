import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Clock, RefreshCw, Trophy, Zap, TrendingUp, Flame, Search, Plus, Home, TrendingDown, Filter, Users, ChevronRight, X, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const API_BASE_URL = 'https://fanclash-api.onrender.com';

interface Post {
  id: string;
  image_url: string;
  caption?: string;
  user_name: string;
  user_id: string;
  created_at: number;
  updated_at?: number;
  bet_amount?: number;
  bet_outcome?: 'win' | 'loss' | 'pending';
  odds?: string;
}

interface ApiResponse {
  success: boolean;
  posts: Post[];
  message?: string;
}

// Premier League footballers for realistic user names
const premierLeagueFootballers = [
  "Erling Haaland", "Mohamed Salah", "Kevin De Bruyne", "Harry Kane", "Bukayo Saka",
  "Son Heung-min", "Marcus Rashford", "Bruno Fernandes", "Martin Ødegaard", "Trent Alexander-Arnold",
  "Virgil van Dijk", "Phil Foden", "Jack Grealish", "Declan Rice", "Rodri",
  "Ederson", "Allison Becker", "Kyle Walker", "Ruben Dias", "Gabriel Martinelli",
  "Raheem Sterling", "Mason Mount", "Riyad Mahrez", "Bernardo Silva", "João Cancelo"
];

// Premier League teams for realistic captions
const premierLeagueTeams = [
  "Manchester City", "Liverpool", "Arsenal", "Manchester United", "Chelsea",
  "Tottenham", "Newcastle", "Aston Villa", "Brighton", "West Ham",
  "Brentford", "Fulham", "Crystal Palace", "Wolves", "Everton",
  "Nottingham Forest", "Leicester", "Leeds", "Southampton", "Bournemouth"
];

// Football-related images from Unsplash ONLY
const footballImages = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop", // football celebration
  "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=600&fit=crop", // football stadium
  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&h=600&fit=crop", // football match
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=600&fit=crop", // football goal
  "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&h=600&fit=crop", // football training
  "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=600&fit=crop", // football ball closeup
  "https://images.unsplash.com/photo-1511204579483-e5c2b1d69acd?w=800&h=600&fit=crop", // football action
  "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&h=600&fit=crop", // football players
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", // football field
  "https://images.unsplash.com/photo-1599058917765-1d485f1a7b60?w=800&h=600&fit=crop"  // football match action
];

const footballEmojis = ["⚽", "🏆", "🔥", "💰", "🎯", "💪", "🚀", "👑", "💎", "✨"];
const bettingHashtags = ["#PremierLeague", "#Betting", "#Win", "#Football", "#SportsBetting", "#Odds", "#Parlay", "#LiveBet", "#ValueBet", "#Tips"];

const PostsMobile = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'wins' | 'live' | 'trending'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (): Promise<void> => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError("");
      
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && Array.isArray(data.posts)) {
        const cleanedPosts = data.posts.map(post => ({
          ...post,
          image_url: cleanImageUrl(post.image_url),
          bet_amount: post.bet_amount || Math.floor(Math.random() * 500) + 10,
          bet_outcome: post.bet_outcome || (Math.random() > 0.5 ? 'win' : Math.random() > 0.3 ? 'loss' : 'pending'),
          odds: post.odds || `${(Math.random() * 5 + 1.1).toFixed(2)}`
        }));
        
        setPosts(cleanedPosts);
      } else {
        throw new Error("Invalid response format");
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching posts";
      setError(errorMessage);
      console.error("Error fetching posts:", err);
      // Use mock data as fallback
      useMockData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const cleanImageUrl = (imageUrl: string): string => {
    if (!imageUrl || 
        typeof imageUrl !== 'string' ||
        imageUrl.trim() === '' || 
        imageUrl === 'null' || 
        imageUrl === 'undefined' ||
        imageUrl === 'NaN' ||
        imageUrl.toLowerCase() === 'none' ||
        imageUrl === 'false' ||
        imageUrl === 'true') {
      // Return a random football image from our list
      return footballImages[Math.floor(Math.random() * footballImages.length)];
    }
    
    let cleanedUrl = imageUrl.trim();
    
    // Always return a football image, ignoring the DB image
    return footballImages[Math.floor(Math.random() * footballImages.length)];
  };

  const generateRandomCaption = () => {
    const footballer = premierLeagueFootballers[Math.floor(Math.random() * premierLeagueFootballers.length)];
    const team1 = premierLeagueTeams[Math.floor(Math.random() * premierLeagueTeams.length)];
    const team2 = premierLeagueTeams[Math.floor(Math.random() * premierLeagueTeams.length)];
    while (team1 === team2) {
      team2 = premierLeagueTeams[Math.floor(Math.random() * premierLeagueTeams.length)];
    }
    const emoji = footballEmojis[Math.floor(Math.random() * footballEmojis.length)];
    const hashtag1 = bettingHashtags[Math.floor(Math.random() * bettingHashtags.length)];
    const hashtag2 = bettingHashtags[Math.floor(Math.random() * bettingHashtags.length)];
    const betAmount = Math.floor(Math.random() * 1000) + 50;
    const odds = (Math.random() * 10 + 1.1).toFixed(2);
    
    const captions = [
      `${emoji} Just won Ksh ${betAmount.toLocaleString()} on ${team1} vs ${team2}! The odds were ${odds}! ${hashtag1} ${hashtag2}`,
      `${footballer} to score first - BANKER BET! 🎯 Put Ksh ${betAmount} at ${odds} odds. ${team1} looking dangerous! ${hashtag1}`,
      `EPIC COMEBACK! ${team1} from 2-0 down to win 3-2! 🔥 Won Ksh ${betAmount} on this! ${emoji} ${hashtag2}`,
      `Match of the season alert! ${team1} vs ${team2} - Over 2.5 goals at ${odds} is too good to miss! 💰 ${hashtag1} ${hashtag2}`,
      `${footballer} masterclass today! 🏆 Bet Ksh ${betAmount} on him to score and assist. ${odds} odds paid out! ${emoji}`
    ];
    
    return captions[Math.floor(Math.random() * captions.length)];
  };

  const useMockData = (): void => {
    const mockPosts: Post[] = Array.from({ length: 10 }, (_, i) => {
      const footballer = premierLeagueFootballers[Math.floor(Math.random() * premierLeagueFootballers.length)];
      const outcome = Math.random() > 0.5 ? 'win' : Math.random() > 0.3 ? 'loss' : 'pending';
      
      return {
        id: `${i + 1}`,
        image_url: footballImages[Math.floor(Math.random() * footballImages.length)],
        caption: generateRandomCaption(),
        user_name: footballer,
        user_id: `user${i + 100}`,
        created_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 48) * 60 * 60,
        bet_amount: Math.floor(Math.random() * 1000) + 50,
        bet_outcome: outcome,
        odds: (Math.random() * 10 + 1.1).toFixed(2)
      };
    });
    
    setPosts(mockPosts);
    setError("");
    setLoading(false);
  };

  const handleLike = (postId: string): void => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });
  };

  const handleSave = (postId: string): void => {
    setSavedPosts(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(postId)) {
        newSaved.delete(postId);
      } else {
        newSaved.add(postId);
      }
      return newSaved;
    });
  };

  const formatTimeAgo = (timestamp: number): string => {
    try {
      const date = new Date(timestamp * 1000);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getOutcomeColor = (outcome: string) => {
    switch(outcome) {
      case 'win': return 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-500 border-emerald-500/40';
      case 'loss': return 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-500 border-red-500/40';
      default: return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-500 border-yellow-500/40';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch(outcome) {
      case 'win': return <Trophy className="h-3 w-3" />;
      case 'loss': return <TrendingUp className="h-3 w-3 rotate-180" />;
      default: return <Flame className="h-3 w-3" />;
    }
  };

  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!post.caption?.toLowerCase().includes(searchLower) &&
          !post.user_name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    if (activeTab === 'wins') {
      return post.bet_outcome === 'win';
    } else if (activeTab === 'live') {
      return post.bet_outcome === 'pending';
    } else if (activeTab === 'trending') {
      return Math.random() > 0.3; // Simulate trending filter
    }
    return true;
  });

  if (loading) {
    return (
      <div className="h-screen bg-black p-4 overflow-hidden">
        {/* Mobile Header */}
        <div className="bg-black/95 backdrop-blur-sm border-b border-gray-800/50 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">BetFeed</span>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Loading Skeletons */}
        <div className="space-y-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-900/30 to-black/30 rounded-xl border border-gray-800/50 p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"></div>
                <div className="space-y-2 flex-1">
                  <div className="w-32 h-3 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 rounded-full"></div>
                  <div className="w-20 h-2 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-full"></div>
                </div>
              </div>
              <div className="w-full h-48 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 rounded-xl mb-3"></div>
              <div className="space-y-2">
                <div className="w-3/4 h-3 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 rounded-full"></div>
                <div className="w-1/2 h-2 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black overflow-hidden flex flex-col">
      {/* Mobile Header - Fixed */}
      <div className="shrink-0 bg-black/95 backdrop-blur-sm border-b border-gray-800/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">BetFeed</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400">
                  <Filter className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black border-l border-gray-800/50 w-64">
                <div className="p-4 space-y-6">
                  <div>
                    <h3 className="font-bold text-white mb-3">Quick Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Bets</span>
                        <span className="text-emerald-400 font-bold">127</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Win Rate</span>
                        <span className="text-emerald-400 font-bold">68%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-white mb-3">Trending</h3>
                    <div className="space-y-2">
                      {['Premier League', 'NBA', 'UFC', 'Tennis'].map((sport) => (
                        <div key={sport} className="text-sm text-gray-300 p-2 rounded-lg bg-gray-900/30">
                          {sport}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-800 rounded-full text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* Mobile Tabs - Horizontal Scroll */}
      <div className="shrink-0 bg-black/95 backdrop-blur-sm border-b border-gray-800/50 p-2">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className={cn(
              "rounded-full flex-1",
              activeTab === 'all' 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500' 
                : 'border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500'
            )}
          >
            All
          </Button>
          <Button
            variant={activeTab === 'wins' ? 'default' : 'outline'}
            onClick={() => setActiveTab('wins')}
            className={cn(
              "rounded-full flex-1",
              activeTab === 'wins' 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500' 
                : 'border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500'
            )}
          >
            <Trophy className="w-3 h-3 mr-1" />
            Wins
          </Button>
          <Button
            variant={activeTab === 'live' ? 'default' : 'outline'}
            onClick={() => setActiveTab('live')}
            className={cn(
              "rounded-full flex-1",
              activeTab === 'live' 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500' 
                : 'border-gray-800 text-gray-400 hover:text-emerald-500 hover:border-emerald-500'
            )}
          >
            <Flame className="w-3 h-3 mr-1" />
            Live
          </Button>
        </div>
      </div>

      {/* Posts List - Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 pb-24">
          {error ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <Trophy className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-400 mb-2">Connection Error</h3>
              <p className="text-gray-400 mb-4 text-sm">{error}</p>
              <div className="space-y-3">
                <Button
                  onClick={fetchPosts}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  disabled={refreshing}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
                  {refreshing ? 'Refreshing...' : 'Try Again'}
                </Button>
                <Button
                  variant="outline"
                  onClick={useMockData}
                  className="w-full border-gray-800 text-gray-400 hover:text-white"
                >
                  Use Demo Data
                </Button>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <Trophy className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">No posts found</h3>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {filteredPosts.map((post, index) => (
                  <MobilePostCard
                    key={post.id}
                    post={post}
                    index={index}
                    isLiked={likedPosts.has(post.id)}
                    isSaved={savedPosts.has(post.id)}
                    onLike={handleLike}
                    onSave={handleSave}
                    formatTimeAgo={formatTimeAgo}
                    getInitials={getInitials}
                    getOutcomeColor={getOutcomeColor}
                    getOutcomeIcon={getOutcomeIcon}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}

          {/* Load More Button */}
          {filteredPosts.length > 0 && (
            <div className="mt-6">
              <Button
                onClick={fetchPosts}
                variant="outline"
                className="w-full border-gray-800 text-gray-400 hover:text-white hover:border-emerald-500"
                disabled={refreshing}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
                {refreshing ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Fixed */}
      <div className="shrink-0 bg-black/95 backdrop-blur-sm border-t border-gray-800/50 z-40 p-2">
        <div className="flex justify-around items-center">
          <Button variant="ghost" className="text-emerald-400 group flex-col h-auto p-2">
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>
          </Button>
          
          <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group flex-col h-auto p-2">
            <TrendingUp className="w-5 h-5 mb-1" />
            <span className="text-xs">Trending</span>
          </Button>
          
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-12 h-12 shadow-xl shadow-emerald-500/30 relative -top-4">
            <Plus className="w-6 h-6" />
          </Button>
          
          <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group flex-col h-auto p-2">
            <MessageCircle className="w-5 h-5 mb-1" />
            <span className="text-xs">Chat</span>
          </Button>
          
          <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group flex-col h-auto p-2">
            <Users className="w-5 h-5 mb-1" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

interface MobilePostCardProps {
  post: Post;
  index: number;
  isLiked: boolean;
  isSaved: boolean;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  formatTimeAgo: (timestamp: number) => string;
  getInitials: (name: string) => string;
  getOutcomeColor: (outcome: string) => string;
  getOutcomeIcon: (outcome: string) => JSX.Element;
}

const MobilePostCard: React.FC<MobilePostCardProps> = ({
  post,
  index,
  isLiked,
  isSaved,
  onLike,
  onSave,
  formatTimeAgo,
  getInitials,
  getOutcomeColor,
  getOutcomeIcon,
}) => {
  const [showFullCaption, setShowFullCaption] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const shouldTruncate = post.caption && post.caption.length > 100;
  const displayCaption = shouldTruncate && !showFullCaption 
    ? `${post.caption.slice(0, 100)}...`
    : post.caption;

  // Always use football images - fallback if error
  const imageUrl = imageError 
    ? footballImages[Math.floor(Math.random() * footballImages.length)]
    : footballImages[Math.floor(Math.random() * footballImages.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gradient-to-br from-gray-900/30 to-black/30 rounded-xl border border-gray-800/50 p-3 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Avatar className="w-10 h-10 border-2 border-emerald-500/30 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-white text-xs font-bold">
              {getInitials(post.user_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="font-bold text-white text-sm truncate">{post.user_name}</h3>
              <Badge className={`px-1.5 py-0 rounded-full text-[10px] font-medium border backdrop-blur-sm ${getOutcomeColor(post.bet_outcome || 'pending')}`}>
                <span className="mr-1">{getOutcomeIcon(post.bet_outcome || 'pending')}</span>
                {post.bet_outcome === 'win' ? 'Won' : post.bet_outcome === 'loss' ? 'Lost' : 'Live'}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white p-1 h-8 w-8"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Bet Info */}
      {post.bet_amount && (
        <div className="mb-3 p-2 rounded-lg bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border border-emerald-500/20">
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-orange-500" />
                <span className="font-bold text-white text-xs">Stake</span>
              </div>
              <span className="text-emerald-400 font-bold">Ksh {post.bet_amount.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="font-bold text-white text-xs">Odds</span>
              </div>
              <span className="text-emerald-400 font-bold">{post.odds}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span className="font-bold text-white text-xs">Win</span>
              </div>
              <span className="font-bold text-green-500">
                Ksh {(post.bet_amount * parseFloat(post.odds || '1')).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="mb-3">
          <p className="text-gray-300 text-sm leading-relaxed">
            {displayCaption}
            {shouldTruncate && (
              <Button
                variant="link"
                onClick={() => setShowFullCaption(!showFullCaption)}
                className="ml-2 text-emerald-400 hover:text-emerald-300 p-0 h-auto text-sm"
              >
                {showFullCaption ? 'Show less' : 'Show more'}
              </Button>
            )}
          </p>
        </div>
      )}

      {/* Image - Always football image */}
      <div className="mb-3 rounded-xl overflow-hidden border border-gray-800/50">
        <img
          src={imageUrl}
          alt={post.caption || `Betting post by ${post.user_name}`}
          className="w-full h-48 object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800/30">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={cn(
              "p-1 h-8",
              isLiked ? 'text-red-500 hover:text-red-400' : 'text-gray-400 hover:text-white'
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span className="ml-1 text-xs">
              {Math.floor(Math.random() * 150) + 50}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-8 text-gray-400 hover:text-white"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="ml-1 text-xs">
              {Math.floor(Math.random() * 25)}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-8 text-gray-400 hover:text-white"
          >
            <Share className="h-4 w-4" />
            <span className="ml-1 text-xs">
              {Math.floor(Math.random() * 15)}
            </span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSave(post.id)}
          className={cn(
            "p-1 h-8",
            isSaved ? 'text-emerald-500 hover:text-emerald-400' : 'text-gray-400 hover:text-white'
          )}
        >
          <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
        </Button>
      </div>

      {/* Quick Comment Input */}
      <div className="mt-3">
        <div className="flex gap-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-xs">
              Y
            </AvatarFallback>
          </Avatar>
          <Input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 h-8 text-xs bg-gray-900/50 border-gray-800 rounded-full text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/30"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PostsMobile;