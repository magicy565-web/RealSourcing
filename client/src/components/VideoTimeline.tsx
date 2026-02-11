import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Highlight {
  id: string;
  timestamp_start: string;
  timestamp_end: string;
  title: string;
  summary: string;
  category: string;
  thumbnail: string;
  color: string;
}

interface VideoTimelineProps {
  videoUrl: string;
  highlights: Highlight[];
  totalDuration?: number; // seconds, default 1978
  thumbnailCount?: number; // total thumbnails available
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTimestamp(ts: string): number {
  const parts = ts.split(":");
  return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function VideoTimeline({
  videoUrl,
  highlights,
  totalDuration = 1978,
  thumbnailCount = 198,
}: VideoTimelineProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(totalDuration);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);

  // Timeline state
  const [zoomLevel, setZoomLevel] = useState(1); // 1x to 8x
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredHighlight, setHoveredHighlight] = useState<Highlight | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [showThumbnailStrip, setShowThumbnailStrip] = useState(true);

  // ─── Video Controls ──────────────────────────────────────────────────────

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seekTo = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const skipForward = useCallback(() => {
    seekTo(Math.min(currentTime + 10, duration));
  }, [currentTime, duration, seekTo]);

  const skipBackward = useCallback(() => {
    seekTo(Math.max(currentTime - 10, 0));
  }, [currentTime, seekTo]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  }, []);

  // ─── Video Event Listeners ───────────────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration || totalDuration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [totalDuration]);

  // ─── Keyboard Shortcuts ──────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          skipForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skipBackward();
          break;
        case "m":
          toggleMute();
          break;
        case "+":
        case "=":
          setZoomLevel((z) => Math.min(z * 1.5, 8));
          break;
        case "-":
          setZoomLevel((z) => Math.max(z / 1.5, 1));
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skipForward, skipBackward, toggleMute]);

  // ─── Timeline Calculations ───────────────────────────────────────────────

  const timelineWidth = useMemo(() => {
    const container = timelineContainerRef.current;
    const baseWidth = container?.clientWidth || 900;
    return baseWidth * zoomLevel;
  }, [zoomLevel]);

  const timeToX = useCallback(
    (time: number) => (time / duration) * timelineWidth,
    [duration, timelineWidth]
  );

  const xToTime = useCallback(
    (x: number) => (x / timelineWidth) * duration,
    [duration, timelineWidth]
  );

  // ─── Timeline Ruler Ticks ────────────────────────────────────────────────

  const rulerTicks = useMemo(() => {
    const ticks: { time: number; label: string; major: boolean }[] = [];
    // Determine interval based on zoom
    let interval = 60; // 1 minute
    if (zoomLevel >= 2) interval = 30;
    if (zoomLevel >= 4) interval = 15;
    if (zoomLevel >= 6) interval = 10;

    for (let t = 0; t <= duration; t += interval) {
      ticks.push({ time: t, label: formatTime(t), major: t % 60 === 0 });
    }
    return ticks;
  }, [duration, zoomLevel]);

  // ─── Sorted Highlights ───────────────────────────────────────────────────

  const sortedHighlights = useMemo(
    () =>
      [...highlights].sort(
        (a, b) => parseTimestamp(a.timestamp_start) - parseTimestamp(b.timestamp_start)
      ),
    [highlights]
  );

  // ─── Auto-scroll to playhead ─────────────────────────────────────────────

  useEffect(() => {
    if (isDragging) return;
    const container = timelineContainerRef.current;
    if (!container) return;
    const playheadX = timeToX(currentTime);
    const viewWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;

    if (playheadX < scrollLeft + 50 || playheadX > scrollLeft + viewWidth - 50) {
      container.scrollLeft = playheadX - viewWidth / 2;
    }
  }, [currentTime, isDragging, timeToX]);

  // ─── Timeline Click / Drag ───────────────────────────────────────────────

  const handleTimelineMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const container = timelineContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const time = xToTime(x);
      seekTo(Math.max(0, Math.min(time, duration)));
      setIsDragging(true);
    },
    [xToTime, seekTo, duration]
  );

  const handleTimelineMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const container = timelineContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const time = xToTime(x);
      setHoverTime(Math.max(0, Math.min(time, duration)));
      setHoverX(e.clientX - rect.left);

      if (isDragging) {
        seekTo(Math.max(0, Math.min(time, duration)));
      }
    },
    [isDragging, xToTime, seekTo, duration]
  );

  const handleTimelineMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTimelineMouseLeave = useCallback(() => {
    setHoverTime(null);
    setIsDragging(false);
  }, []);

  // ─── Jump to highlight ──────────────────────────────────────────────────

  const jumpToHighlight = useCallback(
    (hl: Highlight) => {
      const time = parseTimestamp(hl.timestamp_start);
      seekTo(time);
      setSelectedHighlight(hl);
      if (!isPlaying) {
        videoRef.current?.play();
      }
    },
    [seekTo, isPlaying]
  );

  // Navigate between highlights
  const navigateHighlight = useCallback(
    (direction: "prev" | "next") => {
      const currentIdx = selectedHighlight
        ? sortedHighlights.findIndex((h) => h.id === selectedHighlight.id)
        : -1;
      let newIdx: number;
      if (direction === "next") {
        newIdx = currentIdx < sortedHighlights.length - 1 ? currentIdx + 1 : 0;
      } else {
        newIdx = currentIdx > 0 ? currentIdx - 1 : sortedHighlights.length - 1;
      }
      jumpToHighlight(sortedHighlights[newIdx]);
    },
    [selectedHighlight, sortedHighlights, jumpToHighlight]
  );

  // ─── Thumbnail strip ────────────────────────────────────────────────────

  const thumbnailElements = useMemo(() => {
    const thumbs: JSX.Element[] = [];
    const thumbWidth = 80;
    const count = Math.ceil(timelineWidth / thumbWidth);
    for (let i = 0; i < count; i++) {
      const time = (i / count) * duration;
      const thumbIdx = Math.min(Math.floor(time / 10) + 1, thumbnailCount);
      const paddedIdx = thumbIdx.toString().padStart(4, "0");
      thumbs.push(
        <div
          key={i}
          className="h-full flex-shrink-0"
          style={{ width: thumbWidth }}
        >
          <img
            src={`/timeline-thumbs/thumb_${paddedIdx}.jpg`}
            alt=""
            className="w-full h-full object-cover opacity-40"
            loading="lazy"
          />
        </div>
      );
    }
    return thumbs;
  }, [timelineWidth, duration, thumbnailCount]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ═══════════════════ VIDEO PLAYER ═══════════════════ */}
      <div className="relative flex-1 min-h-0 bg-black rounded-lg overflow-hidden group">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={videoUrl}
          onClick={togglePlay}
        />

        {/* Play/Pause Overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
            isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          )}
        >
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="h-7 w-7 text-white" />
            ) : (
              <Play className="h-7 w-7 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Top-right controls */}
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom gradient + time display */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <button onClick={skipBackward} className="text-white/70 hover:text-white transition-colors">
              <SkipBack className="h-4 w-4" />
            </button>
            <button onClick={togglePlay} className="text-white hover:text-white transition-colors">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={skipForward} className="text-white/70 hover:text-white transition-colors">
              <SkipForward className="h-4 w-4" />
            </button>
            <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors ml-2">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
          <span className="text-xs text-white/80 font-mono tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Selected Highlight Info Overlay */}
        {selectedHighlight && (
          <div className="absolute top-3 left-3 max-w-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-black/70 backdrop-blur-md rounded-lg border border-white/10 p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedHighlight.color }} />
                <span className="text-xs font-medium text-white">{selectedHighlight.title}</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2">
                {selectedHighlight.summary}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════ TIMELINE EDITOR PANEL ═══════════════════ */}
      <div className="flex-shrink-0 border-t border-border bg-card">
        {/* ─── Toolbar ─── */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              AI Highlights
            </span>
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
              {highlights.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Navigate highlights */}
            <button
              onClick={() => navigateHighlight("prev")}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Previous highlight"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => navigateHighlight("next")}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Next highlight"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <div className="w-px h-4 bg-border mx-1" />

            {/* Toggle thumbnail strip */}
            <button
              onClick={() => setShowThumbnailStrip(!showThumbnailStrip)}
              className={cn(
                "p-1.5 rounded transition-colors",
                showThumbnailStrip
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="Toggle thumbnails"
            >
              <Layers className="h-3.5 w-3.5" />
            </button>

            <div className="w-px h-4 bg-border mx-1" />

            {/* Zoom controls */}
            <button
              onClick={() => setZoomLevel((z) => Math.max(z / 1.5, 1))}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-mono text-muted-foreground w-8 text-center tabular-nums">
              {zoomLevel.toFixed(1)}x
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z * 1.5, 8))}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ─── Ruler (Time Markers) ─── */}
        <div
          ref={timelineContainerRef}
          className="overflow-x-auto overflow-y-hidden relative select-none"
          style={{ scrollbarWidth: "thin" }}
        >
          <div style={{ width: timelineWidth, minHeight: showThumbnailStrip ? 140 : 100 }}>
            {/* Ruler row */}
            <div className="relative h-6 border-b border-border/30">
              {rulerTicks.map((tick, i) => {
                const x = timeToX(tick.time);
                return (
                  <div
                    key={i}
                    className="absolute top-0"
                    style={{ left: x }}
                  >
                    <div
                      className={cn(
                        "w-px",
                        tick.major ? "h-4 bg-muted-foreground/40" : "h-2.5 bg-muted-foreground/20"
                      )}
                    />
                    {tick.major && (
                      <span className="absolute top-4 -translate-x-1/2 text-[9px] font-mono text-muted-foreground/60 tabular-nums whitespace-nowrap">
                        {tick.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Thumbnail strip */}
            {showThumbnailStrip && (
              <div className="relative h-[44px] overflow-hidden border-b border-border/30">
                <div className="absolute inset-0 flex">{thumbnailElements}</div>
                {/* Darken non-highlighted areas */}
                <div className="absolute inset-0 bg-black/30" />
                {/* Highlight regions on thumbnail strip */}
                {sortedHighlights.map((hl) => {
                  const startX = timeToX(parseTimestamp(hl.timestamp_start));
                  const endX = timeToX(parseTimestamp(hl.timestamp_end));
                  return (
                    <div
                      key={hl.id + "-thumb"}
                      className="absolute top-0 bottom-0"
                      style={{
                        left: startX,
                        width: Math.max(endX - startX, 4),
                        backgroundColor: hl.color + "20",
                        borderTop: `2px solid ${hl.color}`,
                        borderBottom: `2px solid ${hl.color}`,
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* ─── Highlight Blocks (Main Track) ─── */}
            <div
              className="relative h-[48px] cursor-crosshair"
              onMouseDown={handleTimelineMouseDown}
              onMouseMove={handleTimelineMouseMove}
              onMouseUp={handleTimelineMouseUp}
              onMouseLeave={handleTimelineMouseLeave}
            >
              {/* Background grid lines */}
              {rulerTicks
                .filter((t) => t.major)
                .map((tick, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-px bg-border/20"
                    style={{ left: timeToX(tick.time) }}
                  />
                ))}

              {/* Highlight blocks */}
              {sortedHighlights.map((hl) => {
                const startX = timeToX(parseTimestamp(hl.timestamp_start));
                const endX = timeToX(parseTimestamp(hl.timestamp_end));
                const width = Math.max(endX - startX, 6);
                const isSelected = selectedHighlight?.id === hl.id;
                const isHovered = hoveredHighlight?.id === hl.id;

                return (
                  <div
                    key={hl.id}
                    className={cn(
                      "absolute top-[6px] rounded-md cursor-pointer transition-all duration-150",
                      isSelected
                        ? "ring-2 ring-white/40 shadow-lg z-20"
                        : isHovered
                        ? "ring-1 ring-white/20 shadow-md z-10"
                        : "z-0"
                    )}
                    style={{
                      left: startX,
                      width: width,
                      height: 36,
                      backgroundColor: isSelected ? hl.color : hl.color + "CC",
                      boxShadow: isSelected ? `0 0 20px ${hl.color}40` : undefined,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToHighlight(hl);
                    }}
                    onMouseEnter={() => setHoveredHighlight(hl)}
                    onMouseLeave={() => setHoveredHighlight(null)}
                  >
                    {/* Block content */}
                    <div className="h-full flex items-center px-2 overflow-hidden">
                      {width > 60 && (
                        <span className="text-[10px] font-medium text-white truncate leading-none drop-shadow-sm">
                          {hl.title}
                        </span>
                      )}
                    </div>

                    {/* Left/Right resize handles (visual only) */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md" style={{ backgroundColor: hl.color }} />
                    <div className="absolute right-0 top-0 bottom-0 w-1 rounded-r-md" style={{ backgroundColor: hl.color }} />
                  </div>
                );
              })}

              {/* ─── Playhead ─── */}
              <div
                className="absolute top-0 z-30 pointer-events-none"
                style={{ left: timeToX(currentTime) }}
              >
                {/* Playhead triangle */}
                <div className="relative -translate-x-1/2">
                  <div
                    className="w-0 h-0 mx-auto"
                    style={{
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "6px solid #ef4444",
                    }}
                  />
                  <div className="w-px h-[48px] bg-red-500 mx-auto" />
                </div>
              </div>

              {/* ─── Hover indicator ─── */}
              {hoverTime !== null && !isDragging && (
                <div
                  className="absolute top-0 z-20 pointer-events-none"
                  style={{ left: timeToX(hoverTime) }}
                >
                  <div className="relative -translate-x-1/2">
                    <div className="w-px h-[48px] bg-white/20 mx-auto" />
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-[10px] text-white font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
                      {formatTime(hoverTime)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Hover Tooltip for Highlight ─── */}
        {hoveredHighlight && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="bg-popover border border-border rounded-lg shadow-xl p-3 max-w-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <img
                  src={hoveredHighlight.thumbnail}
                  alt=""
                  className="w-20 h-12 rounded object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{hoveredHighlight.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    {hoveredHighlight.timestamp_start} → {hoveredHighlight.timestamp_end}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Highlight chips row ─── */}
        <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {sortedHighlights.map((hl) => {
            const isActive = selectedHighlight?.id === hl.id;
            return (
              <button
                key={hl.id}
                onClick={() => jumpToHighlight(hl)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border",
                  isActive
                    ? "border-transparent text-white shadow-md"
                    : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                )}
                style={
                  isActive
                    ? { backgroundColor: hl.color, boxShadow: `0 2px 8px ${hl.color}40` }
                    : {}
                }
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isActive ? "#fff" : hl.color }}
                />
                {hl.title.length > 25 ? hl.title.slice(0, 25) + "…" : hl.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
