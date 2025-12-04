import { PenSquare, X, FileImage, Send, Image as ImageIcon, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>(""); 
  const [phone,setPhone]=useState("")
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
        console.log(username,phone)
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
       formData.append('image', selectedImage);
      formData.append('caption', caption.trim());
      
      // Try different combinations - your Rust API might expect different field names
      
      // OPTION 1: Your current fields
      formData.append('user_id', userId);
      formData.append('user_name', username);
      
      // OPTION 2: Try without underscores
      formData.append('userId', userId);
      formData.append('userName', username);
      
      // OPTION 3: Try exact fields from your user object
      formData.append('username', username);
      formData.append('phone', phone);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
      
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
        <div
          ref={modalRef}
          className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <PenSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-foreground text-xl font-bold">Create Post</h2>
                  <p className="text-muted-foreground text-sm">Share your betting moment</p>
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

          {/* Content */}
          <div className="p-4">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-secondary rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-foreground">{username || "User"}</h4>
                <p className="text-xs text-muted-foreground">Ready to share</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Text Area */}
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's your betting story? Share your win, tip, or analysis..."
                className="min-h-[120px] bg-background text-foreground placeholder-muted-foreground resize-none text-sm"
              />

              {/* Character Counter */}
              <div className="text-right">
                <span className={cn(
                  "text-xs",
                  caption.length > 280 ? "text-destructive" : "text-muted-foreground"
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
                  className="w-full h-14 flex-col gap-1 bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                >
                  <FileImage className="w-5 h-5" />
                  <span className="text-xs">{imagePreview ? "Change Image" : "Add Image (Optional)"}</span>
                </Button>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
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
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-destructive/90 hover:bg-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Hashtags Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    <span className="text-foreground text-sm font-bold">Hashtags</span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    Add relevant tags
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {hashtags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-primary/10 text-primary pl-3 pr-2 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                    >
                      #{tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHashtag(tag)}
                        className="h-4 w-4 ml-1 hover:bg-primary/30"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentHashtag}
                    onChange={(e) => setCurrentHashtag(e.target.value.replace(/\s/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && addHashtag()}
                    placeholder="Add hashtag..."
                    className="flex-1 bg-background rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <Button
                    onClick={addHashtag}
                    variant="outline"
                    className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                    disabled={!currentHashtag.trim()}
                  >
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div className={`p-3 rounded-lg ${
                  message.includes("✅") || message.includes("success")
                    ? "bg-success/10 text-success" 
                    : "bg-destructive/10 text-destructive"
                }`}>
                  <p className="text-sm font-medium">{message}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isPosting || !caption.trim() || !userId}
                  className={cn(
                    "w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isPosting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Share Post
                    </>
                  )}
                </Button>
                
                {(!userId || !username) && (
                  <p className="text-xs text-warning mt-2 text-center">
                    Please login to post
                  </p>
                )}
              </div>
            </form>

            {/* Tips */}
            <div className="mt-4 p-3 bg-secondary rounded-lg">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-full bg-warning/10">
                  <svg className="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Tips for better posts:</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <li>• Share your winning bet slips</li>
                    <li>• Post analysis and predictions</li>
                    <li>• Use hashtags to reach more people</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddPostModal;