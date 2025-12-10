import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Phone, 
  Trophy, 
  X,
  Hash,
  ArrowLeft,
  Save,
  Wallet,
  Loader2,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  LogOut,
  UserPlus,
  Globe,
  Coins,
  TrendingUp,
  Sparkles,
  Shield
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

interface UserData {
  username: string;
  phone: string;
  club_fan: string;
  nickname: string;
  country_fan: string;
  balance: number;
  number_of_bets: number;
  user_id: string;
}

export const UserProfileModal = ({ isOpen, onClose, onLogout }: UserProfileModalProps) => {
  const API_BASE_URL = 'https://fanclash-api.onrender.com';
  
  const [currentPage, setCurrentPage] = useState<'view' | 'edit' | 'deposit' | 'withdraw'>('view');
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPhone, setDepositPhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const [recentTransaction, setRecentTransaction] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Initialize empty user data
  const [userData, setUserData] = useState<UserData>({
    username: '',
    phone: '',
    club_fan: '',
    nickname: '',
    country_fan: '',
    balance: 0,
    number_of_bets: 0,
    user_id: ''
  });

  // Load user data from BACKEND when modal opens
  useEffect(() => {
    if (isOpen) {
      checkUserSession();
    }
  }, [isOpen]);

  // Close modal handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, currentPage, userData]);

  // Check user session and determine if new or existing user
  const checkUserSession = async () => {
    try {
      setIsSyncing(true);
      
      const isForcedNewUser = localStorage.getItem('forceNewUser') === 'true';
      const sessionToken = localStorage.getItem('sessionToken');
      const userProfile = localStorage.getItem('userProfile');
      
      if (isForcedNewUser || !sessionToken || !userProfile) {
        setIsNewUser(true);
        setCurrentPage('edit');
        localStorage.removeItem('forceNewUser');
        return;
      }
      
      await loadUserFromBackend();
      
    } catch (error) {
      console.error('Session check error:', error);
      setIsNewUser(true);
      setCurrentPage('edit');
    } finally {
      setIsSyncing(false);
    }
  };

  // Toast helpers
  const showError = (message: string) => {
    toast.error(message, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: 'rgba(239, 68, 68, 0.95)',
        color: 'white',
        borderRadius: '8px',
      }
    });
  };

  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: 'rgba(16, 185, 129, 0.95)',
        color: 'white',
        borderRadius: '8px',
      }
    });
  };

  const showLoading = (message: string, id: string = 'loading') => {
    toast.loading(message, {
      id,
      duration: 5000,
      position: 'top-center',
      style: {
        background: 'rgba(59, 130, 246, 0.95)',
        color: 'white',
        borderRadius: '8px',
      }
    });
  };

  const findUserByPhone = async (phone: string): Promise<UserData | null> => {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      
      const phoneFormats = [];
      phoneFormats.push(cleanPhone);
      
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
          const response = await fetch(`${API_BASE_URL}/api/profile/profile/phone/${phoneFormat}`);
          
          if (response.ok) {
            const backendUser = await response.json();
            
            return {
              user_id: backendUser.user_id,
              username: backendUser.username || '',
              phone: phone,
              nickname: backendUser.nickname || '',
              club_fan: backendUser.club_fan || '',
              country_fan: backendUser.country_fan || '',
              balance: backendUser.balance || 0,
              number_of_bets: backendUser.number_of_bets || 0
            };
          }
        } catch (error) {
          console.log(`Format ${phoneFormat} not found:`, error);
        }
      }
      
      return null;
    } catch (error) {
      console.log('Error finding user by phone:', error);
      return null;
    }
  };

  const formatPhoneTo254 = (phone: string): string => {
    const clean = phone.replace(/\D/g, '');
    
    if (clean.length === 12 && clean.startsWith('254')) {
      return clean;
    }
    
    if (clean.length === 10 && clean.startsWith('0')) {
      return '254' + clean.substring(1);
    }
    
    if (clean.length === 9) {
      return '254' + clean;
    }
    
    return clean;
  };

  // Load user from backend
  const loadUserFromBackend = async () => {
    try {
      setIsSyncing(true);
      
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
      
      if (localPhone) {
        const backendUser = await findUserByPhone(localPhone);
        
        if (backendUser) {
          setUserData(backendUser);
          setDepositPhone(backendUser.phone);
          setWithdrawPhone(backendUser.phone);
          localStorage.setItem('userProfile', JSON.stringify(backendUser));
          
          const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('sessionToken', sessionToken);
          
          setCurrentPage('view');
          setIsSyncing(false);
          return;
        }
      }
      
      setIsNewUser(true);
      setCurrentPage('edit');
      
    } catch (error) {
      console.error('Error loading user:', error);
      setIsNewUser(true);
      setCurrentPage('edit');
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync data from backend
  const syncFromBackend = async (showToast: boolean = false) => {
    if (!userData.phone) return;
    
    try {
      setIsSyncing(true);
      const backendUser = await findUserByPhone(userData.phone);
      
      if (backendUser) {
        setUserData(backendUser);
        localStorage.setItem('userProfile', JSON.stringify(backendUser));
        
        if (showToast) {
          showSuccess('Synced with server!');
        }
      } else {
        console.log('No data from backend');
        if (showToast) {
          showError('Failed to sync with server');
        }
      }
    } catch (error) {
      console.error('Error syncing from backend:', error);
      if (showToast) {
        showError('Failed to sync with server');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Save profile to backend
  const handleSave = async () => {
    if (!userData.username.trim() && !userData.phone.trim()) {
      showError('Please enter at least username or phone');
      return;
    }

    try {
      setIsProcessing(true);
      showLoading('Saving profile...', 'save-profile');

      const formattedPhone = formatPhoneTo254(userData.phone);
      const userId = userData.user_id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const profileData = {
        user_id: userId,
        username: userData.username || "User",
        phone: formattedPhone || "",
        nickname: userData.nickname || "",
        club_fan: userData.club_fan || "",
        country_fan: userData.country_fan || "",
        balance: userData.balance || 0,
        number_of_bets: userData.number_of_bets || 0
      };

      const response = await fetch(`${API_BASE_URL}/api/profile/create_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const result = await response.json();
        
        const updatedData: UserData = {
          ...userData,
          user_id: result.user_id || userId,
          balance: result.balance || userData.balance
        };
        
        setUserData(updatedData);
        setDepositPhone(updatedData.phone);
        setWithdrawPhone(updatedData.phone);
        
        localStorage.setItem('userProfile', JSON.stringify(updatedData));
        const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('sessionToken', sessionToken);
        localStorage.removeItem('forceNewUser');
        
        setIsNewUser(false);
        showSuccess('Profile saved successfully!');
        setCurrentPage('view');
      } else {
        const errorText = await response.text();
        
        const updateResponse = await fetch(`${API_BASE_URL}/api/profile/profiles/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        });
        
        if (updateResponse.ok) {
          const result = await updateResponse.json();
          
          const updatedData: UserData = {
            ...userData,
            user_id: result.user_id || userId,
            balance: result.balance || userData.balance
          };
          
          setUserData(updatedData);
          setDepositPhone(updatedData.phone);
          setWithdrawPhone(updatedData.phone);
          
          localStorage.setItem('userProfile', JSON.stringify(updatedData));
          const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('sessionToken', sessionToken);
          localStorage.removeItem('forceNewUser');
          
          setIsNewUser(false);
          showSuccess('Profile updated successfully!');
          setCurrentPage('view');
        } else {
          throw new Error('Failed to save profile');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      showError('Failed to save profile');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      showError('Enter valid amount');
      return;
    }

    if (!depositPhone || (depositPhone.replace(/\D/g, '').length !== 10 && depositPhone.replace(/\D/g, '').length !== 9)) {
      showError('Enter valid phone (07XXXXXXXX or 7XXXXXXXX)');
      return;
    }

    const amount = Number(depositAmount);
    const phoneNumber = depositPhone;

    try {
      setIsProcessing(true);
      showLoading('Initiating M-Pesa payment...', 'deposit-processing');

      let userId = userData.user_id;
      
      if (!userId) {
        const backendUser = await findUserByPhone(phoneNumber);
        if (backendUser) {
          userId = backendUser.user_id;
          setUserData(backendUser);
          localStorage.setItem('userProfile', JSON.stringify(backendUser));
        } else {
          throw new Error('User not found. Please save your profile first.');
        }
      }

      const cleanPhone = phoneNumber.replace(/\D/g, '');
      let formattedPhone = '';
      
      if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
        formattedPhone = '254' + cleanPhone.substring(1);
      } else if (cleanPhone.length === 9) {
        formattedPhone = '254' + cleanPhone;
      } else if (cleanPhone.length === 12 && cleanPhone.startsWith('254')) {
        formattedPhone = cleanPhone;
      } else {
        throw new Error('Invalid phone number format');
      }

      const stkResponse = await fetch(`${API_BASE_URL}/api/mpesa/stk-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: formattedPhone,
          amount: amount.toString(),
          account_reference: userId,
          transaction_desc: "FanClash Deposit"
        }),
      });

      const stkResult = await stkResponse.json();

      if (!stkResponse.ok || !stkResult.success) {
        throw new Error(stkResult.error || stkResult.message || 'M-Pesa payment failed');
      }

      toast.success('Payment request sent! Check your phone', {
        id: 'deposit-processing',
        duration: 3000,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (userData.phone !== phoneNumber) {
        const updatedLocalData = { 
          ...userData, 
          phone: phoneNumber,
        };
        localStorage.setItem('userProfile', JSON.stringify(updatedLocalData));
        setUserData(updatedLocalData);
      }

      const newBalance = userData.balance + amount;

      showLoading('Processing payment...', 'update-balance');
      
      const updateResponse = await fetch(`${API_BASE_URL}/api/profile/update-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          balance: newBalance
        }),
      });
      
      if (updateResponse.ok) {
        const updatedUser = await updateResponse.json();
        
        const updatedLocalData = { 
          ...userData, 
          balance: updatedUser.balance || newBalance,
        };
        localStorage.setItem('userProfile', JSON.stringify(updatedLocalData));
        setUserData(updatedLocalData);
        
        setRecentTransaction(amount);
        setTimeout(() => setRecentTransaction(null), 3000);
        showSuccess(`Deposit successful! +Ksh ${amount.toLocaleString()} added!`);
        setDepositAmount('');
        setCurrentPage('view');
      } else {
        const errorText = await updateResponse.text();
        console.error('Balance update failed:', errorText);
        throw new Error('Failed to update balance. Please try again.');
      }

    } catch (error) {
      console.error('Deposit error:', error);
      toast.dismiss('deposit-processing');
      toast.dismiss('update-balance');
      showError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      showError('Enter valid amount');
      return;
    }

    const amount = Number(withdrawAmount);
    
    if (amount < 50) {
      showError('Minimum withdrawal is Ksh 50');
      return;
    }

    if (userData.balance < amount) {
      showError(`Insufficient balance. You have Ksh ${userData.balance.toLocaleString()}`);
      return;
    }

    const phoneNumber = withdrawPhone || userData.phone;
    
    if (!phoneNumber) {
      showError('Please set your phone number first');
      return;
    }

    try {
      setIsProcessing(true);
      showLoading('Processing withdrawal...', 'withdraw-processing');

      const formattedPhone = formatPhoneTo254(phoneNumber);
      
      const withdrawResponse = await fetch(`${API_BASE_URL}/api/mpesa/b2c/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: formattedPhone,
          amount: amount.toString(),
          command_id: 'BusinessPayment',
          remarks: 'Withdrawal from FanClash',
          occasion: 'Cash Withdrawal'
        }),
      });

      const withdrawResult = await withdrawResponse.json();

      if (!withdrawResponse.ok) {
        const errorMessage = withdrawResult.error || 
                          withdrawResult.response_description || 
                          'Withdrawal request failed';
        throw new Error(errorMessage);
      }

      if (withdrawResult.response_code !== "0" && withdrawResult.response_code !== "0.00") {
        let errorMsg = withdrawResult.response_description || 'M-Pesa transaction failed';
        throw new Error(errorMsg);
      }

      toast.success('Withdrawal initiated successfully!', {
        id: 'withdraw-processing',
        duration: 3000,
      });

      const newBalance = userData.balance - amount;

      showLoading('Updating balance...', 'update-withdraw-balance');
      
      const updateResponse = await fetch(`${API_BASE_URL}/api/profile/update-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.user_id,
          balance: newBalance
        }),
      });
      
      if (updateResponse.ok) {
        const updatedUser = await updateResponse.json();
        
        const updatedLocalData = { 
          ...userData, 
          balance: updatedUser.balance || newBalance,
        };
        localStorage.setItem('userProfile', JSON.stringify(updatedLocalData));
        setUserData(updatedLocalData);
        
        setRecentTransaction(-amount);
        setTimeout(() => setRecentTransaction(null), 3000);
        showSuccess(`Withdrawal of Ksh ${amount.toLocaleString()} processing!`);
        setWithdrawAmount('');
        setCurrentPage('view');
      } else {
        toast.warning('Withdrawal sent but balance update failed. Contact support.', {
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.dismiss('withdraw-processing');
      toast.dismiss('update-withdraw-balance');
      showError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsProcessing(true);
      showLoading('Logging out...', 'logout');

      localStorage.removeItem('userProfile');
      localStorage.removeItem('sessionToken');
      localStorage.setItem('forceNewUser', 'true');
      
      sessionStorage.clear();
      
      setUserData({
        username: '',
        phone: '',
        club_fan: '',
        nickname: '',
        country_fan: '',
        balance: 0,
        number_of_bets: 0,
        user_id: ''
      });
      
      setCurrentPage('edit');
      setIsNewUser(true);
      setDepositAmount('');
      setDepositPhone('');
      setWithdrawAmount('');
      setWithdrawPhone('');
      setRecentTransaction(null);
      
      if (onLogout) {
        onLogout();
      }
      
      toast.success('Successfully logged out!', {
        id: 'logout',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      showError('Error during logout.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle switch to new user mode
  const handleSwitchToNewUser = () => {
    setUserData({
      username: '',
      phone: '',
      club_fan: '',
      nickname: '',
      country_fan: '',
      balance: 0,
      number_of_bets: 0,
      user_id: ''
    });
    setIsNewUser(true);
    setCurrentPage('edit');
    localStorage.setItem('forceNewUser', 'true');
  };

  // Handle close
  const handleClose = () => {
    if (currentPage === 'view') {
      onClose();
    } else {
      const hasData = userData.username.trim() || userData.phone.trim();
      if (hasData && !isNewUser) {
        setCurrentPage('view');
      } else {
        onClose();
      }
    }
  };

  // Check if user has data
  const hasUserData = userData.username.trim() || userData.phone.trim();

  // Helper to get display values
  const getDisplayValue = (field: keyof UserData): string => {
    const value = userData[field];
    if (typeof value === 'string') {
      return value || 'Not set';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    return 'Not set';
  };

  // Check if user can withdraw (balance > 50)
  const canWithdraw = userData.balance > 50;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with glass effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
      />

      {/* Modal - Positioned at bottom with zero margin */}
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
        <motion.div
          ref={modalRef}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full"
        >
          {/* Main content with glass effect - NO borders */}
          <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.04] backdrop-blur-xl rounded-t-2xl overflow-hidden border-t border-white/[0.15]">
            
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-emerald-600/[0.03] pointer-events-none" />
            
            {/* Header with glass effect */}
            <div className="relative px-4 py-3 border-b border-white/[0.15] backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.05] via-transparent to-emerald-600/[0.05] opacity-50" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    className="h-8 w-8 rounded-full bg-white/[0.1] hover:bg-white/[0.15] flex items-center justify-center backdrop-blur-sm border border-white/[0.15]"
                  >
                    {currentPage === 'view' ? (
                      <X className="h-4 w-4 text-white/[0.8]" />
                    ) : (
                      <ArrowLeft className="h-4 w-4 text-white/[0.8]" />
                    )}
                  </motion.button>
                  <div>
                    <div className="flex items-center gap-1">
                      <h2 className="text-white text-sm font-bold">
                        {currentPage === 'view' ? (isNewUser ? 'Welcome!' : 'Profile') : 
                         currentPage === 'edit' ? (hasUserData && !isNewUser ? 'Edit Profile' : 'Setup Profile') : 
                         currentPage === 'deposit' ? 'Deposit Funds' : 'Withdraw Cash'}
                      </h2>
                      {currentPage === 'view' && hasUserData && !isNewUser && (
                        <Sparkles className="h-3 w-3 text-emerald-300 animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
                {currentPage === 'view' && hasUserData && !isNewUser && (
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => syncFromBackend(true)}
                      disabled={isSyncing}
                      className="p-1.5 bg-emerald-500/[0.1] border border-emerald-500/[0.3] rounded-full hover:bg-emerald-500/[0.2] backdrop-blur-sm"
                      title="Sync with server"
                    >
                      {isSyncing ? (
                        <Loader2 className="h-3 w-3 text-emerald-300 animate-spin" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-emerald-300" />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage('edit')}
                      className="px-3 py-1 text-xs font-medium bg-emerald-500/[0.1] text-emerald-300 border border-emerald-500/[0.3] rounded-full hover:bg-emerald-500/[0.2] backdrop-blur-sm"
                    >
                      Edit
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[70vh]">
              <AnimatePresence mode="wait">
                {currentPage === 'view' ? (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4"
                  >
                    {/* New User Welcome Screen */}
                    {isNewUser ? (
                      <div className="text-center py-6">
                        <div className="relative inline-block mb-3">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 blur-xl rounded-full opacity-20" />
                          <div className="relative p-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl shadow-emerald-500/20">
                            <UserPlus className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Welcome!</h3>
                        <p className="text-white/[0.6] text-sm mb-4">
                          Create your profile to start betting
                        </p>
                        
                        <div className="space-y-2">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCurrentPage('edit')}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-xl hover:shadow-emerald-500/20 backdrop-blur-sm"
                          >
                            Create Profile
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={loadUserFromBackend}
                            disabled={isSyncing}
                            className="w-full py-2 bg-white/[0.05] border border-white/[0.15] text-white rounded-xl text-sm hover:bg-white/[0.08] backdrop-blur-sm"
                          >
                            {isSyncing ? 'Checking...' : 'Already have an account?'}
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Stats Cards with glass effect */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {/* Balance Card */}
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="relative overflow-hidden bg-white/[0.05] border border-white/[0.1] rounded-xl p-3 backdrop-blur-sm"
                          >
                            <div className="absolute top-2 right-2">
                              <Wallet className="h-4 w-4 text-emerald-300 opacity-50" />
                            </div>
                            <div className="mb-2">
                              <div className="text-xs text-white/[0.6] font-medium">Balance</div>
                              <div className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                                Ksh {userData.balance.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-emerald-400/70 mt-0.5">
                                {isSyncing ? 'Syncing...' : 'Live'}
                              </div>
                            </div>
                            
                            {/* Text-only action buttons (no background) */}
                            <div className="flex gap-2 mt-2">
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentPage('deposit')}
                                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1"
                              >
                                <ArrowUpRight className="h-3 w-3" />
                                Add Funds
                              </motion.span>
                              
                              {canWithdraw && (
                                <motion.span
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setCurrentPage('withdraw')}
                                  className="text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1"
                                >
                                  <ArrowDownLeft className="h-3 w-3" />
                                  Withdraw
                                </motion.span>
                              )}
                            </div>
                            
                            {/* Recent transaction */}
                            {recentTransaction && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1 text-xs font-medium flex items-center gap-1"
                                style={{
                                  color: recentTransaction > 0 ? '#10b981' : '#ef4444'
                                }}
                              >
                                {recentTransaction > 0 ? '+' : '-'} Ksh {Math.abs(recentTransaction).toLocaleString()}
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Bets Card */}
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="relative bg-white/[0.05] border border-white/[0.1] rounded-xl p-3 backdrop-blur-sm"
                          >
                            <div className="absolute top-2 right-2">
                              <Trophy className="h-4 w-4 text-emerald-300 opacity-50" />
                            </div>
                            <div className="text-xs text-white/[0.6] font-medium">Total Bets</div>
                            <div className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                              {userData.number_of_bets}
                            </div>
                          </motion.div>
                        </div>

                        {/* User Info - NO background borders, just clean listing */}
                        <div className="space-y-3">
                          {[
                            { icon: User, label: 'Username', field: 'username' },
                            { icon: Phone, label: 'Phone', field: 'phone' },
                            { icon: Hash, label: 'Nickname', field: 'nickname' },
                            { icon: Trophy, label: 'Club Fan', field: 'club_fan' },
                            { icon: Globe, label: 'Country Fan', field: 'country_fan' },
                          ].map((item, index) => (
                            <motion.div
                              key={item.field}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.01, x: 2 }}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-all cursor-default group"
                            >
                              <div className={`p-2 rounded-lg bg-white/[0.08] group-hover:scale-110 transition-transform`}>
                                <item.icon className="h-4 w-4 text-emerald-300" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-white/[0.6] mb-0.5">{item.label}</div>
                                <div className="text-sm font-medium text-white">
                                  {getDisplayValue(item.field as keyof UserData)}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* User Actions Footer */}
                        <div className="mt-6 pt-4 border-t border-white/[0.1]">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleSwitchToNewUser}
                              className="flex-1 py-2 bg-white/[0.05] border border-white/[0.15] text-white rounded-lg text-xs hover:bg-white/[0.08] backdrop-blur-sm"
                            >
                              Switch Account
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleLogout}
                              disabled={isProcessing}
                              className="flex-1 py-2 bg-red-500/[0.1] border border-red-500/[0.2] text-red-300 rounded-lg text-xs hover:bg-red-500/[0.2] backdrop-blur-sm flex items-center justify-center gap-1"
                            >
                              <LogOut className="h-3 w-3" />
                              Logout
                            </motion.button>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ) : currentPage === 'edit' ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4"
                  >
                    {/* Edit Profile Content */}
                    <div className="space-y-3">
                      {[
                        { field: 'username', label: 'Username', placeholder: 'Enter username' },
                        { field: 'phone', label: 'Phone Number', placeholder: '0712345679', type: 'tel' },
                        { field: 'nickname', label: 'Nickname', placeholder: 'Your nickname' },
                        { field: 'club_fan', label: 'Club Fan', placeholder: 'Manchester United' },
                        { field: 'country_fan', label: 'Country Fan', placeholder: 'England' },
                      ].map((input, index) => (
                        <motion.div
                          key={input.field}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="space-y-1"
                        >
                          <label className="text-xs font-semibold text-white">
                            {input.label}
                          </label>
                          <input
                            type={input.type || 'text'}
                            value={userData[input.field as keyof UserData] as string}
                            onChange={(e) => setUserData(prev => ({
                              ...prev,
                              [input.field]: e.target.value
                            }))}
                            className="w-full p-3 text-sm border border-white/[0.15] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/40 bg-white/[0.05] backdrop-blur-sm text-white placeholder:text-white/[0.4]"
                            placeholder={input.placeholder}
                          />
                        </motion.div>
                      ))}

                      {/* Info Note */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-3 p-3 bg-white/[0.05] rounded-lg border border-white/[0.1] backdrop-blur-sm"
                      >
                        <div className="flex gap-2">
                          <Shield className="h-4 w-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-white/[0.7] leading-relaxed">
                            Balance and betting statistics are managed automatically.
                          </p>
                        </div>
                      </motion.div>

                      {/* Save Button */}
                      <div className="pt-2">
                        <div className="flex gap-2">
                          {isNewUser && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setCurrentPage('view');
                              }}
                              className="flex-1 py-3 bg-white/[0.05] border border-white/[0.15] text-white rounded-lg hover:bg-white/[0.08] hover:border-white/[0.25] backdrop-blur-sm text-sm"
                            >
                              Cancel
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={isProcessing}
                            className={`${isNewUser ? 'flex-1' : 'w-full'} py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:shadow-xl hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 backdrop-blur-sm`}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                {isNewUser ? 'Create Profile' : 'Save Changes'}
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : currentPage === 'deposit' ? (
                  <motion.div
                    key="deposit"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4"
                  >
                    {/* Deposit Content */}
                    <div className="text-center mb-4">
                      <div className="relative inline-block mb-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 blur-xl rounded-full opacity-20" />
                        <div className="relative p-3 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl shadow-emerald-500/20">
                          <ArrowUpRight className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">Deposit Funds</h3>
                      <p className="text-white/[0.6] text-xs">Add money to your account</p>
                    </div>

                    {/* Current Balance */}
                    <div className="mb-4 p-3 bg-white/[0.05] border border-white/[0.1] rounded-xl backdrop-blur-sm">
                      <div className="text-xs text-white/[0.6] mb-1">Current Balance</div>
                      <div className="text-lg font-bold bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                        Ksh {userData.balance.toLocaleString()}
                      </div>
                    </div>

                    {/* Deposit Form */}
                    <div className="space-y-3">
                      {/* Phone Input */}
                      <div>
                        <label className="text-xs font-semibold text-white mb-1 block">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300 text-xs">+254</div>
                          <input
                            type="tel"
                            value={depositPhone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 10) {
                                setDepositPhone(value);
                              }
                            }}
                            className="w-full pl-10 pr-3 py-2.5 bg-white/[0.05] border border-white/[0.15] rounded-lg text-white text-xs placeholder:text-white/[0.4] focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/40 backdrop-blur-sm"
                            placeholder="0712345679 or 712345678"
                            maxLength={10}
                          />
                        </div>
                        <p className="text-[10px] text-white/[0.5] mt-0.5 ml-1">
                          Enter M-Pesa number
                        </p>
                      </div>

                      {/* Amount Input */}
                      <div>
                        <label className="text-xs font-semibold text-white mb-1 block">
                          Amount (Ksh)
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300 text-xs">Ksh</div>
                          <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-white/[0.05] border border-white/[0.15] rounded-lg text-white text-xs font-bold placeholder:text-white/[0.4] focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/40 backdrop-blur-sm"
                            placeholder="0"
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Quick Amounts */}
                      <div>
                        <label className="text-xs font-semibold text-white mb-1 block">
                          Quick Select
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {[100, 500, 1000].map((amt) => (
                            <motion.button
                              key={amt}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setDepositAmount(amt.toString())}
                              className="py-1.5 bg-white/[0.05] border border-white/[0.1] text-white rounded text-xs hover:bg-white/[0.08] hover:border-white/[0.2] backdrop-blur-sm"
                            >
                              Ksh {amt}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Security Note */}
                      <div className="p-3 bg-white/[0.05] rounded-lg border border-white/[0.1] backdrop-blur-sm">
                        <div className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                          <p className="text-[11px] text-white/[0.7]">
                            You'll receive an M-Pesa prompt on your phone.
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCurrentPage('view')}
                            className="flex-1 py-2.5 bg-white/[0.05] border border-white/[0.15] text-white rounded-lg hover:bg-white/[0.08] hover:border-white/[0.25] backdrop-blur-sm text-xs"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDeposit}
                            disabled={isProcessing || !depositAmount || !depositPhone}
                            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/20 backdrop-blur-sm text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-3 w-3" />
                                Deposit
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Withdraw Page */
                  <motion.div
                    key="withdraw"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4"
                  >
                    {/* Withdraw Header */}
                    <div className="text-center mb-4">
                      <div className="relative inline-block mb-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 blur-xl rounded-full opacity-20" />
                        <div className="relative p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/20">
                          <ArrowDownLeft className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">Withdraw Cash</h3>
                      <p className="text-white/[0.6] text-xs">Withdraw to M-Pesa</p>
                    </div>

                    {/* Current Balance */}
                    <div className="mb-4 p-3 bg-white/[0.05] border border-white/[0.1] rounded-xl backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-white/[0.6] mb-1">Available Balance</div>
                          <div className="text-lg font-bold bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                            Ksh {userData.balance.toLocaleString()}
                          </div>
                        </div>
                        {!canWithdraw && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded">
                            <AlertCircle className="h-3 w-3 text-amber-400" />
                            <span className="text-xs text-amber-300">Min: Ksh 50</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Withdrawal Form */}
                    <div className="space-y-3">
                      {/* Phone Input */}
                      <div>
                        <label className="text-xs font-semibold text-white mb-1 block">
                          M-Pesa Number
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-xs">+254</div>
                          <input
                            type="tel"
                            value={withdrawPhone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 10) {
                                setWithdrawPhone(value);
                              }
                            }}
                            className="w-full pl-10 pr-3 py-2.5 bg-white/[0.05] border border-white/[0.15] rounded-lg text-white text-xs placeholder:text-white/[0.4] focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/40 backdrop-blur-sm"
                            placeholder="0712345679 or 712345678"
                            maxLength={10}
                          />
                        </div>
                      </div>

                      {/* Amount Input */}
                      <div>
                        <label className="text-xs font-semibold text-white mb-1 block">
                          Amount (Ksh)
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-xs">Ksh</div>
                          <input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-white/[0.05] border border-white/[0.15] rounded-lg text-white text-xs font-bold placeholder:text-white/[0.4] focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/40 backdrop-blur-sm"
                            placeholder="0"
                            min="50"
                            max={userData.balance}
                          />
                        </div>
                        <div className="flex justify-between mt-0.5">
                          <p className="text-[10px] text-white/[0.5]">
                            Min: Ksh 50
                          </p>
                          <p className="text-[10px] text-white/[0.5]">
                            Max: Ksh {userData.balance.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Quick Amounts */}
                      <div>
                        <label className="text-xs font-semibold text-white mb-1 block">
                          Quick Select
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {[50, 100, 500].map((amt) => (
                            <motion.button
                              key={amt}
                              onClick={() => {
                                if (amt <= userData.balance) {
                                  setWithdrawAmount(amt.toString());
                                } else {
                                  showError(`Amount exceeds balance`);
                                }
                              }}
                              disabled={amt > userData.balance}
                              className={`py-1.5 border rounded text-xs backdrop-blur-sm ${
                                amt > userData.balance
                                  ? 'bg-white/[0.03] border-white/[0.1] text-white/[0.3] cursor-not-allowed'
                                  : 'bg-white/[0.05] border-white/[0.1] text-white hover:bg-white/[0.08] hover:border-white/[0.2]'
                              }`}
                            >
                              Ksh {amt}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Fee Info */}
                      <div className="p-3 bg-white/[0.05] rounded-lg border border-white/[0.1] backdrop-blur-sm">
                        <div className="flex items-start gap-2">
                          <Coins className="h-4 w-4 text-blue-300 mt-0.5 flex-shrink-0" />
                          <p className="text-[11px] text-white/[0.7]">
                            <span className="font-semibold text-white">No fees!</span> Withdrawals are free.
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCurrentPage('view')}
                            className="flex-1 py-2.5 bg-white/[0.05] border border-white/[0.15] text-white rounded-lg hover:bg-white/[0.08] hover:border-white/[0.25] backdrop-blur-sm text-xs"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleWithdraw}
                            disabled={isProcessing || !withdrawAmount || Number(withdrawAmount) < 50 || Number(withdrawAmount) > userData.balance}
                            className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/20 backdrop-blur-sm text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <ArrowDownLeft className="h-3 w-3" />
                                Withdraw
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};