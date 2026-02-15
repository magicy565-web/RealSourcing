import { format, subDays, isSameDay } from "date-fns";
import { cn } from "../lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ActivityData {
  date: Date;
  count: number;
  events: string[];
}

interface ActivityCalendarProps {
  data: ActivityData[];
  days?: number;
}

export default function ActivityCalendar({ data, days = 14 }: ActivityCalendarProps) {
  // 生成最近 N 天的日期
  const dates = Array.from({ length: days }, (_, i) => subDays(new Date(), days - 1 - i));

  // 获取每天的活动数据
  const getActivityForDate = (date: Date) => {
    return data.find(d => isSameDay(d.date, date)) || { date, count: 0, events: [] };
  };

  // 根据活动数量返回颜色
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-[#1a1a1a]";
    if (count <= 2) return "bg-orange-500/30";
    if (count <= 5) return "bg-orange-500/60";
    return "bg-orange-500";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>活动（过去 {days} 天）</span>
        <div className="flex items-center gap-2">
          <span>少</span>
          <div className="flex gap-1">
            {[0, 1, 3, 6].map(count => (
              <div
                key={count}
                className={cn("h-2.5 w-2.5 rounded-sm", getColorClass(count))}
              />
            ))}
          </div>
          <span>多</span>
        </div>
      </div>

      <div className="grid grid-cols-14 gap-1.5">
        {dates.map((date, index) => {
          const activity = getActivityForDate(date);
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "h-10 w-full rounded-md transition-all cursor-pointer hover:ring-2 hover:ring-violet-500/50",
                        getColorClass(activity.count)
                      )}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {format(date, "d")}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <div className="font-medium">{format(date, "MMM d, yyyy")}</div>
                    <div className="text-muted-foreground mt-1">
                      {activity.count === 0 ? "暂无活动" : `${activity.count} 个活动`}
                    </div>
                    {activity.events.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {activity.events.slice(0, 3).map((event, i) => (
                          <li key={i} className="text-xs">• {event}</li>
                        ))}
                        {activity.events.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{activity.events.length - 3} 更多
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-[#262626]">
        <span>{format(dates[0], "MMM d")}</span>
        <span>{format(dates[dates.length - 1], "MMM d")}</span>
      </div>
    </div>
  );
}
