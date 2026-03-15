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
  Heart as HeartIcon, MessageCircle as MessageCircleIcon,
  Share2 as Share2Icon, Users as UsersIcon,
  ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon,
  Loader2 as Loader2Icon, DollarSign as DollarSignIcon,
  Wallet as WalletIcon, Coins as CoinsIcon,
  Trophy as TrophyIcon, Sword as SwordIcon, Shield as ShieldIcon
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ========== TYPES ==========

interface Game {
  _id: string;
  match_id: string;
  home_team: string;
  away_team: string;
  league: string;
  home_win: number;
  away_win: number;
  draw: number;
  date: string;
  time: string;
  home_score?: number;
  away_score?: number;
  status: string;
  is_live: boolean;
  available_for_voting: boolean;
  source: string;
  date_iso: string;
}

interface Pledge {
  _id?: string;
  username: string;
  phone: string;
  selection: string;
  amount: number;
  time: string;
  fan: string;
  home_team: string;
  away_team: string;
  starter_id: string;
  created_at: string;
  updated_at: string;
}

interface CreatePledge {
  username: string;
  phone: string;
  selection: string;
  amount: number;
  fan: string;
  home_team: string;
  away_team: string;
  starter_id: string;
}

interface UserProfile {
  _id?: string;
  user_id: string;
  username: string;
  phone: string;
  nickname: string;
  club_fan: string;
  country_fan: string;
  balance: number;
  number_of_bets: number;
  created_at: string;
  updated_at: string;
}

interface MpesaRequest {
  phone_number: string;
  amount: string;
  account_reference?: string;
  transaction_desc?: string;
}

interface MpesaResponse {
  success?: boolean;
  CheckoutRequestID: string;
  checkout_request_id: string;
  MerchantRequestID: string;
  merchant_request_id: string;
  ResponseCode: string;
  response_code: string;
  ResponseDescription: string;
  response_description: string;
  CustomerMessage: string;
  customer_message: string;
}

interface FilterOptions {
  status: string;
  league: string;
  sortBy: 'date' | 'stake' | 'league';
}

interface Voter {
  userId: string;
  username: string;
  selection: string;
  amount: number;
  time: string;
  fan?: string;
}

interface FixtureVoteData {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  currentUserVote: Pledge | null;
  supporters: Voter[];
  rivals: Voter[];
  totalStaked: {
    home: number;
    away: number;
    draw: number;
    total: number;
  };
}

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  selection: string;
  userProfile: UserProfile;
  onConfirm: (gameId: string, selection: string, amount: number) => Promise<void>;
}

interface VotersPopupProps {
  type: 'supporters' | 'rivals';
  fixtureId: string;
  voters: Voter[];
  onClose: () => void;
}

// ========== API SERVICE ==========

const API_BASE_URL = 'https://fanclash-api.onrender.com/api';

class ApiService {
  static async fetchGames(params?: { status?: string; league?: string; is_live?: boolean; limit?: number; skip?: number }): Promise<Game[]> {
    try {
      let url = `${API_BASE_URL}/games`;
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.league) queryParams.append('league', params.league);
        if (params.is_live !== undefined) queryParams.append('is_live', String(params.is_live));
        if (params.limit) queryParams.append('limit', String(params.limit));
        if (params.skip !== undefined) queryParams.append('skip', String(params.skip));
        if (queryParams.toString()) url += `?${queryParams.toString()}`;
      }
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) return [];
      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (data.games && Array.isArray(data.games)) return data.games;
      if (data.data && Array.isArray(data.data)) return data.data;
      return [];
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  }

  static async createPledge(pledge: CreatePledge): Promise<{ success: boolean; pledge?: Pledge; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/pledges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pledge)
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || data.message || `HTTP error ${response.status}` };
      return { success: true, pledge: data.pledge || data.data || data };
    } catch (error) {
      return { success: false, error: error.message || 'Network error occurred' };
    }
  }

  static async fetchAllPledges(params?: { username?: string; phone?: string; home_team?: string; away_team?: string; starter_id?: string }): Promise<Pledge[]> {
    try {
      let url = `${API_BASE_URL}/pledges`;
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.username) queryParams.append('username', params.username);
        if (params.phone) queryParams.append('phone', params.phone);
        if (params.home_team) queryParams.append('home_team', params.home_team);
        if (params.away_team) queryParams.append('away_team', params.away_team);
        if (params.starter_id) queryParams.append('starter_id', params.starter_id);
        if (queryParams.toString()) url += `?${queryParams.toString()}`;
      }
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : (data.pledges || data.data || []);
    } catch (error) {
      return [];
    }
  }

  static async fetchUserPledges(params: { username?: string; phone?: string; starter_id?: string }): Promise<Pledge[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.username) queryParams.append('username', params.username);
      if (params.phone) queryParams.append('phone', params.phone);
      if (params.starter_id) queryParams.append('starter_id', params.starter_id);
      const response = await fetch(`${API_BASE_URL}/pledges/user?${queryParams.toString()}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : (data.pledges || data.data || []);
    } catch (error) {
      return [];
    }
  }

  static async initiateMpesaPayment(request: MpesaRequest): Promise<{ success: boolean; data?: MpesaResponse; error?: string }> {
    try {
      console.log('📤 Initiating M-Pesa payment:', request);
      const response = await fetch(`${API_BASE_URL}/lipaclash/stk-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(request)
      });
      const text = await response.text();
      console.log(`📥 Response status:`, response.status);
      console.log(`📥 Response body:`, text);
      if (!response.ok) return { success: false, error: `HTTP error ${response.status}: ${text}` };
      try {
        const data = JSON.parse(text);
        console.log('✅ M-Pesa response parsed:', data);
        return { success: true, data };
      } catch (e) {
        return { success: false, error: 'Failed to parse response' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Network error occurred' };
    }
  }

  static async checkPaymentStatus(checkoutRequestId: string): Promise<{ success: boolean; status?: string; data?: any }> {
    try {
      console.log(`🔍 Checking payment status for: ${checkoutRequestId}`);
      const response = await fetch(`${API_BASE_URL}/lipaclash/check-payment-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkout_request_id: checkoutRequestId })
      });
      const data = await response.json();
      console.log(`📥 Status response:`, data);
      return { success: data.success || false, status: data.status || 'pending', data };
    } catch (error) {
      return { success: false, status: 'pending' };
    }
  }

  static async fetchUserByPhone(phone: string): Promise<UserProfile | null> {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const response = await fetch(`${API_BASE_URL}/profile/phone/${cleanPhone}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.profile || data.data || data;
    } catch (error) {
      return null;
    }
  }

  static async fetchUserById(userId: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.profile || data.data || data;
    } catch (error) {
      return null;
    }
  }

  static async createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/create_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.profile || data.data || data;
    } catch (error) {
      return null;
    }
  }

  static async updateUserBalance(userId: string, newBalance: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/update-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, balance: newBalance })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  static async updateProfile(profileId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.profile || data.data || data;
    } catch (error) {
      return null;
    }
  }
}

