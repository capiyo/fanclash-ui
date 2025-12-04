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
  ChevronRight
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  username: string;
  phone: string;
  clubFan: string;
  nickname: string;
  countryFan: string;
  balance: number;
  numberOfBets: number;
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

  // Initialize user data
  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Return default if parsing fails
      }
    }
    return {
      username: '',
      phone: '',
      clubFan: '',
      nickname: '',
      countryFan: '',
      balance: 0,
      numberOfBets: 0,
      id: ''
    };
  });

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  // Close modal when clicking outside or pressing ESC
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
  }, [isOpen]);

  // Load user data
  const loadUserData = () => {
    try {
      const saved = localStorage.getItem('userProfile');
      if (saved) {
        const data = JSON.parse(saved);
        setUserData(data);
        setDepositPhone(data.phone || '');
        
        // If no user data, go to edit page
        const hasData = data.username?.trim() || data.phone?.trim();
        setCurrentPage(hasData ? 'view' : 'edit');
      } else {
        setCurrentPage('edit');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setCurrentPage('edit');
    }
  };

  // Toast helpers with emerald theme
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

  const showLoading = (message: string) => {
    toast.loading(message, {
      duration: 3000,
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

  // Save profile
  const handleSave = async () => {
    if (!userData.username.trim() && !userData.phone.trim()) {
      showError('Please enter at least username or phone');
      return;
    }

    try {
      setIsProcessing(true);
      showLoading('Saving profile...');

      // Generate ID if needed
      const userId = userData.id || `user_${Date.now()}`;
      const updatedData = { ...userData, id: userId };

      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(updatedData));
      setUserData(updatedData);

      // Save to server
      const response = await fetch(`${API_BASE_URL}/api/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          username: updatedData.username,
          phone: updatedData.phone,
          nickname: updatedData.nickname,
          club_fan: updatedData.clubFan,
          country_fan: updatedData.countryFan
        }),
      });

      if (response.ok) {
        showSuccess('Profile saved successfully!');
        setCurrentPage('view');
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showError('Saved locally (server error)');
      setCurrentPage('view');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      showError('Enter valid amount');
      return;
    }

    if (!depositPhone || depositPhone.replace(/\D/g, '').length !== 9) {
      showError('Enter valid phone (7XXXXXXXX)');
      return;
    }

    try {
      setIsProcessing(true);
      showLoading('Processing payment...');

      const amount = Number(depositAmount);
      const formattedPhone = '254' + depositPhone.replace(/\D/g, '');

      // Call payment API
      const response = await fetch(`${API_BASE_URL}/api/mpesa/stk-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          amount: amount,
          user_id: userData.id || 'guest'
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update balance
        const newBalance = userData.balance + amount;
        const updatedData = { 
          ...userData, 
          balance: newBalance,
          phone: depositPhone 
        };
        
        localStorage.setItem('userProfile', JSON.stringify(updatedData));
        setUserData(updatedData);
        
        // Update server balance
        if (userData.id) {
          await fetch(`${API_BASE_URL}/api/profile/update_balance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userData.id,
              balance: newBalance
            }),
          });
        }

        // Show success animation
        setRecentTransaction(amount);
        setTimeout(() => setRecentTransaction(null), 3000);
        
        showSuccess(`+Ksh ${amount.toLocaleString()} added!`);
        setDepositAmount('');
        setCurrentPage('view');
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Payment failed');
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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage('edit')}
                    className="px-4 py-1.5 text-[13px] font-medium bg-emerald-500/[0.1] text-emerald-300 border border-emerald-500/[0.3] rounded-full hover:bg-emerald-500/[0.2] transition-all shadow-sm backdrop-blur-sm"
                  >
                    Edit
                  </motion.button>
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
                          {userData.numberOfBets}
                        </div>
                      </motion.div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-3">
                      {[
                        { icon: User, label: 'Username', value: userData.username },
                        { icon: Phone, label: 'Phone', value: userData.phone },
                        { icon: Hash, label: 'Nickname', value: userData.nickname },
                        { icon: Trophy, label: 'Club Fan', value: userData.clubFan },
                        { icon: Globe, label: 'Country Fan', value: userData.countryFan },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
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
                                {item.value || <span className="text-white/[0.4]">Not set</span>}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
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
                        { field: 'clubFan', label: 'Club Fan', placeholder: 'Manchester United' },
                        { field: 'countryFan', label: 'Country Fan', placeholder: 'England' },
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
                            onChange={(e) => setDepositPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/[0.05] border border-white/[0.15] rounded-xl text-white text-sm placeholder:text-white/[0.4] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all backdrop-blur-sm"
                            placeholder="712345678"
                            maxLength={9}
                          />
                        </div>
                        <p className="text-[11px] text-white/[0.5] mt-1 ml-1">
                          Enter 9-digit number (7XXXXXXXX)
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
                      <div className="p-3 bg-white/[0.05] border border-white/[0.1] rounded-lg backdrop-blur-sm">
                        <div className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                          <p className="text-[11px] text-white/[0.7]">
                            Your payment is secured with end-to-end encryption.
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