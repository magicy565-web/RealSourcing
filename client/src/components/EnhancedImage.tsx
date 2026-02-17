import { useState } from "react";
import { cn } from "../lib/utils";
import { Loader2, ImageOff } from "lucide-react";

interface EnhancedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  aspectRatio?: "video" | "square" | "portrait";
  objectFit?: "cover" | "contain";
}

/**
 * Enhanced Image Component with loading states and fallback
 * Handles OSS images, external URLs, and provides graceful fallbacks
 */
export function EnhancedImage({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.png",
  aspectRatio = "video",
  objectFit = "cover",
}: EnhancedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Determine aspect ratio class
  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
  };

  // Get the image source with proper handling
  const getImageSrc = () => {
    if (!src) return fallbackSrc;
    
    // If it's already a full URL, use it directly
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src;
    }
    
    // If it starts with /, assume it's a local asset
    if (src.startsWith("/")) {
      return src;
    }
    
    // Otherwise, assume it's an OSS path and prepend the base URL
    const ossBaseUrl = import.meta.env.VITE_OSS_BASE_URL || "https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com";
    return `${ossBaseUrl}/${src}`;
  };

  const imageSrc = getImageSrc();

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={cn("relative overflow-hidden bg-[#1a1a1a]", aspectClasses[aspectRatio], className)}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500/50" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <ImageOff className="h-12 w-12 mb-2 opacity-20" />
          <span className="text-xs font-light">图片加载失败</span>
        </div>
      )}

      {/* Image */}
      {!hasError && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            "w-full h-full transition-opacity duration-300",
            objectFit === "cover" ? "object-cover" : "object-contain",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
}
