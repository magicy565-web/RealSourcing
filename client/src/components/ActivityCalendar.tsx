import { format, addDays, isToday, isSameDay, startOfDay } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "../lib/utils";
import { Users, Video } from "lucide-react";

interface TimelineWebinar {
  id: number;
  title: string;
  status: string;
  scheduledAt: string;
  duration?: number;
  coverImage?: string;
}

interface EmployeeTimeline {
  id: number;
  name: string;
  avatar?: string;
  webinars: TimelineWebinar[];
}

interface ActivityCalendarProps {
  employees: EmployeeTimeline[];
  days?: number;
}

const statusColors: Record<string, { bg: string; border: string }> = {
  live: { bg: "bg-gradient-to-r from-red-500 to-rose-500", border: "border-red-400/40" },
  scheduled: { bg: "bg-gradient-to-r from-violet-500 to-purple-500", border: "border-violet-400/40" },
  completed: { bg: "bg-gradient-to-r from-emerald-500 to-teal-500", border: "border-emerald-400/40" },
  draft: { bg: "bg-gradient-to-r from-gray-600 to-gray-700", border: "border-gray-500/30" },
  cancelled: { bg: "bg-gradient-to-r from-gray-700 to-gray-800", border: "border-gray-600/20" },
};

export default function ActivityCalendar({ employees, days = 14 }: ActivityCalendarProps) {
  const today = startOfDay(new Date());
  const dates = Array.from({ length: days }, (_, i) => addDays(today, i));

  const getBarPosition = (webinar: TimelineWebinar) => {
    const scheduledDate = startOfDay(new Date(webinar.scheduledAt));
    const dayIndex = dates.findIndex(d => isSameDay(d, scheduledDate));
    if (dayIndex === -1) return null;
    
    const durationHours = webinar.duration || 2;
    const durationDays = Math.min(2.5, Math.max(0.8, durationHours / 24));
    
    return { start: dayIndex, span: durationDays };
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground/60">暂无员工活动安排</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 日期头部 */}
      <div className="flex border-b border-[#222]">
        <div className="w-32 flex-shrink-0 py-3 pr-3" />
        <div className="flex-1 flex">
          {dates.map((date, i) => {
            const isCurrentDay = isToday(date);
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 min-w-[60px] py-3 text-center border-l border-[#1a1a1a]",
                  isCurrentDay && "bg-violet-500/[0.04]"
                )}
              >
                <div className="text-[10px] text-muted-foreground/40 leading-none mb-1.5 uppercase">
                  {format(date, "EEE", { locale: zhCN })}
                </div>
                <div
                  className={cn(
                    "text-xs leading-none font-medium mx-auto inline-flex items-center justify-center w-5 h-5 rounded-full",
                    isCurrentDay
                      ? "bg-violet-500 text-white"
                      : "text-muted-foreground/70"
                  )}
                >
                  {format(date, "d")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 员工行 */}
      <div className="relative">
        {employees.map((employee, rowIdx) => (
          <div
            key={employee.id}
            className={cn(
              "flex items-center min-h-[64px] border-b border-[#1a1a1a]",
              rowIdx % 2 === 0 ? "bg-transparent" : "bg-[#0a0a0a]/30"
            )}
          >
            {/* 员工名字 */}
            <div className="w-32 flex-shrink-0 flex items-center gap-2.5 pr-3 py-3">
              {employee.avatar ? (
                <img
                  src={employee.avatar}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-violet-300 font-medium">
                    {employee.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-sm text-white/90 truncate font-medium">
                {employee.name}
              </span>
            </div>

            {/* 时间线网格 */}
            <div className="flex-1 relative flex h-full">
              {dates.map((date, colIdx) => (
                <div
                  key={colIdx}
                  className={cn(
                    "flex-1 min-w-[60px] border-l border-[#1a1a1a]",
                    isToday(date) && "bg-violet-500/[0.04]"
                  )}
                />
              ))}

              {/* 活动条形 - 极简设计 */}
              {employee.webinars.map((webinar) => {
                const pos = getBarPosition(webinar);
                if (!pos) return null;
                
                const colors = statusColors[webinar.status] || statusColors.scheduled;
                const leftPercent = (pos.start / days) * 100;
                const widthPercent = (pos.span / days) * 100;

                return (
                  <div
                    key={webinar.id}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-9 rounded-lg flex items-center gap-2 px-2 cursor-pointer group",
                      "transition-all hover:brightness-110 hover:scale-[1.02] hover:z-10",
                      "border backdrop-blur-sm shadow-lg",
                      colors.bg,
                      colors.border
                    )}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${Math.max(widthPercent, 100 / days * 1.2)}%`,
                    }}
                    title={`${webinar.title}\n${format(new Date(webinar.scheduledAt), "MM月dd日 HH:mm")}`}
                  >
                    {/* 缩略图 */}
                    {webinar.coverImage ? (
                      <div className="w-6 h-6 rounded flex-shrink-0 overflow-hidden bg-black/20">
                        <img
                          src={`https://admin.cnsubscribe.xyz/assets/${webinar.coverImage}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded flex-shrink-0 bg-white/10 flex items-center justify-center">
                        <Video className="h-3 w-3 text-white/60" />
                      </div>
                    )}
                    
                    {/* 标题 */}
                    <span className="text-xs font-medium text-white truncate flex-1 leading-tight">
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
          { label: "直播中", gradient: "from-red-500 to-rose-500" },
          { label: "已预定", gradient: "from-violet-500 to-purple-500" },
          { label: "已完成", gradient: "from-emerald-500 to-teal-500" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn("h-2.5 w-6 rounded bg-gradient-to-r", item.gradient)} />
            <span className="text-[11px] text-muted-foreground/60">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
