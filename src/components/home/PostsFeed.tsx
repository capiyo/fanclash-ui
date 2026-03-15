import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Clock, Trophy, TrendingUp, Flame, UserPlus, Send, X, Copy, Twitter, Facebook, Linkedin, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
}

interface ApiResponse {
  success: boolean;
  posts: Post[];
  message?: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: number;
}

const PostsFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Local storage cache
  const [lastCacheTimestamp, setLastCacheTimestamp] = useState<number | null>(null);
  const [lastEtag, setLastEtag] = useState<string | null>(null);

  // Modal states - matching Flutter
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);

  // Card states - matching Flutter's _cardStates
  const [cardStates, setCardStates] = useState<Map<number, {
    isLiked: boolean;
    isFollowing: boolean;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    isSaved: boolean;
    showComments: boolean;
    comments: Comment[];
    newComment: string;
    isSubmittingComment: boolean;
  }>>(new Map());

  // Processing states - matching Flutter's _processingLikes
  const [processingLikes, setProcessingLikes] = useState<Map<number, boolean>>(new Map());
  const likeDebounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // User data from localStorage - matching Flutter's SharedPreferences
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    token?: string;
  } | null>(null);

  const { toast } = useToast();

  // Cache constants - matching Flutter
  const CACHE_KEY = 'posts_cache';
  const TIMESTAMP_KEY = 'posts_timestamp';
  const ETAG_KEY = 'posts_etag';
  const CACHE_VALIDITY_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Avatar URLs - exactly matching Flutter's list
  const AVATAR_URLS = [
    'https://i.pravatar.cc/150?img=1', 'https://i.pravatar.cc/150?img=2', 'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4', 'https://i.pravatar.cc/150?img=5', 'https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7', 'https://i.pravatar.cc/150?img=8', 'https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10', 'https://i.pravatar.cc/150?img=11', 'https://i.pravatar.cc/150?img=12',
    'https://i.pravatar.cc/150?img=13', 'https://i.pravatar.cc/150?img=14', 'https://i.pravatar.cc/150?img=15',
    'https://i.pravatar.cc/150?img=16', 'https://i.pravatar.cc/150?img=17', 'https://i.pravatar.cc/150?img=18',
    'https://i.pravatar.cc/150?img=19', 'https://i.pravatar.cc/150?img=20', 'https://i.pravatar.cc/150?img=21',
    'https://i.pravatar.cc/150?img=22', 'https://i.pravatar.cc/150?img=23', 'https://i.pravatar.cc/150?img=24',
    'https://i.pravatar.cc/150?img=25', 'https://i.pravatar.cc/150?img=26', 'https://i.pravatar.cc/150?img=27',
    'https://i.pravatar.cc/150?img=28', 'https://i.pravatar.cc/150?img=29', 'https://i.pravatar.cc/150?img=30',
    'https://i.pravatar.cc/150?img=31', 'https://i.pravatar.cc/150?img=32', 'https://i.pravatar.cc/150?img=33',
    'https://i.pravatar.cc/150?img=34', 'https://i.pravatar.cc/150?img=35', 'https://i.pravatar.cc/150?img=36',
    'https://i.pravatar.cc/150?img=37', 'https://i.pravatar.cc/150?img=38', 'https://i.pravatar.cc/150?img=39',
    'https://i.pravatar.cc/150?img=40', 'https://i.pravatar.cc/150?img=41', 'https://i.pravatar.cc/150?img=42',
    'https://i.pravatar.cc/150?img=43', 'https://i.pravatar.cc/150?img=44', 'https://i.pravatar.cc/150?img=45',
    'https://i.pravatar.cc/150?img=46', 'https://i.pravatar.cc/150?img=47', 'https://i.pravatar.cc/150?img=48',
    'https://i.pravatar.cc/150?img=49', 'https://i.pravatar.cc/150?img=50', 'https://i.pravatar.cc/150?img=51',
    'https://i.pravatar.cc/150?img=52', 'https://i.pravatar.cc/150?img=53', 'https://i.pravatar.cc/150?img=54',
    'https://i.pravatar.cc/150?img=55', 'https://i.pravatar.cc/150?img=56', 'https://i.pravatar.cc/150?img=57',
    'https://i.pravatar.cc/150?img=58', 'https://i.pravatar.cc/150?img=59', 'https://i.pravatar.cc/150?img=60',
    'https://i.pravatar.cc/150?img=61', 'https://i.pravatar.cc/150?img=62', 'https://i.pravatar.cc/150?img=63',
    'https://i.pravatar.cc/150?img=64', 'https://i.pravatar.cc/150?img=65', 'https://i.pravatar.cc/150?img=66',
    'https://i.pravatar.cc/150?img=67', 'https://i.pravatar.cc/150?img=68', 'https://i.pravatar.cc/150?img=69',
    'https://i.pravatar.cc/150?img=70',
  ];

  // Cache for user avatars - matching Flutter's _userAvatarMap
  const [userAvatarMap, setUserAvatarMap] = useState<Map<string, string>>(new Map());

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const userString = localStorage.getItem("user");
        const token = localStorage.getItem("usertoken");

        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser({
            id: user.id || user.user_id || '',
            username: user.username || '',
            token: token || undefined
          });
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();

    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get avatar for user - matching Flutter's _getAvatarForUser
  const getAvatarForUser = useCallback((userId: string): string => {
    if (userAvatarMap.has(userId)) {
      return userAvatarMap.get(userId)!;
    }

    const hash = userId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    const index = Math.abs(hash) % AVATAR_URLS.length;
    const avatarUrl = AVATAR_URLS[index];

    setUserAvatarMap(prev => new Map(prev).set(userId, avatarUrl));
    return avatarUrl;
  }, [userAvatarMap]);

  // Load cached data - matching Flutter's _loadCachedData
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cachedPosts = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(TIMESTAMP_KEY);

        if (cachedPosts && cachedTimestamp) {
          const parsedPosts = JSON.parse(cachedPosts) as Post[];
          const timestamp = parseInt(cachedTimestamp);
          const now = Date.now();
          const isCacheValid = now - timestamp < CACHE_VALIDITY_DURATION;

          parsedPosts.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

          if (parsedPosts.length > 0 && posts.length === 0) {
            setPosts(parsedPosts);
            setLastCacheTimestamp(timestamp);
            initializeCardStates(parsedPosts);
            setLoading(false);
          }

          if (!isCacheValid) {
            fetchPosts(true);
          }
        } else {
          fetchPosts(false);
        }
      } catch (error) {
        console.error('Cache load error:', error);
        fetchPosts(false);
      }
    };

    loadCachedData();
  }, []);

  // Save to cache - matching Flutter's _saveToCache
  const saveToCache = useCallback((posts: Post[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(posts));
      localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }, []);

  // Build headers - matching Flutter's _buildHeaders
  const buildHeaders = useCallback((forceRefresh = false) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (currentUser?.token) {
      headers['Authorization'] = `Bearer ${currentUser.token}`;
    }

    headers['Cache-Control'] = forceRefresh ? 'no-cache' : 'max-age=300';

    return headers;
  }, [currentUser]);

  // Check if posts have changed - matching Flutter's _havePostsChanged
  const havePostsChanged = useCallback((newPosts: Post[]): boolean => {
    if (posts.length !== newPosts.length) return true;

    for (let i = 0; i < Math.min(posts.length, 5); i++) {
      if (posts[i].id !== newPosts[i].id) return true;
    }

    return false;
  }, [posts]);

  // Initialize card states - matching Flutter's _initializeCardStates
  const initializeCardStates = useCallback((postsList: Post[]) => {
    const newCardStates = new Map();

    postsList.forEach((post, index) => {
      if (!post.id) return;

      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      const isLiked = likedPosts.includes(post.id) || post.is_liked || false;

      const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      const isSaved = savedPosts.includes(post.id) || false;

      newCardStates.set(index, {
        isLiked,
        isFollowing: false,
        likeCount: post.likes_count || Math.floor(Math.random() * 300) + 100,
        commentCount: post.comments_count || Math.floor(Math.random() * 50) + 10,
        shareCount: post.shares_count || Math.floor(Math.random() * 30) + 5,
        isSaved,
        showComments: false,
        comments: [],
        newComment: '',
        isSubmittingComment: false,
      });
    });

    setCardStates(newCardStates);
  }, []);

  // Clean image URL
  const cleanImageUrl = (imageUrl: string): string => {
    if (!imageUrl ||
      typeof imageUrl !== 'string' ||
      imageUrl.trim() === '' ||
      imageUrl === 'null' ||
      imageUrl === 'undefined') {
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

  // Fetch posts - matching Flutter's _fetchPosts
  const fetchPosts = async (forceRefresh = false) => {
    if (isFetching) return;

    setIsFetching(true);

    try {
      if (posts.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const headers = buildHeaders(forceRefresh);
      const response = await fetch(`${API_BASE_URL}/api/posts`, { headers });

      if (response.ok) {
        const data: ApiResponse = await response.json();

        if (data.success && Array.isArray(data.posts)) {
          const cleanedPosts = data.posts.map(post => ({
            ...post,
            image_url: cleanImageUrl(post.image_url),
            bet_amount: post.bet_amount || Math.floor(Math.random() * 1000) + 100,
            bet_outcome: post.bet_outcome || (Math.random() > 0.5 ? 'win' : Math.random() > 0.3 ? 'loss' : 'pending'),
            odds: post.odds || `${(Math.random() * 5 + 1.1).toFixed(2)}`,
          }));

          cleanedPosts.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

          if (havePostsChanged(cleanedPosts)) {
            saveToCache(cleanedPosts);
            setPosts(cleanedPosts);
            initializeCardStates(cleanedPosts);
            setError('');
          }
        }
      } else if (posts.length === 0) {
        setError(`Server error: ${response.status}`);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      if (posts.length === 0) {
        setError('Connection timeout. Check your internet connection.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsFetching(false);
    }
  };

  // Format time ago - matching Flutter's formattedDate
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

  // Get outcome color - matching Flutter's badge colors
  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'win': return 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-500 border-emerald-500/40';
      case 'loss': return 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-500 border-red-500/40';
      default: return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-500 border-yellow-500/40';
    }
  };

  // Get outcome icon - matching Flutter
  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'win': return <Trophy className="h-3.5 w-3.5" />;
      case 'loss': return <TrendingUp className="h-3.5 w-3.5 rotate-180" />;
      default: return <Clock className="h-3.5 w-3.5" />;
    }
  };

  // Format count - matching Flutter's _formatCount
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Toggle like - matching Flutter's _toggleLike with debouncing
  const toggleLike = async (index: number, postId: string) => {
    if (processingLikes.get(index) === true) return;

    const cardState = cardStates.get(index);
    if (!cardState) return;

    const isCurrentlyLiked = cardState.isLiked;
    if (isCurrentlyLiked) return;

    setProcessingLikes(prev => new Map(prev).set(index, true));

    const originalLikeCount = cardState.likeCount;

    setCardStates(prev => {
      const newMap = new Map(prev);
      const state = newMap.get(index);
      if (state) {
        newMap.set(index, {
          ...state,
          isLiked: true,
          likeCount: originalLikeCount + 1,
        });
      }
      return newMap;
    });

    if (likeDebounceTimers.current.has(postId)) {
      clearTimeout(likeDebounceTimers.current.get(postId));
    }

    const timer = setTimeout(async () => {
      try {
        const url = `${API_BASE_URL}/api/posts/${postId}/like`;
        const headers = buildHeaders();

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ user_id: currentUser?.id }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.post) {
            setCardStates(prev => {
              const newMap = new Map(prev);
              const state = newMap.get(index);
              if (state) {
                newMap.set(index, {
                  ...state,
                  likeCount: data.post.likes_count || originalLikeCount + 1,
                });
              }
              return newMap;
            });

            const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
            if (!likedPosts.includes(postId)) {
              likedPosts.push(postId);
              localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
            }
          }
        } else {
          setCardStates(prev => {
            const newMap = new Map(prev);
            const state = newMap.get(index);
            if (state) {
              newMap.set(index, {
                ...state,
                isLiked: false,
                likeCount: originalLikeCount,
              });
            }
            return newMap;
          });
        }
      } catch (error) {
        setCardStates(prev => {
          const newMap = new Map(prev);
          const state = newMap.get(index);
          if (state) {
            newMap.set(index, {
              ...state,
              isLiked: false,
              likeCount: originalLikeCount,
            });
          }
          return newMap;
        });
      } finally {
        setProcessingLikes(prev => {
          const newMap = new Map(prev);
          newMap.delete(index);
          return newMap;
        });
        likeDebounceTimers.current.delete(postId);
      }
    }, 300);

    likeDebounceTimers.current.set(postId, timer);
  };

  // Handle follow - matching Flutter's _handleFollow
  const handleFollow = (index: number) => {
    setCardStates(prev => {
      const newMap = new Map(prev);
      const state = newMap.get(index);
      if (state) {
        newMap.set(index, {
          ...state,
          isFollowing: true,
        });
      }
      return newMap;
    });

    toast({
      title: "Following",
      description: "You are now following this user",
      duration: 2000,
    });
  };

  // Load comments for a post
  const loadComments = async (postId: string, index: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        headers: buildHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.comments)) {
          setCardStates(prev => {
            const newMap = new Map(prev);
            const state = newMap.get(index);
            if (state) {
              newMap.set(index, {
                ...state,
                comments: data.comments.map((c: any) => ({
                  id: c.id,
                  post_id: postId,
                  user_id: c.user_id,
                  user_name: c.user_name,
                  content: c.content,
                  created_at: c.created_at,
                })),
              });
            }
            return newMap;
          });
        }
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // Submit comment
  const submitComment = async (index: number, postId: string) => {
    const cardState = cardStates.get(index);
    if (!cardState || !cardState.newComment.trim() || !currentUser) return;

    setCardStates(prev => {
      const newMap = new Map(prev);
      const state = newMap.get(index);
      if (state) {
        newMap.set(index, { ...state, isSubmittingComment: true });
      }
      return newMap;
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          user_id: currentUser.id,
          user_name: currentUser.username,
          content: cardState.newComment,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.comment) {
          setCardStates(prev => {
            const newMap = new Map(prev);
            const state = newMap.get(index);
            if (state) {
              newMap.set(index, {
                ...state,
                comments: [...state.comments, {
                  id: data.comment.id,
                  post_id: postId,
                  user_id: currentUser.id,
                  user_name: currentUser.username,
                  content: cardState.newComment,
                  created_at: Math.floor(Date.now() / 1000),
                }],
                commentCount: state.commentCount + 1,
                newComment: '',
                isSubmittingComment: false,
              });
            }
            return newMap;
          });
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setCardStates(prev => {
        const newMap = new Map(prev);
        const state = newMap.get(index);
        if (state) {
          newMap.set(index, { ...state, isSubmittingComment: false });
        }
        return newMap;
      });
    }
  };

  // Toggle save post
  const toggleSave = (postId: string, index: number) => {
    setCardStates(prev => {
      const newMap = new Map(prev);
      const state = newMap.get(index);
      if (state) {
        const newIsSaved = !state.isSaved;
        newMap.set(index, { ...state, isSaved: newIsSaved });

        const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
        if (newIsSaved) {
          if (!savedPosts.includes(postId)) {
            savedPosts.push(postId);
          }
        } else {
          const index = savedPosts.indexOf(postId);
          if (index > -1) {
            savedPosts.splice(index, 1);
          }
        }
        localStorage.setItem('savedPosts', JSON.stringify(savedPosts));

        toast({
          title: newIsSaved ? "Post saved" : "Post unsaved",
          description: newIsSaved ? "Added to your saved posts" : "Removed from saved posts",
          duration: 1500,
        });
      }
      return newMap;
    });
  };

  // Modal handlers
  const openCommentsModal = (index: number) => {
    const post = posts[index];
    if (post?.id) {
      setCardStates(prev => {
        const newMap = new Map(prev);
        const state = newMap.get(index);
        if (state) {
          const showComments = !state.showComments;
          newMap.set(index, { ...state, showComments });
          if (showComments && state.comments.length === 0) {
            loadComments(post.id, index);
          }
        }
        return newMap;
      });
    }
  };

  const openShareModal = (index: number) => {
    setIsShareOpen(true);
    setSelectedPostIndex(index);
  };

  const closeAllModals = () => {
    setIsShareOpen(false);
    setSelectedPostIndex(null);
  };

  // Use mock data if needed
  const useMockData = (): void => {
    const mockPosts: Post[] = [
      {
        id: '1',
        image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=800&fit=crop',
        caption: 'HUGE WIN! 🏆 Just won ₿250 on Liverpool vs Man City! The 2-1 comeback was insane! 💪 #betting #sportsbetting #win #football',
        user_name: 'Alex Betmaster',
        user_id: 'user123',
        created_at: Math.floor(Date.now() / 1000) - 2 * 60 * 60,
        bet_amount: 250,
        bet_outcome: 'win',
        odds: '3.25',
        likes_count: 234,
        comments_count: 45,
        shares_count: 12,
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
        odds: '2.10',
        likes_count: 89,
        comments_count: 23,
        shares_count: 5,
      },
      {
        id: '3',
        image_url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&h=800&fit=crop',
        caption: 'Tough loss on the Derby today... 🤦‍♂️ Thought Horse #3 was a lock! Back to analyzing form for tomorrow. #horseracing #betting #sports #analysis',
        user_name: 'Mike Tipster',
        user_id: 'user789',
        created_at: Math.floor(Date.now() / 1000) - 8 * 60 * 60,
        bet_amount: 75,
        bet_outcome: 'loss',
        odds: '4.50',
        likes_count: 56,
        comments_count: 18,
        shares_count: 3,
      },
      {
        id: '4',
        image_url: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1200&h=800&fit=crop',
        caption: 'EPIC COMEBACK WIN! 🔥 Arsenal coming back from 2-0 down to win 3-2! Bet ₿150 at 8.50 odds! #Arsenal #PremierLeague #Win',
        user_name: 'James Bettor',
        user_id: 'user101',
        created_at: Math.floor(Date.now() / 1000) - 3 * 60 * 60,
        bet_amount: 150,
        bet_outcome: 'win',
        odds: '8.50',
        likes_count: 412,
        comments_count: 67,
        shares_count: 23,
      },
      {
        id: '5',
        image_url: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=1200&h=800&fit=crop',
        caption: 'Live tennis betting right now! 🎾 Taking Nadal to win in straight sets @ 1.85 odds. His clay game is unstoppable! #Tennis #LiveBet',
        user_name: 'Emma Sports',
        user_id: 'user102',
        created_at: Math.floor(Date.now() / 1000) - 1 * 60 * 60,
        bet_amount: 200,
        bet_outcome: 'pending',
        odds: '1.85',
        likes_count: 178,
        comments_count: 34,
        shares_count: 9,
      },
    ];

    const cleanedPosts = mockPosts.map(post => ({
      ...post,
      image_url: cleanImageUrl(post.image_url)
    }));

    setPosts(cleanedPosts);
    initializeCardStates(cleanedPosts);
    setError("");
    setLoading(false);
  };

  // Loading skeleton - FIXED: Using same layout pattern
  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2 p-2 sm:p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#111827]/30 rounded-xl border border-[#1F2937]/50 p-3 sm:p-4 animate-pulse">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="w-32 h-3 sm:w-36 sm:h-4 bg-emerald-500/20 rounded-full"></div>
                    <div className="w-20 h-2 sm:w-24 sm:h-3 bg-emerald-500/10 rounded-full"></div>
                  </div>
                </div>
                <div className="w-full h-32 sm:h-48 bg-emerald-500/10 rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="w-3/4 h-3 sm:h-4 bg-emerald-500/20 rounded-full"></div>
                  <div className="w-1/2 h-2 sm:h-3 bg-emerald-500/10 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state - FIXED: Using same layout pattern
  if (error && posts.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md mx-auto py-8 sm:py-12 px-4"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-red-500/30">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-1 sm:mb-2">Connection Failed</h3>
            <p className="text-sm text-gray-400 mb-4 sm:mb-6">{error}</p>
            <div className="space-y-2 max-w-sm mx-auto">
              <Button
                onClick={() => fetchPosts(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 sm:py-3 text-sm"
              >
                Retry Connection
              </Button>
              <Button
                variant="outline"
                onClick={useMockData}
                className="w-full border-gray-800 text-gray-400 hover:text-white py-2 sm:py-3 text-sm"
              >
                Load Demo Posts
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main render - FIXED: Using exact same layout pattern as working example
  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden">
      {/* Pull to refresh indicator - stays at top */}
      {refreshing && (
        <div className="sticky top-0 z-10 flex justify-center py-1.5 sm:py-2 bg-black/80 backdrop-blur-sm border-b border-gray-800/50">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-0.5 sm:py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-emerald-400">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Scrollable content area - flex-1 overflow-y-auto is key */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-1.5 sm:p-4">
          <AnimatePresence>
            {posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 sm:py-12"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-emerald-500/30">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-emerald-400 mb-1">No posts found</h3>
                <p className="text-sm text-gray-400">Be the first to create a post!</p>
              </motion.div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {posts.map((post, index) => {
                  const cardState = cardStates.get(index) || {
                    isLiked: false,
                    isFollowing: false,
                    likeCount: post.likes_count || 0,
                    commentCount: post.comments_count || 0,
                    shareCount: post.shares_count || 0,
                    isSaved: false,
                    showComments: false,
                    comments: [],
                    newComment: '',
                    isSubmittingComment: false,
                  };

                  const hasImage = post.image_url && post.image_url.trim() !== '';
                  const hasCaption = post.caption && post.caption.trim() !== '';

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="bg-[#111827]/30 rounded-xl border border-[#1F2937]/50 p-2.5 sm:p-4 hover:border-emerald-500/30 transition-all">
                        {/* Header */}
                        <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-4">
                          <div className="relative">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-emerald-500/30 flex-shrink-0">
                              <img
                                src={getAvatarForUser(post.user_id)}
                                alt={post.user_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_name)}&background=10B981&color=fff`;
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <h3 className="font-bold text-white text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{post.user_name}</h3>

                              {!cardState.isFollowing && post.user_id !== currentUser?.id && (
                                <button
                                  onClick={() => handleFollow(index)}
                                  className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20"
                                >
                                  <UserPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                                  <span className="text-xs text-emerald-400 font-medium">Follow</span>
                                </button>
                              )}

                              {post.bet_outcome && (
                                <Badge className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border backdrop-blur-sm ${getOutcomeColor(post.bet_outcome)}`}>
                                  <span className="mr-0.5 sm:mr-1">{getOutcomeIcon(post.bet_outcome)}</span>
                                  {post.bet_outcome === 'win' ? 'Won' : post.bet_outcome === 'loss' ? 'Lost' : 'Live'}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                              <span className="text-[10px] sm:text-xs text-gray-400">{formatTimeAgo(post.created_at)}</span>
                            </div>
                          </div>

                          <button className="p-0.5 sm:p-1 text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        {/* Bet info */}
                        {post.bet_amount && post.odds && (
                          <div className="mb-2 sm:mb-4 p-1.5 sm:p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border border-emerald-500/20">
                            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                              <div className="flex items-center gap-0.5 sm:gap-1.5">
                                <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                                <span className="font-bold text-white text-xs sm:text-sm">₿{post.bet_amount}</span>
                              </div>
                              <div className="flex items-center gap-0.5 sm:gap-1.5">
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                                <span className="text-emerald-400 font-bold text-xs sm:text-sm">{post.odds} odds</span>
                              </div>
                              <div className="flex items-center gap-0.5 sm:gap-1.5">
                                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                                <span className="font-bold text-emerald-400 text-xs sm:text-sm">
                                  ₿{(post.bet_amount * parseFloat(post.odds)).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Caption */}
                        {hasCaption && (
                          <div className="mb-2 sm:mb-4">
                            <p className="text-sm text-gray-300 leading-relaxed break-words">
                              {post.caption}
                            </p>
                          </div>
                        )}

                        {/* Image */}
                        {hasImage && (
                          <div className="mb-2 sm:mb-4 rounded-lg overflow-hidden border border-[#1F2937]/50">
                            <img
                              src={post.image_url}
                              alt={post.caption || `Post by ${post.user_name}`}
                              className="w-full h-auto max-h-[250px] sm:max-h-[350px] object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-[#1F2937]/50 my-1.5 sm:my-3" />

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => toggleLike(index, post.id)}
                              disabled={processingLikes.get(index) === true}
                              className={cn(
                                "flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg transition-colors",
                                cardState.isLiked
                                  ? "text-emerald-400"
                                  : "text-gray-400 hover:text-white"
                              )}
                            >
                              <Heart
                                className={cn(
                                  "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all",
                                  cardState.isLiked && "fill-emerald-400"
                                )}
                              />
                              <span className={cn(
                                "text-xs",
                                cardState.isLiked && "font-semibold"
                              )}>
                                {formatCount(cardState.likeCount)}
                              </span>
                            </button>

                            <button
                              onClick={() => openCommentsModal(index)}
                              className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="text-xs">{formatCount(cardState.commentCount)}</span>
                            </button>

                            <button
                              onClick={() => toggleSave(post.id, index)}
                              className={cn(
                                "flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg transition-colors",
                                cardState.isSaved
                                  ? "text-emerald-400"
                                  : "text-gray-400 hover:text-white"
                              )}
                            >
                              <Bookmark
                                className={cn(
                                  "w-3.5 h-3.5 sm:w-4 sm:h-4",
                                  cardState.isSaved && "fill-emerald-400"
                                )}
                              />
                            </button>
                          </div>

                          <button
                            onClick={() => openShareModal(index)}
                            className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-gray-400 hover:text-white transition-colors"
                          >
                            <Share className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        {/* Comments section */}
                        {cardState.showComments && (
                          <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-[#1F2937]/50">
                            <div className="space-y-2 mb-2 sm:space-y-3 sm:mb-3 max-h-36 sm:max-h-48 overflow-y-auto">
                              {cardState.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-1.5 sm:gap-2">
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden flex-shrink-0 border border-emerald-500/30">
                                    <img
                                      src={getAvatarForUser(comment.user_id)}
                                      alt={comment.user_name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                      <span className="text-xs font-bold text-white">{comment.user_name}</span>
                                      <span className="text-[10px] text-gray-400">{formatTimeAgo(comment.created_at)}</span>
                                    </div>
                                    <p className="text-xs text-gray-300 mt-0.5 break-words">{comment.content}</p>
                                  </div>
                                </div>
                              ))}

                              {cardState.comments.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-1 sm:py-2">No comments yet</p>
                              )}
                            </div>

                            {currentUser && (
                              <div className="flex gap-1.5 sm:gap-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 border border-emerald-500/30">
                                  <img
                                    src={getAvatarForUser(currentUser.id)}
                                    alt={currentUser.username}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 flex gap-1 sm:gap-2">
                                  <input
                                    type="text"
                                    value={cardState.newComment}
                                    onChange={(e) => {
                                      setCardStates(prev => {
                                        const newMap = new Map(prev);
                                        const state = newMap.get(index);
                                        if (state) {
                                          newMap.set(index, { ...state, newComment: e.target.value });
                                        }
                                        return newMap;
                                      });
                                    }}
                                    placeholder="Write a comment..."
                                    className="flex-1 bg-[#111827]/50 border border-[#1F2937] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        submitComment(index, post.id);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => submitComment(index, post.id)}
                                    disabled={!cardState.newComment.trim() || cardState.isSubmittingComment}
                                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
                                  >
                                    {cardState.isSubmittingComment ? (
                                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isShareOpen && selectedPostIndex !== null && posts[selectedPostIndex] && (
          <ShareModal
            isOpen={isShareOpen}
            onClose={closeAllModals}
            post={posts[selectedPostIndex]}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Share Modal Component (simplified)
const ShareModal = ({ isOpen, onClose, post }: any) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/post/${post.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Post link copied to clipboard",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative w-full max-w-md bg-[#111827] rounded-t-2xl sm:rounded-2xl border border-[#1F2937] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#1F2937]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Share className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">Share Post</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#1F2937]"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 border-b border-[#1F2937] bg-[#1F2937]/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              {post.image_url ? (
                <img src={post.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{post.user_name}</p>
              <p className="text-xs text-gray-400 truncate">
                {post.caption ? post.caption.substring(0, 60) : 'No caption'}
                {post.caption && post.caption.length > 60 ? '...' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="p-2 sm:p-4 space-y-1 sm:space-y-2">
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#1F2937] hover:bg-[#374151] rounded-lg transition-colors group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-600 flex-shrink-0">
              {copied ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-white text-sm sm:text-base font-medium">{copied ? 'Copied!' : 'Copy Link'}</p>
              <p className="text-xs text-gray-400 truncate">{shareUrl}</p>
            </div>
          </button>
        </div>

        <div className="p-2 sm:p-4 border-t border-[#1F2937]">
          <button
            onClick={onClose}
            className="w-full py-1.5 sm:py-2 text-gray-400 hover:text-white text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PostsFeed;