// ========== AVATAR MANAGER ==========

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
  ];
  private static memoryCache: Map<string, string> = new Map();

  static getAvatarUrl(userId: string): string {
    if (this.memoryCache.has(userId)) return this.memoryCache.get(userId)!;
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
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return username[0].toUpperCase();
  }

  static buildAvatar(userId: string, username: string, size: number = 32, onClick?: () => void): JSX.Element {
    const avatarUrl = this.getAvatarUrl(userId);
    const initials = this.getInitials(username);
    return (
      <div onClick={onClick} className="cursor-pointer" style={{ width: size, height: size }}>
        <Avatar className={`w-${size} h-${size} border-2 border-emerald-500/30 hover:border-emerald-500 transition-colors`}>
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }
}

// ========== DATE HELPER ==========

class DateHelper {
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
      if (diffHours <= 2 && diffHours >= -2) return '🔴 LIVE';
      if (date > now) {
        if (diffHours < 24) return `In ${diffHours}h`;
        return `In ${Math.floor(diffHours / 24)}d`;
      }
      if (diffHours < 0) {
        const absHours = Math.abs(diffHours);
        if (absHours < 24) return `${absHours}h ago`;
        return `${Math.floor(absHours / 24)}d ago`;
      }
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch { return "TBD"; }
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
    } catch { return 'Unknown'; }
  }
}

// ========== TOAST HELPER ==========

class ToastHelper {
  static showSuccess(toast: any, title: string, description?: string, duration: number = 3000): void {
    toast({ title, description, duration, className: "bg-emerald-500/20 border-emerald-500 text-emerald-400" });
  }
  static showError(toast: any, title: string, description?: string, duration: number = 4000): void {
    toast({ title, description, variant: "destructive", duration });
  }
  static showInfo(toast: any, title: string, description?: string, duration: number = 3000): void {
    toast({ title, description, duration, className: "bg-blue-500/20 border-blue-500 text-blue-400" });
  }
  static showWarning(toast: any, title: string, description?: string, duration: number = 3500): void {
    toast({ title, description, duration, className: "bg-yellow-500/20 border-yellow-500 text-yellow-400" });
  }
}

// ========== LOCAL STORAGE MANAGER ==========

class LocalStorageManager {
  private static readonly FIXTURES_CACHE_KEY = 'fixtures_cache';
  private static readonly FIXTURES_TIMESTAMP_KEY = 'fixtures_timestamp';
  private static readonly USER_PROFILE_KEY = 'userProfile';
  private static readonly USER_VOTES_KEY = 'user_votes';

