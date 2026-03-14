import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  MapPin, Clock, DollarSign, Building2, Heart, MessageCircle,
  Share2, Zap, Users, Calendar, Trophy, Sparkles, UserPlus,
  Eye, TrendingUp, Wallet, Bell, Target, Crown, ShieldCheck,
  Coins, Award, BarChart3, Lock, Gavel, Percent, Timer, Loader2,
  Filter, Search, ArrowUpDown, MoreVertical, Home, TrendingDown,
  Bookmark, Settings, ChevronRight, ExternalLink, ChevronDown,
  ChevronUp, ThumbsUp, ThumbsDown, X, Check, AlertCircle,
  Info, User, Users2, Sword, Shield, Flag, Star, Gift,
  Activity, Circle, Square, Triangle, Hexagon, Octagon,
  Volume2, VolumeX, Maximize, Minimize, Sun, Moon, Cloud,
  CloudRain, CloudSnow, CloudLightning, Wind, Droplets,
  Thermometer, Navigation, Compass, Anchor, Ship, Plane,
  Car, Bike, Bus, Train, Truck, Pizza, Coffee, Beer,
  Wine, GlassWater, Utensils, Cake, Candy, Apple,
  Banana, ShoppingBag, ShoppingCart, Gift as GiftIcon,
  Heart as HeartIcon, HeartOff, HeartPulse, Activity as ActivityIcon,
  Stethoscope, Pill, Syringe, Bone, Brain, Microscope,
  Dna, Atom, Beaker, TestTube, Droplet, Waves,
  ZapOff, Battery, BatteryCharging, BatteryFull, BatteryLow,
  BatteryMedium, Cpu, HardDrive, Monitor, Smartphone, Tablet,
  Laptop, Keyboard, Mouse, Printer, Camera, Speaker,
  Headphones, Mic, Radio, Tv, Gamepad, Joystick, Puzzle,
  Brush, Palette, Pen, Pencil, Highlighter, Eraser,
  Ruler, Compass as CompassIcon, Triangle as TriangleIcon,
  Square as SquareIcon, Circle as CircleIcon, Hexagon as HexagonIcon,
  Octagon as OctagonIcon, Pentagon, RectangleHorizontal,
  RectangleVertical, Star as StarIcon, Moon as MoonIcon,
  Sun as SunIcon, Cloud as CloudIcon, CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon, CloudLightning as CloudLightningIcon,
  Wind as WindIcon, Droplets as DropletsIcon, Thermometer as ThermometerIcon,
  Compass as CompassIcon2, Navigation as NavigationIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ========== TYPES & INTERFACES ==========

interface FixtureProps {
  away_team: string;
  home_team: string;
  date: string;
  draw: string;
  away_win: string;
  home_win: string;
  league: string;
  _id?: string;
  venue?: string;
  competition_logo?: string;
  round?: string;
  status?: 'upcoming' | 'live' | 'completed' | 'postponed' | 'cancelled';
  score?: {
    home: number;
    away: number;
    halfTime?: { home: number; away: number };
  };
  events?: MatchEvent[];
  statistics?: MatchStatistics;
  predictions?: {
    home: number;
    away: number;
    draw: number;
    total: number;
  };
  odds?: {
    home: number;
    draw: number;
    away: number;
    provider: string;
  }[];
  weather?: Weather;
  attendance?: number;
  referee?: string;
  tv_channels?: string[];
  highlights?: string;
}

interface MatchEvent {
  id: string;
  type: 'goal' | 'penalty' | 'ownGoal' | 'yellowCard' | 'redCard' | 'substitution' | 'var' | 'injury' | 'missedPenalty';
  minute: number;
  addedTime?: number;
  team: 'home' | 'away';
  player?: string;
  assistant?: string;
  description?: string;
}

interface MatchStatistics {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  shotsOffTarget: { home: number; away: number };
  blockedShots: { home: number; away: number };
  corners: { home: number; away: number };
  offsides: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  passes: { home: number; away: number };
  passAccuracy: { home: number; away: number };
  tackles: { home: number; away: number };
  interceptions: { home: number; away: number };
  clearances: { home: number; away: number };
  saves: { home: number; away: number };
}

interface Weather {
  condition: 'clear' | 'cloudy' | 'rain' | 'snow' | 'thunderstorm';
  temperature: number;
  windSpeed: number;
  humidity: number;
  precipitation?: number;
}

interface PledgeData {
  username: string;
  phone: string;
  selection: string;
  amount: number;
  fan: string;
  home_team: string;
  away_team: string;
  starter_id: string;
}

interface UserDataFromBackend {
  user_id: string;
  username: string;
  phone: string;
  balance: number;
  nickname?: string;
  club_fan?: string;
  country_fan?: string;
  number_of_bets?: number;
  avatar?: string;
  joined_date?: string;
  total_won?: number;
  win_rate?: number;
  followers?: number;
  following?: number;
}

interface Vote {
  id: string;
  voterId: string;
  username: string;
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  selection: string;
  voteTimestamp: string;
  createdAt: string;
}

interface VoteUser {
  userId: string;
  username: string;
  selection: string;
  votedAt: string;
  avatar?: string;
  badge?: string;
}

interface FixtureVoteData {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  currentUserSelection: string | null;
  supporters: VoteUser[];
  rivals: VoteUser[];
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  fixtureId: string;
  comment: string;
  selection?: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  replies?: Comment[];
  edited?: boolean;
}

interface LikeData {
  fixtureId: string;
  totalLikes: number;
  userHasLiked: boolean;
}

interface VoteStats {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  totalVotes: number;
  homeVotes: number;
  drawVotes: number;
  awayVotes: number;
  homePercentage: number;
  drawPercentage: number;
  awayPercentage: number;
}

interface GameMetadata {
  fixtureId: string;
  userId: string;
  username: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  selection: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  votedAt: string;
  isActive: boolean;
  potentialWinnings?: number;
  status?: 'pending' | 'won' | 'lost' | 'cashed_out';
}

interface VotersPopupProps {
  type: 'supporters' | 'rivals';
  fixtureId: string;
  voters: VoteUser[];
  onClose: () => void;
  onVote?: (userId: string) => void;
}

interface FilterOptions {
  competition: string;
  status: string;
  date: string;
  team: string;
  sortBy: 'date' | 'odds' | 'league' | 'popularity';
}

// ========== FOOTBALL AVATAR MANAGER ==========

class FootballAvatarManager {
  private static readonly AVATAR_URLS = [
    'https://cdn-icons-png.flaticon.com/512/3095/3095207.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095212.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095216.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095221.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095225.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095230.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095234.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095239.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095243.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095248.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095252.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095257.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095261.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095266.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095270.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095275.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095279.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095284.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095288.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095293.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095297.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095302.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095306.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095311.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095315.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095320.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095324.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095329.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095333.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095338.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095342.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095347.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095351.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095356.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095360.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095365.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095369.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095374.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095378.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095383.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095387.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095392.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095396.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095401.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095405.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095410.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095414.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095419.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095423.png',
    'https://cdn-icons-png.flaticon.com/512/3095/3095428.png',
  ];

  private static memoryCache: Map<string, string> = new Map();

  static getAvatarUrl(userId: string): string {
    if (this.memoryCache.has(userId)) {
      return this.memoryCache.get(userId)!;
    }

    const hash = this.hashCode(userId);
    const url = this.AVATAR_URLS[Math.abs(hash) % this.AVATAR_URLS.length];
    this.memoryCache.set(userId, url);
    return url;
  }

  private static hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  static getInitials(username: string): string {
    if (!username || username.length === 0) return '⚽';
    const parts = username.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username[0].toUpperCase();
  }

  static buildAvatar(
    userId: string,
    username: string,
    size: number = 32,
    onClick?: () => void
  ): JSX.Element {
    const avatarUrl = this.getAvatarUrl(userId);
    const initials = this.getInitials(username);

    return (
      <TooltipProvider key={`avatar-${userId}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={onClick}
              className="cursor-pointer"
              style={{ width: size, height: size }}
            >
              <Avatar className={`w-${size} h-${size} border-2 border-emerald-500/30 hover:border-emerald-500 transition-colors`}>
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{username}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
}

// ========== DATE HELPER ==========

class DateHelper {
  static formatDate(dateString: string): string | JSX.Element {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));

      if (diffHours <= 2 && diffHours >= -2) {
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-medium text-xs">LIVE</span>
          </div>
        );
      }

      if (date > now) {
        if (diffHours < 24) {
          return `In ${diffHours}h`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          return `In ${diffDays}d`;
        }
      }

      if (diffHours < 0) {
        const absHours = Math.abs(diffHours);
        if (absHours < 24) {
          return `${absHours}h ago`;
        } else {
          const diffDays = Math.floor(absHours / 24);
          return `${diffDays}d ago`;
        }
      }

      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "TBD";
    }
  }

  static formatFullDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  static formatTimeAgo(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSeconds < 60) return 'Just now';
      if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
      if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
      if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Unknown';
    }
  }

  static parseFixtureDate(dateString: string): Date {
    try {
      return new Date(dateString);
    } catch {
      return new Date();
    }
  }
}

// ========== VOTE SERVICE ==========

class VoteService {
  private static readonly API_BASE_URL = 'https://fanclash-api.onrender.com/api';

  static async fetchAllVotes(): Promise<Vote[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/votes/votes`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) return [];

      const data = await response.json();
      const votes: Vote[] = [];

      if (Array.isArray(data)) {
        data.forEach(item => votes.push(this.parseVote(item)));
      } else if (data.data && Array.isArray(data.data)) {
        data.data.forEach((item: any) => votes.push(this.parseVote(item)));
      }

      return votes;
    } catch (error) {
      console.error('Error fetching votes:', error);
      return [];
    }
  }

