import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Zap } from "lucide-react";

export const PromoBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-accent to-primary p-6 my-8">
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-background/20 backdrop-blur-sm">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          
          <div className="text-white">
            <h3 className="text-xl font-bold mb-1">Free Fire Championship</h3>
            <p className="text-white/90">Join the ultimate battle royale experience!</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            <Gamepad2 className="h-3 w-3 mr-1" />
            Live Now
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            <Zap className="h-3 w-3 mr-1" />
            Win Big
          </Badge>
        </div>
      </div>
    </div>
  );
};