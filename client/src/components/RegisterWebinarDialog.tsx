import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Webinar {
  id: number;
  title: string;
  date: string;
  time: string;
  [key: string]: any;
}

interface RegisterWebinarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webinar: Webinar | null;
}

export default function RegisterWebinarDialog({
  open,
  onOpenChange,
  webinar
}: RegisterWebinarDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Successfully registered for "${webinar?.title}"!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register for Webinar</DialogTitle>
          <DialogDescription>
            {webinar?.title}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{webinar?.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{webinar?.time}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendee-name">Your Name</Label>
              <Input id="attendee-name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendee-email">Email</Label>
              <Input id="attendee-email" type="email" placeholder="john@company.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questions">Questions or Topics (Optional)</Label>
              <Textarea 
                id="questions" 
                placeholder="Any specific topics or questions you'd like to discuss?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Registration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
