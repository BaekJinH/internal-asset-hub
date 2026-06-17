import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart'

interface SparklineProps {
  data: { weekId: string; hours: number }[]
  color?: string
  height?: number
}

export function Sparkline({ data, color = 'hsl(var(--primary))', height = 40 }: SparklineProps) {
  if (!data.length) return null
  return (
    <ChartContainer config={{ hours: { label: '시간', color } }} className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="hours" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
