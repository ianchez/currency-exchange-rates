import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

interface RateSparklineProps {
  data: { date: string; rate: number }[];
  color?: string;
  hoveredIndex?: number | null;
  onHover?: (index: number | null) => void;
}

export const RateSparkline = ({ data, color = '#bc75d2', hoveredIndex = null, onHover }: RateSparklineProps) => {
  // Filter out zero values to only show actual data
  const validData = data.filter(d => d.rate > 0);
  
  if (validData.length === 0) {
    return null;
  }

  // Calculate min and max with some padding for better visualization
  const rates = validData.map(d => d.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const padding = (maxRate - minRate) * 0.1 || 0.01; // 10% padding or small default
  
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart
        data={validData}
        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
        onMouseMove={(e) => {
          if (e?.activeTooltipIndex !== undefined && e.activeTooltipIndex !== null && onHover) {
            const originalIndex = data.findIndex(d => d.date === validData[e.activeTooltipIndex as number]?.date);
            onHover(originalIndex);
          }
        }}
        onMouseLeave={() => onHover?.(null)}
      >
        <Tooltip content={() => null} cursor={false} />
        <YAxis 
          hide 
          domain={[minRate - padding, maxRate + padding]} 
          type="number"
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke={color}
          strokeWidth={2}
          dot={(props) => {
            const { cx, cy, index } = props;
            if (index === hoveredIndex) {
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            }
            return null;
          }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
