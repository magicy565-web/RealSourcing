import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Clock, Users, Video, Circle, Eye } from "lucide-react";
import { cn } from "../lib/utils";
import { EnhancedImage } from "./EnhancedImage";
import type { Webinar } from "../lib/directus";

interface WebinarCardProps {
  webinar: Webinar;
  onClick?: () => void;
}

export function WebinarCard({ webinar, onClick }: WebinarCardProps) {
  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string; dot?: boolean }> = {
      live: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "🔴 Live", dot: true },
      scheduled: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Scheduled" },
      completed: { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "Completed" },
      draft: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Draft" },
      cancelled: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Cancelled" },
    };
    const c = config[status] || { color: "bg-gray-500/10 text-gray-400", label: status };
    return (
      <Badge className={cn("text-[10px] font-light", c.color)}>
        {c.dot && <Circle className="h-1.5 w-1.5 fill-current mr-1 animate-pulse" />}
        {c.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  // Extract cover image from various possible field names
  const coverImage = (webinar as any).coverImage || (webinar as any).cover_image;
  const scheduledAt = (webinar as any).scheduledAt || (webinar as any).scheduled_at;
  const meetingType = (webinar as any).meetingType || (webinar as any).meeting_type;
  const maxParticipants = (webinar as any).maxParticipants || (webinar as any).max_participants || 0;
  const viewCount = (webinar as any).viewCount || (webinar as any).view_count || 0;

  return (
    <Card
      className="bg-[#141414] border-[#262626] overflow-hidden hover:border-violet-500/50 transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="relative">
        <EnhancedImage
          src={coverImage}
          alt={webinar.title}
          className="group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Status Badge Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          {getStatusBadge(webinar.status)}
          {meetingType === 'sourcing' && (
            <Badge className="bg-violet-600/90 text-white border-violet-500/50 text-xs font-medium px-2 py-0.5">
              🛍️ Sourcing
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-5">
        {/* Title */}
        <h3 className="text-lg font-light text-white mb-3 truncate group-hover:text-violet-400 transition-colors">
          {webinar.title}
        </h3>

        {/* Description (if available) */}
        {webinar.description && (
          <p className="text-xs text-muted-foreground font-light mb-3 line-clamp-2">
            {webinar.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2">
          {/* Scheduled Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-light">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatDate(scheduledAt)}</span>
          </div>

          {/* Duration and Participants */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-light">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDuration(webinar.duration)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-light">
                <Users className="h-3.5 w-3.5" />
                <span>{maxParticipants}</span>
              </div>
            </div>

            {/* View Count */}
            {viewCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-light">
                <Eye className="h-3.5 w-3.5" />
                <span>{viewCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Category/Tags */}
        {webinar.category && (
          <div className="mt-3 pt-3 border-t border-[#262626]">
            <Badge variant="outline" className="text-[10px] font-light">
              {webinar.category}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