  static async fetchUserVotes(userId: string): Promise<Map<string, string>> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/votes/user/${userId}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) return new Map();

      const data = await response.json();
      const userVotes = new Map<string, string>();

      if (data.success && Array.isArray(data.data)) {
        data.data.forEach((vote: any) => {
          if (vote.fixtureId && vote.selection) {
            userVotes.set(vote.fixtureId, vote.selection);
          }
        });
      }

      return userVotes;
    } catch (error) {
      console.error('Error fetching user votes:', error);
      return new Map();
    }
  }

  static async fetchVoteStats(fixtureId: string): Promise<VoteStats | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/votes/stats/${fixtureId}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        fixtureId: data.fixtureId || fixtureId,
        homeTeam: data.homeTeam || '',
        awayTeam: data.awayTeam || '',
        totalVotes: data.totalVotes || 0,
        homeVotes: data.homeVotes || 0,
        drawVotes: data.drawVotes || 0,
        awayVotes: data.awayVotes || 0,
        homePercentage: data.homePercentage || 0,
        drawPercentage: data.drawPercentage || 0,
        awayPercentage: data.awayPercentage || 0,
      };
    } catch (error) {
      console.error('Error fetching vote stats:', error);
      return null;
    }
  }

  static organizeVotesByFixture(
    votes: Vote[],
    currentUserId: string
  ): Map<string, FixtureVoteData> {
    const fixtureData = new Map<string, FixtureVoteData>();
    const userVotes = new Map<string, string>();

    // Get current user's votes
    votes.forEach(vote => {
      if (vote.voterId === currentUserId) {
        userVotes.set(vote.fixtureId, vote.selection);
      }
    });

    // Organize other users' votes
    votes.forEach(vote => {
      if (vote.voterId === currentUserId) return;

      const fixtureId = vote.fixtureId;
      const userSelection = userVotes.get(fixtureId);

      if (!fixtureData.has(fixtureId)) {
        fixtureData.set(fixtureId, {
          fixtureId,
          homeTeam: vote.homeTeam,
          awayTeam: vote.awayTeam,
          currentUserSelection: userSelection || null,
          supporters: [],
          rivals: []
        });
      }

      const data = fixtureData.get(fixtureId)!;
      const voteUser: VoteUser = {
        userId: vote.voterId,
        username: vote.username,
        selection: vote.selection,
        votedAt: vote.voteTimestamp,
      };

      if (userSelection) {
        if (vote.selection === userSelection) {
          data.supporters.push(voteUser);
        } else {
          data.rivals.push(voteUser);
        }
      }
    });

    return fixtureData;
  }

  private static parseVote(data: any): Vote {
    return {
      id: data._id?.$oid || data._id || data.id || '',
      voterId: data.voterId || '',
      username: data.username || 'Anonymous',
      fixtureId: data.fixtureId || '',
      homeTeam: data.homeTeam || '',
      awayTeam: data.awayTeam || '',
      selection: data.selection || '',
      voteTimestamp: data.voteTimestamp || data.createdAt || new Date().toISOString(),
      createdAt: data.createdAt || data.voteTimestamp || new Date().toISOString(),
    };
  }
}

// ========== COMMENT SERVICE ==========

class CommentService {
  private static readonly API_BASE_URL = 'https://fanclash-api.onrender.com/api';

  static async fetchCommentsForFixture(
    fixtureId: string,
    limit: number = 2
  ): Promise<Comment[]> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/votes/comments/fixture/${fixtureId}?limit=${limit}`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) return [];

      const data = await response.json();
      const comments: Comment[] = [];

      if (data.success && Array.isArray(data.data)) {
        data.data.forEach((item: any) => comments.push(this.parseComment(item)));
      } else if (Array.isArray(data)) {
        data.forEach((item: any) => comments.push(this.parseComment(item)));
      }

      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  static async fetchAllCommentsBulk(): Promise<Map<string, Comment[]>> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/votes/comments/recent?perFixture=2`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) return new Map();

      const data = await response.json();
      const result = new Map<string, Comment[]>();

      if (data.success && data.data) {
        Object.entries(data.data).forEach(([fixtureId, comments]: [string, any]) => {
          if (Array.isArray(comments)) {
            result.set(
              fixtureId,
              comments.map(c => this.parseComment(c))
            );
          }
        });
      }

      return result;
    } catch (error) {
      console.error('Error fetching all comments:', error);
      return new Map();
    }
  }

  static async postComment(
    userId: string,
    username: string,
    fixtureId: string,
    comment: string,
    selection?: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/votes/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterId: userId,
          username,
          fixtureId,
          comment: comment.trim(),
          selection,
          timestamp: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error posting comment:', error);
      return false;
    }
  }

  private static parseComment(data: any): Comment {
    return {
      id: data._id?.$oid || data._id || data.id || '',
      userId: data.voterId || data.userId || '',
      username: data.username || 'Anonymous',
      userAvatar: data.avatar,
      fixtureId: data.fixtureId || '',
      comment: data.comment || '',
      selection: data.selection,
      timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
      likes: data.likes || 0,
      dislikes: data.dislikes || 0,
      edited: data.edited || false
    };
  }
}

// ========== LIKE SERVICE ==========

class LikeService {
  private static readonly API_BASE_URL = 'https://fanclash-api.onrender.com/api';

