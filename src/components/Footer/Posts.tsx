import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Clock, RefreshCw, Trophy, Zap, TrendingUp, Flame } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

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
      case 'win': return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-500 border-green-500/40';
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
    ];
    
    const cleanedPosts = mockPosts.map(post => ({
      ...post,
      image_url: cleanImageUrl(post.image_url)
    }));
    
    setPosts(cleanedPosts);
    setError("");
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-background via-background to-background/95 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card/50 backdrop-blur-sm border-b border-border/50 animate-pulse"
            >
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="w-24 h-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full"></div>
                    <div className="w-20 h-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="w-full h-64 bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/5"></div>
              <div className="p-3 space-y-2">
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full"></div>
                  <div className="w-7 h-7 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full"></div>
                  <div className="w-7 h-7 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full"></div>
                </div>
                <div className="w-3/4 h-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-b from-background via-background to-background/95 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm w-full"
        >
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/5" />
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-destructive/20 to-red-500/20 flex items-center justify-center border border-destructive/30 shadow-lg shadow-destructive/10"
              >
                <Trophy className="h-10 w-10 text-destructive" />
              </motion.div>
              <h3 className="text-foreground font-bold text-base mb-2">Connection Failed</h3>
              <p className="text-muted-foreground mb-6 text-sm">Unable to load betting posts</p>
              <div className="space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={fetchPosts}
                    className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white text-sm py-2 rounded-full shadow-lg shadow-primary/20"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Connection
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={useMockData}
                    className="w-full border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-sm py-2 rounded-full backdrop-blur-sm"
                  >
                    Load Demo Posts
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-background via-background to-background/95 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-2">
        <div className="space-y-0">
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BettingPostCard
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
            ))}
          </AnimatePresence>
        </div>

        {posts.length === 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-card/80 backdrop-blur-xl border border-border/50 p-8 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
            <div className="relative text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10"
              >
                <Zap className="h-10 w-10 text-primary" />
              </motion.div>
              <h3 className="text-foreground font-bold text-base mb-2">No betting posts yet</h3>
              <p className="text-muted-foreground mb-6 text-sm">Be the first to share a betting tip or win!</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={useMockData}
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white text-sm py-2 px-6 rounded-full shadow-lg shadow-primary/20"
                >
                  Load Demo Posts
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card/80 backdrop-blur-xl border-t border-border/50 p-3 sticky bottom-0"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={fetchPosts}
                className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white text-sm py-2 rounded-full shadow-lg shadow-primary/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Load New Posts
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Betting Post Card Component
interface BettingPostCardProps {
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

const BettingPostCard: React.FC<BettingPostCardProps> = ({
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

  const shouldTruncate = post.caption && post.caption.length > 100;
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
    <div className="relative bg-card/80 backdrop-blur-sm border-b border-border/50 p-3 hover:bg-card/90 transition-all group">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Avatar className="w-9 h-9 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white text-xs font-bold">
                  {getInitials(post.user_name)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-foreground text-sm">
                  {post.user_name}
                </h3>
                <Badge className={`px-2 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getOutcomeColor(post.bet_outcome || 'pending')}`}>
                  <span className="mr-1">{getOutcomeIcon(post.bet_outcome || 'pending')}</span>
                  {post.bet_outcome === 'win' ? 'Won' : post.bet_outcome === 'loss' ? 'Lost' : 'Live'}
                </Badge>
                <span className="text-muted-foreground text-xs">•</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{formatTimeAgo(post.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-full transition-colors hover:bg-secondary/50"
          >
            <MoreHorizontal className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Bet Info */}
        {post.bet_amount && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-gradient-to-r from-primary/10 via-purple-500/5 to-primary/10 border border-primary/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-1.5 text-xs">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="font-bold text-foreground">₿{post.bet_amount}</span>
              <span className="text-muted-foreground">@{post.odds}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-bold text-green-500">₿{(post.bet_amount * parseFloat(post.odds || '1')).toFixed(2)}</span>
            </div>
          </motion.div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="mb-2">
            <p className="text-foreground text-sm leading-relaxed">
              {shouldTruncate && !showFullCaption 
                ? `${post.caption.slice(0, 100)}...`
                : post.caption
              }
              {shouldTruncate && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFullCaption(!showFullCaption)}
                  className="ml-1 text-primary hover:text-primary/80 font-medium text-sm"
                >
                  {showFullCaption ? 'Show less' : 'Show more'}
                </motion.button>
              )}
            </p>
          </div>
        )}

        {/* Image Section */}
        {hasValidImage && !imageError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mb-2 rounded-xl overflow-hidden bg-secondary/30 border border-border/50 shadow-lg"
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-purple-500/5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full"
                />
              </div>
            )}
            
            <img
              src={post.image_url}
              alt={post.caption || `Betting post by ${post.user_name}`}
              className={`w-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ 
                maxHeight: '400px',
                minHeight: '200px'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          </motion.div>
        )}

        {/* Actions */}
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onLike(post.id)}
                className={cn(
                  "p-1.5 transition-all duration-200 rounded-full",
                  isLiked 
                    ? 'text-red-500 bg-red-500/10' 
                    : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
                )}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="text-muted-foreground hover:text-primary p-1.5 hover:bg-primary/10 rounded-full transition-all"
              >
                <MessageCircle className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="text-muted-foreground hover:text-primary p-1.5 hover:bg-primary/10 rounded-full transition-all"
              >
                <Share className="h-5 w-5" />
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSave(post.id)}
              className={cn(
                "p-1.5 transition-all duration-200 rounded-full",
                isSaved 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              )}
            >
              <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
            </motion.button>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">{Math.floor(Math.random() * 150) + 50} likes</span>
            <span>•</span>
            <span>{Math.floor(Math.random() * 25)} comments</span>
          </div>
          <span>{Math.floor(Math.random() * 15)} shares</span>
        </div>

        {/* Comment Input */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Post your reply..."
              className="flex-1 text-xs text-foreground bg-secondary/30 border border-border/50 rounded-full px-4 py-2 outline-none placeholder-muted-foreground focus:border-primary focus:bg-secondary/50 transition-all backdrop-blur-sm"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white font-bold text-xs px-4 py-2 rounded-full shadow-lg shadow-primary/20">
                Reply
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;