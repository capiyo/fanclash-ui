import { FixtureCard } from "./FixtureCard";
import { Calendar, Flame, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

const mockFixtures = [
  {
    id: 1,
    league: "Premier League",
    homeTeam: "Liverpool",
    awayTeam: "Man City",
    homeOdds: "2.40",
    drawOdds: "3.25",
    awayOdds: "2.80",
    time: "15:00",
    date: "Today",
    isLive: true,
    totalBets: 1245,
    homeScore: 1,
    awayScore: 1,
  },
  {
    id: 2,
    league: "La Liga",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeOdds: "2.10",
    drawOdds: "3.50",
    awayOdds: "3.20",
    time: "20:00",
    date: "Today",
    isLive: false,
    totalBets: 2340,
  },
  {
    id: 3,
    league: "Champions League",
    homeTeam: "Bayern Munich",
    awayTeam: "PSG",
    homeOdds: "1.85",
    drawOdds: "3.80",
    awayOdds: "4.00",
    time: "21:00",
    date: "Tomorrow",
    isLive: false,
    totalBets: 892,
  },
  {
    id: 4,
    league: "Serie A",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    homeOdds: "2.30",
    drawOdds: "3.20",
    awayOdds: "3.00",
    time: "18:45",
    date: "Tomorrow",
    isLive: false,
    totalBets: 567,
  },
  {
    id: 5,
    league: "NBA",
    homeTeam: "Lakers",
    awayTeam: "Celtics",
    homeOdds: "1.90",
    awayOdds: "1.95",
    time: "02:30",
    date: "Tomorrow",
    isLive: false,
    totalBets: 1123,
  },
  {
    id: 6,
    league: "NFL",
    homeTeam: "Chiefs",
    awayTeam: "Eagles",
    homeOdds: "1.75",
    awayOdds: "2.15",
    time: "01:00",
    date: "Sunday",
    isLive: false,
    totalBets: 2890,
  },
];

const filters = ["All", "Live", "Today", "Tomorrow", "Football", "Basketball"];

export const FixturesList = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredFixtures = mockFixtures.filter((fixture) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Live") return fixture.isLive;
    if (activeFilter === "Today") return fixture.date === "Today";
    if (activeFilter === "Tomorrow") return fixture.date === "Tomorrow";
    if (activeFilter === "Football") return ["Premier League", "La Liga", "Champions League", "Serie A"].includes(fixture.league);
    if (activeFilter === "Basketball") return fixture.league === "NBA";
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 w-[400px]">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Fixtures</h2>
          <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-800/50">
            {filteredFixtures.length}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Filter className="h-4 w-4 mr-1" />
          Filter
        </Button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant="outline"
            size="sm"
            className={cn(
              "whitespace-nowrap border-border/50",
              activeFilter === filter
                ? "bg-primary/20 text-primary border-primary/50"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
            onClick={() => setActiveFilter(filter)}
          >
            {filter === "Live" && <Flame className="h-3 w-3 mr-1 text-destructive" />}
            {filter}
          </Button>
        ))}
      </div>

      {/* Fixtures grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredFixtures.map((fixture, index) => (
          <div key={fixture.id} style={{ animationDelay: `${index * 100}ms` }}>
            <FixtureCard {...fixture} />
          </div>
        ))}
      </div>
    </div>
  );
};
