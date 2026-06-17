import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { UploadTrendPoint } from '@/widgets/dashboard/lib/build-dashboard-chart-data'
import { DashboardChartCard } from '@/widgets/dashboard/ui/dashboard-chart-card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'

const chartConfig = {
  uploads: {
    label: '업로드',
    color: 'rgb(var(--chart-1))',
  },
} satisfies ChartConfig

interface AssetUploadTrendChartProps {
  data: UploadTrendPoint[]
}

const CHART_TICK_STYLE = { fill: 'hsl(215 16% 47%)', fontSize: 12 }

export function AssetUploadTrendChart({ data }: AssetUploadTrendChartProps) {
  return (
    <DashboardChartCard
      title="자산 업로드 추이"
      description="월별 신규 등록 자산 수"
    >
      <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
        <AreaChart data={data} margin={{ top: 12, right: 16, left: 8, bottom: 4 }}>
          <defs>
            <linearGradient id="uploadFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--chart-1))" stopOpacity={0.35} />
              <stop offset="95%" stopColor="rgb(var(--chart-1))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={CHART_TICK_STYLE}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={40}
            tick={CHART_TICK_STYLE}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="uploads"
            stroke="rgb(var(--chart-1))"
            fill="url(#uploadFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </DashboardChartCard>
  )
}
