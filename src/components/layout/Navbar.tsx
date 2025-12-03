import { Bell, Search, Menu, User, Wallet } from "lucide-react";
import { FanclshLogo } from "@/components/icons/FanclshLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { PenSquare, FileEdit, PencilLine, SquarePen } from "lucide-react";
import AddPostModal from "../Footer/AddPostalModal";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [openPost,setpost]=useState("")
    const [isModalOpen, setIsModalOpen] = useState(false);
  

  const handlePost=()=>{
    setpost("addpost")
    console.log("hellooo")
    setIsModalOpen(true)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/90 backdrop-blur-xl border-b border-border/30">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <FanclshLogo size={36} />
            <span className="font-display font-bold text-xl tracking-wider text-gradient hidden sm:block">
              fanclash
            </span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <PenSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
           onClick={handlePost}
          >
            <PenSquare className="h-5 w-5" />
          </Button>

          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 border-primary/50 text-primary hover:bg-primary/10"
          >
            <Wallet className="h-4 w-4" />
            <span>$250.00</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
     
      

      {/* Mobile search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 animate-fade-in">
          <div className="relative w-full">
            <PenSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           
          </div>
        </div>
      )}
    </nav>
  );
};
