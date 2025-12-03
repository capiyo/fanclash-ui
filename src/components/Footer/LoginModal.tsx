import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Phone, ArrowRight, LogIn, UserPlus, X } from 'lucide-react';
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
        toast.success('Login successful!');
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (err) {
      console.log(err);
      toast.error("Connection error");
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
        toast.success('Registration successful!');
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (err) {
      console.log(err);
      toast.error("Connection error");
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
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
        <motion.div
          ref={modalRef}
          variants={{
            hidden: { y: "100%", opacity: 0 },
            visible: { 
              y: 0, 
              opacity: 1,
              transition: { 
                duration: 0.4,
                type: "spring",
                damping: 25,
                stiffness: 300
              }
            },
            exit: {
              y: "100%",
              opacity: 0,
              transition: { duration: 0.3 }
            }
          }}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="relative w-full max-w-md sm:max-h-[90vh]"
        >
          {/* Main Card with rounded top for mobile */}
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-border max-h-[85vh] overflow-y-auto">
            {/* Mobile handle */}
            <div className="sm:hidden pt-4 pb-2 flex justify-center">
              <div className="w-16 h-1.5 bg-secondary rounded-full"></div>
            </div>
            
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-foreground text-xl font-bold">
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {isLogin ? 'Access your betting account' : 'Join the betting community'}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-10 w-10 rounded-full hover:bg-secondary"
                >
                  <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </Button>
              </div>
            </div>

            <div className="p-4">
              {/* Toggle Switch */}
              <div className="mb-6">
                <div className="relative bg-secondary rounded-xl p-1 flex">
                  <div 
                    className="absolute top-1 left-1 w-1/2 h-[calc(100%-0.5rem)] bg-background rounded-lg shadow-sm transition-all duration-500"
                    style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }}
                  ></div>
                  <button
                    onClick={() => setIsLogin(true)}
                    className={cn(
                      "relative z-10 flex-1 py-2 text-center rounded-lg transition-all duration-300 text-sm",
                      isLogin ? "text-foreground font-semibold" : "text-muted-foreground"
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
                      !isLogin ? "text-foreground font-semibold" : "text-muted-foreground"
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
                        <User className="h-4 w-4 text-primary" />
                        <label className="text-sm font-medium text-foreground">Username</label>
                      </div>
                      <input
                        {...loginForm.register("username", { required: "Username is required" })}
                        type="text"
                        className="w-full p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm placeholder-muted-foreground transition-colors"
                        placeholder="e.g. tesla"
                        disabled={isLoading}
                      />
                      {loginForm.formState.errors.username && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-destructive"
                        >
                          {loginForm.formState.errors.username.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        <label className="text-sm font-medium text-foreground">Password</label>
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
                        className="w-full p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm placeholder-muted-foreground transition-colors"
                        placeholder="e.g. @tesla"
                        disabled={isLoading}
                      />
                      {loginForm.formState.errors.password && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-destructive"
                        >
                          {loginForm.formState.errors.password.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-sm"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"
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
                        <User className="h-4 w-4 text-primary" />
                        <label className="text-sm font-medium text-foreground">Username</label>
                      </div>
                      <input
                        {...registerForm.register("username", { 
                          required: "Username is required"
                        })}
                        type="text"
                        className="w-full p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm placeholder-muted-foreground transition-colors"
                        placeholder="e.g. tesla"
                        disabled={isLoading}
                      />
                      {registerForm.formState.errors.username && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-destructive"
                        >
                          {registerForm.formState.errors.username.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <label className="text-sm font-medium text-foreground">Phone Number</label>
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
                        className="w-full p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm placeholder-muted-foreground transition-colors"
                        placeholder="e.g 0712345679"
                        disabled={isLoading}
                      />
                      {registerForm.formState.errors.phone && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-destructive"
                        >
                          {registerForm.formState.errors.phone.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        <label className="text-sm font-medium text-foreground">Password</label>
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
                        className="w-full p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm placeholder-muted-foreground transition-colors"
                        placeholder="e.g @tesla"
                        disabled={isLoading}
                      />
                      {registerForm.formState.errors.password && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-destructive"
                        >
                          {registerForm.formState.errors.password.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-sm"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                            />
                          ) : (
                            <>
                              Register
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
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    {isLogin ? 'Register' : 'Sign in'}
                  </button>
                </p>
              </motion.div>
            </div>
          </div>
          
          {/* Mobile close hint */}
          <div className="sm:hidden text-center mt-3">
            <p className="text-xs text-muted-foreground">
              Tap outside or swipe down to close
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};