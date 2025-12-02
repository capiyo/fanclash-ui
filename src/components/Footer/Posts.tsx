import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Clock, RefreshCw, ImageIcon, Trophy, Flame, TrendingUp, Users, Target, Coins, Zap, Award, MessageSquare, TrendingDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [activeFilter, setActiveFilter] = useState<'all' | 'wins' | 'hot'>('all');

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
      case 'win': return 'bg-success/10 text-success border-success/30';
      case 'loss': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-warning/10 text-warning border-warning/30';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch(outcome) {
      case 'win': return <Trophy className="h-3 w-3" />;
      case 'loss': return <TrendingDown className="h-3 w-3" />;
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
        image_url: '', // Text-only post
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
        image_url: '', // Another text-only post
        caption: '🔥 HOT TIP: Chelsea vs Arsenal - Over 2.5 goals @ 1.80 Both teams scoring like crazy lately! #premierleague #football #bettips #soccer',
        user_name: 'Emma Analyst',
        user_id: 'user101',
        created_at: Math.floor(Date.now() / 1000) - 12 * 60 * 60,
        bet_amount: 200,
        bet_outcome: 'pending',
        odds: '1.80'
      },
      {
        id: '5',
        image_url: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&h=600&fit=crop',
        caption: 'My betting strategy for March Madness! 🏀 Going with underdog picks and live betting. Who else is ready for the tournament? #marchmadness #collegebasketball #bettingstrategy',
        user_name: 'Chris Gambler',
        user_id: 'user102',
        created_at: Math.floor(Date.now() / 1000) - 1 * 60 * 60,
        bet_amount: 150,
        bet_outcome: 'win',
        odds: '5.25'
      },
      {
        id: '6',
        image_url: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800&h=600&fit=crop',
        caption: 'Parlay hit! 🎯 4-leg accumulator came through with ₿425 profit! Feeling unstoppable right now! #parlay #accumulator #winning #betting',
        user_name: 'Jordan Winner',
        user_id: 'user103',
        created_at: Math.floor(Date.now() / 1000) - 3 * 60 * 60,
        bet_amount: 50,
        bet_outcome: 'win',
        odds: '9.50'
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

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'wins') return post.bet_outcome === 'win';
    if (activeFilter === 'hot') {
      const likes = Math.floor(Math.random() * 100) + 50;
      return likes > 80 || post.bet_outcome === 'win';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="h-screen bg-background overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border-b border-border animate-pulse">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full"></div>
                  <div className="space-y-1 flex-1">
                    <div className="w-20 h-3 bg-primary/10 rounded"></div>
                    <div className="w-16 h-2 bg-primary/5 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="w-full h-80 bg-primary/5"></div>
              <div className="p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded"></div>
                  <div className="w-6 h-6 bg-primary/10 rounded"></div>
                  <div className="w-6 h-6 bg-primary/10 rounded"></div>
                </div>
                <div className="w-3/4 h-3 bg-primary/10 rounded"></div>
                <div className="w-1/2 h-2 bg-primary/5 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm w-full">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/30">
              <Trophy className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-foreground font-bold text-lg mb-2">Connection Failed</h3>
            <p className="text-muted-foreground mb-6 text-sm">Unable to load betting posts</p>
            <div className="space-y-3">
              <Button
                onClick={fetchPosts}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
              <Button
                variant="outline"
                onClick={useMockData}
                className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                Load Demo Posts
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-y-auto">
      {/* Header Stats */}
      <div className="max-w-2xl mx-auto pt-4 px-4">
       

        {/* Filter Tabs */}
       
            
         
        {/* Community Stats */}
       
      </div>
       

      <div className="max-w-2xl mx-auto">
        <div className="space-y-0">
          {filteredPosts.map((post) => (
            <BettingPostCard
              key={post.id}
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
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="bg-card border-b border-border p-10">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-foreground font-bold text-lg mb-2">No betting posts yet</h3>
              <p className="text-muted-foreground mb-6 text-sm">Be the first to share a betting tip or win!</p>
              <Button
                onClick={useMockData}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Load Demo Posts
              </Button>
            </div>
          </div>
        )}

        {filteredPosts.length > 0 && (
          <div className="bg-card border-t border-border p-4 sticky bottom-0">
            <Button
              onClick={fetchPosts}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Load New Posts
            </Button>
          </div>
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
  getOutcomeIcon: (outcome: string) => JSX.Element;
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

  const shouldTruncate = post.caption && post.caption.length > 120;
  const hasValidImage = hasValidImageUrl(post.image_url);
  const isTextOnly = !hasValidImage;

  function hasValidImageUrl(imageUrl: string): boolean {
    if (!imageUrl || imageUrl.trim() === '') return false;
    
    const invalidValues = ['null', 'undefined', 'nan', 'none', 'false', 'true'];
    if (invalidValues.includes(imageUrl.toLowerCase())) return false;
    
    if (imageUrl.includes('placeholder') || 
        imageUrl.includes('default') || 
        imageUrl.includes('missing')) {
      return false;
    }
    
    return true;
  }

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const calculatePotentialWin = () => {
    if (post.bet_amount && post.odds) {
      return (post.bet_amount * parseFloat(post.odds)).toFixed(2);
    }
    return '0.00';
  };

  return (
    <div className="bg-card border-b border-border glass-card-hover p-4 mb-4">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-border">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                {getInitials(post.user_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground text-sm">
                  {post.user_name}
                </h3>
                <Badge className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getOutcomeColor(post.bet_outcome || 'pending')}`}>
                  {getOutcomeIcon(post.bet_outcome || 'pending')}
                  {post.bet_outcome?.toUpperCase() || 'PENDING'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-xs">
                  {formatTimeAgo(post.created_at)}
                </span>
              </div>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg transition-colors hover:bg-secondary">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bet Info Banner */}
      
           

      {/* Image Section */}
      {hasValidImage && !imageError && (
        <div className="relative bg-primary/5">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin"></div>
                <p className="text-muted-foreground text-xs">Loading image...</p>
              </div>
            </div>
          )}
          
          <img
            src={post.image_url}
            alt={post.caption || `Betting post by ${post.user_name}`}
            className={`w-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{ 
              maxHeight: '70vh',
              minHeight: '400px'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Text-only post indicator */}
        {isTextOnly && (
          <div className="flex items-center gap-2 text-primary mb-3">
            <Zap className="h-4 w-4" />
            <span className="text-xs font-bold">BETTING TIP</span>
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="mb-4">
            <p className="text-foreground text-sm leading-relaxed">
              <span className="font-bold text-foreground">{post.user_name}</span>{' '}
              {shouldTruncate && !showFullCaption 
                ? `${post.caption.slice(0, 120)}...`
                : post.caption
              }
              {shouldTruncate && (
                <button
                  onClick={() => setShowFullCaption(!showFullCaption)}
                  className="ml-2 text-primary hover:text-primary/80 font-bold text-sm transition-colors"
                >
                  {showFullCaption ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onLike(post.id)}
                className={cn(
                  "p-1.5 transition-all duration-200 rounded-full",
                  isLiked 
                    ? 'text-destructive scale-110 bg-destructive/10' 
                    : 'text-muted-foreground hover:text-destructive hover:bg-secondary'
                )}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              </button>
              <button className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-secondary rounded-full transition-all">
                <MessageCircle className="h-5 w-5" />
              </button>
              <button className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-secondary rounded-full transition-all">
                <Share className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => onSave(post.id)}
              className={cn(
                "p-1.5 transition-all duration-200 rounded-full",
                isSaved 
                  ? 'text-primary scale-110 bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
            </button>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-bold text-foreground text-sm">
              {Math.floor(Math.random() * 150) + 50} likes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <MessageCircle className="h-3 w-3" />
              <span>{Math.floor(Math.random() * 25)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Share className="h-3 w-3" />
              <span>{Math.floor(Math.random() * 15)}</span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="text-muted-foreground text-sm mb-3">
          <button className="hover:text-primary transition-colors font-medium">
            View all {Math.floor(Math.random() * 25)} comments
          </button>
        </div>

        {/* Add Comment */}
        <div className="pt-3 border-t border-border">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Add a betting tip or comment..."
              className="flex-1 text-sm text-foreground bg-background border border-input rounded-lg px-3 py-2 outline-none placeholder-muted-foreground focus:border-primary transition-colors"
            />
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-4 py-2 rounded-lg">
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;