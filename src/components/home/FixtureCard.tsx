import { Clock, Users, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FixtureCardProps {
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: string;
  drawOdds?: string;
  awayOdds: string;
  time: string;
  date: string;
  isLive?: boolean;
  totalBets: number;
  homeScore?: number;
  awayScore?: number;
}

export const FixtureCard = ({
  league,
  homeTeam,
  awayTeam,
  homeOdds,
  drawOdds,
  awayOdds,
  time,
  date,
  isLive = false,
  totalBets,
  homeScore,
  awayScore,
}: FixtureCardProps) => {
  return (
    <article className="glass-card-hover p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Badge 
          variant="outline" 
          className="bg-emerald-900/30 text-emerald-400 border-emerald-800/50 text-xs"
        >
          {league}
        </Badge>
        {isLive ? (
          <Badge className="bg-red-900/40 text-red-300 border border-red-700/50 animate-pulse">
            <span className="mr-1 h-2 w-2 rounded-full bg-red-400 inline-block" />
            LIVE
          </Badge>
        ) : (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{date} • {time}</span>
          </div>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
              {homeTeam.slice(0, 2)}
            </div>
            <span className="font-medium text-foreground">{homeTeam}</span>
          </div>
          {isLive && homeScore !== undefined && (
            <span className="text-xl font-bold text-foreground">{homeScore}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
              {awayTeam.slice(0, 2)}
            </div>
            <span className="font-medium text-foreground">{awayTeam}</span>
          </div>
          {isLive && awayScore !== undefined && (
            <span className="text-xl font-bold text-foreground">{awayScore}</span>
          )}
        </div>
      </div>

      {/* Odds */}
      <div className={cn("grid gap-2 mb-4", drawOdds ? "grid-cols-3" : "grid-cols-2")}>
        <Button
          variant="outline"
          className="flex flex-col h-auto py-2 border-border/50 hover:border-primary/50 hover:bg-primary/10"
        >
          <span className="text-xs text-muted-foreground">Home</span>
          <span className="font-bold text-primary">{homeOdds}</span>
        </Button>
        {drawOdds && (
          <Button
            variant="outline"
            className="flex flex-col h-auto py-2 border-border/50 hover:border-primary/50 hover:bg-primary/10"
          >
            <span className="text-xs text-muted-foreground">Draw</span>
            <span className="font-bold text-primary">{drawOdds}</span>
          </Button>
        )}
        <Button
          variant="outline"
          className="flex flex-col h-auto py-2 border-border/50 hover:border-primary/50 hover:bg-primary/10"
        >
          <span className="text-xs text-muted-foreground">Away</span>
          <span className="font-bold text-primary">{awayOdds}</span>
        </Button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{totalBets} bets</span>
        </div>
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
        >
          <Zap className="h-3 w-3 mr-1" />
          Quick Bet
        </Button>
      </div>
    </article>
  );
};
