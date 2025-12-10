import { PenSquare, X, FileImage, Send, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const AddPostModal = ({ isOpen, onClose, onPostCreated }: AddPostModalProps) => {
  const API_BASE_URL = 'https://fanclash-api.onrender.com';
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>(["betting", "sports", "win"]);
  const [currentHashtag, setCurrentHashtag] = useState("");
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>(""); 
  const [phone, setPhone] = useState("");
  const [caption, setCaption] = useState<string>("");
  
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        setUsername(user.username || "");
        setPhone(user.phone || "");
        setUserId(user.id || "");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addHashtag = () => {
    if (currentHashtag.trim() && !hashtags.includes(currentHashtag.trim())) {
      setHashtags([...hashtags, currentHashtag.trim()]);
      setCurrentHashtag("");
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!userId || !username) {
      setMessage("Please login first");
      return;
    }

    if (!caption.trim()) {
      setMessage("Please write a caption");
      return;
    }

    setIsPosting(true);
    setMessage("");

    try {
      const formData = new FormData();
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      formData.append('caption', caption.trim());
      formData.append('user_id', userId);
      formData.append('username', username);
      formData.append('phone', phone);
      
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("✅ Post created successfully!");
        
        setCaption("");
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        if (onPostCreated) {
          onPostCreated();
        }
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage(result.error || result.message || `Failed to post`);
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage("Network error. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit(e as any);
    }
    if (e.key === "Enter" && e.target === e.currentTarget && currentHashtag.trim()) {
      addHashtag();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Transparent Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center">
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
          className="relative w-full max-w-md max-h-[85vh] flex flex-col"
        >
          {/* Main Card - Glass Morphism */}
          <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.04] rounded-t-xl sm:rounded-xl shadow-2xl overflow-hidden border border-white/[0.15] backdrop-blur-[20px] flex flex-col flex-1">
            
            {/* Frosted glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-emerald-600/[0.03] pointer-events-none" />
            
            {/* Mobile handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center relative z-10">
              <div className="w-12 h-1 bg-gradient-to-r from-white/[0.3] via-white/[0.5] to-white/[0.3] rounded-full shadow-lg shadow-white/[0.1]"></div>
            </div>
            
            {/* Header */}
            <div className="relative p-3 border-b border-white/[0.15] backdrop-blur-sm flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.05] via-transparent to-emerald-600/[0.05] opacity-50" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-white/[0.1] border border-white/[0.2] backdrop-blur-sm">
                    <PenSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-lg font-bold">Create Post</h2>
                    <p className="text-white/[0.6] text-xs">Share your betting moment</p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full hover:bg-white/[0.1] backdrop-blur-sm border border-white/[0.15]"
                >
                  <X className="h-4 w-4 text-white/[0.8] hover:text-white" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* User Info */}
              <div className="flex items-center gap-2 mb-3 p-2 bg-white/[0.05] rounded-lg backdrop-blur-sm border border-white/[0.1]">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-emerald-500 text-white font-bold text-sm border border-white/[0.2]">
                    {username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-white text-sm">{username || "User"}</h4>
                  <p className="text-xs text-white/[0.6]">Ready to share</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Text Area */}
                <div className="relative">
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What's your betting story? Share your win, tip, or analysis..."
                    className="min-h-[100px] bg-white/[0.05] border border-white/[0.15] text-white placeholder-white/[0.4] resize-none text-sm backdrop-blur-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/[0.2]"
                  />
                </div>

                {/* Character Counter */}
                <div className="text-right">
                  <span className={cn(
                    "text-xs",
                    caption.length > 280 ? "text-red-400" : "text-white/[0.5]"
                  )}>
                    {caption.length}/280 characters
                  </span>
                </div>

                {/* Image Upload */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-10 bg-white/[0.05] text-white/[0.7] hover:text-white hover:bg-white/[0.08] border border-white/[0.15] backdrop-blur-sm text-xs"
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    {imagePreview ? "Change Image" : "Add Image (Optional)"}
                  </Button>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/[0.05] backdrop-blur-sm rounded-lg" />
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="relative w-full h-32 object-cover rounded-lg shadow-sm border border-white/[0.1]"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500/[0.9] hover:bg-red-500 border border-white/[0.2] backdrop-blur-sm"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Hashtags Section - Compact */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-emerald-400" />
                      <span className="text-white text-xs font-bold">Hashtags</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {hashtags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-emerald-500/[0.15] text-white pl-2 pr-1 py-1 rounded-full hover:bg-emerald-500/[0.25] transition-colors border border-emerald-500/[0.3] backdrop-blur-sm text-xs"
                      >
                        #{tag}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHashtag(tag)}
                          className="h-3 w-3 ml-0.5 hover:bg-emerald-500/[0.3]"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={currentHashtag}
                      onChange={(e) => setCurrentHashtag(e.target.value.replace(/\s/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && addHashtag()}
                      placeholder="Add hashtag..."
                      className="flex-1 bg-white/[0.05] border border-white/[0.15] rounded-lg px-3 py-1.5 text-white placeholder-white/[0.4] focus:outline-none focus:ring-1 focus:ring-emerald-500/[0.2] focus:border-emerald-500 text-xs backdrop-blur-sm"
                    />
                    <Button
                      onClick={addHashtag}
                      variant="outline"
                      className="text-white/[0.7] hover:text-white hover:bg-white/[0.08] border border-white/[0.15] backdrop-blur-sm p-1.5"
                      disabled={!currentHashtag.trim()}
                    >
                      <Hash className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Message */}
                {message && (
                  <div className={`p-2 rounded-lg backdrop-blur-sm border ${
                    message.includes("✅") || message.includes("success")
                      ? "bg-emerald-500/[0.1] text-emerald-300 border-emerald-500/[0.2]" 
                      : "bg-red-500/[0.1] text-red-300 border-red-500/[0.2]"
                  }`}>
                    <p className="text-xs font-medium">{message}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-1">
                  <Button
                    type="submit"
                    disabled={isPosting || !caption.trim() || !userId}
                    className={cn(
                      "w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm",
                      "disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-500/90 hover:to-emerald-600/90 text-sm"
                    )}
                  >
                    {isPosting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Share Post
                      </>
                    )}
                  </Button>
                  
                  {(!userId || !username) && (
                    <p className="text-xs text-yellow-300 mt-1 text-center">
                      Please login to post
                    </p>
                  )}
                </div>
              </form>

              {/* Tips - Compact */}
              <div className="mt-3 p-2 bg-white/[0.05] rounded-lg backdrop-blur-sm border border-white/[0.1]">
                <div className="flex items-start gap-1.5">
                  <div className="p-1 rounded-full bg-yellow-500/[0.1] border border-yellow-500/[0.2]">
                    <svg className="h-3 w-3 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">Tips:</p>
                    <ul className="text-xs text-white/[0.7] mt-0.5 space-y-0.5">
                      <li>• Share winning bet slips</li>
                      <li>• Post analysis & predictions</li>
                      <li>• Use hashtags to reach more</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile close hint */}
          <div className="sm:hidden text-center mt-2">
            <p className="text-xs text-white/[0.5]">
              Swipe down to close
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AddPostModal;