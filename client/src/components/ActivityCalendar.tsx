import { format, subDays, isSameDay, isToday } from "date-fns";
import { cn } from "../lib/utils";

interface ActivityEvent {
  title: string;
  status: "pending" | "active" | "completed" | "cancelled";
}

interface ActivityData {
  date: Date;
  count: number;
  events: ActivityEvent[];
}

interface ActivityCalendarProps {
  data: ActivityData[];
  days?: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-orange-500",
  active: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-gray-500",
};

export default function ActivityCalendar({ data, days = 21 }: ActivityCalendarProps) {
  const dates = Array.from({ length: days }, (_, i) => subDays(new Date(), days - 1 - i));
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  const getActivityForDate = (date: Date) => {
    return data.find(d => isSameDay(d.date, date)) || { date, count: 0, events: [] };
  };

  // 获取所有有事件的唯一标题（用于甘特图行）
  const allEventTitles = Array.from(
    new Set(data.flatMap(d => d.events.map(e => e.title)))
  ).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* 日期头部 */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* 星期和日期 */}
          <div className="flex items-end gap-0">
            <div className="w-28 flex-shrink-0" />
            {dates.map((date, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 min-w-[32px] text-center",
                  isToday(date) && "relative"
                )}
              >
                <div className="text-[10px] text-muted-foreground/60 mb-0.5">
                  {weekdays[date.getDay()]}
                </div>
                <div
                  className={cn(
                    "text-[11px] font-medium mx-auto w-6 h-6 flex items-center justify-center rounded-full",
                    isToday(date)
                      ? "bg-violet-500 text-white"
                      : "text-muted-foreground"
                  )}
                >
                  {format(date, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* 甘特图行 */}
          {allEventTitles.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {allEventTitles.map((title, rowIdx) => (
                <div key={rowIdx} className="flex items-center gap-0">
                  <div className="w-28 flex-shrink-0 pr-2">
                    <span className="text-[11px] text-muted-foreground truncate block">
                      {title}
                    </span>
                  </div>
                  {dates.map((date, colIdx) => {
                    const activity = getActivityForDate(date);
                    const event = activity.events.find(e => e.title === title);
                    return (
                      <div key={colIdx} className="flex-1 min-w-[32px] px-0.5">
                        {event ? (
                          <div
                            className={cn(
                              "h-5 rounded-sm",
                              statusColors[event.status] || "bg-violet-500"
                            )}
                            title={`${title} - ${format(date, "MM/dd")}`}
                          />
                        ) : (
                          <div className="h-5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 text-center py-6">
              <div className="text-muted-foreground/40 text-sm">暂无活动</div>
              <div className="text-muted-foreground/30 text-xs mt-1">
                会话开始后，活动数据将显示。
              </div>
            </div>
          )}

          {/* 图例 */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#262626]">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
              <span className="text-[10px] text-muted-foreground">待办的</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-green-500" />
              <span className="text-[10px] text-muted-foreground">积极的</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
              <span className="text-[10px] text-muted-foreground">完全的</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-gray-500" />
              <span className="text-[10px] text-muted-foreground">取消</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
