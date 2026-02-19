import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface InviteWebinarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  factoryName: string;
}

export default function InviteWebinarDialog({
  open,
  onOpenChange,
  factoryName
}: InviteWebinarDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Webinar invitation sent successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite {factoryName} to 1:1 Webinar</DialogTitle>
          <DialogDescription>
            Send a personalized invitation to schedule a private webinar session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="e.g., Product Inquiry for Q2 2024" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred-date">Preferred Date</Label>
              <Input id="preferred-date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred-time">Preferred Time</Label>
              <Input id="preferred-time" type="time" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Describe your requirements and topics you'd like to discuss..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Send className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
