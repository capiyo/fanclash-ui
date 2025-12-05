import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Clock, RefreshCw, Trophy, Zap, TrendingUp, Flame, Search, Plus, Home, TrendingDown, Filter, Users, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

const PostsFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'wins' | 'live' | 'trending'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (): Promise<void> => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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
      return '';
    }
    
    let cleanedUrl = imageUrl.trim();
    
    if (cleanedUrl.startsWith('http://') || cleanedUrl.startsWith('https://')) {
      return cleanedUrl;
    }
    
    if (cleanedUrl.startsWith('//')) {
      return `https:${cleanedUrl}`;
    }
    
    if (cleanedUrl.startsWith('/')) {
      return `${API_BASE_URL}${cleanedUrl}`;
    }
    
    return `${API_BASE_URL}/${cleanedUrl}`;
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
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const useMockData = (): void => {
    const mockPosts: Post[] = [
      {
        id: '1',
        image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=600&fit=crop',
        caption: 'HUGE WIN! 🏆 Just won ₿250 on Liverpool vs Man City! The 2-1 comeback was insane! 💪 #betting #sportsbetting #win #football',
        user_name: 'Alex Betmaster',
        user_id: 'user123',
        created_at: Math.floor(Date.now() / 1000) - 2 * 60 * 60,
        bet_amount: 250,
        bet_outcome: 'win',
        odds: '3.25'
      },
      {
        id: '2',
        image_url: '',
        caption: 'Live betting on NBA playoffs! 🏀 Taking Lakers ML @ 2.10 odds. Lebron going for 40+ tonight! #NBA #livebetting #basketball #sportsbook',
        user_name: 'Sarah Sportsfan',
        user_id: 'user456',
        created_at: Math.floor(Date.now() / 1000) - 5 * 60 * 60,
        bet_amount: 100,
        bet_outcome: 'pending',
        odds: '2.10'
      },
      {
        id: '3',
        image_url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop',
        caption: 'Tough loss on the Derby today... 🤦‍♂️ Thought Horse #3 was a lock! Back to analyzing form for tomorrow. #horseracing #betting #sports #analysis',
        user_name: 'Mike Tipster',
        user_id: 'user789',
        created_at: Math.floor(Date.now() / 1000) - 8 * 60 * 60,
        bet_amount: 75,
        bet_outcome: 'loss',
        odds: '4.50'
      },
      {
        id: '4',
        image_url: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=600&fit=crop',
        caption: 'EPIC COMEBACK WIN! 🔥 Arsenal coming back from 2-0 down to win 3-2! Bet ₿150 at 8.50 odds! #Arsenal #PremierLeague #Win',
        user_name: 'James Bettor',
        user_id: 'user101',
        created_at: Math.floor(Date.now() / 1000) - 3 * 60 * 60,
        bet_amount: 150,
        bet_outcome: 'win',
        odds: '8.50'
      },
      {
        id: '5',
        image_url: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=800&h=600&fit=crop',
        caption: 'Live tennis betting right now! 🎾 Taking Nadal to win in straight sets @ 1.85 odds. His clay game is unstoppable! #Tennis #LiveBet',
        user_name: 'Emma Sports',
        user_id: 'user102',
        created_at: Math.floor(Date.now() / 1000) - 1 * 60 * 60,
        bet_amount: 200,
        bet_outcome: 'pending',
        odds: '1.85'
      },
    ];
    
    const cleanedPosts = mockPosts.map(post => ({
      ...post,
      image_url: cleanImageUrl(post.image_url)
    }));
    
    setPosts(cleanedPosts);
    setError("");
    setLoading(false);
  };

  // Filter posts based on active tab
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
    }
    return true;
  });

  if (loading) {
    return (
      <div className="hidden lg:block min-h-screen bg-black">
        {/* Scrollable Container */}
        <div className="flex h-screen overflow-hidden">
          {/* Left Sidebar - Fixed */}
          <div className="w-30 border-r border-gray-800/50 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Loading skeleton for sidebar */}
              <div className="space-y-4">
                <div className="h-10 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-full animate-pulse"></div>
                <div className="h-48 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-xl animate-pulse"></div>
                <div className="h-64 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6">
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gradient-to-br from-gray-900/30 to-black/30 rounded-xl border border-gray-800/50 p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"></div>
                      <div className="space-y-2 flex-1">
                        <div className="w-32 h-4 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 rounded-full"></div>
                        <div className="w-24 h-3 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-full"></div>
                      </div>
                    </div>
                    <div className="w-full h-64 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 rounded-xl mb-4"></div>
                    <div className="space-y-3">
                      <div className="w-3/4 h-4 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 rounded-full"></div>
                      <div className="w-1/2 h-3 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hidden lg:block min-h-screen bg-black">
        <div className="flex h-screen overflow-hidden">
          <div className="w-80 border-r border-gray-800/50"></div>
          <div className="flex-1 overflow-y-auto flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center max-w-md"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <Trophy className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Connection Failed</h3>
              <p className="text-gray-400 mb-6">Unable to load betting posts</p>
              <div className="space-y-3">
                <Button
                  onClick={fetchPosts}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
                <Button
                  variant="outline"
                  onClick={useMockData}
                  className="w-full border-gray-800 text-gray-400 hover:text-white"
                >
                  Load Demo Posts
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block min-h-screen bg-black">
      {/* Scrollable Container */}
      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar - Fixed & Scrollable */}
        <div className="w-80 border-r border-gray-800/50 overflow-y-auto">
          <div className="sticky top-0 bg-black/95 backdrop-blur-sm z-10 p-6 border-b border-gray-800/50">
            <div className="relative mb-6">
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

          <div className="p-6 space-y-6">
            {/* Sidebar Content */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 rounded-xl border border-emerald-500/20 p-4">
              <h3 className="font-bold text-white mb-2">🎯 Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Bets</span>
                  <span className="text-emerald-400 font-bold">127</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-emerald-400 font-bold">68%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Profit</span>
                  <span className="text-emerald-400 font-bold">₿1,240</span>
                </div>
              </div>
            </div>

            {/* Trending Bets */}
            <div>
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Trending Now
              </h3>
              <div className="space-y-3">
                {['Premier League', 'NBA Finals', 'UFC 300', 'Masters'].map((sport) => (
                  <div key={sport} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/30 hover:bg-gray-900/50 cursor-pointer">
                    <span className="text-sm text-gray-300">{sport}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Top Tipsters */}
            <div>
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Top Tipsters
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'BetKing', profit: '+₿420' },
                  { name: 'SportsPro', profit: '+₿380' },
                  { name: 'OddsMaster', profit: '+₿320' }
                ].map((tipster) => (
                  <div key={tipster.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-xs">
                          {tipster.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-300">{tipster.name}</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">{tipster.profit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - This was missing! */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6">
            {/* Header with Tabs */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Betting Feed</h1>
              <p className="text-gray-400 mb-6">See the latest wins, losses, and live bets from the community</p>
              
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant={activeTab === 'all' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    activeTab === 'all' 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  All Posts
                </Button>
                <Button
                  variant={activeTab === 'wins' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('wins')}
                  className={cn(
                    activeTab === 'wins' 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Wins
                </Button>
                <Button
                  variant={activeTab === 'live' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('live')}
                  className={cn(
                    activeTab === 'live' 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Live Bets
                </Button>
                <Button
                  variant={activeTab === 'trending' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('trending')}
                  className={cn(
                    activeTab === 'trending' 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </Button>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="space-y-6">
              <AnimatePresence>
                {filteredPosts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                  >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                      <Trophy className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-400 mb-2">No posts found</h3>
                    <p className="text-gray-400">Try adjusting your filters or create the first post!</p>
                  </motion.div>
                ) : (
                  filteredPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <DesktopBettingPostCard
                        post={post}
                        isLiked={likedPosts.has(post.id)}
                        isSaved={savedPosts.has(post.id)}
                        onLike={handleLike}
                        onSave={handleSave}
                        formatTimeAgo={formatTimeAgo}
                        getInitials={getInitials}
                        getOutcomeColor={getOutcomeColor}
                        getOutcomeIcon={getOutcomeIcon}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>

              {/* Load More */}
              {filteredPosts.length > 0 && (
                <div className="pt-6 border-t border-gray-800/50">
                  <Button
                    onClick={fetchPosts}
                    variant="outline"
                    className="w-full border-gray-800 text-gray-400 hover:text-white hover:border-emerald-500"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Load More Posts
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DesktopBettingPostCardProps {
  post: Post;
  isLiked: boolean;
  isSaved: boolean;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  formatTimeAgo: (timestamp: number) => string;
  getInitials: (name: string) => string;
  getOutcomeColor: (outcome: string) => string;
  getOutcomeIcon: (outcome: string) => JSX.Element | string;
}

const DesktopBettingPostCard: React.FC<DesktopBettingPostCardProps> = ({
  post,
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
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const shouldTruncate = post.caption && post.caption.length > 150;
  const hasValidImage = post.image_url && post.image_url.trim() !== '';

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01, y: -2 }}
      className="bg-gradient-to-br w-full from-gray-900/30 to-black/30 rounded-xl border border-gray-800/50 p-6 backdrop-blur-sm hover:border-emerald-500/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-emerald-500/30">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-white font-bold">
              {getInitials(post.user_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white">{post.user_name}</h3>
              <Badge className={`px-2 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getOutcomeColor(post.bet_outcome || 'pending')}`}>
                <span className="mr-1">{getOutcomeIcon(post.bet_outcome || 'pending')}</span>
                {post.bet_outcome === 'win' ? 'Won' : post.bet_outcome === 'loss' ? 'Lost' : 'Live'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Bet Info */}
      {post.bet_amount && (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-white">₿{post.bet_amount}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">{post.odds} odds</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-bold text-green-500">₿{(post.bet_amount * parseFloat(post.odds || '1')).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="mb-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            {shouldTruncate && !showFullCaption 
              ? `${post.caption.slice(0, 150)}...`
              : post.caption
            }
            {shouldTruncate && (
              <Button
                variant="link"
                onClick={() => setShowFullCaption(!showFullCaption)}
                className="ml-2 text-emerald-400 hover:text-emerald-300 p-0 h-auto"
              >
                {showFullCaption ? 'Show less' : 'Show more'}
              </Button>
            )}
          </p>
        </div>
      )}

      {/* Image */}
      {hasValidImage && !imageError && (
        <div className="mb-4 rounded-xl overflow-hidden border border-gray-800/50">
          <img
            src={post.image_url}
            alt={post.caption || `Betting post by ${post.user_name}`}
            className="w-full h-auto max-h-[400px] object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={cn(
              "flex items-center gap-2",
              isLiked ? 'text-red-500 hover:text-red-400' : 'text-gray-400 hover:text-white'
            )}
          >
            <Heart className={cn("h-5 w-5 transition-all", isLiked && "fill-current")} />
            <span>Like</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Comment</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <Share className="h-5 w-5" />
            <span>Share</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSave(post.id)}
          className={cn(
            "transition-all",
            isSaved ? 'text-emerald-500 hover:text-emerald-400' : 'text-gray-400 hover:text-white'
          )}
        >
          <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
        </Button>
      </div>

      {/* Engagement Stats */}
      <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span>{Math.floor(Math.random() * 150) + 50} likes</span>
          <span>•</span>
          <span>{Math.floor(Math.random() * 25)} comments</span>
          <span>•</span>
          <span>{Math.floor(Math.random() * 15)} shares</span>
        </div>
      </div>

      {/* Comment Input */}
      <div className="mt-4">
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
              Y
            </AvatarFallback>
          </Avatar>
          <Input
            type="text"
            placeholder="Write a comment..."
            className="flex-1 bg-gray-900/50 border-gray-800 rounded-full text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/30"
          />
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4">
            Post
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PostsFeed;