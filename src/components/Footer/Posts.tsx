import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Clock, RefreshCw, Trophy, Zap } from "lucide-react";
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
      case 'loss': return '▼';
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
      <div className="bg-background overflow-y-auto">
        <div className="max-w-2xl mx-auto px-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border-b border-border animate-pulse">
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full"></div>
                  <div className="space-y-1 flex-1">
                    <div className="w-20 h-3 bg-primary/10 rounded"></div>
                    <div className="w-16 h-2 bg-primary/5 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="w-full h-64 bg-primary/5"></div>
              <div className="p-3 space-y-2">
                <div className="flex gap-2">
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
      <div className="bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/30">
              <Trophy className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-foreground font-bold text-sm mb-1">Connection Failed</h3>
            <p className="text-muted-foreground mb-4 text-xs">Unable to load betting posts</p>
            <div className="space-y-2">
              <Button
                onClick={fetchPosts}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-1.5"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry Connection
              </Button>
              <Button
                variant="outline"
                onClick={useMockData}
                className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-secondary text-sm py-1.5"
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
    <div className="bg-background overflow-y-auto">
      <div className="max-w-2xl mx-auto px-2">
        <div className="space-y-0">
          {posts.map((post) => (
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

        {posts.length === 0 && (
          <div className="bg-card border border-border p-6 rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-foreground font-bold text-sm mb-1">No betting posts yet</h3>
              <p className="text-muted-foreground mb-4 text-xs">Be the first to share a betting tip or win!</p>
              <Button
                onClick={useMockData}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-1.5"
              >
                Load Demo Posts
              </Button>
            </div>
          </div>
        )}

        {posts.length > 0 && (
          <div className="bg-card border-t border-border p-3 sticky bottom-0">
            <Button
              onClick={fetchPosts}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-1.5"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
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
    <div className="bg-card border-b border-border p-3">
      {/* Header - Made more compact */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {getInitials(post.user_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-foreground text-sm">
                {post.user_name}
              </h3>
              <Badge className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${getOutcomeColor(post.bet_outcome || 'pending')}`}>
                <span className="text-xs">{getOutcomeIcon(post.bet_outcome || 'pending')}</span>
              </Badge>
              <span className="text-muted-foreground text-xs ml-1">•</span>
              <div className="flex items-center gap-0.5 text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                <span className="text-xs">
                  {formatTimeAgo(post.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors hover:bg-secondary">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Bet Info - Compact inline */}
      {post.bet_amount && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <span className="font-medium text-foreground">₿{post.bet_amount}</span>
          <span>•</span>
          <span>@{post.odds}</span>
          <span>•</span>
          <span>Pot: ₿{(post.bet_amount * parseFloat(post.odds || '1')).toFixed(2)}</span>
        </div>
      )}

      {/* Caption - Twitter-like typography */}
      {post.caption && (
        <div className="mb-2">
          <p className="text-foreground text-sm leading-relaxed">
            {shouldTruncate && !showFullCaption 
              ? `${post.caption.slice(0, 100)}...`
              : post.caption
            }
            {shouldTruncate && (
              <button
                onClick={() => setShowFullCaption(!showFullCaption)}
                className="ml-1 text-primary hover:text-primary/80 font-medium text-sm"
              >
                {showFullCaption ? 'Show less' : 'Show more'}
              </button>
            )}
          </p>
        </div>
      )}

      {/* Image Section - Reduced height */}
      {hasValidImage && !imageError && (
        <div className="relative mb-2 rounded-lg overflow-hidden bg-secondary">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin"></div>
              </div>
            </div>
          )}
          
          <img
            src={post.image_url}
            alt={post.caption || `Betting post by ${post.user_name}`}
            className={`w-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              maxHeight: '400px',
              minHeight: '200px'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      )}

      {/* Actions - More compact like Twitter */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLike(post.id)}
              className={cn(
                "p-1 transition-all duration-200 rounded-full",
                isLiked 
                  ? 'text-destructive scale-105' 
                  : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </button>
            <button className="text-muted-foreground hover:text-primary p-1 hover:bg-primary/10 rounded-full transition-all">
              <MessageCircle className="h-4 w-4" />
            </button>
            <button className="text-muted-foreground hover:text-primary p-1 hover:bg-primary/10 rounded-full transition-all">
              <Share className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => onSave(post.id)}
            className={cn(
              "p-1 transition-all duration-200 rounded-full",
              isSaved 
                ? 'text-primary scale-105' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
            )}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          </button>
        </div>
      </div>

      {/* Engagement Stats - Smaller */}
      <div className="flex items-center justify-between mb-2 text-xs">
        <div>
          <span className="text-muted-foreground">
            {Math.floor(Math.random() * 150) + 50} likes
          </span>
          <span className="text-muted-foreground mx-1">•</span>
          <span className="text-muted-foreground">
            {Math.floor(Math.random() * 25)} comments
          </span>
        </div>
        <div className="text-muted-foreground">
          {Math.floor(Math.random() * 15)} shares
        </div>
      </div>

      {/* Comment Input - Twitter style */}
      <div className="pt-2 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Post your reply..."
            className="flex-1 text-xs text-foreground bg-background border border-input rounded-full px-3 py-1.5 outline-none placeholder-muted-foreground focus:border-primary transition-colors"
          />
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-3 py-1.5 rounded-full">
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Posts;