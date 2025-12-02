import { ArrowRight, Zap, Shield, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FanclshLogo } from "@/components/icons/FanclshLogo";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-12 lg:py-10  hidden ">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(160_84%_39%_/_0.15),transparent_50%)]" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        {/* Logo animation */}
        <div className="flex justify-center mb-6 animate-float">
          <FanclshLogo size={80} className="drop-shadow-2xl" />
        </div>
        
        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
          <span className="text-foreground">Battle Ground </span>
          <span className="text-gradient font-display">For Fans</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The ultimate peer-to-peer betting platform. Challenge rivals, place bets, 
          and prove your sports knowledge against fans worldwide.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-primary/30 group"
          >
            Start Betting
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            Explore Fixtures
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="glass-card p-4 text-center">
            <div className="flex justify-center mb-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">50K+</p>
            <p className="text-xs text-muted-foreground">Active Bets</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex justify-center mb-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">100%</p>
            <p className="text-xs text-muted-foreground">Secure</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex justify-center mb-2">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">$2M+</p>
            <p className="text-xs text-muted-foreground">Won Daily</p>
          </div>
        </div>
      </div>
    </section>
  );
};