  static saveFixturesToCache(fixtures: Game[]): void {
    try {
      localStorage.setItem(this.FIXTURES_CACHE_KEY, JSON.stringify(fixtures));
      localStorage.setItem(this.FIXTURES_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) { console.error('Error saving fixtures to cache:', error); }
  }

  static loadFixturesFromCache(): Game[] | null {
    try {
      const cached = localStorage.getItem(this.FIXTURES_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) { return null; }
  }

  static shouldRefreshCache(): boolean {
    try {
      const timestamp = localStorage.getItem(this.FIXTURES_TIMESTAMP_KEY);
      if (!timestamp) return true;
      return Date.now() - parseInt(timestamp) > 5 * 60 * 1000;
    } catch (error) { return true; }
  }

  static saveUserProfile(profile: UserProfile): void {
    try { localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(profile)); } catch (error) { }
  }

  static loadUserProfile(): UserProfile | null {
    try {
      const saved = localStorage.getItem(this.USER_PROFILE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) { return null; }
  }

  static saveUserVote(userId: string, fixtureId: string, pledge: Pledge): void {
    try {
      const key = `${this.USER_VOTES_KEY}_${userId}`;
      const existing = localStorage.getItem(key);
      const votes = existing ? JSON.parse(existing) : {};
      votes[fixtureId] = pledge;
      localStorage.setItem(key, JSON.stringify(votes));
    } catch (error) { }
  }

  static loadUserVotes(userId: string): Map<string, Pledge> {
    try {
      const key = `${this.USER_VOTES_KEY}_${userId}`;
      const existing = localStorage.getItem(key);
      const votes = existing ? JSON.parse(existing) : {};
      return new Map(Object.entries(votes));
    } catch (error) { return new Map(); }
  }
}

// ========== PAYMENT STATUS MODAL ==========

interface PaymentStatusModalProps {
  show: boolean;
  message: string;
  attempt: number;
  maxAttempts: number;
  checkoutId: string;
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({ show, message, attempt, maxAttempts, checkoutId }) => {
  if (!show) return null;

  const progressPercent = (attempt / maxAttempts) * 100;
  const timeLeft = Math.max(0, (maxAttempts - attempt) * 2);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-emerald-500/30 rounded-xl p-6 max-w-sm w-full text-center shadow-2xl"
      >
        {/* Animated Icon */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full border border-emerald-500/30 animate-ping" />
          <div className="relative w-20 h-20 bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-center">
            <CoinsIcon className="w-9 h-9 text-emerald-400 animate-pulse" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">Processing Payment</h3>
        <p className="text-emerald-400 font-medium mb-1">{message}</p>
        <p className="text-gray-500 text-xs mb-4">~{timeLeft}s remaining</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-2 text-left">
          <div className={cn("flex items-center gap-2 text-xs", attempt >= 1 ? "text-emerald-400" : "text-gray-600")}>
            <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", attempt >= 1 ? "bg-emerald-500/20 border-emerald-500" : "border-gray-600")}>
              {attempt >= 1 ? <Check className="w-2.5 h-2.5" /> : <span className="w-1 h-1 bg-gray-600 rounded-full" />}
            </div>
            STK Push sent to your phone
          </div>
          <div className={cn("flex items-center gap-2 text-xs", attempt >= 2 ? "text-emerald-400" : "text-gray-600")}>
            <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", attempt >= 2 ? "bg-emerald-500/20 border-emerald-500" : "border-gray-600")}>
              {attempt >= 2 ? <Check className="w-2.5 h-2.5" /> : attempt === 1 ? <Loader2Icon className="w-2.5 h-2.5 animate-spin" /> : <span className="w-1 h-1 bg-gray-600 rounded-full" />}
            </div>
            Enter M-Pesa PIN on phone
          </div>
          <div className={cn("flex items-center gap-2 text-xs", "text-gray-600")}>
            <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center">
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
            </div>
            Confirming payment...
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-4">
          Check: {attempt}/{maxAttempts}
        </p>
      </motion.div>
    </div>
  );
};

// ========== STAKE MODAL ==========

const StakeModal: React.FC<StakeModalProps> = ({ isOpen, onClose, game, selection, userProfile, onConfirm }) => {
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const MIN_STAKE = 20;
  const MAX_STAKE = 50000;

  const getSelectionDetails = () => {
    switch (selection) {
      case 'home_team': return { name: game.home_team, odds: game.home_win, borderColor: 'border-emerald-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400' };
      case 'away_team': return { name: game.away_team, odds: game.away_win, borderColor: 'border-blue-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' };
      case 'draw': return { name: 'Draw', odds: game.draw, borderColor: 'border-purple-500', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400' };
      default: return { name: '', odds: 0, borderColor: 'border-gray-500', bgColor: 'bg-gray-500/10', textColor: 'text-gray-400' };
    }
  };

  const details = getSelectionDetails();
  const stakeAmount = Number(amount) || 0;
  const potentialReturn = stakeAmount * details.odds;
  const profit = potentialReturn - stakeAmount;
  const quickStakes = [20, 50, 100, 500, 1000, 5000, 10000, 25000];

  const handleConfirm = async () => {
    if (stakeAmount < MIN_STAKE) { ToastHelper.showWarning(toast, 'Minimum Stake', `Minimum stake is Ksh ${MIN_STAKE}`); return; }
    if (stakeAmount > userProfile.balance) { ToastHelper.showError(toast, 'Insufficient Balance', `You need Ksh ${stakeAmount} but have Ksh ${userProfile.balance}`); return; }
    if (stakeAmount > MAX_STAKE) { ToastHelper.showWarning(toast, 'Maximum Stake', `Maximum stake is Ksh ${MAX_STAKE}`); return; }
    setIsProcessing(true);
    try {
      await onConfirm(game._id || game.match_id, selection, stakeAmount);
      onClose();
      setAmount('');
    } catch (error) {
      console.error('Error in stake confirmation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CoinsIcon className="h-5 w-5 text-yellow-400" />
            Place Your Stake
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {game.home_team} vs {game.away_team}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className={cn("p-4 rounded-lg text-center border-2", details.borderColor, details.bgColor)}>
            <p className="text-sm text-gray-400 mb-1">Your Selection</p>
            <p className={cn("text-xl font-bold", details.textColor)}>{details.name}</p>
            <p className="text-sm text-gray-300 mt-1">Odds: {details.odds.toFixed(2)}</p>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Stake Amount (Ksh)</Label>
            <div className="relative">
              <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min Ksh ${MIN_STAKE}`}
                className="pl-8 bg-gray-900/50 border-gray-700"
                disabled={isProcessing}
                min={MIN_STAKE}
                max={Math.min(MAX_STAKE, userProfile.balance)}
                step="1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum: Ksh {MIN_STAKE}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Quick Stake</p>
            <div className="grid grid-cols-4 gap-2">
              {quickStakes.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="border-gray-700 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 text-xs px-1"
                  disabled={quickAmount > userProfile.balance}
                >
                  Ksh {quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {stakeAmount >= MIN_STAKE && (
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Stake</span>
                <span className="text-white">Ksh {stakeAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Return</span>
                <span className="text-emerald-400 font-bold">Ksh {potentialReturn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Profit</span>
                <span className="text-green-400">+Ksh {profit.toLocaleString()}</span>
              </div>
              <Separator className="bg-gray-700" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Balance After</span>
                <span className={stakeAmount > userProfile.balance ? 'text-red-400' : 'text-emerald-400'}>
                  Ksh {(userProfile.balance - stakeAmount).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {stakeAmount > userProfile.balance && (
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-400 text-sm">Insufficient Balance</AlertTitle>
              <AlertDescription className="text-xs text-red-300">
                You need Ksh {(stakeAmount - userProfile.balance).toLocaleString()} more
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-400 hover:text-white">Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={!amount || stakeAmount < MIN_STAKE || stakeAmount > userProfile.balance || isProcessing}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isProcessing ? <Loader2Icon className="h-4 w-4 animate-spin" /> : `Stake Ksh ${stakeAmount.toLocaleString()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ========== VOTERS POPUP ==========

const VotersPopup: React.FC<VotersPopupProps> = ({ type, fixtureId, voters, onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const getVoteColor = (s: string) => s === 'home_team' ? 'text-emerald-400' : s === 'away_team' ? 'text-blue-400' : 'text-purple-400';
  const getVoteBg = (s: string) => s === 'home_team' ? 'bg-emerald-500/10' : s === 'away_team' ? 'bg-blue-500/10' : 'bg-purple-500/10';
  const getVoteText = (s: string) => s === 'home_team' ? 'home' : s === 'away_team' ? 'away' : 'draw';
  const totalStaked = voters.reduce((sum, v) => sum + v.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div ref={popupRef} className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-gray-800 w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            {type === 'supporters' ? (
              <><Shield className="h-5 w-5 text-emerald-400" /><span>Supporters</span><Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{voters.length}</Badge></>
            ) : (
              <><Sword className="h-5 w-5 text-red-400" /><span>Rivals</span><Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30">{voters.length}</Badge></>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Total: Ksh {totalStaked.toLocaleString()}</Badge>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-800"><X className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
          {voters.length > 0 ? (
            <div className="space-y-2">
              {voters.map((voter) => (
                <div key={`${voter.userId}-${voter.time}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-200">
                  {FootballAvatarManager.buildAvatar(voter.userId, voter.username, 40)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium truncate">{voter.username}</p>
                      {voter.fan && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] px-1.5">{voter.fan}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={cn("text-xs px-1.5 py-0.5 rounded-full", getVoteBg(voter.selection), getVoteColor(voter.selection))}>{getVoteText(voter.selection)}</span>
                      <span className="text-gray-500 text-xs">{DateHelper.formatTimeAgo(voter.time)}</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] mt-1">Ksh {voter.amount.toLocaleString()}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <h4 className="text-white font-medium mb-1">No voters yet</h4>
              <p className="text-sm text-gray-400">Be the first to stake on this match!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== MATCH CARD ==========

interface MatchCardProps {
  game: Game;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  voteData?: FixtureVoteData;
  userVotes: Map<string, Pledge>;
  onVote: (gameId: string, selection: string, amount: number) => Promise<void>;
  onViewSupporters: (gameId: string) => void;
  onViewRivals: (gameId: string) => void;
}

function MatchCard({ game, userProfile, setUserProfile, voteData, userVotes, onVote, onViewSupporters, onViewRivals }: MatchCardProps) {
  const [selectedStake, setSelectedStake] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const { toast } = useToast();

  const gameId = game._id || game.match_id;
  const userVote = userVotes.get(gameId);
  const hasVoted = !!userVote;
  const isLive = game.is_live || game.status === 'live';

  const getStatusColor = () => {
    if (isLive) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (game.status === 'upcoming') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (game.status === 'completed') return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  };

  const getStatusText = () => {
    if (isLive) return '🔴 LIVE';
    if (game.status === 'upcoming') return '⏳ UPCOMING';
    if (game.status === 'completed') return '✅ FINISHED';
    return game.status;
  };

  const getVoteColor = (s: string) => s === 'home_team' ? 'text-emerald-400' : s === 'away_team' ? 'text-blue-400' : 'text-purple-400';
  const getVoteBg = (s: string) => s === 'home_team' ? 'bg-emerald-500/10' : s === 'away_team' ? 'bg-blue-500/10' : 'bg-purple-500/10';

  const handleStakeClick = (selection: string) => {
    if (!userProfile) { ToastHelper.showError(toast, 'Authentication Required', 'Please log in to stake'); return; }
    if (hasVoted) { ToastHelper.showWarning(toast, 'Already Staked', 'You have already staked on this match'); return; }
    if (isLive) { ToastHelper.showWarning(toast, 'Match In Progress', 'Cannot stake on live matches'); return; }
    if (!game.available_for_voting) { ToastHelper.showWarning(toast, 'Not Available', 'This match is not available for staking'); return; }
    setSelectedStake(selection);
    setShowStakeModal(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl border border-gray-800/50 p-4 backdrop-blur-sm hover:border-emerald-500/30 transition-all group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{game.league}</Badge>
            <Badge className={cn("border", getStatusColor())}>{getStatusText()}</Badge>
          </div>
          <div className="text-xs text-gray-400">{DateHelper.formatDate(game.date_iso || `${game.date} ${game.time}`)}</div>
        </div>

        {game.home_score !== undefined && game.away_score !== undefined && (
          <div className="text-center mb-2">
            <span className="text-2xl font-bold text-white">{game.home_score} - {game.away_score}</span>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="text-center w-2/5">
              <div className={cn("w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 flex items-center justify-center mx-auto mb-1 transition-colors", userVote?.selection === 'home_team' ? 'border-emerald-500' : 'border-emerald-500/30')}>
                <span className="font-bold text-emerald-300">{game.home_team.substring(0, 2).toUpperCase()}</span>
              </div>
              <p className="text-xs font-bold text-white truncate">{game.home_team}</p>
              {userVote?.selection === 'home_team' && <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Ksh {userVote.amount.toLocaleString()}</Badge>}
            </div>

            <div className="px-2">
              <div className="bg-gray-900 rounded-full p-2 w-10 h-10 flex items-center justify-center border border-gray-800">
                <Sword className="w-5 h-5 text-emerald-500/70" />
              </div>
            </div>

            <div className="text-center w-2/5">
              <div className={cn("w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 flex items-center justify-center mx-auto mb-1 transition-colors", userVote?.selection === 'away_team' ? 'border-blue-500' : 'border-emerald-500/30')}>
                <span className="font-bold text-emerald-300">{game.away_team.substring(0, 2).toUpperCase()}</span>
              </div>
              <p className="text-xs font-bold text-white truncate">{game.away_team}</p>
              {userVote?.selection === 'away_team' && <Badge className="mt-1 bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">Ksh {userVote.amount.toLocaleString()}</Badge>}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="grid grid-cols-3 gap-1">
            <Button variant="outline" onClick={() => handleStakeClick('home_team')}
              className={cn("rounded-lg font-medium py-3 transition-all border-gray-700 hover:border-emerald-500 hover:bg-emerald-500/10", userVote?.selection === 'home_team' && "border-emerald-500 bg-emerald-500/10")}
              disabled={hasVoted || isLive || !game.available_for_voting}>
              <div className="text-center"><div className="text-[10px] text-gray-400">HOME</div><div className="text-sm font-bold text-emerald-400">{game.home_win.toFixed(2)}</div></div>
            </Button>
            <Button variant="outline" onClick={() => handleStakeClick('draw')}
              className={cn("rounded-lg font-medium py-3 transition-all border-gray-700 hover:border-purple-500 hover:bg-purple-500/10", userVote?.selection === 'draw' && "border-purple-500 bg-purple-500/10")}
              disabled={hasVoted || isLive || !game.available_for_voting}>
              <div className="text-center"><div className="text-[10px] text-gray-400">DRAW</div><div className="text-sm font-bold text-purple-400">{game.draw.toFixed(2)}</div></div>
            </Button>
            <Button variant="outline" onClick={() => handleStakeClick('away_team')}
              className={cn("rounded-lg font-medium py-3 transition-all border-gray-700 hover:border-blue-500 hover:bg-blue-500/10", userVote?.selection === 'away_team' && "border-blue-500 bg-blue-500/10")}
              disabled={hasVoted || isLive || !game.available_for_voting}>
              <div className="text-center"><div className="text-[10px] text-gray-400">AWAY</div><div className="text-sm font-bold text-blue-400">{game.away_win.toFixed(2)}</div></div>
            </Button>
          </div>

          {voteData && (
            <div onClick={() => hasVoted && setIsExpanded(!isExpanded)} className={cn("mt-2 p-3 bg-gray-800/30 rounded-lg transition-colors", hasVoted && "cursor-pointer hover:bg-gray-800/50")}>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Stake Pool</span>
                <span className="text-white font-bold">Ksh {voteData.totalStaked.total.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: game.home_team, value: voteData.totalStaked.home, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                  { label: 'Draw', value: voteData.totalStaked.draw, color: 'bg-purple-500', textColor: 'text-purple-400' },
                  { label: game.away_team, value: voteData.totalStaked.away, color: 'bg-blue-500', textColor: 'text-blue-400' },
                ].map(({ label, value, color, textColor }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className={textColor}>{label}</span>
                      <span className="text-gray-400">Ksh {value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div className={cn("h-1.5 rounded-full", color)} style={{ width: `${voteData.totalStaked.total > 0 ? (value / voteData.totalStaked.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {hasVoted && <ChevronDownIcon className={cn("h-4 w-4 mx-auto text-gray-500 transition-transform mt-2", isExpanded && "rotate-180")} />}
            </div>
          )}
        </div>

        {hasVoted && (
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="w-full text-gray-400 hover:text-white mb-2">
            {isExpanded ? <><ChevronUpIcon className="h-4 w-4 mr-1" />Show less</> : <><ChevronDownIcon className="h-4 w-4 mr-1" />View details</>}
          </Button>
        )}

        <AnimatePresence>
          {isExpanded && hasVoted && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              {userVote && (
                <div className={cn("mb-4 p-3 rounded-lg", getVoteBg(userVote.selection))}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className={cn("h-4 w-4", getVoteColor(userVote.selection))} />
                      <span className="text-sm text-white">Your stake:</span>
                    </div>
                    <div className="text-right">
                      <Badge className={cn(getVoteBg(userVote.selection), getVoteColor(userVote.selection), "border-0")}>Ksh {userVote.amount.toLocaleString()}</Badge>
                      <p className="text-xs text-gray-400 mt-1">Time: {DateHelper.formatTimeAgo(userVote.time)}</p>
                    </div>
                  </div>
                </div>
              )}
              {voteData && (
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" size="sm" onClick={() => onViewSupporters(gameId)} className="flex-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                    <Shield className="h-4 w-4 mr-1" />Supporters ({voteData.supporters.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onViewRivals(gameId)} className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <Sword className="h-4 w-4 mr-1" />Rivals ({voteData.rivals.length})
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-3 border-t border-gray-800/30">
          <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-emerald-500"
            onClick={() => { navigator.clipboard.writeText(`${game.home_team} vs ${game.away_team} - ${game.league}`); ToastHelper.showSuccess(toast, 'Copied!', 'Match details copied'); }}>
            <Share2Icon className="w-4 h-4" />
          </Button>
          {hasVoted && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">PENDING</Badge>}
        </div>
      </motion.div>

      {showStakeModal && selectedStake && userProfile && (
        <StakeModal
          isOpen={showStakeModal}
          onClose={() => { setShowStakeModal(false); setSelectedStake(''); }}
          game={game}
          selection={selectedStake}
          userProfile={userProfile}
          onConfirm={async (gId, sel, amt) => { await onVote(gId, sel, amt); }}
        />
      )}
    </>
  );
}

// ========== FILTER BAR ==========

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onSearch: (query: string) => void;
  totalMatches: number;
  liveCount: number;
  totalStaked: number;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onSearch, totalMatches, liveCount, totalStaked }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); onSearch(e.target.value); };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white">Matches</h2>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{totalMatches}</Badge>
          {liveCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />{liveCount} Live
            </Badge>
          )}
        </div>
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Total: Ksh {totalStaked.toLocaleString()}</Badge>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input placeholder="Search teams or leagues..." value={searchQuery} onChange={handleSearch} className="pl-9 bg-gray-900/50 border-gray-800 focus:border-emerald-500 w-full" />
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Select value={filters.sortBy} onValueChange={(value: any) => onFilterChange({ ...filters, sortBy: value })}>
            <SelectTrigger className="flex-1 sm:w-32 bg-gray-900/50 border-gray-800"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="stake">Stake Pool</SelectItem>
              <SelectItem value="league">League</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(value: string) => onFilterChange({ ...filters, status: value })}>
            <SelectTrigger className="flex-1 sm:w-32 bg-gray-900/50 border-gray-800"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

// ========== MAIN COMPONENT ==========

const FixturesList: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({ status: 'all', league: 'all', sortBy: 'date' });
  const [userVotes, setUserVotes] = useState<Map<string, Pledge>>(new Map());
  const [voteData, setVoteData] = useState<Map<string, FixtureVoteData>>(new Map());
  const [votersPopup, setVotersPopup] = useState<{ type: 'supporters' | 'rivals'; fixtureId: string; voters: Voter[] } | null>(null);
  const [devMode, setDevMode] = useState(false);

  // ✅ Payment status modal state
  const [paymentStatus, setPaymentStatus] = useState<{
    show: boolean;
    message: string;
    attempt: number;
    maxAttempts: number;
    checkoutId: string;
  } | null>(null);

  const { toast } = useToast();

  // ========== LOAD USER PROFILE ==========

  const loadUserProfile = useCallback(async () => {
    setUserLoading(true);
    try {
      const saved = LocalStorageManager.loadUserProfile();
      if (saved) { setUserProfile(saved); setUserLoading(false); return; }
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const userId = userData.id || userData.user_id;
        if (userId) {
          const profile = await ApiService.fetchUserById(userId);
          if (profile) { setUserProfile(profile); LocalStorageManager.saveUserProfile(profile); }
        }
        if (userData.phone) {
          const profileByPhone = await ApiService.fetchUserByPhone(userData.phone);
          if (profileByPhone) { setUserProfile(profileByPhone); LocalStorageManager.saveUserProfile(profileByPhone); }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setUserLoading(false);
    }
  }, []);

  // ========== LOAD GAMES ==========

  const loadGames = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError("");
      if (!forceRefresh) {
        const cached = LocalStorageManager.loadFixturesFromCache();
        if (cached && cached.length > 0) {
          setGames(cached);
          setFilteredGames(cached);
          setLoading(false);
          if (LocalStorageManager.shouldRefreshCache()) loadGames(true);
          return;
        }
      }
      const gamesData = await ApiService.fetchGames();
      setGames(gamesData);
      setFilteredGames(gamesData);
      LocalStorageManager.saveFixturesToCache(gamesData);
    } catch (err) {
      setError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== LOAD PLEDGES ==========

  const loadAllPledges = useCallback(async () => {
    try {
      const allPledges = await ApiService.fetchAllPledges();
      const organized = organizePledgesByFixture(allPledges, userProfile?.user_id || '');
      setVoteData(organized);
    } catch (error) { console.error('Error loading pledges:', error); }
  }, [userProfile]);

  const loadUserPledges = useCallback(async () => {
    if (!userProfile) return;
    try {
      const pledges = await ApiService.fetchUserPledges({ starter_id: userProfile.user_id, username: userProfile.username, phone: userProfile.phone });
      const votesMap = new Map<string, Pledge>();
      pledges.forEach(pledge => { votesMap.set(`${pledge.home_team}_${pledge.away_team}`, pledge); });
      setUserVotes(votesMap);
      pledges.forEach(pledge => { LocalStorageManager.saveUserVote(userProfile.user_id, `${pledge.home_team}_${pledge.away_team}`, pledge); });
    } catch (error) {
      const localVotes = LocalStorageManager.loadUserVotes(userProfile.user_id);
      setUserVotes(localVotes);
    }
  }, [userProfile]);

  const organizePledgesByFixture = (pledges: Pledge[], currentUserId: string): Map<string, FixtureVoteData> => {
    const fixtureData = new Map<string, FixtureVoteData>();
    const userVotesMap = new Map<string, Pledge>();

    pledges.forEach(pledge => {
      if (pledge.starter_id === currentUserId) {
        userVotesMap.set(`${pledge.home_team}_${pledge.away_team}`, pledge);
      }
    });

    pledges.forEach(pledge => {
      const gameId = `${pledge.home_team}_${pledge.away_team}`;
      const currentUserVote = userVotesMap.get(gameId);
      if (!fixtureData.has(gameId)) {
        fixtureData.set(gameId, { fixtureId: gameId, homeTeam: pledge.home_team, awayTeam: pledge.away_team, currentUserVote: currentUserVote || null, supporters: [], rivals: [], totalStaked: { home: 0, away: 0, draw: 0, total: 0 } });
      }
      const data = fixtureData.get(gameId)!;
      if (pledge.selection === 'home_team') data.totalStaked.home += pledge.amount;
      else if (pledge.selection === 'away_team') data.totalStaked.away += pledge.amount;
      else if (pledge.selection === 'draw') data.totalStaked.draw += pledge.amount;
      data.totalStaked.total += pledge.amount;
      if (pledge.starter_id === currentUserId) return;
      const voter: Voter = { userId: pledge.starter_id, username: pledge.username, selection: pledge.selection, amount: pledge.amount, time: pledge.time || pledge.created_at, fan: pledge.fan };
      if (currentUserVote) {
        if (pledge.selection === currentUserVote.selection) data.supporters.push(voter);
        else data.rivals.push(voter);
      }
    });

    fixtureData.forEach(data => {
      data.supporters.sort((a, b) => b.amount - a.amount);
      data.rivals.sort((a, b) => b.amount - a.amount);
    });
    return fixtureData;
  };

  // ========== INIT ==========

  useEffect(() => {
    const init = async () => { await loadUserProfile(); await loadGames(); };
    init();
  }, []);

  useEffect(() => {
    if (userProfile) { loadUserPledges(); loadAllPledges(); }
  }, [userProfile]);

  // ========== FILTERING ==========

  useEffect(() => {
    let filtered = [...games];
    if (filters.status !== 'all') {
      filtered = filtered.filter(g => {
        if (filters.status === 'live') return g.is_live || g.status === 'live';
        if (filters.status === 'upcoming') return g.status === 'upcoming' && !g.is_live;
        if (filters.status === 'completed') return g.status === 'completed';
        return true;
      });
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g => g.home_team.toLowerCase().includes(query) || g.away_team.toLowerCase().includes(query) || g.league.toLowerCase().includes(query));
    }
    filtered.sort((a, b) => {
      if (filters.sortBy === 'date') return new Date(a.date_iso || `${a.date} ${a.time}`).getTime() - new Date(b.date_iso || `${b.date} ${b.time}`).getTime();
      if (filters.sortBy === 'stake') {
        const stakeA = voteData.get(`${a.home_team}_${a.away_team}`)?.totalStaked.total || 0;
        const stakeB = voteData.get(`${b.home_team}_${b.away_team}`)?.totalStaked.total || 0;
        return stakeB - stakeA;
      }
      if (filters.sortBy === 'league') return a.league.localeCompare(b.league);
      return 0;
    });
    setFilteredGames(filtered);
  }, [games, filters, searchQuery, voteData]);

  // ========== HANDLE VOTE ==========

  const handleVote = useCallback(async (gameId: string, selection: string, amount: number) => {
    if (!userProfile) { ToastHelper.showError(toast, 'Authentication Required', 'Please log in to stake'); return; }
    const game = games.find(g => g._id === gameId || `${g.home_team}_${g.away_team}` === gameId);
    if (!game) { ToastHelper.showError(toast, 'Error', 'Game not found'); return; }
    if (userVotes.has(gameId)) { ToastHelper.showWarning(toast, 'Already Staked', 'You have already staked on this match'); return; }
    if (amount > userProfile.balance) { ToastHelper.showError(toast, 'Insufficient Balance', `You need Ksh ${amount} but have Ksh ${userProfile.balance}`); return; }

    try {
      // DEV MODE
      if (devMode) {
        ToastHelper.showInfo(toast, 'DEV MODE', 'Creating stake directly...');
        const pledge: CreatePledge = { username: userProfile.username, phone: userProfile.phone, selection, amount, fan: userProfile.club_fan || userProfile.nickname || 'fan', home_team: game.home_team, away_team: game.away_team, starter_id: userProfile.user_id };
        const result = await ApiService.createPledge(pledge);
        if (result.success && result.pledge) {
          setUserVotes(prev => new Map(prev).set(gameId, result.pledge!));
          LocalStorageManager.saveUserVote(userProfile.user_id, gameId, result.pledge!);
          await loadAllPledges();
          ToastHelper.showSuccess(toast, '✅ Stake Placed (DEV MODE)', `Ksh ${amount} on ${selection === 'home_team' ? game.home_team : selection === 'away_team' ? game.away_team : 'Draw'}`);
        } else {
          ToastHelper.showError(toast, 'Failed', result.error || 'Could not create stake');
        }
        return;
      }

      // PRODUCTION MODE
      let phoneNumber = userProfile.phone.replace(/\D/g, '');
      if (phoneNumber.startsWith('0')) phoneNumber = '254' + phoneNumber.substring(1);
      else if (!phoneNumber.startsWith('254')) phoneNumber = '254' + phoneNumber;
      phoneNumber = phoneNumber.substring(0, 12);

      console.log('📞 Formatted phone:', phoneNumber);
      console.log('💰 Amount:', amount);
      console.log('🎮 Game:', game.home_team, 'vs', game.away_team);

      const mpesaResponse = await ApiService.initiateMpesaPayment({
        phone_number: phoneNumber,
        amount: amount.toString(),
        account_reference: gameId.substring(0, 12),
        transaction_desc: `${game.home_team} vs ${game.away_team}`
      });

      if (!mpesaResponse.success || !mpesaResponse.data) {
        ToastHelper.showError(toast, 'Payment Failed', mpesaResponse.error || 'M-Pesa service unavailable');
        return;
      }

      const checkoutRequestId = mpesaResponse.data.CheckoutRequestID || mpesaResponse.data.checkout_request_id;
      console.log('✅ M-Pesa initiated:', checkoutRequestId);

      // ✅ Show payment status modal
      setPaymentStatus({ show: true, message: 'Check your phone for M-Pesa prompt...', attempt: 0, maxAttempts: 30, checkoutId: checkoutRequestId });

      let paymentCompleted = false;
      let paymentFailed = false;
      let failureReason = '';
      let attempts = 0;
      const maxAttempts = 30;

      while (!paymentCompleted && !paymentFailed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;

        // ✅ Update modal with current attempt
        const message = attempts < 5
          ? 'Enter PIN on your phone...'
          : attempts < 15
            ? 'Waiting for confirmation...'
            : 'Still waiting...';

        setPaymentStatus({ show: true, message, attempt: attempts, maxAttempts, checkoutId: checkoutRequestId });

        try {
          const statusResponse = await ApiService.checkPaymentStatus(checkoutRequestId);
          console.log(`⏳ Status check ${attempts}:`, statusResponse);

          if (statusResponse.data?.success === true || statusResponse.data?.status === 'completed') {
            paymentCompleted = true;
            break;
          }

          if (statusResponse.data?.failed === true ||
            statusResponse.data?.status === 'failed' ||
            (statusResponse.data?.result_code && statusResponse.data.result_code !== 0)) {
            paymentFailed = true;
            failureReason = statusResponse.data.result_desc || 'Payment failed';
            break;
          }
        } catch (error) {
          console.log('⚠️ Status check error:', error);
        }
      }

      // ✅ Hide payment status modal
      setPaymentStatus(null);

      if (paymentCompleted) {
        ToastHelper.showSuccess(toast, '✅ Payment Confirmed!', 'Recording your stake...');
        const pledge: CreatePledge = { username: userProfile.username, phone: userProfile.phone, selection, amount, fan: userProfile.club_fan || userProfile.nickname || 'fan', home_team: game.home_team, away_team: game.away_team, starter_id: userProfile.user_id };
        const result = await ApiService.createPledge(pledge);
        if (result.success && result.pledge) {
          setUserVotes(prev => new Map(prev).set(gameId, result.pledge!));
          LocalStorageManager.saveUserVote(userProfile.user_id, gameId, result.pledge!);
          await loadAllPledges();
          ToastHelper.showSuccess(toast, '🎉 Stake Placed Successfully!', `Ksh ${amount} on ${selection === 'home_team' ? game.home_team : selection === 'away_team' ? game.away_team : 'Draw'}`);
        } else {
          ToastHelper.showError(toast, 'Stake Recording Failed', 'Payment succeeded but stake recording failed. Contact support.');
        }
      } else if (paymentFailed) {
        // ✅ Show specific error message for failed payment
        const errorMessages: Record<string, string> = {
          'Request cancelled by user.': '❌ You cancelled the payment.',
          'The initiator information is invalid.': '❌ Invalid credentials. Please try again.',
          'No response from user.': '⏰ Timed out. You did not enter your PIN.',
          'Insufficient balance.': '💸 Insufficient M-Pesa balance.',
        };
        const friendlyMessage = errorMessages[failureReason] || failureReason || 'Transaction was not completed';
        ToastHelper.showError(toast, 'Payment Failed', friendlyMessage, 6000);
      } else {
        // Timeout — ask for manual confirmation
        const confirmed = window.confirm('Payment is taking longer than expected. Did you complete the M-Pesa payment on your phone?');
        if (confirmed) {
          const pledge: CreatePledge = { username: userProfile.username, phone: userProfile.phone, selection, amount, fan: userProfile.club_fan || userProfile.nickname || 'fan', home_team: game.home_team, away_team: game.away_team, starter_id: userProfile.user_id };
          const result = await ApiService.createPledge(pledge);
          if (result.success && result.pledge) {
            setUserVotes(prev => new Map(prev).set(gameId, result.pledge!));
            LocalStorageManager.saveUserVote(userProfile.user_id, gameId, result.pledge!);
            await loadAllPledges();
            ToastHelper.showSuccess(toast, '✅ Stake Recorded!', 'Please check your M-Pesa statement');
          } else {
            ToastHelper.showError(toast, 'Failed', 'Could not record stake. Please contact support.');
          }
        } else {
          ToastHelper.showError(toast, 'Payment Cancelled', 'Your transaction was not completed');
        }
      }
    } catch (error: any) {
      setPaymentStatus(null);
      console.error('💥 Fatal error:', error);
      ToastHelper.showError(toast, 'System Error', error.message || 'An unexpected error occurred', 8000);
    }
  }, [userProfile, games, userVotes, loadAllPledges, toast, devMode]);

  const handleViewSupporters = useCallback((gameId: string) => {
    const data = voteData.get(gameId);
    if (data) setVotersPopup({ type: 'supporters', fixtureId: gameId, voters: data.supporters });
  }, [voteData]);

  const handleViewRivals = useCallback((gameId: string) => {
    const data = voteData.get(gameId);
    if (data) setVotersPopup({ type: 'rivals', fixtureId: gameId, voters: data.rivals });
  }, [voteData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadGames(true);
      await loadAllPledges();
      if (userProfile) await loadUserPledges();
      ToastHelper.showSuccess(toast, 'Refreshed!', 'Latest data loaded');
    } catch (error) {
      ToastHelper.showError(toast, 'Refresh Failed', 'Unable to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [loadGames, loadAllPledges, loadUserPledges, userProfile, toast]);

  const liveCount = useMemo(() => games.filter(g => g.is_live || g.status === 'live').length, [games]);
  const totalStaked = useMemo(() => { let t = 0; voteData.forEach(d => { t += d.totalStaked.total; }); return t; }, [voteData]);

  // ========== RENDER ==========

  return (
    <div className="h-screen w-full bg-black text-white font-sans flex flex-col overflow-hidden">

      {/* Desktop Header */}
      <div className="hidden lg:block sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <TrophyIcon className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Stake Arena</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 rounded-lg border border-emerald-500/20">
                <WalletIcon className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs text-emerald-300">Balance</div>
                  <div className="text-sm font-bold text-emerald-400">{userLoading ? "..." : `Ksh ${userProfile?.balance?.toLocaleString() || '0'}`}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 rounded-lg border border-yellow-500/20">
                <CoinsIcon className="w-4 h-4 text-yellow-400" />
                <div>
                  <div className="text-xs text-yellow-300">Total Staked</div>
                  <div className="text-sm font-bold text-yellow-400">Ksh {totalStaked.toLocaleString()}</div>
                </div>
              </div>
              {/* Dev Mode Toggle */}
              {process.env.NODE_ENV === 'development' && (
                <Button variant="outline" size="sm" onClick={() => setDevMode(!devMode)}
                  className={cn("text-xs", devMode ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "border-gray-700 text-gray-400")}>
                  {devMode ? "DEV ON" : "DEV OFF"}
                </Button>
              )}
              {userProfile ? FootballAvatarManager.buildAvatar(userProfile.user_id, userProfile.username, 40) : (
                <Avatar className="w-10 h-10 border-2 border-emerald-500/30"><AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">U</AvatarFallback></Avatar>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <TrophyIcon className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold">Stake Arena</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-right">
              <div className="text-emerald-300">Balance</div>
              <div className="font-bold text-emerald-400">{userLoading ? "..." : `Ksh ${userProfile?.balance?.toLocaleString() || '0'}`}</div>
            </div>
            {userProfile ? FootballAvatarManager.buildAvatar(userProfile.user_id, userProfile.username, 36) : (
              <Avatar className="w-9 h-9 border-2 border-emerald-500/30"><AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">U</AvatarFallback></Avatar>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <FilterBar filters={filters} onFilterChange={setFilters} onSearch={setSearchQuery} totalMatches={filteredGames.length} liveCount={liveCount} totalStaked={totalStaked} />

          {refreshing && (
            <div className="my-2 p-2 bg-gray-900/50 rounded-lg flex items-center gap-2">
              <Loader2Icon className="h-4 w-4 animate-spin text-emerald-500" />
              <span className="text-sm text-gray-400">Refreshing data...</span>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2Icon className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                <div className="text-emerald-400">Loading matches...</div>
              </div>
            </div>
          )}

          {error && !loading && filteredGames.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <Zap className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-2">{error}</h3>
              <Button onClick={handleRefresh} className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white">Try Again</Button>
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {filteredGames.length === 0 ? (
                <div className="col-span-1 lg:col-span-2 text-center py-20">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                    <TrophyIcon className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">No matches found</h3>
                  <p className="text-gray-400">Try adjusting your filters or check back later</p>
                </div>
              ) : (
                filteredGames.map((game) => {
                  const gameId = game._id || `${game.home_team}_${game.away_team}`;
                  return (
                    <MatchCard
                      key={gameId}
                      game={game}
                      userProfile={userProfile}
                      setUserProfile={setUserProfile}
                      voteData={voteData.get(gameId)}
                      userVotes={userVotes}
                      onVote={handleVote}
                      onViewSupporters={handleViewSupporters}
                      onViewRivals={handleViewRivals}
                    />
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Payment Status Modal */}
      {paymentStatus && (
        <PaymentStatusModal
          show={paymentStatus.show}
          message={paymentStatus.message}
          attempt={paymentStatus.attempt}
          maxAttempts={paymentStatus.maxAttempts}
          checkoutId={paymentStatus.checkoutId}
        />
      )}

      {/* Voters Popup */}
      {votersPopup && (
        <VotersPopup
          type={votersPopup.type}
          fixtureId={votersPopup.fixtureId}
          voters={votersPopup.voters}
          onClose={() => setVotersPopup(null)}
        />
      )}
    </div>
  );
};

export default FixturesList;
