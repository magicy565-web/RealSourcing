import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  name: string;
  value: number;
}

interface DataChartProps {
  data: DataPoint[];
  type?: "line" | "area";
  color?: string;
  height?: number;
}

export default function DataChart({ data, type = "area", color = "#8B5CF6", height = 200 }: DataChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-[10px] text-muted-foreground mb-0.5">{payload[0].payload.name}</p>
          <p className="text-sm text-white font-semibold">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const gradientId = `gradient-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === "area" ? (
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1a1a1a" strokeDasharray="none" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="transparent"
            tick={{ fill: "#555", fontSize: 10 }}
            tickLine={false}
            dy={8}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: "#444", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#333", strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: color, stroke: "#111", strokeWidth: 2 }}
          />
        </AreaChart>
      ) : (
        <LineChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="#1a1a1a" strokeDasharray="none" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="transparent"
            tick={{ fill: "#555", fontSize: 10 }}
            tickLine={false}
            dy={8}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: "#444", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#333", strokeDasharray: "4 4" }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: color, stroke: "#111", strokeWidth: 2 }}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
