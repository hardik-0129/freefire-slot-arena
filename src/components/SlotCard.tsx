import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Zap } from "lucide-react";
import { BookingDialog } from "./BookingDialog";

interface SlotCardProps {
  type: "Solo" | "Duo" | "Squad";
  entryFee: number;
  perKillReward: number;
  winnerPrize: number;
}

export const SlotCard = ({ type, entryFee, perKillReward, winnerPrize }: SlotCardProps) => {
  const getIcon = () => {
    switch (type) {
      case "Solo": return <Users className="h-5 w-5" />;
      case "Duo": return <Users className="h-5 w-5" />;
      case "Squad": return <Users className="h-5 w-5" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "Solo": return "bg-primary";
      case "Duo": return "bg-accent";
      case "Squad": return "bg-success";
    }
  };

  return (
    <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
      <div className={`absolute top-0 left-0 right-0 h-1 ${getTypeColor()}`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getIcon()}
            {type} Match
          </CardTitle>
          <Badge variant="secondary" className="font-bold">
            ₹{entryFee}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Per Kill</span>
            </div>
            <div className="font-bold text-warning">₹{perKillReward}</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Winner</span>
            </div>
            <div className="font-bold text-primary">₹{winnerPrize}</div>
          </div>
        </div>
        
        <BookingDialog
          type={type}
          entryFee={entryFee}
          perKillReward={perKillReward}
          winnerPrize={winnerPrize}
        >
          <Button 
            className="w-full bg-primary hover:bg-primary/90 font-semibold"
            size="lg"
          >
            Book Slot - ₹{entryFee}
          </Button>
        </BookingDialog>
      </CardContent>
    </Card>
  );
};