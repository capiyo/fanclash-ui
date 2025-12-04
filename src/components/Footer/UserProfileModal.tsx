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
  ArrowRight,
  Wallet,
  Coins,
  Shield,
  CheckCircle
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

interface PaymentResponse {
  success: boolean;
  message: string;
  balance?: number;
}

export const UserProfileModal = ({ isOpen, onClose }: UserProfileModalProps) => {
  const [currentPage, setCurrentPage] = useState<'view' | 'edit' | 'deposit'>('view');
  const [recentDeposit, setRecentDeposit] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPhone, setDepositPhone] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
   const API_BASE_URL = 'https://fanclash-api.onrender.com';
  
  const defaultFormData: UserData = {
    username: '',
    phone: '',
    clubFan: '',
    nickname: '',
    countryFan: '',
    balance: 100,
    numberOfBets: 0,
    id: ''
  };

  const [formData, setFormData] = useState<UserData>(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fanClub && !parsed.nickname) {
          parsed.nickname = parsed.fanClub;
          delete parsed.fanClub;
        }
        return { ...defaultFormData, ...parsed };
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
    return defaultFormData;
  });

  // Initialize deposit phone from form data
  useEffect(() => {
    if (formData.phone) {
      setDepositPhone(formData.phone);
    }
  }, [formData.phone]);

  // Generate user ID if not exists
  const generateUserId = () => {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const updatedData = { ...formData, id: userId };
    setFormData(updatedData);
    localStorage.setItem('userProfile', JSON.stringify(updatedData));
    return userId;
  };

  // Update user balance on server
  const updateUserBalance = async (userId: string, newBalance: number) => {
    try {
      const response = await fetch('/api/user/update-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          balance: newBalance,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update server balance');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update server balance:', error);
      return { success: true };
    }
  };

  // Handle deposit payment
 const handleDeposit = async () => {
  if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
    toast.error('Enter valid amount', {
      duration: 2000,
      position: 'top-center',
      style: {
        background: 'rgba(16, 185, 129, 0.95)',
        color: 'white',
        fontSize: '12px',
        padding: '8px 16px',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }
    });
    return;
  }

  if (!depositPhone || depositPhone.replace(/\D/g, '').length !== 10) {
    toast.error('Enter valid 10-digit phone', {
      duration: 2000,
      position: 'top-center',
      style: {
        background: 'rgba(16, 185, 129, 0.95)',
        color: 'white',
        fontSize: '12px',
        padding: '8px 16px',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }
    });
    return;
  }

  const amount = Number(depositAmount);
  const phoneNumber = depositPhone;

  try {
    setIsProcessing(true);
    
    // Show centered emerald processing toast
    toast.loading('Processing...', { 
      id: 'deposit',
      duration: 5000,
      position: 'top-center',
      style: {
        background: 'rgba(16, 185, 129, 0.95)',
        color: 'white',
        fontSize: '12px',
        padding: '8px 16px',
        borderRadius: '8px',
        minWidth: '120px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      },
    });
    
    // Get or generate user ID
    const userId = formData.id || generateUserId();
    
    // Clean phone number and convert to format: 2547XXXXXXXX
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      throw new Error('Invalid phone number');
    }
    
    // Convert from 07XXXXXXXX to 2547XXXXXXXX
    const formattedPhone = '254' + cleanPhone.substring(1);

    // Update phone in form data if different
    if (formData.phone !== phoneNumber) {
      const updatedFormData = { 
        ...formData, 
        phone: phoneNumber,
        id: userId 
      };
      setFormData(updatedFormData);
      localStorage.setItem('userProfile', JSON.stringify(updatedFormData));
    }

    // Call M-Pesa API with the correct format
    const response = await fetch(`${API_BASE_URL}/api/mpesa/stk-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: formattedPhone, // Must be "254712345678"
        amount: amount.toString(), // Must be string
        account_reference: userId, // Use user ID as reference
        transaction_desc: "FanClash Deposit" // Optional description
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Update local balance
      const updatedBalance = formData.balance + amount;
      const updatedFormData = { 
        ...formData, 
        balance: updatedBalance,
        phone: phoneNumber,
        id: userId 
      };
      
      setFormData(updatedFormData);
      
      // Update localStorage
      localStorage.setItem('userProfile', JSON.stringify(updatedFormData));
      
      // Show success animation
      setRecentDeposit(amount);
      setTimeout(() => setRecentDeposit(null), 3000);
      
      // Update server balance via user ID
      await updateUserBalance(userId, updatedBalance);
      
      // Show centered emerald success toast
      toast.success(`+Ksh ${amount.toLocaleString()}`, { 
        id: 'deposit',
        duration: 2000,
        position: 'top-center',
        icon: '✅',
        style: {
          background: 'rgba(16, 185, 129, 0.95)',
          color: 'white',
          fontSize: '12px',
          padding: '8px 16px',
          borderRadius: '8px',
          minWidth: '120px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        },
      });
      
      // Reset form and go back to view page
      setDepositAmount('');
      setCurrentPage('view');
    } else {
      throw new Error(data.error || data.message || 'Payment failed');
    }
  } catch (error) {
    console.error('Deposit error:', error);
    toast.error(error instanceof Error ? error.message : 'Payment failed', {
      id: 'deposit',
      duration: 2000,
      position: 'top-center',
      style: {
        background: 'rgba(16, 185, 129, 0.95)',
        color: 'white',
        fontSize: '12px',
        padding: '8px 16px',
        borderRadius: '8px',
        minWidth: '120px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      },
    });
  } finally {
    setIsProcessing(false);
  }
};

  useEffect(() => {
    const savedData = localStorage.getItem('userProfile');
    const hasUserData = savedData && Object.values(JSON.parse(savedData)).some(val => {
      if (typeof val === 'string') return val.trim() !== '';
      if (typeof val === 'number') return val !== 0;
      return false;
    });
    
    if (!hasUserData) {
      setCurrentPage('edit');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem('userProfile');
      const hasUserData = savedData && Object.values(JSON.parse(savedData)).some(val => {
        if (typeof val === 'string') return val.trim() !== '';
        if (typeof val === 'number') return val !== 0;
        return false;
      });
      
      setCurrentPage(hasUserData ? 'view' : 'edit');
    }
  }, [isOpen]);

  useEffect(() => {
    const hasData = Object.values(formData).some(val => {
      if (typeof val === 'string') return val.trim() !== '';
      if (typeof val === 'number') return val !== 0;
      return false;
    });
    if (hasData) {
      localStorage.setItem('userProfile', JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (currentPage === 'edit' || currentPage === 'deposit') {
          const savedData = localStorage.getItem('userProfile');
          const hasUserData = savedData && Object.values(JSON.parse(savedData)).some(val => {
            if (typeof val === 'string') return val.trim() !== '';
            if (typeof val === 'number') return val !== 0;
            return false;
          });
          
          if (hasUserData) {
            setCurrentPage('view');
          } else {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose, currentPage]);

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Profile saved:', formData);
    
    const hasData = Object.values(formData).some(val => {
      if (typeof val === 'string') return val.trim() !== '';
      if (typeof val === 'number') return val !== 0;
      return false;
    });
    if (hasData) {
      setCurrentPage('view');
    }
  };

  if (!isOpen) return null;

  const pageVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? '100%' : '-100%',
      opacity: 0
    })
  };

  const getPageDirection = (from: string, to: string) => {
    const order = ['view', 'edit', 'deposit'];
    return order.indexOf(from) < order.indexOf(to) ? 'right' : 'left';
  };

  const hasUserData = Object.values(formData).some(val => {
    if (typeof val === 'string') return val.trim() !== '';
    if (typeof val === 'number') return val !== 0;
    return false;
  });

  return (
    <>
      {/* Transparent backdrop with blur */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
        <motion.div
          ref={modalRef}
          initial={{ y: "100%", scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: "100%", scale: 0.95 }}
          transition={{ 
            type: "spring",
            damping: 25,
            stiffness: 300
          }}
          className="relative w-full max-w-md"
        >
          {/* Main Card - Completely Transparent Glass Effect */}
          <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-white/[0.15] backdrop-blur-[20px]">
            
            {/* Frosted glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-green-500/[0.03] pointer-events-none" />
            
            {/* Mobile handle - transparent */}
            <div className="sm:hidden pt-4 pb-2 flex justify-center relative z-10">
              <div className="w-16 h-1.5 bg-gradient-to-r from-white/[0.3] via-white/[0.5] to-white/[0.3] rounded-full shadow-lg shadow-white/[0.1]"></div>
            </div>
            
            {/* Header with transparent glass effect */}
            <div className="relative px-4 py-3 border-b border-white/[0.15] backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.05] via-transparent to-green-500/[0.05] opacity-50" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (currentPage === 'view') {
                        onClose();
                      } else if (currentPage === 'deposit') {
                        setCurrentPage('view');
                      } else if (hasUserData) {
                        setCurrentPage('view');
                      } else {
                        onClose();
                      }
                    }}
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
                         currentPage === 'edit' ? (hasUserData ? 'Edit profile' : 'Setup profile') : 
                         'Deposit Funds'}
                      </h2>
                      {currentPage === 'view' && hasUserData && (
                        <Sparkles className="h-3.5 w-3.5 text-emerald-300 animate-pulse" />
                      )}
                    </div>
                    {currentPage === 'view' && formData.nickname && (
                      <p className="text-white/[0.6] text-[13px] leading-tight">
                        {formData.nickname}
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

            {/* Pages Container */}
            <div className="relative overflow-hidden h-[500px]">
              <AnimatePresence mode="wait">
                {currentPage === 'view' ? (
                  <motion.div
                    key="view-page"
                    custom={getPageDirection('view', 'view')}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ 
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0 overflow-y-auto"
                  >
                    {/* Profile Stats Bar with transparent glass cards */}
                    <div className="px-4 py-4 border-b border-white/[0.1]">
                      <div className="grid grid-cols-2 gap-3">
                        <motion.div 
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="relative bg-white/[0.05] border border-white/[0.1] rounded-xl p-4 backdrop-blur-sm shadow-lg shadow-black/[0.1] overflow-hidden group"
                        >
                          {/* Animated gradient background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0] via-emerald-500/[0.05] to-emerald-500/[0] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          
                          <div className="absolute top-2 right-2">
                            <Wallet className="h-4 w-4 text-emerald-300 opacity-50" />
                          </div>
                          
                          <div className="relative">
                            <div className="text-[13px] text-white/[0.6] mb-1 font-medium flex items-center justify-between">
                              <span>Balance</span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentPage('deposit')}
                                className="px-3 py-1 text-xs bg-emerald-500/[0.1] border border-emerald-500/[0.3] text-emerald-300 rounded-full hover:bg-emerald-500/[0.2] hover:border-emerald-500/[0.4] hover:text-emerald-200 transition-all flex items-center gap-1.5 backdrop-blur-sm"
                                disabled={isProcessing}
                              >
                                <CreditCard className="h-3 w-3" />
                                {isProcessing ? 'Processing...' : 'Deposit'}
                              </motion.button>
                            </div>
                            
                            <div className="text-[20px] font-bold text-white bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                              Ksh {formData.balance.toLocaleString()}
                            </div>
                            
                            {/* Recent deposit animation */}
                            {recentDeposit && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-2 text-xs text-emerald-300 font-medium flex items-center gap-1"
                              >
                                <TrendingUp className="h-3 w-3" />
                                + Ksh {recentDeposit.toLocaleString()} added
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="relative bg-white/[0.05] border border-white/[0.1] rounded-xl p-4 backdrop-blur-sm shadow-lg shadow-black/[0.1]"
                        >
                          <div className="absolute top-2 right-2">
                            <Award className="h-4 w-4 text-emerald-300 opacity-50" />
                          </div>
                          <div className="text-[13px] text-white/[0.6] mb-1 font-medium">Total Bets</div>
                          <div className="text-[20px] font-bold text-white bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                            {formData.numberOfBets}
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* User Details with transparent glass effect */}
                    <div className="p-4 space-y-3">
                      {[
                        { icon: User, label: 'Username', value: formData.username },
                        { icon: Phone, label: 'Phone', value: formData.phone },
                        { icon: Hash, label: 'Nickname', value: formData.nickname },
                        { icon: Trophy, label: 'Club Fan', value: formData.clubFan },
                        { icon: Globe, label: 'Country Fan', value: formData.countryFan },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01, x: 4 }}
                          className="group p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] transition-all cursor-default"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-white/[0.08] group-hover:scale-110 transition-transform`}>
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

                    {/* Empty state */}
                    {!hasUserData && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 text-center"
                      >
                        <div className="relative inline-block mb-4">
                          <div className="absolute inset-0 bg-emerald-500/[0.1] blur-2xl rounded-full" />
                          <User className="relative h-16 w-16 text-emerald-300 mx-auto" />
                        </div>
                        <h3 className="text-[17px] font-bold text-white mb-2">No profile data</h3>
                        <p className="text-[14px] text-white/[0.6] mb-6">
                          Setup your profile to get started
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage('edit')}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[14px] font-medium rounded-full hover:shadow-lg hover:shadow-emerald-500/30 transition-all backdrop-blur-sm"
                        >
                          Setup Profile
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                ) : currentPage === 'edit' ? (
                  <motion.div
                    key="edit-page"
                    custom={getPageDirection('view', 'edit')}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ 
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0 overflow-y-auto"
                  >
                    {/* Edit Form */}
                    <div className="p-4 space-y-4">
                      {[
                        { field: 'username', label: 'Username', placeholder: 'Enter username', type: 'text' },
                        { field: 'phone', label: 'Phone Number', placeholder: '0712345679', type: 'tel' },
                        { field: 'nickname', label: 'Nickname', placeholder: 'Your nickname', type: 'text' },
                        { field: 'clubFan', label: 'Club Fan', placeholder: 'Manchester United', type: 'text' },
                        { field: 'countryFan', label: 'Country Fan', placeholder: 'England', type: 'text' },
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
                            type={input.type}
                            value={formData[input.field as keyof UserData]}
                            onChange={(e) => handleInputChange(input.field as keyof UserData, e.target.value)}
                            className="w-full p-3 text-[14px] border border-white/[0.15] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 bg-white/[0.05] backdrop-blur-sm text-white placeholder:text-white/[0.4] transition-all hover:border-white/[0.25]"
                            placeholder={input.placeholder}
                          />
                        </motion.div>
                      ))}

                      {/* Info Note with transparent glass */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 p-4 bg-white/[0.05] rounded-xl border border-white/[0.1] backdrop-blur-sm"
                      >
                        <div className="flex gap-2">
                          <Shield className="h-4 w-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                          <p className="text-[12px] text-white/[0.7] leading-relaxed">
                            <span className="font-semibold text-white">Note:</span> Balance and betting statistics are managed automatically and cannot be edited.
                          </p>
                        </div>
                      </motion.div>

                      {/* Save Button */}
                      <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-black/[0.5] via-transparent to-transparent">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSave}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[15px] font-semibold rounded-full hover:shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                        >
                          <Save className="h-4 w-4" />
                          {hasUserData ? 'Save Changes' : 'Create Profile'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="deposit-page"
                    custom={getPageDirection('view', 'deposit')}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ 
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0 overflow-y-auto"
                  >
                    {/* Deposit Form */}
                    <div className="p-4">
                      {/* Header Icon */}
                      <div className="text-center mb-6">
                        <div className="relative inline-block mb-3">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 blur-xl rounded-full opacity-30" />
                          <div className="relative p-4 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 shadow-xl shadow-emerald-500/30">
                            <Coins className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <h3 className="text-[18px] font-bold text-white mb-2">Deposit Funds</h3>
                        <p className="text-white/[0.6] text-[13px]">Add money to your betting account</p>
                      </div>

                      {/* Current Balance */}
                      <div className="mb-6 p-4 bg-white/[0.05] border border-white/[0.1] rounded-xl backdrop-blur-sm">
                        <div className="text-[12px] text-white/[0.6] mb-1">Current Balance</div>
                        <div className="text-[24px] font-bold text-white bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                          Ksh {formData.balance.toLocaleString()}
                        </div>
                      </div>

                      {/* Deposit Form */}
                      <div className="space-y-4">
                        {/* Phone Number Input */}
                        <div>
                          <label className="text-[13px] font-semibold text-white mb-2 block">
                            Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300 font-bold text-sm">+254</div>
                            <input
                              type="tel"
                              value={depositPhone}
                              onChange={(e) => setDepositPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              className="w-full pl-12 pr-4 py-3 bg-white/[0.05] border border-white/[0.15] rounded-xl text-white text-sm placeholder:text-white/[0.4] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all backdrop-blur-sm"
                              placeholder="712345678"
                              maxLength={10}
                              autoFocus
                            />
                          </div>
                          <p className="text-[11px] text-white/[0.5] mt-1 ml-1">
                            Enter 10-digit number (07XXXXXXXX)
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
                              className="w-full pl-12 pr-4 py-3 bg-white/[0.05] border border-white/[0.15] rounded-xl text-white text-sm font-bold placeholder:text-white/[0.4] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all backdrop-blur-sm"
                              placeholder="0"
                              min="1"
                            />
                          </div>
                        </div>

                        {/* Quick Amount Buttons */}
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
                                className="py-2 bg-white/[0.05] border border-white/[0.1] text-white rounded-lg hover:bg-white/[0.08] hover:border-white/[0.2] transition-all text-xs font-medium backdrop-blur-sm"
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
                              Your payment is secured with end-to-end encryption. Funds are added instantly to your account.
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Mobile close hint - transparent */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="sm:hidden text-center mt-4"
          >
            <p className="text-xs text-white/[0.5]">
              {currentPage === 'view' ? 'Swipe down to close' : 'Tap back to cancel'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};