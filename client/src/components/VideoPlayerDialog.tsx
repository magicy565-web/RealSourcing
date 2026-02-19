import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

interface Video {
  id: number;
  title: string;
  description?: string;
  url: string;
  [key: string]: any;
}

interface VideoPlayerDialogProps {
  video: Video | null;
  onClose: () => void;
}

export default function VideoPlayerDialog({
  video,
  onClose
}: VideoPlayerDialogProps) {
  if (!video) return null;

  return (
    <Dialog open={!!video} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{video.title}</DialogTitle>
          {video.description && (
            <DialogDescription>{video.description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="aspect-video">
          <video 
            src={video.url} 
            controls 
            autoPlay
            className="w-full h-full rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
}
