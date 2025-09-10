import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Users, Wallet } from "lucide-react";

interface BookingDialogProps {
  type: "Solo" | "Duo" | "Squad";
  entryFee: number;
  perKillReward: number;
  winnerPrize: number;
  children: React.ReactNode;
}

const createBookingSchema = (type: "Solo" | "Duo" | "Squad") => {
  const baseSchema = {
    playerName: z.string().min(2, "Name must be at least 2 characters"),
    player1Username: z.string().min(3, "Free Fire username must be at least 3 characters"),
  };

  if (type === "Duo") {
    return z.object({
      ...baseSchema,
      player2Username: z.string().min(3, "Free Fire username must be at least 3 characters"),
    });
  }

  if (type === "Squad") {
    return z.object({
      ...baseSchema,
      player2Username: z.string().min(3, "Free Fire username must be at least 3 characters"),
      player3Username: z.string().min(3, "Free Fire username must be at least 3 characters"),
      player4Username: z.string().min(3, "Free Fire username must be at least 3 characters"),
    });
  }

  return z.object(baseSchema);
};

export const BookingDialog = ({ type, entryFee, perKillReward, winnerPrize, children }: BookingDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const schema = createBookingSchema(type);
  type FormData = z.infer<typeof schema>;
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      playerName: "",
      player1Username: "",
      ...(type === "Duo" && { player2Username: "" }),
      ...(type === "Squad" && { 
        player2Username: "", 
        player3Username: "", 
        player4Username: "" 
      }),
    } as FormData,
  });

  const onSubmit = (data: FormData) => {
    // Simulate wallet deduction and booking
    toast({
      title: "Slot Booked Successfully!",
      description: `${type} match booked for ₹${entryFee}. Entry fee deducted from wallet.`,
    });
    
    setOpen(false);
    form.reset();
  };

  const getPlayerCount = () => {
    switch (type) {
      case "Solo": return 1;
      case "Duo": return 2;
      case "Squad": return 4;
    }
  };

  const renderUsernameFields = () => {
    const playerCount = getPlayerCount();
    const fields = [];

    for (let i = 1; i <= playerCount; i++) {
      const fieldName = `player${i}Username` as keyof FormData;
      fields.push(
        <FormField
          key={i}
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Player {i} Free Fire Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter Free Fire username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    return fields;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0F0F0F] border border-[#2A2A2A] text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#FF4D4F] to-[#FF7875] rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Book {type} Slot
              </DialogTitle>
              <p className="text-gray-400 text-sm">
                Reserve your position in the tournament
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-[#1A1A1A] p-4 rounded-lg mb-4 border border-[#2A2A2A]">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-400">Entry Fee</div>
              <div className="font-bold text-[#52C41A]">₹{entryFee}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Per Kill</div>
              <div className="font-bold text-yellow-400">₹{perKillReward}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Winner</div>
              <div className="font-bold text-[#FF4D4F]">₹{winnerPrize}</div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="playerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {renderUsernameFields()}

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                ₹{entryFee} will be deducted from your wallet
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Book Slot - ₹{entryFee}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};