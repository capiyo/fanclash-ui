import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Phone, 
  Trophy, 
  X,
  Hash,
  Globe,
  ArrowLeft,
  Save,
  Sparkles,
  TrendingUp,
  Award,
  CreditCard,
  Loader2,
  Wallet,
  Coins,
  Shield,
  RefreshCw
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  id?: string;
}

export const UserProfileModal = ({ isOpen, onClose }: UserProfileModalProps) => {
  const API_BASE_URL = 'https://fanclash-api.onrender.com';
  
  const [currentPage, setCurrentPage] = useState<'view' | 'edit' | 'deposit'>('view');
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPhone, setDepositPhone] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const [recentTransaction, setRecentTransaction] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize empty user data - will be loaded from backend
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
      loadUserFromBackend();
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

  // Toast helpers
  const showError = (message: string) => {
    toast.error(message, {
      duration: 2000,
      position: 'top-center',
      style: {
        background: 'rgba(239, 68, 68, 0.95)',
        color: 'white',
        borderRadius: '10px',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        backdropFilter: 'blur(10px)'
      }
    });
  };

  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 2000,
      position: 'top-center',
      style: {
        background: 'rgba(16, 185, 129, 0.95)',
        color: 'white',
        borderRadius: '10px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        backdropFilter: 'blur(10px)'
      }
    });
  };

  const showLoading = (message: string, id: string = 'loading') => {
    toast.loading(message, {
      id,
      duration: 5000,
      position: 'top-center',
      style: {
        background: 'rgba(16, 185, 129, 0.95)',
        color: 'white',
        borderRadius: '10px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        backdropFilter: 'blur(10px)'
      }
    });
  };

  // Find user by phone in backend
 





































  const findUserByPhone = async (phone: string): Promise<UserData | null> => {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Try different phone formats
    const phoneFormats = [];
    
    // 1. Clean phone as-is (could be 0704306867 or 704306867)
    phoneFormats.push(cleanPhone);
    
    // 2. If it starts with 0, try without 0 (0704306867 -> 704306867)
    if (cleanPhone.startsWith('0')) {
      phoneFormats.push(cleanPhone.substring(1));
    }
    
    // 3. Try with 254 prefix (704306867 -> 254704306867)
    if (cleanPhone.length === 9) {
      phoneFormats.push('254' + cleanPhone);
    } else if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
      phoneFormats.push('254' + cleanPhone.substring(1));
    }
    
    console.log('Searching for phone formats:', phoneFormats);
    
    // Try each format
    for (const phoneFormat of phoneFormats) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/profile/phone/${phoneFormat}`);
        
        if (response.ok) {
          const backendUser = await response.json();
          console.log(`✅ Found user with phone format ${phoneFormat}:`, backendUser);
          
          return {
            user_id: backendUser.user_id,
            username: backendUser.username || '',
            phone: phone, // Keep the original local format
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
  
  // Already in 254 format
  if (clean.length === 12 && clean.startsWith('254')) {
    return clean;
  }
  
  // Convert 0704306867 or 704306867 to 254704306867
  if (clean.length === 10 && clean.startsWith('0')) {
    return '254' + clean.substring(1);
  }
  
  if (clean.length === 9) {
    return '254' + clean;
  }
  
  return clean;
};




























  // Load user from backend (primary source of truth)
  const loadUserFromBackend = async () => {
    try {
      setIsSyncing(true);
      
      // 1. Check if we have phone in localStorage
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
      
      // 2. Try to find user by phone in backend
      if (localPhone) {
        const backendUser = await findUserByPhone(localPhone);
        
        if (backendUser) {
          // User found in backend - use backend data
          setUserData(backendUser);
          setDepositPhone(backendUser.phone);
          localStorage.setItem('userProfile', JSON.stringify(backendUser));
          setCurrentPage('view');
          setIsSyncing(false);
          return;
        }
      }
      
      // 3. No user found in backend, check local storage
      if (saved) {
        try {
          const localData = JSON.parse(saved);
          setUserData(localData);
          setDepositPhone(localData.phone || '');
          
          // Check if we have minimal data
          const hasData = localData.username?.trim() || localData.phone?.trim();
          setCurrentPage(hasData ? 'view' : 'edit');
        } catch {
          setCurrentPage('edit');
        }
      } else {
        setCurrentPage('edit');
      }
      
    } catch (error) {
      console.error('Error loading user:', error);
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

      // Format phone for backend
      const formatPhoneTo254 = (phone: string): string => {
        const clean = phone.replace(/\D/g, '');
        if (clean.length === 10 && clean.startsWith('0')) {
          return '254' + clean.substring(1);
        }
        if (clean.length === 9) {
          return '254' + clean;
        }
        return clean;
      };

      const formattedPhone = formatPhoneTo254(userData.phone);
      
      // Generate user ID
      const userId = userData.user_id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare profile data
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

      console.log('Saving profile:', profileData);

      // Save to backend
      const response = await fetch(`${API_BASE_URL}/api/profile/create_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile saved:', result);
        
        // Update local data with backend response
        const updatedData: UserData = {
          ...userData,
          user_id: result.user_id || userId,
          balance: result.balance || userData.balance
        };
        
        setUserData(updatedData);
        localStorage.setItem('userProfile', JSON.stringify(updatedData));
        
        showSuccess('Profile saved successfully!');
        setCurrentPage('view');
      } else {
        const errorText = await response.text();
        console.error('Save failed, trying update...', errorText);
        
        // Try update if create failed (user might already exist)
        const updateResponse = await fetch(`${API_BASE_URL}/api/profile/profiles/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        });
        
        if (updateResponse.ok) {
          const result = await updateResponse.json();
          console.log('Profile updated:', result);
          
          const updatedData: UserData = {
            ...userData,
            user_id: result.user_id || userId,
            balance: result.balance || userData.balance
          };
          
          setUserData(updatedData);
          localStorage.setItem('userProfile', JSON.stringify(updatedData));
          
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

      // Get user ID - MUST come from backend
      let userId = userData.user_id;
      
      if (!userId) {
        // Try to find user by phone in backend
        const backendUser = await findUserByPhone(phoneNumber);
        if (backendUser) {
          userId = backendUser.user_id;
          // Update local data with backend user
          setUserData(backendUser);
          localStorage.setItem('userProfile', JSON.stringify(backendUser));
        } else {
          throw new Error('User not found. Please save your profile first.');
        }
      }

      // Format phone for M-Pesa
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

      console.log('Processing deposit for user:', {
        userId,
        currentBalance: userData.balance,
        depositAmount: amount,
        phone: formattedPhone
      });

      // 1. M-Pesa STK Push
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
      console.log('M-Pesa STK Response:', stkResult);

      if (!stkResponse.ok || !stkResult.success) {
        throw new Error(stkResult.error || stkResult.message || 'M-Pesa payment failed');
      }

      // STK Push successful
      toast.success('✓ Payment request sent! Check your phone', {
        id: 'deposit-processing',
        duration: 3000,
        position: 'top-center',
        style: {
          background: 'rgba(16, 185, 129, 0.95)',
          color: 'white',
          fontSize: '12px',
          padding: '8px 16px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        },
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Update phone locally if changed
      if (userData.phone !== phoneNumber) {
        const updatedLocalData = { 
          ...userData, 
          phone: phoneNumber,
        };
        localStorage.setItem('userProfile', JSON.stringify(updatedLocalData));
        setUserData(updatedLocalData);
      }

      // 3. Calculate new balance
      const newBalance = userData.balance + amount;
      console.log(`Updating balance: ${userData.balance} + ${amount} = ${newBalance}`);

      // 4. Update balance on backend
      showLoading('Processing payment...', 'update-balance');
      
      const updateResponse = await fetch(`${API_BASE_URL}/api/profile/update-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          balance: newBalance
        }),
      });

      console.log('Update balance response status:', updateResponse.status);
      
      if (updateResponse.ok) {
        const updatedUser = await updateResponse.json();
        console.log('✅ Balance update successful:', updatedUser);
        
        // Update local data with backend response
        const updatedLocalData = { 
          ...userData, 
          balance: updatedUser.balance || newBalance,
        };
        localStorage.setItem('userProfile', JSON.stringify(updatedLocalData));
        setUserData(updatedLocalData);
        
        setRecentTransaction(amount);
        setTimeout(() => setRecentTransaction(null), 3000);
        showSuccess(`Payment successful! +Ksh ${amount.toLocaleString()} added!`);
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

  // Handle close
  const handleClose = () => {
    if (currentPage === 'view') {
      onClose();
    } else if (currentPage === 'deposit') {
      setCurrentPage('view');
    } else {
      const hasData = userData.username.trim() || userData.phone.trim();
      if (hasData) {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          className="w-full max-w-md"
        >
          {/* Glass card */}
          <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl shadow-2xl overflow-hidden border border-white/[0.15] backdrop-blur-[20px]">
            
            {/* Frosted glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-green-500/[0.03] pointer-events-none" />
            
            {/* Header */}
            <div className="relative px-6 py-4 border-b border-white/[0.15] backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.05] via-transparent to-green-500/[0.05] opacity-50" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    className="h-9 w-9 rounded-full bg-white/[0.08] hover:bg-white/[0.12] flex items-center justify-center transition-colors backdrop-blur-sm border border-white/[0.15]"
                  >
                    {currentPage === 'view' ? (
                      <X className="h-4 w-4 text-white/[0.8]" />
                    ) : (
                      <ArrowLeft className="h-4 w-4 text-white/[0.8]" />
                    )}
                  </motion.button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-white text-[17px] font-bold leading-tight">
                        {currentPage === 'view' ? 'Profile' : 
                         currentPage === 'edit' ? (hasUserData ? 'Edit Profile' : 'Setup Profile') : 
                         'Deposit Funds'}
                      </h2>
                      {currentPage === 'view' && hasUserData && (
                        <Sparkles className="h-3.5 w-3.5 text-emerald-300 animate-pulse" />
                      )}
                    </div>
                    {currentPage === 'view' && userData.nickname && (
                      <p className="text-white/[0.6] text-[13px] leading-tight">
                        {userData.nickname}
                      </p>
                    )}
                  </div>
                </div>
                {currentPage === 'view' && hasUserData && (
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => syncFromBackend(true)}
                      disabled={isSyncing}
                      className="p-2 bg-emerald-500/[0.1] border border-emerald-500/[0.3] rounded-full hover:bg-emerald-500/[0.2] transition-all backdrop-blur-sm"
                      title="Sync with server"
                    >
                      <RefreshCw className={`h-4 w-4 text-emerald-300 ${isSyncing ? 'animate-spin' : ''}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage('edit')}
                      className="px-4 py-1.5 text-[13px] font-medium bg-emerald-500/[0.1] text-emerald-300 border border-emerald-500/[0.3] rounded-full hover:bg-emerald-500/[0.2] transition-all shadow-sm backdrop-blur-sm"
                    >
                      Edit
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="relative overflow-y-auto max-h-[70vh]">
              <AnimatePresence mode="wait">
                {currentPage === 'view' ? (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6"
                  >
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {/* Balance Card */}
                      <motion.div 
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="relative overflow-hidden bg-white/[0.05] border border-white/[0.1] rounded-xl p-5 backdrop-blur-sm shadow-lg shadow-black/[0.1]"
                      >
                        <div className="absolute top-3 right-3">
                          <Wallet className="h-5 w-5 text-emerald-300 opacity-50" />
                        </div>
                        <div className="mb-2">
                          <div className="text-[13px] text-white/[0.6] font-medium">Balance</div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                            Ksh {userData.balance.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-emerald-400/70 mt-1">
                            {isSyncing ? 'Syncing...' : 'Live from server'}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage('deposit')}
                          className="mt-3 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 backdrop-blur-sm border border-emerald-500/[0.3]"
                        >
                          <Coins className="h-4 w-4" />
                          Add Funds
                        </motion.button>
                        
                        {/* Recent transaction animation */}
                        {recentTransaction && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-xs text-emerald-300 font-medium flex items-center gap-1"
                          >
                            <TrendingUp className="h-3 w-3" />
                            + Ksh {recentTransaction.toLocaleString()}
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Bets Card */}
                      <motion.div 
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="relative bg-white/[0.05] border border-white/[0.1] rounded-xl p-5 backdrop-blur-sm shadow-lg shadow-black/[0.1]"
                      >
                        <div className="absolute top-3 right-3">
                          <Award className="h-5 w-5 text-emerald-300 opacity-50" />
                        </div>
                        <div className="text-[13px] text-white/[0.6] font-medium">Total Bets</div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                          {userData.number_of_bets}
                        </div>
                      </motion.div>
                    </div>

                    {/* User Info */}
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
                          whileHover={{ scale: 1.01, x: 4 }}
                          className="group p-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] transition-all cursor-default"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg bg-white/[0.08] group-hover:scale-110 transition-transform`}>
                              <item.icon className="h-4 w-4 text-emerald-300" />
                            </div>
                            <div className="flex-1">
                              <div className="text-[12px] text-white/[0.6] mb-0.5">{item.label}</div>
                              <div className="text-[15px] font-medium text-white">
                                {getDisplayValue(item.field as keyof UserData)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Sync Status */}
                    {userData.user_id && (
                      <div className="mt-6 pt-4 border-t border-white/[0.1]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                            <span className="text-xs text-white/[0.6]">
                              {isSyncing ? 'Syncing...' : 'Connected to server'}
                            </span>
                          </div>
                          <span className="text-xs text-white/[0.5] font-mono">
                            ID: {userData.user_id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : currentPage === 'edit' ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6"
                  >
                    <div className="space-y-4">
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
                          className="space-y-2"
                        >
                          <label className="text-[13px] font-semibold text-white block">
                            {input.label}
                          </label>
                          <input
                            type={input.type || 'text'}
                            value={userData[input.field as keyof UserData] as string}
                            onChange={(e) => setUserData(prev => ({
                              ...prev,
                              [input.field]: e.target.value
                            }))}
                            className="w-full p-3.5 text-[14px] border border-white/[0.15] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 bg-white/[0.05] backdrop-blur-sm text-white placeholder:text-white/[0.4] transition-all hover:border-white/[0.25]"
                            placeholder={input.placeholder}
                          />
                        </motion.div>
                      ))}

                      {/* Info Note */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 p-4 bg-white/[0.05] rounded-xl border border-white/[0.1] backdrop-blur-sm"
                      >
                        <div className="flex gap-2">
                          <Shield className="h-4 w-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                          <p className="text-[12px] text-white/[0.7] leading-relaxed">
                            <span className="font-semibold text-white">Note:</span> Balance and betting statistics are managed automatically.
                          </p>
                        </div>
                      </motion.div>

                      {/* Save Button */}
                      <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-black/[0.5] via-transparent to-transparent">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSave}
                          disabled={isProcessing}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[15px] font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              {hasUserData ? 'Save Changes' : 'Create Profile'}
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="deposit"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6"
                  >
                    {/* Deposit Header */}
                    <div className="text-center mb-6">
                      <div className="relative inline-block mb-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 blur-xl rounded-full opacity-30" />
                        <div className="relative p-4 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 shadow-xl shadow-emerald-500/30">
                          <Coins className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-[18px] font-bold text-white mb-2">Deposit Funds</h3>
                      <p className="text-white/[0.6] text-[13px]">Add money to your account</p>
                    </div>

                    {/* Current Balance */}
                    <div className="mb-6 p-4 bg-white/[0.05] border border-white/[0.1] rounded-xl backdrop-blur-sm">
                      <div className="text-[12px] text-white/[0.6] mb-1">Current Balance</div>
                      <div className="text-[24px] font-bold bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                        Ksh {userData.balance.toLocaleString()}
                      </div>
                    </div>

                    {/* Deposit Form */}
                    <div className="space-y-4">
                      {/* Phone Input */}
                      <div>
                        <label className="text-[13px] font-semibold text-white mb-2 block">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300 font-bold text-sm">+254</div>
                          <input
                            type="tel"
                            value={depositPhone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 10) {
                                setDepositPhone(value);
                              }
                            }}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/[0.05] border border-white/[0.15] rounded-xl text-white text-sm placeholder:text-white/[0.4] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all backdrop-blur-sm"
                            placeholder="0712345679 or 712345678"
                            maxLength={10}
                          />
                        </div>
                        <p className="text-[11px] text-white/[0.5] mt-1 ml-1">
                          Enter M-Pesa number (07XXXXXXXX or 7XXXXXXXX)
                        </p>
                      </div>

                      {/* Amount Input */}
                      <div>
                        <label className="text-[13px] font-semibold text-white mb-2 block">
                          Amount (Ksh)
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300 font-bold text-sm">Ksh</div>
                          <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/[0.05] border border-white/[0.15] rounded-xl text-white text-sm font-bold placeholder:text-white/[0.4] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all backdrop-blur-sm"
                            placeholder="0"
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Quick Amounts */}
                      <div>
                        <label className="text-[13px] font-semibold text-white mb-2 block">
                          Quick Select
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[100, 500, 1000, 2000, 5000, 10000].map((amt) => (
                            <motion.button
                              key={amt}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setDepositAmount(amt.toString())}
                              className="py-2.5 bg-white/[0.05] border border-white/[0.1] text-white rounded-lg hover:bg-white/[0.08] hover:border-white/[0.2] transition-all text-xs font-medium backdrop-blur-sm"
                            >
                              Ksh {amt.toLocaleString()}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Security Note */}
                      <div className="p-3 bg-white/[0.05] rounded-lg border border-white/[0.1] backdrop-blur-sm">
                        <div className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                          <p className="text-[11px] text-white/[0.7]">
                            You'll receive an M-Pesa prompt on your phone. Please enter your PIN to complete the payment.
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-black/[0.5] via-transparent to-transparent">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCurrentPage('view')}
                            className="flex-1 py-3 bg-white/[0.05] border border-white/[0.15] text-white rounded-xl hover:bg-white/[0.08] hover:border-white/[0.25] transition-all text-sm font-medium backdrop-blur-sm"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDeposit}
                            disabled={isProcessing || !depositAmount || !depositPhone}
                            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4" />
                                Deposit Now
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