import { format, addDays, isToday, isSameDay, startOfDay, differenceInHours } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "../lib/utils";
import { Building2, Clock, Users } from "lucide-react";

interface TimelineWebinar {
  id: number;
  title: string;
  status: string;
  scheduledAt: string;
  duration?: number; // in hours
  category?: string;
  participants?: number;
}

interface EmployeeTimeline {
  id: number;
  name: string;
  avatar?: string;
  role?: string;
  webinars: TimelineWebinar[];
}

interface ActivityCalendarProps {
  employees: EmployeeTimeline[];
  days?: number;
}

const statusStyles: Record<string, { 
  bg: string; 
  border: string; 
  text: string;
  shadow: string;
  pattern?: string;
}> = {
  live: { 
    bg: "bg-gradient-to-r from-red-500 to-rose-500", 
    border: "border-red-400/50", 
    text: "text-white",
    shadow: "shadow-lg shadow-red-500/20",
  },
  scheduled: { 
    bg: "bg-gradient-to-r from-violet-500 to-purple-500", 
    border: "border-violet-400/50", 
    text: "text-white",
    shadow: "shadow-md shadow-violet-500/15",
  },
  completed: { 
    bg: "bg-gradient-to-r from-emerald-500 to-teal-500", 
    border: "border-emerald-400/50", 
    text: "text-white",
    shadow: "shadow-md shadow-emerald-500/15",
  },
  draft: { 
    bg: "bg-gradient-to-r from-gray-600 to-gray-700", 
    border: "border-gray-500/40", 
    text: "text-gray-300",
    shadow: "shadow-sm shadow-gray-700/10",
    pattern: "bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_8px)]",
  },
  cancelled: { 
    bg: "bg-gradient-to-r from-gray-700 to-gray-800", 
    border: "border-gray-600/30", 
    text: "text-gray-500",
    shadow: "shadow-sm",
    pattern: "bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.03)_4px,rgba(255,255,255,0.03)_8px)]",
  },
};

export default function ActivityCalendar({ employees, days = 14 }: ActivityCalendarProps) {
  const today = startOfDay(new Date());
  const dates = Array.from({ length: days }, (_, i) => addDays(today, i));

  const getBarPosition = (webinar: TimelineWebinar) => {
    const scheduledDate = startOfDay(new Date(webinar.scheduledAt));
    const dayIndex = dates.findIndex(d => isSameDay(d, scheduledDate));
    if (dayIndex === -1) return null;
    
    // 根据实际时长计算宽度（最少1天，最多3天）
    const durationHours = webinar.duration || 2;
    const durationDays = Math.min(3, Math.max(0.5, durationHours / 24));
    
    return { start: dayIndex, span: durationDays };
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground/60">暂无员工活动安排</p>
        <p className="text-xs text-muted-foreground/40 mt-1">为员工安排参加活动后将在此显示</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 日期头部 */}
      <div className="flex border-b border-[#222]">
        <div className="w-48 flex-shrink-0 py-3 pr-4">
          <span className="text-[11px] text-muted-foreground/50 uppercase tracking-wider font-medium">
            员工/负责人
          </span>
        </div>
        <div className="flex-1 flex">
          {dates.map((date, i) => {
            const isCurrentDay = isToday(date);
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 min-w-[52px] py-3 text-center border-l border-[#1a1a1a] transition-colors",
                  isCurrentDay && "bg-violet-500/[0.03] border-l-violet-500/20"
                )}
              >
                <div className="text-[10px] text-muted-foreground/40 leading-none mb-1.5 uppercase">
                  {format(date, "EEE", { locale: zhCN })}
                </div>
                <div
                  className={cn(
                    "text-xs leading-none font-medium mx-auto inline-flex items-center justify-center w-5 h-5 rounded-full transition-colors",
                    isCurrentDay
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
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
              "flex items-center min-h-[56px] border-b border-[#1a1a1a] transition-colors hover:bg-white/[0.01]",
              rowIdx % 2 === 0 ? "bg-transparent" : "bg-[#0a0a0a]/30"
            )}
          >
            {/* 员工信息 */}
            <div className="w-48 flex-shrink-0 flex items-center gap-3 pr-4 py-3">
              {employee.avatar ? (
                <img
                  src={employee.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-white/5"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 via-purple-500/30 to-indigo-500/30 flex items-center justify-center flex-shrink-0 ring-2 ring-white/5">
                  <span className="text-xs text-violet-300 font-semibold">
                    {employee.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-white/90 truncate font-medium">
                  {employee.name}
                </div>
                {employee.role && (
                  <div className="text-[10px] text-muted-foreground/50 truncate mt-0.5">
                    {employee.role}
                  </div>
                )}
              </div>
            </div>

            {/* 时间线网格 */}
            <div className="flex-1 relative flex h-full">
              {dates.map((date, colIdx) => (
                <div
                  key={colIdx}
                  className={cn(
                    "flex-1 min-w-[52px] border-l border-[#1a1a1a]",
                    isToday(date) && "bg-violet-500/[0.03]"
                  )}
                />
              ))}

              {/* 活动条形 */}
              {employee.webinars.map((webinar) => {
                const pos = getBarPosition(webinar);
                if (!pos) return null;
                
                const styles = statusStyles[webinar.status] || statusStyles.scheduled;
                const leftPercent = (pos.start / days) * 100;
                const widthPercent = (pos.span / days) * 100;

                return (
                  <div
                    key={webinar.id}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-7 rounded-lg flex items-center px-2.5 cursor-pointer group",
                      "transition-all hover:brightness-110 hover:scale-[1.02] hover:z-10",
                      "border backdrop-blur-sm",
                      styles.bg,
                      styles.border,
                      styles.text,
                      styles.shadow,
                      styles.pattern
                    )}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${Math.max(widthPercent, 100 / days * 0.8)}%`,
                    }}
                    title={`${webinar.title}\n${format(new Date(webinar.scheduledAt), "MM/dd HH:mm")} · ${webinar.duration || 2}h`}
                  >
                    <div className="flex items-center gap-1.5 w-full min-w-0">
                      <Clock className="h-3 w-3 flex-shrink-0 opacity-80" />
                      <span className="text-[11px] font-medium truncate leading-none flex-1">
                        {webinar.title}
                      </span>
                      {webinar.participants && webinar.participants > 0 && (
                        <span className="text-[9px] opacity-70 flex-shrink-0 bg-black/20 px-1.5 py-0.5 rounded">
                          {webinar.participants}人
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-6 mt-5 pt-4 border-t border-[#1a1a1a]">
        {[
          { label: "直播中", gradient: "from-red-500 to-rose-500" },
          { label: "已预定", gradient: "from-violet-500 to-purple-500" },
          { label: "已完成", gradient: "from-emerald-500 to-teal-500" },
          { label: "草稿", gradient: "from-gray-600 to-gray-700" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn("h-2.5 w-6 rounded-sm bg-gradient-to-r", item.gradient)} />
            <span className="text-[11px] text-muted-foreground/60">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
