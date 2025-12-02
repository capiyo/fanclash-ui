import { 
  Home, 
  Trophy, 
  Users, 
  TrendingUp, 
  Wallet, 
  Settings, 
  HelpCircle,
  Flame,
  Calendar,
  Award,
  MessageSquare
} from "lucide-react";
import { FanclshLogo } from "@/components/icons/FanclshLogo";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Flame, label: "Hot Bets" },
  { icon: Trophy, label: "Leagues" },
  { icon: Calendar, label: "Fixtures" },
  { icon: TrendingUp, label: "Trending" },
  { icon: Users, label: "Following" },
  { icon: MessageSquare, label: "Messages" },
];

const bottomItems = [
  { icon: Wallet, label: "Wallet" },
  { icon: Award, label: "Rewards" },
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "Help" },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-40",
          "transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full py-6">
          {/* Main menu */}
          <nav className="flex-1 px-3">
            <ul className="space-y-1">
              {menuItems.map((item, index) => (
                <li key={item.label}>
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                      "hover:bg-sidebar-accent",
                      item.active && "bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <item.icon className={cn("h-5 w-5", item.active && "text-sidebar-primary")} />
                    <span className="font-medium">{item.label}</span>
                    {item.label === "Hot Bets" && (
                      <span className="ml-auto px-2 py-0.5 text-xs bg-destructive/20 text-destructive rounded-full">
                        12
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Promo card */}
          <div className="mx-3 mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Weekly Challenge</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Win 5 bets this week and earn 2x rewards!
            </p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">3/5 completed</p>
          </div>

          {/* Bottom menu */}
          <nav className="px-3 border-t border-sidebar-border pt-4">
            <ul className="space-y-1">
              {bottomItems.map((item) => (
                <li key={item.label}>
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
                      "text-sidebar-foreground/60 hover:text-sidebar-foreground",
                      "hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};