  static async toggleLike(
    userId: string,
    username: string,
    fixtureId: string,
    isLiked: boolean
  ): Promise<LikeData | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterId: userId,
          username,
          fixtureId,
          action: isLiked ? 'unlike' : 'like'
        })
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        fixtureId,
        totalLikes: data.totalLikes || 0,
        userHasLiked: !isLiked
      };
    } catch (error) {
      console.error('Error toggling like:', error);
      return null;
    }
  }

  static async fetchLikeStats(
    fixtureId: string,
    userId: string
  ): Promise<LikeData | null> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/likes/stats/${fixtureId}?userId=${userId}`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return {
        fixtureId,
        totalLikes: data.totalLikes || 0,
        userHasLiked: data.userHasLiked || false
      };
    } catch (error) {
      console.error('Error fetching like stats:', error);
      return null;
    }
  }
}

// ========== ARCHIVE SERVICE ==========

class ArchiveService {
  private static readonly API_BASE_URL = 'https://fanclash-api.onrender.com/api';

  static async archiveVoteActivity(
    userId: string,
    username: string,
    fixtureId: string,
    homeTeam: string,
    awayTeam: string,
    selection: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/archive/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          username,
          fixture_id: fixtureId,
          home_team: homeTeam,
          away_team: awayTeam,
          activity_type: 'vote',
          selection,
          timestamp: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error archiving vote:', error);
      return false;
    }
  }

  static async archiveLikeActivity(
    userId: string,
    username: string,
    fixtureId: string,
    homeTeam: string,
    awayTeam: string,
    isLiked: boolean
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/archive/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          username,
          fixture_id: fixtureId,
          home_team: homeTeam,
          away_team: awayTeam,
          activity_type: 'like',
          is_liked: isLiked,
          timestamp: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error archiving like:', error);
      return false;
    }
  }

  static async archiveCommentActivity(
    userId: string,
    username: string,
    fixtureId: string,
    homeTeam: string,
    awayTeam: string,
    comment: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/archive/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          username,
          fixture_id: fixtureId,
          home_team: homeTeam,
          away_team: awayTeam,
          activity_type: 'comment',
          comment,
          timestamp: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error archiving comment:', error);
      return false;
    }
  }
}

// ========== NOTIFICATION SERVICE ==========

class NotificationService {
  static async sendNotification(
    userId: string,
    notificationType: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    try {
      // In a real app, this would send to a notification service
      console.log(`📱 Notification to ${userId}:`, { title, body, data });
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }
}

// ========== LOCAL STORAGE MANAGER ==========

class LocalStorageManager {
  private static readonly VOTES_KEY = 'user_votes';
  private static readonly LIKES_KEY = 'user_likes';
  private static readonly METADATA_KEY = 'game_metadata';
  private static readonly FIXTURES_CACHE_KEY = 'fixtures_cache';
  private static readonly FIXTURES_TIMESTAMP_KEY = 'fixtures_timestamp';

  static saveVote(userId: string, fixtureId: string, selection: string): void {
    try {
      const key = `${this.VOTES_KEY}_${userId}`;
      const existing = localStorage.getItem(key);
      const votes = existing ? JSON.parse(existing) : {};
      votes[fixtureId] = selection;
      localStorage.setItem(key, JSON.stringify(votes));
    } catch (error) {
      console.error('Error saving vote:', error);
    }
  }

  static loadVotesForUser(userId: string): Map<string, string> {
    try {
      const key = `${this.VOTES_KEY}_${userId}`;
      const existing = localStorage.getItem(key);
      const votes = existing ? JSON.parse(existing) : {};
      return new Map(Object.entries(votes));
    } catch (error) {
      console.error('Error loading votes:', error);
      return new Map();
    }
  }

  static saveLike(userId: string, fixtureId: string, isLiked: boolean): void {
    try {
      const key = `${this.LIKES_KEY}_${userId}`;
      const existing = localStorage.getItem(key);
      const likes = existing ? new Set(JSON.parse(existing)) : new Set<string>();

      if (isLiked) {
        likes.add(fixtureId);
      } else {
        likes.delete(fixtureId);
      }

      localStorage.setItem(key, JSON.stringify(Array.from(likes)));
    } catch (error) {
      console.error('Error saving like:', error);
    }
  }

  static loadLikesForUser(userId: string): Set<string> {
    try {
      const key = `${this.LIKES_KEY}_${userId}`;
      const existing = localStorage.getItem(key);
      return existing ? new Set(JSON.parse(existing)) : new Set();
    } catch (error) {
      console.error('Error loading likes:', error);
      return new Set();
    }
  }

  static saveGameMetadata(metadata: GameMetadata): void {
    try {
      const key = `${this.METADATA_KEY}_${metadata.userId}`;
      const existing = localStorage.getItem(key);
      const metadataList = existing ? JSON.parse(existing) : [];

      const index = metadataList.findIndex(
        (m: GameMetadata) => m.fixtureId === metadata.fixtureId
      );

      if (index >= 0) {
        metadataList[index] = metadata;
      } else {
        metadataList.push(metadata);
      }

      localStorage.setItem(key, JSON.stringify(metadataList));
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  }

  static loadUserGameMetadata(userId: string): GameMetadata[] {
    try {
      const key = `${this.METADATA_KEY}_${userId}`;
      const existing = localStorage.getItem(key);
      return existing ? JSON.parse(existing) : [];
    } catch (error) {
      console.error('Error loading metadata:', error);
      return [];
    }
  }

  static getGameMetadata(fixtureId: string, userId: string): GameMetadata | null {
    try {
      const key = `${this.METADATA_KEY}_${userId}`;
      const existing = localStorage.getItem(key);
      if (!existing) return null;

      const metadataList = JSON.parse(existing);
      return metadataList.find((m: GameMetadata) => m.fixtureId === fixtureId) || null;
    } catch (error) {
      console.error('Error getting metadata:', error);
      return null;
    }
  }

  static saveFixturesToCache(fixtures: FixtureProps[]): void {
    try {
      localStorage.setItem(this.FIXTURES_CACHE_KEY, JSON.stringify(fixtures));
      localStorage.setItem(this.FIXTURES_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving fixtures to cache:', error);
    }
  }

  static loadFixturesFromCache(): FixtureProps[] | null {
    try {
      const cached = localStorage.getItem(this.FIXTURES_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error loading fixtures from cache:', error);
      return null;
    }
  }

  static shouldRefreshCache(): boolean {
    try {
      const timestamp = localStorage.getItem(this.FIXTURES_TIMESTAMP_KEY);
      if (!timestamp) return true;

      const cacheTime = parseInt(timestamp);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      return now - cacheTime > fiveMinutes;
    } catch (error) {
      console.error('Error checking cache age:', error);
      return true;
    }
  }
}

// ========== TOAST HELPER ==========

class ToastHelper {
  static showSuccess(
    toast: any,
    title: string,
    description?: string,
    duration: number = 3000
  ): void {
    toast({
      title,
      description,
      duration,
      className: "bg-emerald-500/20 border-emerald-500 text-emerald-400",
    });
  }

  static showError(
    toast: any,
    title: string,
    description?: string,
    duration: number = 4000
  ): void {
    toast({
      title,
      description,
      variant: "destructive",
      duration,
    });
  }

  static showInfo(
    toast: any,
    title: string,
    description?: string,
    duration: number = 3000
  ): void {
    toast({
      title,
      description,
      duration,
      className: "bg-blue-500/20 border-blue-500 text-blue-400",
    });
  }

  static showWarning(
    toast: any,
    title: string,
    description?: string,
    duration: number = 3500
  ): void {
    toast({
      title,
      description,
      duration,
      className: "bg-yellow-500/20 border-yellow-500 text-yellow-400",
    });
  }
}

// ========== VOTERS POPUP COMPONENT ==========

const VotersPopup: React.FC<VotersPopupProps> = ({
  type,
  fixtureId,
  voters,
  onClose,
  onVote
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const getVoteColor = (selection: string): string => {
    if (selection === 'home_team') return 'text-emerald-400';
    if (selection === 'away_team') return 'text-blue-400';
    if (selection === 'draw') return 'text-purple-400';
    return 'text-gray-400';
  };

  const getVoteBg = (selection: string): string => {
    if (selection === 'home_team') return 'bg-emerald-500/10';
    if (selection === 'away_team') return 'bg-blue-500/10';
    if (selection === 'draw') return 'bg-purple-500/10';
    return 'bg-gray-500/10';
  };

  const getVoteText = (selection: string): string => {
    if (selection === 'home_team') return 'home';
    if (selection === 'away_team') return 'away';
    if (selection === 'draw') return 'draw';
    return selection;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        ref={popupRef}
        className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-gray-800 w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            {type === 'supporters' ? (
              <>
                <Shield className="h-5 w-5 text-emerald-400" />
                <span>Supporters</span>
                <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {voters.length}
                </Badge>
              </>
            ) : (
              <>
                <Sword className="h-5 w-5 text-red-400" />
                <span>Rivals</span>
                <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30">
                  {voters.length}
                </Badge>
              </>
            )}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4 custom-scrollbar">
          {voters.length > 0 ? (
            <div className="space-y-2">
              {voters.map((voter) => (
                <div
                  key={voter.userId}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group"
                >
                  {FootballAvatarManager.buildAvatar(
                    voter.userId,
                    voter.username,
                    40
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium truncate">{voter.username}</p>
                      {voter.badge && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] px-1.5">
                          ⭐ {voter.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full",
                        getVoteBg(voter.selection),
                        getVoteColor(voter.selection)
                      )}>
                        {getVoteText(voter.selection)}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {DateHelper.formatTimeAgo(voter.votedAt)}
                      </span>
                    </div>
                  </div>

                  {onVote && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onVote(voter.userId)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <h4 className="text-white font-medium mb-1">No voters yet</h4>
              <p className="text-sm text-gray-400">Be the first to predict this match!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== MATCH STATISTICS COMPONENT ==========

interface MatchStatisticsProps {
  statistics: MatchStatistics;
  homeTeam: string;
  awayTeam: string;
}

const MatchStatistics: React.FC<MatchStatisticsProps> = ({
  statistics,
  homeTeam,
  awayTeam
}) => {
  const statsItems = [
    { label: 'Possession', home: statistics.possession.home, away: statistics.possession.away, unit: '%' },
    { label: 'Shots', home: statistics.shots.home, away: statistics.shots.away },
    { label: 'Shots on Target', home: statistics.shotsOnTarget.home, away: statistics.shotsOnTarget.away },
    { label: 'Shots off Target', home: statistics.shotsOffTarget.home, away: statistics.shotsOffTarget.away },
    { label: 'Blocked Shots', home: statistics.blockedShots.home, away: statistics.blockedShots.away },
    { label: 'Corners', home: statistics.corners.home, away: statistics.corners.away },
    { label: 'Offsides', home: statistics.offsides.home, away: statistics.offsides.away },
    { label: 'Fouls', home: statistics.fouls.home, away: statistics.fouls.away },
    { label: 'Yellow Cards', home: statistics.yellowCards.home, away: statistics.yellowCards.away },
    { label: 'Red Cards', home: statistics.redCards.home, away: statistics.redCards.away },
    { label: 'Passes', home: statistics.passes.home, away: statistics.passes.away },
    { label: 'Pass Accuracy', home: statistics.passAccuracy.home, away: statistics.passAccuracy.away, unit: '%' },
    { label: 'Tackles', home: statistics.tackles.home, away: statistics.tackles.away },
    { label: 'Interceptions', home: statistics.interceptions.home, away: statistics.interceptions.away },
    { label: 'Clearances', home: statistics.clearances.home, away: statistics.clearances.away },
    { label: 'Saves', home: statistics.saves.home, away: statistics.saves.away },
  ];

  const getHomeAbbr = (name: string) => name.substring(0, 3).toUpperCase();
  const getAwayAbbr = (name: string) => name.substring(0, 3).toUpperCase();

  return (
    <div className="space-y-4 p-2">
      {statsItems.map((stat, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>{getHomeAbbr(homeTeam)}</span>
            <span className="font-medium text-gray-300">{stat.label}</span>
            <span>{getAwayAbbr(awayTeam)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white w-8 text-right">
              {stat.home}{stat.unit}
            </span>

            <div className="flex-1 flex gap-0.5 h-2">
              <div
                className="bg-emerald-500 rounded-l-full"
                style={{ width: `${(stat.home / (stat.home + stat.away)) * 100}%` }}
              />
              <div
                className="bg-red-500 rounded-r-full"
                style={{ width: `${(stat.away / (stat.home + stat.away)) * 100}%` }}
              />
            </div>

            <span className="text-sm font-semibold text-white w-8">
              {stat.away}{stat.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ========== MATCH TIMELINE COMPONENT ==========

interface MatchTimelineProps {
  events: MatchEvent[];
  homeTeam: string;
  awayTeam: string;
}

const MatchTimeline: React.FC<MatchTimelineProps> = ({ events, homeTeam, awayTeam }) => {
  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute);

  const getEventIcon = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal':
        return <Trophy className="h-4 w-4 text-yellow-400" />;
      case 'penalty':
        return <Target className="h-4 w-4 text-yellow-400" />;
      case 'ownGoal':
        return <AlertCircle className="h-4 w-4 text-orange-400" />;
      case 'yellowCard':
        return <Square className="h-4 w-4 text-yellow-400 fill-yellow-400" />;
      case 'redCard':
        return <Square className="h-4 w-4 text-red-500 fill-red-500" />;
      case 'substitution':
        return <Square className="h-4 w-4 text-blue-400" />;
      case 'var':
        return <Eye className="h-4 w-4 text-purple-400" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-2 p-2">
      {sortedEvents.map((event) => (
        <div
          key={event.id}
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg",
            event.team === 'home' ? 'justify-start' : 'justify-end'
          )}
        >
          {event.team === 'home' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                  {getEventIcon(event.type)}
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{event.player}</p>
                  <p className="text-xs text-gray-400">
                    {event.minute}'{event.addedTime ? `+${event.addedTime}` : ''} • {event.type}
                  </p>
                </div>
              </div>
            </>
          )}

          {event.team === 'away' && (
            <>
              <div className="flex items-center gap-2">
                <div className="text-left">
                  <p className="text-sm text-white">{event.player}</p>
                  <p className="text-xs text-gray-400">
                    {event.minute}'{event.addedTime ? `+${event.addedTime}` : ''} • {event.type}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                  {getEventIcon(event.type)}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

// ========== VOTING MODAL COMPONENT ==========

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: FixtureProps;
  voteData: {
    homeVotes: number;
    awayVotes: number;
    drawVotes: number;
  };
  onVote: (selection: string) => void;
  userId: string;
  username: string;
}

const VotingModal: React.FC<VotingModalProps> = ({
  isOpen,
  onClose,
  fixture,
  voteData,
  onVote,
  userId,
  username
}) => {
  const [selectedVote, setSelectedVote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const totalVotes = voteData.homeVotes + voteData.awayVotes + voteData.drawVotes;
  const homePercent = totalVotes > 0 ? (voteData.homeVotes / totalVotes) * 100 : 0;
  const awayPercent = totalVotes > 0 ? (voteData.awayVotes / totalVotes) * 100 : 0;
  const drawPercent = totalVotes > 0 ? (voteData.drawVotes / totalVotes) * 100 : 0;

  const handleVote = async () => {
    if (!selectedVote) {
      ToastHelper.showWarning(toast, 'Select an outcome', 'Please choose your prediction');
      return;
    }

    setIsSubmitting(true);
    try {
      onVote(selectedVote);
      onClose();
    } catch (error) {
      ToastHelper.showError(toast, 'Vote Failed', 'Unable to submit your vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-400" />
            Vote on Match
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {fixture.home_team} vs {fixture.away_team}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Current Vote Distribution */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Current Predictions</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400">{fixture.home_team}</span>
                  <span className="text-gray-400">{voteData.homeVotes} votes</span>
                </div>
                <Progress value={homePercent} className="h-2 bg-gray-800">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${homePercent}%` }} />
                </Progress>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-purple-400">Draw</span>
                  <span className="text-gray-400">{voteData.drawVotes} votes</span>
                </div>
                <Progress value={drawPercent} className="h-2 bg-gray-800">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${drawPercent}%` }} />
                </Progress>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-400">{fixture.away_team}</span>
                  <span className="text-gray-400">{voteData.awayVotes} votes</span>
                </div>
                <Progress value={awayPercent} className="h-2 bg-gray-800">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${awayPercent}%` }} />
                </Progress>
              </div>
            </div>
          </div>

          {/* Vote Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Cast Your Vote</h4>
            <RadioGroup value={selectedVote} onValueChange={setSelectedVote} className="gap-2">
              <div
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                  selectedVote === 'home_team'
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-gray-800 hover:border-gray-700"
                )}
                onClick={() => setSelectedVote('home_team')}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="home_team" id="home" className="border-emerald-500 text-emerald-500" />
                  <Label htmlFor="home" className="text-white cursor-pointer">{fixture.home_team}</Label>
                </div>
                <span className="text-sm font-bold text-emerald-400">{fixture.home_win}</span>
              </div>

              <div
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                  selectedVote === 'draw'
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-800 hover:border-gray-700"
                )}
                onClick={() => setSelectedVote('draw')}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="draw" id="draw" className="border-purple-500 text-purple-500" />
                  <Label htmlFor="draw" className="text-white cursor-pointer">Draw</Label>
                </div>
                <span className="text-sm font-bold text-purple-400">{fixture.draw}</span>
              </div>

              <div
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                  selectedVote === 'away_team'
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-800 hover:border-gray-700"
                )}
                onClick={() => setSelectedVote('away_team')}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="away_team" id="away" className="border-blue-500 text-blue-500" />
                  <Label htmlFor="away" className="text-white cursor-pointer">{fixture.away_team}</Label>
                </div>
                <span className="text-sm font-bold text-blue-400">{fixture.away_win}</span>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-400 hover:text-white">
            Cancel
          </Button>
          <Button
            onClick={handleVote}
            disabled={!selectedVote || isSubmitting}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Submit Vote'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ========== COMMENT ITEM COMPONENT ==========

interface CommentItemProps {
  comment: Comment;
  fixture: FixtureProps;
  onReply?: (commentId: string, content: string) => void;
  onLike?: (commentId: string) => void;
  onDislike?: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  fixture,
  onReply,
  onLike,
  onDislike
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const timeAgo = DateHelper.formatTimeAgo(comment.timestamp);

  const getVoteColor = (selection?: string): string => {
    if (selection === 'home_team') return 'text-emerald-400 bg-emerald-500/10';
    if (selection === 'away_team') return 'text-blue-400 bg-blue-500/10';
    if (selection === 'draw') return 'text-purple-400 bg-purple-500/10';
    return 'text-gray-400 bg-gray-500/10';
  };

  const getVoteText = (selection?: string): string => {
    if (selection === 'home_team') return 'home';
    if (selection === 'away_team') return 'away';
    if (selection === 'draw') return 'draw';
    return '';
  };

  const handleReply = () => {
    if (replyText.trim() && onReply) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {FootballAvatarManager.buildAvatar(comment.userId, comment.username, 28)}

        <div className="flex-1">
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-white">{comment.username}</span>
              <span className="text-xs text-gray-500">{timeAgo}</span>
              {comment.edited && (
                <span className="text-[10px] text-gray-600">(edited)</span>
              )}
            </div>

            <p className="text-sm text-gray-300 mb-2">{comment.comment}</p>

            {comment.selection && (
              <Badge className={cn("text-[10px] px-1.5 py-0", getVoteColor(comment.selection))}>
                voted: {getVoteText(comment.selection)}
              </Badge>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onLike?.(comment.id)}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <span className="text-xs text-gray-400">{comment.likes}</span>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onDislike?.(comment.id)}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
              <span className="text-xs text-gray-400">{comment.dislikes}</span>

              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                Reply
              </Button>
            </div>
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-2 ml-8 flex gap-2">
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 h-8 text-xs bg-gray-900/50 border-gray-800"
              />
              <Button
                size="sm"
                className="h-8"
                onClick={handleReply}
                disabled={!replyText.trim()}
              >
                Post
              </Button>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 mt-2 space-y-2">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  fixture={fixture}
                  onReply={onReply}
                  onLike={onLike}
                  onDislike={onDislike}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== COMMENTS SECTION COMPONENT ==========

interface CommentsSectionProps {
  fixtureId: string;
  fixture: FixtureProps;
  comments: Comment[];
  loading: boolean;
  userHasVoted: boolean;
  userSelection?: string | null;
  onAddComment: (comment: string) => void;
  onReply?: (commentId: string, content: string) => void;
  onLike?: (commentId: string) => void;
  onDislike?: (commentId: string) => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  fixtureId,
  fixture,
  comments,
  loading,
  userHasVoted,
  userSelection,
  onAddComment,
  onReply,
  onLike,
  onDislike
}) => {
  const [newComment, setNewComment] = useState('');
  const [showAll, setShowAll] = useState(false);

  const displayComments = showAll ? comments : comments.slice(0, 2);

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Comment Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={userHasVoted ? "Write a comment..." : "Vote first to comment"}
            disabled={!userHasVoted}
            className={cn(
              "bg-gray-900/50 border-gray-800",
              !userHasVoted && "opacity-50 cursor-not-allowed"
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!userHasVoted || !newComment.trim()}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          Post
        </Button>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          {displayComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              fixture={fixture}
              onReply={onReply}
              onLike={onLike}
              onDislike={onDislike}
            />
          ))}

          {comments.length > 2 && !showAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(true)}
              className="w-full text-emerald-400 hover:text-emerald-300"
            >
              View {comments.length - 2} more comments
            </Button>
          )}

          {comments.length === 0 && (
            <div className="text-center py-4">
              <MessageCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No comments yet</p>
              {userHasVoted && (
                <p className="text-xs text-gray-500">Be the first to comment!</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ========== MATCH CARD COMPONENT ==========

interface MatchCardProps {
  fixture: FixtureProps;
  userData: UserDataFromBackend | null;
  setUserData: React.Dispatch<React.SetStateAction<UserDataFromBackend | null>>;
  voteData?: FixtureVoteData;
  userVotes: Map<string, string>;
  userLikes: Set<string>;
  likeCounts: Map<string, number>;
  comments: Map<string, Comment[]>;
  onVote: (fixtureId: string, selection: string) => void;
  onLike: (fixtureId: string) => void;
  onComment: (fixtureId: string, comment: string) => void;
  onViewSupporters: (fixtureId: string) => void;
  onViewRivals: (fixtureId: string) => void;
}

function MatchCard({
  fixture,
  userData,
  setUserData,
  voteData,
  userVotes,
  userLikes,
  likeCounts,
  comments,
  onVote,
  onLike,
  onComment,
  onViewSupporters,
  onViewRivals
}: MatchCardProps) {
  const [selectedBet, setSelectedBet] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const { toast } = useToast();

  const fixtureId = fixture._id || '';
  const userVote = userVotes.get(fixtureId);
  const hasVoted = !!userVote;
  const isLiked = userLikes.has(fixtureId);
  const likeCount = likeCounts.get(fixtureId) || Math.floor(Math.random() * 50) + 20;
  const fixtureComments = comments.get(fixtureId) || [];

  const isLive = () => {
    const date = new Date(fixture.date);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 2 && diffHours >= -2;
  };

  const getStatusColor = (): string => {
    if (isLive()) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (new Date(fixture.date) > new Date()) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  };

  const getStatusText = (): string => {
    if (isLive()) return '🔴 LIVE';
    if (new Date(fixture.date) > new Date()) return '⏳ UPCOMING';
    return '✅ FINISHED';
  };

  const getVoteColor = (selection: string): string => {
    if (selection === 'home_team') return 'text-emerald-400';
    if (selection === 'away_team') return 'text-blue-400';
    if (selection === 'draw') return 'text-purple-400';
    return 'text-gray-400';
  };

  const getVoteBg = (selection: string): string => {
    if (selection === 'home_team') return 'bg-emerald-500/10';
    if (selection === 'away_team') return 'bg-blue-500/10';
    if (selection === 'draw') return 'bg-purple-500/10';
    return 'bg-gray-500/10';
  };

  const handleBetPlacement = async () => {
    if (!selectedBet || !betAmount) {
      ToastHelper.showWarning(toast, 'Incomplete Bet', 'Select outcome and enter stake');
      return;
    }

    const betAmountNum = Number(betAmount);
    if (betAmountNum <= 0 || isNaN(betAmountNum)) {
      ToastHelper.showError(toast, 'Invalid Amount', 'Please enter a valid bet amount');
      return;
    }

    if (!userData?.user_id || !userData?.username) {
      ToastHelper.showError(toast, 'Authentication Error', 'Please complete your profile first');
      return;
    }

    if (userData.balance < betAmountNum) {
      ToastHelper.showError(
        toast,
        'Insufficient Balance',
        `You need Ksh ${betAmountNum} but only have Ksh ${userData.balance}`
      );
      return;
    }

    setIsProcessing(true);

    try {
      let selection: string;
      switch (selectedBet) {
        case "homeTeam":
          selection = "home_team";
          break;
        case "awayTeam":
          selection = "away_team";
          break;
        default:
          selection = "draw";
      }

      const pledgeData: PledgeData = {
        username: userData.username,
        phone: userData.phone,
        selection: selection,
        amount: betAmountNum,
        fan: userData.club_fan || "user",
        home_team: fixture.home_team,
        away_team: fixture.away_team,
        starter_id: userData.user_id,
      };

      const betResponse = await fetch(`https://fanclash-api.onrender.com/api/pledges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pledgeData),
      });

      if (!betResponse.ok) {
        const errorData = await betResponse.json();
        throw new Error(errorData.error || `HTTP error! status: ${betResponse.status}`);
      }

      const newBalance = userData.balance - betAmountNum;

      const updateResponse = await fetch(`https://fanclash-api.onrender.com/api/profile/update-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userData.user_id, balance: newBalance }),
      });

      if (updateResponse.ok) {
        const updatedUser = await updateResponse.json();
        const updatedUserData = { ...userData, balance: updatedUser.balance || newBalance };
        setUserData(updatedUserData);
        localStorage.setItem('userProfile', JSON.stringify(updatedUserData));

        const selectedTeam = selectedBet === "homeTeam" ? fixture.home_team :
          selectedBet === "awayTeam" ? fixture.away_team : "Draw";

        ToastHelper.showSuccess(
          toast,
          '🎯 Bet Placed Successfully!',
          `Ksh ${betAmount} on ${selectedTeam}. New balance: Ksh ${updatedUserData.balance.toLocaleString()}`
        );

        setBetAmount("");
        setSelectedBet("");
        setIsExpanded(false);
      }
    } catch (error) {
      console.error("❌ Error placing bet:", error);
      ToastHelper.showError(
        toast,
        'Bet Failed',
        error instanceof Error ? error.message : "Unable to place bet"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl border border-gray-800/50 p-4 backdrop-blur-sm hover:border-emerald-500/30 transition-all group"
      >
        {/* Match Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              {fixture.league}
            </Badge>
            <Badge className={cn("border", getStatusColor())}>
              {getStatusText()}
            </Badge>
          </div>
          <div className="text-xs text-gray-400">
            {DateHelper.formatDate(fixture.date)}
          </div>
        </div>

        {/* Teams */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="text-center w-2/5">
              <div className={cn(
                "w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 flex items-center justify-center mx-auto mb-1 transition-colors",
                userVote === 'home_team' ? 'border-emerald-500' : 'border-emerald-500/30 group-hover:border-emerald-500/50'
              )}>
                <span className="font-bold text-emerald-300">
                  {fixture.home_team.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate">{fixture.home_team}</p>
              {userVote === 'home_team' && (
                <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                  Your pick
                </Badge>
              )}
            </div>

            {/* VS with Sword */}
            <div className="px-2">
              <div className="bg-gray-900 rounded-full p-2 w-10 h-10 flex items-center justify-center border border-gray-800">
                <Sword className="w-5 h-5 text-emerald-500/70" />
              </div>
            </div>

            {/* Away Team */}
            <div className="text-center w-2/5">
              <div className={cn(
                "w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 flex items-center justify-center mx-auto mb-1 transition-colors",
                userVote === 'away_team' ? 'border-blue-500' : 'border-emerald-500/30 group-hover:border-emerald-500/50'
              )}>
                <span className="font-bold text-emerald-300">
                  {fixture.away_team.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate">{fixture.away_team}</p>
              {userVote === 'away_team' && (
                <Badge className="mt-1 bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                  Your pick
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Odds */}
        <div className="mb-3">
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant={selectedBet === "homeTeam" ? "default" : "outline"}
              onClick={() => setSelectedBet("homeTeam")}
              className={cn(
                "rounded-lg font-medium py-2 transition-all",
                selectedBet === "homeTeam"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                  : "border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-white bg-gray-900/30",
                hasVoted && userVote !== 'home_team' && "opacity-50 cursor-not-allowed"
              )}
              disabled={hasVoted && userVote !== 'home_team'}
            >
              <div className="text-center">
                <div className="text-[10px]">1</div>
                <div className="text-sm font-bold text-emerald-400">{fixture.home_win}</div>
              </div>
            </Button>

            <Button
              variant={selectedBet === "draw" ? "default" : "outline"}
              onClick={() => setSelectedBet("draw")}
              className={cn(
                "rounded-lg font-medium py-2 transition-all",
                selectedBet === "draw"
                  ? "bg-purple-500 hover:bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20"
                  : "border-gray-700 hover:border-purple-500 text-gray-400 hover:text-white bg-gray-900/30",
                hasVoted && userVote !== 'draw' && "opacity-50 cursor-not-allowed"
              )}
              disabled={hasVoted && userVote !== 'draw'}
            >
              <div className="text-center">
                <div className="text-[10px]">X</div>
                <div className="text-sm font-bold text-purple-400">{fixture.draw}</div>
              </div>
            </Button>

            <Button
              variant={selectedBet === "awayTeam" ? "default" : "outline"}
              onClick={() => setSelectedBet("awayTeam")}
              className={cn(
                "rounded-lg font-medium py-2 transition-all",
                selectedBet === "awayTeam"
                  ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                  : "border-gray-700 hover:border-blue-500 text-gray-400 hover:text-white bg-gray-900/30",
                hasVoted && userVote !== 'away_team' && "opacity-50 cursor-not-allowed"
              )}
              disabled={hasVoted && userVote !== 'away_team'}
            >
              <div className="text-center">
                <div className="text-[10px]">2</div>
                <div className="text-sm font-bold text-blue-400">{fixture.away_win}</div>
              </div>
            </Button>
          </div>

          {/* Vote Stats - Click to open voting modal */}
          {voteData && (
            <div
              onClick={() => setShowVotingModal(true)}
              className="mt-2 p-2 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>{voteData.supporters.length} supporters</span>
                <span>{voteData.rivals.length} rivals</span>
              </div>
              <div className="flex gap-0.5 h-1.5">
                <div
                  className="bg-emerald-500 rounded-l-full"
                  style={{ width: `${voteData.supporters.length * 10}%` }}
                />
                <div
                  className="bg-red-500 rounded-r-full"
                  style={{ width: `${voteData.rivals.length * 10}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-gray-400 hover:text-white mb-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              {hasVoted ? 'View details & comments' : 'Place bet & view details'}
            </>
          )}
        </Button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {/* Betting Section - Only show if user hasn't voted */}
              {!hasVoted && selectedBet && (
                <div className="mb-4 p-3 bg-gray-800/30 rounded-lg">
                  <div className="relative mb-2">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      placeholder="Enter stake amount..."
                      className="pl-8 bg-gray-900/50 border-gray-700"
                      disabled={isProcessing}
                    />
                  </div>

                  {/* Quick Stake Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {["100", "500", "1000", "5000"].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount(amount)}
                        className="border-gray-700 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 text-xs py-1"
                        disabled={isProcessing}
                      >
                        Ksh {parseInt(amount).toLocaleString()}
                      </Button>
                    ))}
                  </div>

                  {/* Bet Button */}
                  <Button
                    onClick={handleBetPlacement}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={!betAmount || isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      `Place Bet Ksh ${betAmount ? parseInt(betAmount).toLocaleString() : '...'}`
                    )}
                  </Button>

                  {/* Balance Info */}
                  {userData && (
                    <div className="mt-2 text-xs text-gray-400 flex justify-between">
                      <span>Balance: Ksh {userData.balance.toLocaleString()}</span>
                      {betAmount && (
                        <span className={Number(betAmount) > userData.balance ? "text-red-400" : "text-emerald-400"}>
                          After: Ksh {(userData.balance - Number(betAmount)).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* User's Vote Info - Show if user has voted */}
              {hasVoted && (
                <div className={cn(
                  "mb-4 p-3 rounded-lg flex items-center justify-between",
                  getVoteBg(userVote!)
                )}>
                  <div className="flex items-center gap-2">
                    <Check className={cn("h-4 w-4", getVoteColor(userVote!))} />
                    <span className="text-sm text-white">You voted:</span>
                  </div>
                  <Badge className={cn(getVoteBg(userVote!), getVoteColor(userVote!), "border-0")}>
                    {userVote === 'home_team' ? fixture.home_team :
                      userVote === 'away_team' ? fixture.away_team : 'Draw'}
                  </Badge>
                </div>
              )}

              {/* Supporters/Rivals Buttons - Show if user has voted */}
              {hasVoted && voteData && (
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewSupporters(fixtureId)}
                    className="flex-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Supporters ({voteData.supporters.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewRivals(fixtureId)}
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Sword className="h-4 w-4 mr-1" />
                    Rivals ({voteData.rivals.length})
                  </Button>
                </div>
              )}

              {/* Comments Section */}
              <CommentsSection
                fixtureId={fixtureId}
                fixture={fixture}
                comments={fixtureComments}
                loading={false}
                userHasVoted={hasVoted}
                userSelection={userVote}
                onAddComment={(comment) => onComment(fixtureId, comment)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800/30">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(fixtureId)}
              className={cn(
                "p-1 text-gray-400 hover:text-pink-500",
                isLiked && "text-pink-500"
              )}
            >
              <HeartIcon className={cn("w-4 h-4", isLiked && "fill-pink-500")} />
              <span className="text-xs ml-1">{likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-emerald-500"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs ml-1">{fixtureComments.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-1 text-gray-400 hover:text-emerald-500"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${fixture.home_team} vs ${fixture.away_team} - ${fixture.league}`
                );
                ToastHelper.showSuccess(toast, 'Copied!', 'Match details copied to clipboard');
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVotingModal(true)}
            className="text-gray-400 hover:text-emerald-500"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            <span className="text-xs">Stats</span>
          </Button>
        </div>
      </motion.div>

      {/* Voting Modal */}
      {showVotingModal && (
        <VotingModal
          isOpen={showVotingModal}
          onClose={() => setShowVotingModal(false)}
          fixture={fixture}
          voteData={{
            homeVotes: voteData?.supporters?.filter(v => v.selection === 'home_team').length || 50,
            awayVotes: voteData?.supporters?.filter(v => v.selection === 'away_team').length || 30,
            drawVotes: voteData?.supporters?.filter(v => v.selection === 'draw').length || 20
          }}
          onVote={(selection) => onVote(fixtureId, selection)}
          userId={userData?.user_id || ''}
          username={userData?.username || ''}
        />
      )}
    </>
  );
}

// ========== FILTER BAR COMPONENT ==========

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onSearch: (query: string) => void;
  totalMatches: number;
  liveCount: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onSearch,
  totalMatches,
  liveCount
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white">Matches</h2>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {totalMatches}
          </Badge>
          {liveCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />
              {liveCount} Live
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange({ ...filters, status: 'all' })}
            className={cn(
              "border-gray-800",
              filters.status === 'all' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            )}
          >
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange({ ...filters, status: 'live' })}
            className={cn(
              "border-gray-800",
              filters.status === 'live' && "bg-red-500/10 text-red-400 border-red-500/30"
            )}
          >
            Live
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange({ ...filters, status: 'upcoming' })}
            className={cn(
              "border-gray-800",
              filters.status === 'upcoming' && "bg-blue-500/10 text-blue-400 border-blue-500/30"
            )}
          >
            Upcoming
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search teams or leagues..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-9 bg-gray-900/50 border-gray-800 focus:border-emerald-500"
        />
      </div>

      <div className="flex gap-2">
        <Select
          value={filters.sortBy}
          onValueChange={(value: any) => onFilterChange({ ...filters, sortBy: value })}
        >
          <SelectTrigger className="flex-1 bg-gray-900/50 border-gray-800">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="odds">Odds</SelectItem>
            <SelectItem value="league">League</SelectItem>
            <SelectItem value="popularity">Popularity</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="border-gray-800 hover:border-emerald-500">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ========== MAIN FIXTURES LIST COMPONENT ==========

const FixturesList = () => {
  const [userData, setUserData] = useState<UserDataFromBackend | null>(null);
  const [fixtures, setFixtures] = useState<FixtureProps[]>([]);
  const [filteredFixtures, setFilteredFixtures] = useState<FixtureProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    competition: 'all',
    status: 'all',
    date: 'all',
    team: 'all',
    sortBy: 'date'
  });

  // Vote/Like/Comment State
  const [userVotes, setUserVotes] = useState<Map<string, string>>(new Map());
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Map<string, number>>(new Map());
  const [voteData, setVoteData] = useState<Map<string, FixtureVoteData>>(new Map());
  const [comments, setComments] = useState<Map<string, Comment[]>>(new Map());
  const [gameMetadata, setGameMetadata] = useState<Map<string, GameMetadata>>(new Map());

  // Popup State
  const [votersPopup, setVotersPopup] = useState<{
    type: 'supporters' | 'rivals';
    fixtureId: string;
    voters: VoteUser[];
  } | null>(null);

  const API_BASE_URL = 'https://fanclash-api.onrender.com/api/games';
  const API_PROFILE_URL = 'https://fanclash-api.onrender.com/api/profile';
  const { toast } = useToast();

  // ========== USER DATA FETCHING ==========

  const fetchUserFromBackend = useCallback(async (): Promise<UserDataFromBackend | null> => {
    try {
      const saved = localStorage.getItem('userProfile');
      let localPhone = '';

      if (saved) {
        try {
          const localData = JSON.parse(saved);
          localPhone = localData.phone || '';
        } catch (error) {
          console.log('Error parsing local data:', error);
        }
      }

      if (!localPhone) return null;

      const cleanPhone = localPhone.replace(/\D/g, '');
      const phoneFormats = [cleanPhone];

      if (cleanPhone.startsWith('0')) {
        phoneFormats.push(cleanPhone.substring(1));
      }

      if (cleanPhone.length === 9) {
        phoneFormats.push('254' + cleanPhone);
      } else if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
        phoneFormats.push('254' + cleanPhone.substring(1));
      }

      for (const phoneFormat of phoneFormats) {
        try {
          const response = await fetch(`${API_PROFILE_URL}/profile/phone/${phoneFormat}`);

          if (response.ok) {
            const backendUser = await response.json();

            return {
              user_id: backendUser.user_id,
              username: backendUser.username || '',
              phone: localPhone,
              balance: backendUser.balance || 0,
              nickname: backendUser.nickname || '',
              club_fan: backendUser.club_fan || '',
              country_fan: backendUser.country_fan || '',
              number_of_bets: backendUser.number_of_bets || 0
            };
          }
        } catch (error) {
          console.log(`Phone format ${phoneFormat} not found:`, error);
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching user from backend:', error);
      return null;
    }
  }, [API_PROFILE_URL]);

  // ========== FIXTURES FETCHING ==========

  const fetchFixtures = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError("");

      // Try cache first if not force refresh
      if (!forceRefresh) {
        const cached = LocalStorageManager.loadFixturesFromCache();
        if (cached && cached.length > 0) {
          setFixtures(cached);
          setFilteredFixtures(cached);
          setLoading(false);

          // Refresh in background if cache is old
          if (LocalStorageManager.shouldRefreshCache()) {
            fetchFixtures(true);
          }
          return;
        }
      }

      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setFixtures(data);
      setFilteredFixtures(data);
      LocalStorageManager.saveFixturesToCache(data);
    } catch (err) {
      console.error("Error fetching fixtures:", err);
      setError("Failed to load matches");

      // Try cache as fallback
      const cached = LocalStorageManager.loadFixturesFromCache();
      if (cached && cached.length > 0) {
        setFixtures(cached);
        setFilteredFixtures(cached);
        ToastHelper.showInfo(toast, 'Offline Mode', 'Showing cached matches');
      } else {
        ToastHelper.showError(toast, 'Connection Error', 'Unable to fetch live matches');
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, toast]);

  // ========== VOTES FETCHING ==========

  const fetchAllVotes = useCallback(async () => {
    try {
      const allVotes = await VoteService.fetchAllVotes();
      const organized = VoteService.organizeVotesByFixture(allVotes, userData?.user_id || '');
      setVoteData(organized);
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  }, [userData?.user_id]);

  const fetchUserVotes = useCallback(async () => {
    if (!userData?.user_id) return;

    try {
      const votes = await VoteService.fetchUserVotes(userData.user_id);
      setUserVotes(votes);

      // Save to local storage
      votes.forEach((selection, fixtureId) => {
        LocalStorageManager.saveVote(userData.user_id, fixtureId, selection);
      });
    } catch (error) {
      console.error('Error fetching user votes:', error);

      // Load from local storage as fallback
      const localVotes = LocalStorageManager.loadVotesForUser(userData.user_id);
      setUserVotes(localVotes);
    }
  }, [userData?.user_id]);

  // ========== LIKES FETCHING ==========

  const fetchUserLikes = useCallback(async () => {
    if (!userData?.user_id) return;

    try {
      const response = await fetch(`${API_PROFILE_URL}/likes/user/${userData.user_id}`);
      if (response.ok) {
        const data = await response.json();
        const likes = new Set<string>();
        const counts = new Map<string, number>();

        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (item.fixtureId && item.liked) {
              likes.add(item.fixtureId);
            }
            if (item.fixtureId && item.count) {
              counts.set(item.fixtureId, item.count);
            }
          });
        }

        setUserLikes(likes);
        setLikeCounts(counts);

        // Save to local storage
        likes.forEach(fixtureId => {
          LocalStorageManager.saveLike(userData.user_id, fixtureId, true);
        });
      }
    } catch (error) {
      console.error('Error fetching user likes:', error);

      // Load from local storage as fallback
      const localLikes = LocalStorageManager.loadLikesForUser(userData.user_id);
      setUserLikes(localLikes);
    }
  }, [userData?.user_id, API_PROFILE_URL]);

  // ========== COMMENTS FETCHING ==========

  const fetchAllComments = useCallback(async () => {
    try {
      const commentsMap = await CommentService.fetchAllCommentsBulk();
      setComments(commentsMap);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, []);

  // ========== METADATA LOADING ==========

  const loadGameMetadata = useCallback(() => {
    if (!userData?.user_id) return;

    const metadata = LocalStorageManager.loadUserGameMetadata(userData.user_id);
    const metadataMap = new Map<string, GameMetadata>();
    metadata.forEach(m => metadataMap.set(m.fixtureId, m));
    setGameMetadata(metadataMap);
  }, [userData?.user_id]);

  // ========== INITIAL LOAD ==========

  useEffect(() => {
    const loadInitialData = async () => {
      setUserLoading(true);
      try {
        const backendUser = await fetchUserFromBackend();
        setUserData(backendUser);

        if (backendUser) {
          // Load all data in parallel
          await Promise.all([
            fetchFixtures(),
            fetchUserVotes(),
            fetchUserLikes(),
            fetchAllVotes(),
            fetchAllComments(),
          ]);

          loadGameMetadata();
        } else {
          // Still load fixtures even without user
          await fetchFixtures();
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setUserLoading(false);
      }
    };

    loadInitialData();
  }, [fetchFixtures, fetchUserFromBackend, fetchUserVotes, fetchUserLikes, fetchAllVotes, fetchAllComments, loadGameMetadata]);

  // ========== FILTERING ==========

  useEffect(() => {
    let filtered = [...fixtures];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(f => {
        const date = new Date(f.date);
        const now = new Date();
        const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (filters.status === 'live') {
          return diffHours >= -2 && diffHours <= 2;
        } else if (filters.status === 'upcoming') {
          return diffHours > 2;
        }
        return true;
      });
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        f.home_team.toLowerCase().includes(query) ||
        f.away_team.toLowerCase().includes(query) ||
        f.league.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (filters.sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (filters.sortBy === 'odds') {
        const maxOddsA = Math.max(parseFloat(a.home_win), parseFloat(a.away_win), parseFloat(a.draw));
        const maxOddsB = Math.max(parseFloat(b.home_win), parseFloat(b.away_win), parseFloat(b.draw));
        return maxOddsB - maxOddsA;
      } else if (filters.sortBy === 'league') {
        return a.league.localeCompare(b.league);
      }
      return 0;
    });

    setFilteredFixtures(filtered);
  }, [fixtures, filters, searchQuery]);

  // ========== HANDLERS ==========

  const handleVote = useCallback(async (fixtureId: string, selection: string) => {
    if (!userData?.user_id || !userData?.username) {
      ToastHelper.showError(toast, 'Authentication Required', 'Please log in to vote');
      return;
    }

    if (userVotes.has(fixtureId)) {
      ToastHelper.showWarning(toast, 'Already Voted', 'You have already voted for this match');
      return;
    }

    try {
      const voteData = {
        voterId: userData.user_id,
        username: userData.username,
        fixtureId,
        homeTeam: fixtures.find(f => f._id === fixtureId)?.home_team || '',
        awayTeam: fixtures.find(f => f._id === fixtureId)?.away_team || '',
        selection,
        voteTimestamp: new Date().toISOString(),
      };

      const response = await fetch(`https://fanclash-api.onrender.com/api/votes/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voteData),
      });

      if (response.ok) {
        // Update local state
        setUserVotes(prev => new Map(prev).set(fixtureId, selection));
        LocalStorageManager.saveVote(userData.user_id, fixtureId, selection);

        // Update vote data
        setVoteData(prev => {
          const newData = new Map(prev);
          const existing = newData.get(fixtureId);
          if (existing) {
            newData.set(fixtureId, {
              ...existing,
              currentUserSelection: selection
            });
          }
          return newData;
        });

        // Archive activity
        await ArchiveService.archiveVoteActivity(
          userData.user_id,
          userData.username,
          fixtureId,
          voteData.homeTeam,
          voteData.awayTeam,
          selection
        );

        // Save metadata
        const fixture = fixtures.find(f => f._id === fixtureId);
        if (fixture) {
          const metadata: GameMetadata = {
            fixtureId,
            userId: userData.user_id,
            username: userData.username,
            homeTeam: fixture.home_team,
            awayTeam: fixture.away_team,
            league: fixture.league,
            date: fixture.date,
            selection,
            homeOdds: parseFloat(fixture.home_win),
            drawOdds: parseFloat(fixture.draw),
            awayOdds: parseFloat(fixture.away_win),
            votedAt: new Date().toISOString(),
            isActive: true,
            potentialWinnings: 0
          };
          setGameMetadata(prev => new Map(prev).set(fixtureId, metadata));
          LocalStorageManager.saveGameMetadata(metadata);
        }

        // Refresh votes
        fetchAllVotes();

        ToastHelper.showSuccess(toast, 'Vote Recorded!', `You voted: ${selection}`);
      } else {
        ToastHelper.showError(toast, 'Vote Failed', 'Unable to submit your vote');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      ToastHelper.showError(toast, 'Vote Failed', 'Network error occurred');
    }
  }, [userData, userVotes, fixtures, fetchAllVotes, toast]);

  const handleLike = useCallback(async (fixtureId: string) => {
    if (!userData?.user_id || !userData?.username) {
      ToastHelper.showError(toast, 'Authentication Required', 'Please log in to like');
      return;
    }

    const isLiked = userLikes.has(fixtureId);

    try {
      const likeData = await LikeService.toggleLike(
        userData.user_id,
        userData.username,
        fixtureId,
        isLiked
      );

      if (likeData) {
        // Update local state
        setUserLikes(prev => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.delete(fixtureId);
          } else {
            newSet.add(fixtureId);
          }
          return newSet;
        });

        setLikeCounts(prev => new Map(prev).set(fixtureId, likeData.totalLikes));
        LocalStorageManager.saveLike(userData.user_id, fixtureId, !isLiked);

        // Archive activity
        const fixture = fixtures.find(f => f._id === fixtureId);
        if (fixture) {
          await ArchiveService.archiveLikeActivity(
            userData.user_id,
            userData.username,
            fixtureId,
            fixture.home_team,
            fixture.away_team,
            !isLiked
          );
        }

        ToastHelper.showSuccess(
          toast,
          isLiked ? 'Like Removed' : 'Liked!',
          isLiked ? '' : 'Match added to your likes'
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      ToastHelper.showError(toast, 'Action Failed', 'Unable to process like');
    }
  }, [userData, userLikes, fixtures, toast]);

  const handleComment = useCallback(async (fixtureId: string, commentText: string) => {
    if (!userData?.user_id || !userData?.username) {
      ToastHelper.showError(toast, 'Authentication Required', 'Please log in to comment');
      return;
    }

    if (!userVotes.has(fixtureId)) {
      ToastHelper.showWarning(toast, 'Vote First', 'You must vote before commenting');
      return;
    }

    const success = await CommentService.postComment(
      userData.user_id,
      userData.username,
      fixtureId,
      commentText,
      userVotes.get(fixtureId)
    );

    if (success) {
      // Refresh comments
      const updatedComments = await CommentService.fetchCommentsForFixture(fixtureId, 5);
      setComments(prev => new Map(prev).set(fixtureId, updatedComments));

      // Archive activity
      const fixture = fixtures.find(f => f._id === fixtureId);
      if (fixture) {
        await ArchiveService.archiveCommentActivity(
          userData.user_id,
          userData.username,
          fixtureId,
          fixture.home_team,
          fixture.away_team,
          commentText
        );
      }

      ToastHelper.showSuccess(toast, 'Comment Posted!');
    } else {
      ToastHelper.showError(toast, 'Comment Failed', 'Unable to post comment');
    }
  }, [userData, userVotes, fixtures, toast]);

  const handleViewSupporters = useCallback((fixtureId: string) => {
    const data = voteData.get(fixtureId);
    if (data) {
      setVotersPopup({
        type: 'supporters',
        fixtureId,
        voters: data.supporters
      });
    }
  }, [voteData]);

  const handleViewRivals = useCallback((fixtureId: string) => {
    const data = voteData.get(fixtureId);
    if (data) {
      setVotersPopup({
        type: 'rivals',
        fixtureId,
        voters: data.rivals
      });
    }
  }, [voteData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchFixtures(true),
        fetchAllVotes(),
        fetchUserLikes(),
        fetchAllComments()
      ]);
      ToastHelper.showSuccess(toast, 'Refreshed!', 'Latest data loaded');
    } catch (error) {
      ToastHelper.showError(toast, 'Refresh Failed', 'Unable to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [fetchFixtures, fetchAllVotes, fetchUserLikes, fetchAllComments, toast]);

  // ========== COMPUTED VALUES ==========

  const liveCount = useMemo(() => {
    return fixtures.filter(f => {
      const date = new Date(f.date);
      const now = new Date();
      const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours >= -2 && diffHours <= 2;
    }).length;
  }, [fixtures]);

  // ========== RENDER ==========

  return (
    <div className="h-full w-full bg-black text-white font-sans overflow-hidden">
      {/* Desktop Header */}
      <div className="hidden lg:block sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">Battle Ground</span>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" className="text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </Button>
                <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search matches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-800 rounded-full text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                />
              </div>

              {/* User Balance */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 rounded-lg border border-emerald-500/20">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs text-emerald-300">Balance</div>
                  <div className="text-sm font-bold text-emerald-400">
                    {userLoading ? "..." : `Ksh ${userData?.balance?.toLocaleString() || '0'}`}
                  </div>
                </div>
              </div>

              {/* User Avatar */}
              {userData ? (
                FootballAvatarManager.buildAvatar(userData.user_id, userData.username, 40)
              ) : (
                <Avatar className="w-10 h-10 border-2 border-emerald-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                    U
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="p-4">
          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onSearch={setSearchQuery}
            totalMatches={filteredFixtures.length}
            liveCount={liveCount}
          />

          {/* Refresh Indicator */}
          {refreshing && (
            <div className="my-2 p-2 bg-gray-900/50 rounded-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
              <span className="text-sm text-gray-400">Refreshing data...</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                <div className="text-emerald-400">Loading matches...</div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && filteredFixtures.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <Zap className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-2">{error}</h3>
              <Button
                onClick={() => handleRefresh()}
                className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Fixtures Grid */}
          {!loading && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
              {filteredFixtures.length === 0 ? (
                <div className="col-span-2 text-center py-20">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                    <Trophy className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">No matches found</h3>
                  <p className="text-gray-400">Try adjusting your filters or check back later</p>
                </div>
              ) : (
                filteredFixtures.map((fixture) => (
                  <MatchCard
                    key={fixture._id}
                    fixture={fixture}
                    userData={userData}
                    setUserData={setUserData}
                    voteData={voteData.get(fixture._id || '')}
                    userVotes={userVotes}
                    userLikes={userLikes}
                    likeCounts={likeCounts}
                    comments={comments}
                    onVote={handleVote}
                    onLike={handleLike}
                    onComment={handleComment}
                    onViewSupporters={handleViewSupporters}
                    onViewRivals={handleViewRivals}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Voters Popup */}
      {votersPopup && (
        <VotersPopup
          type={votersPopup.type}
          fixtureId={votersPopup.fixtureId}
          voters={votersPopup.voters}
          onClose={() => setVotersPopup(null)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800/50 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            <Button variant="ghost" className="text-emerald-400 group">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center bg-emerald-500/10">
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-xs">Home</span>
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
              <Trophy className="w-6 h-6" />
            </Button>

            <Button variant="ghost" className="text-gray-400 hover:text-emerald-500 group">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center group-hover:bg-emerald-500/10">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs">Bets</span>
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

export default FixturesList;