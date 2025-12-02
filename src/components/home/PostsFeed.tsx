import { PostCard } from "./PostCard";
import { Flame, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const mockPosts = [
  {
    id: 1,
    username: "BetKing_Mike",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    timeAgo: "2 min ago",
    content: "Just hit a 5-game parlay! 🔥 Liverpool, Real Madrid, Bayern all came through. Who else had faith in the big teams today?",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop",
    likes: 234,
    comments: 45,
    isFollowing: false,
  },
  {
    id: 2,
    username: "SoccerQueen_23",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    timeAgo: "15 min ago",
    content: "Anyone want to take my bet on the Manchester derby? I'm backing City to win by 2+ goals. Put your money where your mouth is! 💰",
    likes: 156,
    comments: 89,
    isFollowing: true,
  },
  {
    id: 3,
    username: "ChampionPredictor",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    timeAgo: "1 hour ago",
    content: "My analysis for tonight's Champions League matches. Barcelona vs PSG is going to be a goal fest. Over 3.5 goals is the play. Trust the process! 📊",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&h=400&fit=crop",
    likes: 412,
    comments: 67,
    isFollowing: false,
  },
  {
    id: 4,
    username: "UnderDogKing",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    timeAgo: "3 hours ago",
    content: "Everyone sleeping on Nottingham Forest this weekend. They've been solid at home and the odds are juicy. Who's with me? 🌳",
    likes: 89,
    comments: 34,
    isFollowing: false,
  },
];

const tabs = [
  { id: "hot", label: "Hot", icon: Flame },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "recent", label: "Recent", icon: Clock },
];

export const PostsFeed = () => {
  const [activeTab, setActiveTab] = useState("hot");

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4 p-1 bg-secondary/30 rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 gap-2",
              activeTab === tab.id
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {mockPosts.map((post, index) => (
          <div key={post.id} style={{ animationDelay: `${index * 100}ms` }}>
            <PostCard {...post} />
          </div>
        ))}
      </div>
    </div>
  );
};
