import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Phone, ArrowRight, LogIn, UserPlus, X, Shield, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  phone: string;
  password: string;
}

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loginUrl = "https://fanclash-api.onrender.com/api/auth";
  const registerUrl = "https://fanclash-api.onrender.com/api/auth/register";

  const loginForm = useForm<LoginFormData>();
  const registerForm = useForm<RegisterFormData>();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${loginUrl}/login`, {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.token) {
        localStorage.setItem("usertoken", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        toast.success('Login successful!', {
          style: {
            background: 'rgba(16, 185, 129, 0.95)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }
        });
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Login failed', {
          style: {
            background: 'rgba(239, 68, 68, 0.95)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }
        });
      }
    } catch (err) {
      console.log(err);
      toast.error("Connection error", {
        style: {
          background: 'rgba(239, 68, 68, 0.95)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(registerUrl, {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        localStorage.setItem("usertoken", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        toast.success('Registration successful!', {
          style: {
            background: 'rgba(16, 185, 129, 0.95)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }
        });
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Registration failed', {
          style: {
            background: 'rgba(239, 68, 68, 0.95)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }
        });
      }
    } catch (err) {
      console.log(err);
      toast.error("Connection error", {
        style: {
          background: 'rgba(239, 68, 68, 0.95)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { 
      x: isLogin ? -30 : 30, 
      opacity: 0,
    },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        duration: 0.4,
        type: "spring",
        damping: 20,
        stiffness: 250
      }
    },
    exit: { 
      x: isLogin ? 30 : -30, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Transparent Backdrop */}
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
          {/* Main Card - Glass Morphism */}
          <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.04] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-white/[0.15] backdrop-blur-[20px]">
            
            {/* Frosted glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-green-500/[0.03] pointer-events-none" />
            
            {/* Mobile handle */}
            <div className="sm:hidden pt-4 pb-2 flex justify-center relative z-10">
              <div className="w-16 h-1.5 bg-gradient-to-r from-white/[0.3] via-white/[0.5] to-white/[0.3] rounded-full shadow-lg shadow-white/[0.1]"></div>
            </div>
            
            {/* Header */}
            <div className="relative p-4 border-b border-white/[0.15] backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.05] via-transparent to-green-500/[0.05] opacity-50" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-white/[0.1] border border-white/[0.2] backdrop-blur-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">
                      {isLogin ? 'Welcome Back' : 'Join FanClash'}
                    </h2>
                    <p className="text-white/[0.6] text-sm">
                      {isLogin ? 'Sign in to continue betting' : 'Create your betting account'}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-10 w-10 rounded-full hover:bg-white/[0.1] backdrop-blur-sm border border-white/[0.15]"
                >
                  <X className="h-5 w-5 text-white/[0.8] hover:text-white" />
                </Button>
              </div>
            </div>

            <div className="p-4">
              {/* Toggle Switch - Glass Effect */}
              <div className="mb-6">
                <div className="relative bg-white/[0.05] rounded-xl p-1 flex border border-white/[0.1] backdrop-blur-sm">
                  <div 
                    className="absolute top-1 left-1 w-1/2 h-[calc(100%-0.5rem)] bg-white/[0.15] rounded-lg shadow-sm transition-all duration-500 backdrop-blur-sm"
                    style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }}
                  ></div>
                  <button
                    onClick={() => setIsLogin(true)}
                    className={cn(
                      "relative z-10 flex-1 py-2 text-center rounded-lg transition-all duration-300 text-sm",
                      isLogin ? "text-white font-semibold" : "text-white/[0.6]"
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <LogIn className="h-3.5 w-3.5" />
                      Sign In
                    </div>
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={cn(
                      "relative z-10 flex-1 py-2 text-center rounded-lg transition-all duration-300 text-sm",
                      !isLogin ? "text-white font-semibold" : "text-white/[0.6]"
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus className="h-3.5 w-3.5" />
                      Register
                    </div>
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.form
                    key="login-form"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-4"
                  >
                    {/* Username */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-300" />
                        <label className="text-sm font-medium text-white">Username</label>
                      </div>
                      <input
                        {...loginForm.register("username", { required: "Username is required" })}
                        type="text"
                        className="w-full p-3 border border-white/[0.15] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 bg-white/[0.05] text-white text-sm placeholder-white/[0.4] transition-all backdrop-blur-sm"
                        placeholder="Enter your username"
                        disabled={isLoading}
                      />
                      {loginForm.formState.errors.username && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-400"
                        >
                          {loginForm.formState.errors.username.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-emerald-300" />
                        <label className="text-sm font-medium text-white">Password</label>
                      </div>
                      <input
                        {...loginForm.register("password", { 
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "At least 6 characters"
                          }
                        })}
                        type="password"
                        className="w-full p-3 border border-white/[0.15] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 bg-white/[0.05] text-white text-sm placeholder-white/[0.4] transition-all backdrop-blur-sm"
                        placeholder="Enter your password"
                        disabled={isLoading}
                      />
                      {loginForm.formState.errors.password && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-400"
                        >
                          {loginForm.formState.errors.password.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Security Note */}
                    <div className="p-3 bg-white/[0.05] rounded-lg border border-white/[0.1] backdrop-blur-sm">
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-white/[0.7]">
                          Your account is secured with end-to-end encryption
                        </p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-sm backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <>
                              Sign In
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register-form"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    className="space-y-4"
                  >
                    {/* Username */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-300" />
                        <label className="text-sm font-medium text-white">Username</label>
                      </div>
                      <input
                        {...registerForm.register("username", { 
                          required: "Username is required"
                        })}
                        type="text"
                        className="w-full p-3 border border-white/[0.15] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 bg-white/[0.05] text-white text-sm placeholder-white/[0.4] transition-all backdrop-blur-sm"
                        placeholder="Choose a username"
                        disabled={isLoading}
                      />
                      {registerForm.formState.errors.username && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-400"
                        >
                          {registerForm.formState.errors.username.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-300" />
                        <label className="text-sm font-medium text-white">Phone Number</label>
                      </div>
                      <input
                        {...registerForm.register("phone", { 
                          required: "Phone number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Enter a valid 10-digit phone number"
                          }
                        })}
                        type="tel"
                        className="w-full p-3 border border-white/[0.15] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 bg-white/[0.05] text-white text-sm placeholder-white/[0.4] transition-all backdrop-blur-sm"
                        placeholder="e.g 0712345679"
                        disabled={isLoading}
                      />
                      {registerForm.formState.errors.phone && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-400"
                        >
                          {registerForm.formState.errors.phone.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-emerald-300" />
                        <label className="text-sm font-medium text-white">Password</label>
                      </div>
                      <input
                        {...registerForm.register("password", { 
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "At least 6 characters"
                          }
                        })}
                        type="password"
                        className="w-full p-3 border border-white/[0.15] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 bg-white/[0.05] text-white text-sm placeholder-white/[0.4] transition-all backdrop-blur-sm"
                        placeholder="Create a strong password"
                        disabled={isLoading}
                      />
                      {registerForm.formState.errors.password && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-400"
                        >
                          {registerForm.formState.errors.password.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Registration Benefits */}
                    <div className="p-3 bg-white/[0.05] rounded-lg border border-white/[0.1] backdrop-blur-sm">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-white font-semibold mb-1">Registration Benefits:</p>
                          <ul className="text-xs text-white/[0.7] space-y-1">
                            <li className="flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
                              Start with Ksh 100 bonus
                            </li>
                            <li className="flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
                              Join betting communities
                            </li>
                            <li className="flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
                              Share your predictions
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-sm backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <>
                              Create Account
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Bottom Text */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-white/[0.6]">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-emerald-300 hover:text-emerald-200 font-semibold transition-colors"
                  >
                    {isLogin ? 'Register Now' : 'Sign In'}
                  </button>
                </p>
              </motion.div>
            </div>
          </div>
          
          {/* Mobile close hint */}
          <div className="sm:hidden text-center mt-3">
            <p className="text-xs text-white/[0.5]">
              Swipe down to close
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};