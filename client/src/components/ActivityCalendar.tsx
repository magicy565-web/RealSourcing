import { format, addDays, isToday, isSameDay, startOfDay } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "../lib/utils";
import { Building2 } from "lucide-react";

interface TimelineWebinar {
  id: number;
  title: string;
  status: string;
  scheduledAt: string;
  duration?: number; // in hours
  category?: string;
}

interface FactoryTimeline {
  id: number;
  name: string;
  avatar?: string;
  webinars: TimelineWebinar[];
}

interface ActivityCalendarProps {
  factories: FactoryTimeline[];
  days?: number;
}

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  live: { bg: "bg-red-500/80", border: "border-red-400", text: "text-white" },
  scheduled: { bg: "bg-violet-500/70", border: "border-violet-400", text: "text-white" },
  completed: { bg: "bg-emerald-500/60", border: "border-emerald-400", text: "text-white" },
  draft: { bg: "bg-gray-500/40", border: "border-gray-500", text: "text-gray-300" },
  cancelled: { bg: "bg-gray-600/30", border: "border-gray-600", text: "text-gray-400" },
};

export default function ActivityCalendar({ factories, days = 14 }: ActivityCalendarProps) {
  const today = startOfDay(new Date());
  const dates = Array.from({ length: days }, (_, i) => addDays(today, i));

  const getBarPosition = (webinar: TimelineWebinar) => {
    const scheduledDate = startOfDay(new Date(webinar.scheduledAt));
    const dayIndex = dates.findIndex(d => isSameDay(d, scheduledDate));
    if (dayIndex === -1) return null;
    const durationDays = Math.max(1, Math.ceil((webinar.duration || 2) / 24));
    return { start: dayIndex, span: durationDays };
  };

  if (factories.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground/60">暂无工厂活动数据</p>
        <p className="text-xs text-muted-foreground/40 mt-1">工厂关注或预约活动后将在此显示</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 日期头部 */}
      <div className="flex border-b border-[#262626]">
        <div className="w-40 flex-shrink-0 py-2 pr-3">
          <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">供应商</span>
        </div>
        <div className="flex-1 flex">
          {dates.map((date, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 min-w-[48px] py-2 text-center border-l border-[#1a1a1a]",
                isToday(date) && "bg-violet-500/5"
              )}
            >
              <div className="text-[10px] text-muted-foreground/40 leading-none mb-1">
                {format(date, "EEE", { locale: zhCN })}
              </div>
              <div
                className={cn(
                  "text-xs leading-none mx-auto",
                  isToday(date)
                    ? "text-violet-400 font-semibold"
                    : "text-muted-foreground/70"
                )}
              >
                {format(date, "d")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 今日指示线 */}
      <div className="relative">
        {/* 工厂行 */}
        {factories.map((factory, rowIdx) => (
          <div
            key={factory.id}
            className={cn(
              "flex items-center min-h-[44px] border-b border-[#1a1a1a]",
              rowIdx % 2 === 0 ? "bg-transparent" : "bg-[#0f0f0f]/50"
            )}
          >
            {/* 工厂名称 */}
            <div className="w-40 flex-shrink-0 flex items-center gap-2.5 pr-3 py-2">
              {factory.avatar ? (
                <img
                  src={factory.avatar}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] text-violet-300 font-medium">
                    {factory.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-xs text-white/80 truncate">{factory.name}</span>
            </div>

            {/* 时间线网格 */}
            <div className="flex-1 relative flex h-full">
              {dates.map((date, colIdx) => (
                <div
                  key={colIdx}
                  className={cn(
                    "flex-1 min-w-[48px] border-l border-[#1a1a1a]",
                    isToday(date) && "bg-violet-500/5"
                  )}
                />
              ))}

              {/* 活动条形 */}
              {factory.webinars.map((webinar) => {
                const pos = getBarPosition(webinar);
                if (!pos) return null;
                const colors = statusColors[webinar.status] || statusColors.scheduled;
                const leftPercent = (pos.start / days) * 100;
                const widthPercent = (pos.span / days) * 100;

                return (
                  <div
                    key={webinar.id}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-6 rounded-md flex items-center px-2 cursor-pointer",
                      "transition-all hover:brightness-110 hover:shadow-lg hover:z-10",
                      "border",
                      colors.bg,
                      colors.border,
                      colors.text
                    )}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${Math.max(widthPercent, 100 / days)}%`,
                    }}
                    title={`${webinar.title} - ${format(new Date(webinar.scheduledAt), "MM/dd HH:mm")}`}
                  >
                    <span className="text-[10px] font-medium truncate leading-none">
                      {webinar.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-[#1a1a1a]">
        {[
          { label: "直播中", color: "bg-red-500/80" },
          { label: "已预定", color: "bg-violet-500/70" },
          { label: "已完成", color: "bg-emerald-500/60" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={cn("h-2 w-5 rounded-sm", item.color)} />
            <span className="text-[10px] text-muted-foreground/60">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
