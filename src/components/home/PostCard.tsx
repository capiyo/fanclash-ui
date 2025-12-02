import { Heart, MessageCircle, Share2, MoreHorizontal, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PostCardProps {
  username: string;
  userAvatar: string;
  timeAgo: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  isFollowing?: boolean;
}

export const PostCard = ({
  username,
  userAvatar,
  timeAgo,
  content,
  image,
  likes: initialLikes,
  comments,
  isFollowing: initialFollowing = false,
}: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isFollowing, setIsFollowing] = useState(initialFollowing);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };



















  return (
    <article className="glass-card-hover p-4 mb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/30">
            <AvatarImage src={userAvatar} alt={username} />
            <AvatarFallback className="bg-secondary text-foreground">
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{username}</span>
              {!isFollowing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => setIsFollowing(true)}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Follow
                </Button>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <p className="text-foreground/90 mb-3 leading-relaxed">{content}</p>

      {/* Image */}
      {image && (
        <div className="relative rounded-lg overflow-hidden mb-3 bg-secondary/50">
          <img
            src={image}
            alt="Post"
            className="w-full h-auto max-h-80 object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 transition-colors",
              liked ? "text-destructive hover:text-destructive" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            <span>{likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{comments}</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
};
