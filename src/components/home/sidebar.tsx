import {
    Home, TrendingUp, Calendar, Trophy, Users, Wallet,
    Settings, LogOut, Bell, Star, Shield, HelpCircle,
    BarChart3, Award, Target, Flame, Zap, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const [activeItem, setActiveItem] = useState("home");

    const menuItems = [
        { id: "home", label: "Home", icon: Home, notifications: 0 },
        { id: "trending", label: "Trending", icon: TrendingUp, notifications: 3 },
        { id: "matches", label: "Live Matches", icon: Calendar, notifications: 8 },
        { id: "leaderboard", label: "Leaderboard", icon: Trophy, notifications: 0 },
        { id: "community", label: "Community", icon: Users, notifications: 5 },
        { id: "mybets", label: "My Bets", icon: Target, notifications: 0 },
        { id: "wallet", label: "Wallet", icon: Wallet, notifications: 0 },
    ];

    const bottomMenuItems = [
        { id: "settings", label: "Settings", icon: Settings },
        { id: "help", label: "Help & Support", icon: HelpCircle },
        { id: "logout", label: "Logout", icon: LogOut },
    ];

    return (
        <>
            {/* Overlay - only visible on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar - fixed position, no scroll */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-gray-950 to-black border-r border-gray-800/50",
                    "transform transition-transform duration-300 ease-in-out",
                    "lg:translate-x-0 lg:static lg:z-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Area - Fixed height */}
                    <div className="h-20 px-6 flex items-center border-b border-gray-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">FanClash</h1>
                                <p className="text-xs text-emerald-400">Betting Arena</p>
                            </div>
                        </div>
                    </div>

                    {/* User Profile - Fixed height */}
                    <div className="h-24 px-6 py-4 border-b border-gray-800/50">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 border-2 border-emerald-500/30">
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-white font-bold">
                                    JD
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-white truncate">John Doe</p>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-1.5 py-0.5 text-[10px]">
                                        PRO
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-400 truncate">@johndoe</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Wallet className="w-3 h-3 text-emerald-400" />
                                    <span className="text-sm font-bold text-emerald-400">Ksh 12,450</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Navigation - Fixed height with no scroll */}
                    <nav className="flex-1 px-4 py-6">
                        <div className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeItem === item.id;

                                return (
                                    <Button
                                        key={item.id}
                                        variant="ghost"
                                        onClick={() => setActiveItem(item.id)}
                                        className={cn(
                                            "w-full justify-start gap-3 px-4 py-3 h-auto text-base font-normal",
                                            "transition-all duration-200",
                                            isActive
                                                ? "bg-emerald-500/20 text-emerald-400 border-l-4 border-emerald-500"
                                                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                                        )}
                                    >
                                        <Icon className={cn("w-5 h-5", isActive && "text-emerald-400")} />
                                        <span className="flex-1 text-left">{item.label}</span>
                                        {item.notifications > 0 && (
                                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 rounded-full px-2 py-0.5 text-xs">
                                                {item.notifications}
                                            </Badge>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>

                        {/* Stats Preview - Fixed within nav */}
                        <div className="mt-8 p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl border border-emerald-500/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Winning Streak</p>
                                    <p className="text-lg font-bold text-white">5</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-xs text-gray-400">Win Rate</p>
                                    <p className="text-sm font-bold text-emerald-400">78%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Total Bets</p>
                                    <p className="text-sm font-bold text-white">143</p>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Bottom Navigation - Fixed height */}
                    <div className="h-32 px-4 py-4 border-t border-gray-800/50">
                        <div className="space-y-1">
                            {bottomMenuItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Button
                                        key={item.id}
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start gap-3 px-4 py-2.5 h-auto text-sm",
                                            "text-gray-400 hover:text-white hover:bg-gray-800/50",
                                            item.id === "logout" && "hover:text-red-400"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </Button>
                                );
                            })}
                        </div>

                        {/* Version - Fixed at bottom */}
                        <div className="mt-3 px-4">
                            <p className="text-[10px] text-gray-600">Version 2.0.1</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;